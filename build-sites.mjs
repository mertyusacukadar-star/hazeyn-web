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
const MEDIA_SCHEMA = "CREATE TABLE IF NOT EXISTS app_media (id TEXT PRIMARY KEY, content_type TEXT NOT NULL, body BLOB NOT NULL, updated_at INTEGER NOT NULL DEFAULT 0)";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

async function ensureState(env) {
  await env.DB.prepare(SCHEMA).run();
  const row = await env.DB.prepare("SELECT payload FROM app_state WHERE key = ?").bind("main").first();
  if (row && row.payload) {
    try {
      const oldData = JSON.parse(row.payload);
      const banners = Array.isArray(oldData?.settings?.heroBanners) ? oldData.settings.heroBanners : [];
      const gallery = Array.isArray(oldData?.gallery) ? oldData.gallery : [];
      const isEmptyLegacyDefault = !oldData?._meta?.updatedAt
        && banners.length === 1 && banners[0]?.image === "assets/hero.svg"
        && gallery.length === 3
        && gallery.some(item => item?.image === "assets/hotel.svg")
        && gallery.some(item => item?.image === "assets/yurtici.svg");
      if (!isEmptyLegacyDefault) return row.payload;
      await env.DB.prepare("UPDATE app_state SET payload = ?, updated_at = ? WHERE key = ?").bind(DEFAULT_DATA, Date.now(), "main").run();
      return DEFAULT_DATA;
    } catch {
      return row.payload;
    }
  }
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
    if (url.pathname.startsWith("/media/") && request.method === "GET") {
      await env.DB.prepare(MEDIA_SCHEMA).run();
      const id = url.pathname.slice("/media/".length).replace(/[^a-z0-9-]/gi, "");
      const row = id ? await env.DB.prepare("SELECT content_type, body FROM app_media WHERE id = ?").bind(id).first() : null;
      if (!row || !row.body) return new Response("Görsel bulunamadı", { status: 404 });
      return new Response(row.body, { headers: { "content-type": row.content_type, "cache-control": "public, max-age=31536000, immutable" } });
    }
    if (url.pathname === "/api/data" && request.method === "GET") {
      return new Response(await ensureState(env), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === "/api/login" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return String(body.password || "") === await currentPassword(env) ? json({ ok: true }) : json({ ok: false, error: "Şifre hatalı." }, 401);
    }
    if (url.pathname === "/api/media-upload" && request.method === "POST") {
      if (String(request.headers.get("x-admin-password") || "") !== await currentPassword(env)) return json({ ok: false, error: "Yetkisiz." }, 401);
      const body = await request.arrayBuffer();
      if (!body.byteLength || body.byteLength > 1800000) return json({ ok: false, error: "Görsel en fazla 1,8 MB olabilir." }, 413);
      const contentType = String(request.headers.get("content-type") || "image/jpeg");
      if (!contentType.startsWith("image/")) return json({ ok: false, error: "Geçersiz görsel." }, 415);
      const id = crypto.randomUUID();
      await env.DB.prepare(MEDIA_SCHEMA).run();
      await env.DB.prepare("INSERT INTO app_media (id, content_type, body, updated_at) VALUES (?, ?, ?, ?)").bind(id, contentType, body, Date.now()).run();
      return json({ ok: true, url: "/media/" + id });
    }
    if (url.pathname === "/api/data" && request.method === "POST") {
      if (String(request.headers.get("x-admin-password") || "") !== await currentPassword(env)) return json({ ok: false, error: "Yetkisiz." }, 401);
      const payload = await request.text();
      try { JSON.parse(payload); } catch { return json({ ok: false, error: "Geçersiz veri." }, 400); }
      await env.DB.prepare("INSERT INTO app_state (key, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at").bind("main", payload, Date.now()).run();
      return json({ ok: true });
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "Bu işlem bu sürümde kullanılamıyor." }, 404);

    const routes = { "/": "/index.html", "/tr": "/index.html", "/tr/": "/index.html", "/admin": "/admin.html", "/deneyimli-kadro": "/deneyimli-kadro.html", "/merak-edilenler": "/merak-edilenler.html" };
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
