import fs from "node:fs";
import path from "node:path";

const projectDir = process.cwd();
const publicDir = path.join(projectDir, "public");
const distDir = path.join(projectDir, "dist");
const serverDir = path.join(distDir, "server");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function collectFiles(dir, prefix = "") {
  const result = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(result, collectFiles(absolute, relative));
    else {
      const extension = path.extname(entry.name).toLowerCase();
      result[`/${relative}`] = {
        type: mimeTypes[extension] || "application/octet-stream",
        body: fs.readFileSync(absolute).toString("base64")
      };
    }
  }
  return result;
}

const assets = collectFiles(publicDir);
const defaultData = fs.readFileSync(path.join(projectDir, "data", "db.json"), "utf8");

const worker = `
const ASSETS = ${JSON.stringify(assets)};
const DEFAULT_DATA = ${JSON.stringify(defaultData)};
const SCHEMA = "CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL DEFAULT 0)";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

async function ensureState(env) {
  await env.DB.prepare(SCHEMA).run();
  const row = await env.DB.prepare("SELECT payload FROM app_state WHERE key = ?").bind("main").first();
  if (row && row.payload) return row.payload;
  await env.DB.prepare("INSERT OR IGNORE INTO app_state (key, payload, updated_at) VALUES (?, ?, ?)").bind("main", DEFAULT_DATA, Date.now()).run();
  return DEFAULT_DATA;
}

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function currentPassword(env) {
  try {
    const data = JSON.parse(await ensureState(env));
    return String(data?.settings?.adminPassword || "1234");
  } catch {
    return "1234";
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/data" && request.method === "GET") {
      return new Response(await ensureState(env), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === "/api/login" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return String(body.password || "") === await currentPassword(env) ? json({ ok: true }) : json({ ok: false, error: "Şifre hatalı." }, 401);
    }
    if (url.pathname === "/api/data" && request.method === "POST") {
      if (String(request.headers.get("x-admin-password") || "") !== await currentPassword(env)) return json({ ok: false, error: "Yetkisiz." }, 401);
      const payload = await request.text();
      try { JSON.parse(payload); } catch { return json({ ok: false, error: "Geçersiz veri." }, 400); }
      await env.DB.prepare("INSERT INTO app_state (key, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at").bind("main", payload, Date.now()).run();
      return json({ ok: true });
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "Bu işlem bu sürümde kullanılamıyor." }, 404);

    const routes = { "/": "/index.html", "/admin": "/admin.html", "/deneyimli-kadro": "/deneyimli-kadro.html", "/merak-edilenler": "/merak-edilenler.html" };
    const asset = ASSETS[routes[url.pathname] || url.pathname];
    if (!asset) return new Response("Sayfa bulunamadı", { status: 404 });
    return new Response(decodeBase64(asset.body), { headers: { "content-type": asset.type, "cache-control": asset.type.startsWith("text/html") ? "no-cache" : "public, max-age=86400" } });
  }
};
`;

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(serverDir, { recursive: true });
fs.writeFileSync(path.join(serverDir, "index.js"), worker);
console.log(`Hazeyn Sites build ready: ${Object.keys(assets).length} assets`);
