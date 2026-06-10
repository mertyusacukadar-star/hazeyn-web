const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const TABLE = process.env.SUPABASE_TABLE || 'hazeyn_data';
const ROW_ID = process.env.SUPABASE_ROW_ID || 'main';
const BUCKET = process.env.SUPABASE_BUCKET || 'hazeyn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon'
};

function send(res, code, body, type='text/plain; charset=utf-8'){
  res.writeHead(code, {'Content-Type': type, 'Cache-Control':'no-store'});
  res.end(body);
}
function json(res, code, obj){ send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8'); }
function parseBody(req){
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 60 * 1024 * 1024) reject(new Error('İstek çok büyük.'));
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch(e){ reject(e); }
    });
    req.on('error', reject);
  });
}
function safeJoin(base, reqPath){
  const decoded = decodeURIComponent(reqPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][\/\\])+/, '');
  return path.join(base, normalized);
}
function ensureDb(){
  if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
  if(!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(readDefaultData(), null, 2));
}
function readDefaultData(){
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'db.json'), 'utf8')); }
  catch(e){ return {settings:{}, tours:[], reviews:[], gallery:[], staff:[], blogs:[], passengerLists:[]}; }
}
function checkAdmin(req, body){
  const headerPassword = req.headers['x-admin-password'];
  const auth = req.headers.authorization || '';
  const bearerPassword = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const bodyPassword = body && body.password;
  return String(headerPassword || bearerPassword || bodyPassword || '') === String(ADMIN_PASSWORD);
}
function requiredEnv(name){
  const v = process.env[name];
  if(!v) throw new Error(`${name} ortam değişkeni eksik.`);
  return v;
}
function supabaseAdmin(){
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {auth:{persistSession:false}});
}
async function ensureBucket(client){
  const { data: buckets, error: listError } = await client.storage.listBuckets();
  if(listError) throw listError;
  const exists = Array.isArray(buckets) && buckets.some(b => b.name === BUCKET || b.id === BUCKET);
  if(!exists){
    const { error } = await client.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 1024 * 1024 * 50 });
    if(error) throw error;
  } else {
    try { await client.storage.updateBucket(BUCKET, { public: true, fileSizeLimit: 1024 * 1024 * 50 }); } catch(e) {}
  }
}
function cleanFileName(name){
  const ext = path.extname(String(name || '')).toLowerCase() || '.jpg';
  const base = path.basename(String(name || 'image'), ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 60) || 'image';
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
}

async function handleApi(req, res, pathname){
  if(pathname === '/api/config' && req.method === 'GET'){
    return json(res, 200, { url: process.env.SUPABASE_URL || '', anonKey: process.env.SUPABASE_ANON_KEY || '', bucket: BUCKET });
  }
  if(pathname === '/api/login' && req.method === 'POST'){
    const body = await parseBody(req).catch(()=>({}));
    if(checkAdmin(req, body)) return json(res, 200, {ok:true});
    return json(res, 401, {ok:false, error:'Admin şifresi hatalı.'});
  }
  if(pathname === '/api/data' && req.method === 'GET'){
    try{
      if(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY){
        const client = supabaseAdmin();
        const { data, error } = await client.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle();
        if(error) throw error;
        return json(res, 200, data && data.data ? data.data : readDefaultData());
      }
    } catch(err){ console.error('GET /api/data Supabase hata:', err.message); }
    ensureDb();
    return send(res, 200, fs.readFileSync(DB_PATH, 'utf8'), 'application/json; charset=utf-8');
  }
  if(pathname === '/api/data' && req.method === 'POST'){
    let body;
    try { body = await parseBody(req); } catch(e){ return json(res, 400, {ok:false, error:'JSON okunamadı.'}); }
    if(!checkAdmin(req, body)) return json(res, 401, {ok:false, error:'Admin şifresi hatalı.'});
    try{
      const dataToSave = body.data || body;
      if(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY){
        const client = supabaseAdmin();
        const { error } = await client.from(TABLE).upsert({id: ROW_ID, data: dataToSave, updated_at: new Date().toISOString()}, {onConflict:'id'});
        if(error) throw error;
        return json(res, 200, {ok:true});
      }
      ensureDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2));
      return json(res, 200, {ok:true});
    } catch(err){
      console.error('POST /api/data hata:', err.message);
      return json(res, 500, {ok:false, error:'Veri kaydı yapılamadı: ' + err.message});
    }
  }
  if(pathname === '/api/signed-upload' && req.method === 'POST'){
    let body;
    try { body = await parseBody(req); } catch(e){ return json(res, 400, {ok:false, error:'JSON okunamadı.'}); }
    if(!checkAdmin(req, body)) return json(res, 401, {ok:false, error:'Admin şifresi hatalı.'});
    try{
      const folder = String(body.folder || 'uploads').replace(/[^a-z0-9-_\/]/gi, '').replace(/^\/+/, '').slice(0, 80) || 'uploads';
      const filename = cleanFileName(body.filename || 'image.jpg');
      const objectPath = `${folder}/${filename}`;
      const client = supabaseAdmin();
      await ensureBucket(client);
      const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(objectPath);
      if(error) throw error;
      return json(res, 200, {ok:true, bucket: BUCKET, path: objectPath, token: data.token, signedUrl: data.signedUrl});
    } catch(err){
      console.error('POST /api/signed-upload hata:', err.message);
      return json(res, 500, {ok:false, error:'Yükleme bağlantısı oluşturulamadı: ' + err.message});
    }
  }
  return json(res, 404, {ok:false, error:'API bulunamadı.'});
}

const server = http.createServer(async (req, res) => {
  const pathname = (req.url || '/').split('?')[0];
  try{
    if(pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
  } catch(err){
    console.error('API genel hata:', err);
    return json(res, 500, {ok:false, error: err.message || 'Sunucu hatası'});
  }

  let reqPath = pathname;
  if(reqPath === '/') reqPath = '/index.html';
  if(reqPath === '/admin') reqPath = '/admin.html';
  if(reqPath === '/deneyimli-kadro') reqPath = '/deneyimli-kadro.html';
  if(reqPath === '/merak-edilenler') reqPath = '/merak-edilenler.html';
  const filePath = safeJoin(PUBLIC_DIR, reqPath);
  if(!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, 'Erişim yok');

  fs.readFile(filePath, (err, data) => {
    if(err) return send(res, 404, 'Dosya bulunamadı');
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, mime[ext] || 'application/octet-stream');
  });
});

server.listen(PORT, () => {
  console.log(`Hazeyn web sitesi çalışıyor: http://localhost:${PORT}`);
  console.log(`Yönetici paneli: http://localhost:${PORT}/admin`);
});
