const http = require('http');
const fs = require('fs');
const path = require('path');
const { TABLE, ROW_ID, BUCKET, supabaseAdmin, ensureBucket } = require('./api/_supabase');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const ADMIN_PASSWORD = process.env.HAZEYN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Hazeyn_2026_!x9';

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml; charset=utf-8', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

function send(res, code, body, type='text/plain; charset=utf-8', headers={}){
  res.writeHead(code, {'Content-Type': type, 'Cache-Control':'no-store', ...headers});
  res.end(body);
}

function safeJoin(base, reqPath){
  const decoded = decodeURIComponent(reqPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][\/\\])+/, '');
  return path.join(base, normalized);
}

function ensureDb(){
  if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
  if(!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({settings:{},tours:[],reviews:[],gallery:[],passengerLists:[]}, null, 2));
}

const server = http.createServer(async (req, res) => {
  ensureDb();
  const requestUrl = new URL(req.url, 'http://localhost');
  const pathname = requestUrl.pathname;
  if(pathname === '/api/login' && req.method === 'POST'){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if(String(data.password || '') === String(ADMIN_PASSWORD)){
          return send(res, 200, JSON.stringify({ok:true}), 'application/json; charset=utf-8');
        }
        return send(res, 401, JSON.stringify({ok:false, error:'Şifre hatalı.'}), 'application/json; charset=utf-8');
      } catch(e) {
        return send(res, 400, JSON.stringify({ok:false, error:'Geçersiz istek.'}), 'application/json; charset=utf-8');
      }
    });
    return;
  }
  if(pathname === '/api/data' && req.method === 'GET'){
    if(requestUrl.searchParams.get('action') === 'upload-config'){
      return send(res, 200, JSON.stringify({
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        bucket: BUCKET
      }), 'application/json; charset=utf-8');
    }
    try {
      const client = supabaseAdmin();
      const { data, error } = await client.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle();
      if(error) throw error;
      const payload = data && data.data ? data.data : JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      return send(res, 200, JSON.stringify(payload), 'application/json; charset=utf-8', {'X-Hazeyn-Data-Source':'supabase'});
    } catch(error) {
      console.error('Supabase veri okuma hatası:', error);
      return send(res, 502, JSON.stringify({ok:false, error:'Merkezi veriye ulaşılamadı.'}), 'application/json; charset=utf-8');
    }
  }
  if(pathname === '/api/media-upload' && req.method === 'POST'){
    if(String(req.headers['x-admin-password'] || '') !== String(ADMIN_PASSWORD)){
      return send(res, 401, JSON.stringify({ok:false, error:'Yetkisiz.'}), 'application/json; charset=utf-8');
    }
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if(size > 1800000) req.destroy();
      else chunks.push(chunk);
    });
    req.on('end', async () => {
      try {
        if(!size || size > 1800000) return send(res, 413, JSON.stringify({ok:false, error:'Görsel en fazla 1,8 MB olabilir.'}), 'application/json; charset=utf-8');
        const contentType = String(req.headers['content-type'] || 'image/jpeg');
        if(!contentType.startsWith('image/')) return send(res, 415, JSON.stringify({ok:false, error:'Geçersiz görsel.'}), 'application/json; charset=utf-8');
        const extension = path.extname(String(req.headers['x-file-name'] || '')).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
        const folder = String(req.headers['x-upload-folder'] || 'uploads').replace(/[^a-z0-9-_\/]/gi, '').replace(/^\/+/, '').slice(0, 80) || 'uploads';
        const objectPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,10)}${extension}`;
        const client = supabaseAdmin();
        await ensureBucket(client);
        const { error } = await client.storage.from(BUCKET).upload(objectPath, Buffer.concat(chunks), { contentType, upsert: false });
        if(error) throw error;
        const published = client.storage.from(BUCKET).getPublicUrl(objectPath);
        const publicUrl = published && published.data && published.data.publicUrl;
        if(!publicUrl) throw new Error('Görsel adresi oluşturulamadı.');
        return send(res, 200, JSON.stringify({ok:true, url:publicUrl}), 'application/json; charset=utf-8');
      } catch(error) {
        console.error(error);
        return send(res, 500, JSON.stringify({ok:false, error:'Görsel kalıcı alana yüklenemedi.'}), 'application/json; charset=utf-8');
      }
    });
    return;
  }
  if(pathname === '/api/data' && req.method === 'POST'){
    if(String(req.headers['x-admin-password'] || '') !== String(ADMIN_PASSWORD)){
      return send(res, 401, JSON.stringify({ok:false, error:'Yetkisiz.'}), 'application/json; charset=utf-8');
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 700 * 1024 * 1024){ req.destroy(); }
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const client = supabaseAdmin();
        const { error } = await client.from(TABLE).upsert({
          id: ROW_ID,
          data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        if(error) throw error;
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        } catch(localBackupError) {
          // Vercel çalışma dizini salt okunurdur; merkezi Supabase kaydı başarılıysa
          // yerel yedek hatası kullanıcı kaydını başarısız göstermemelidir.
          if(localBackupError && localBackupError.code !== 'EROFS') console.warn('Yerel veri yedeği yazılamadı:', localBackupError);
        }
        send(res, 200, JSON.stringify({ok:true, source:'supabase'}), 'application/json; charset=utf-8');
      } catch(e) {
        console.error('Supabase veri kayıt hatası:', e);
        send(res, 502, JSON.stringify({ok:false, error:'Merkezi veri kaydı yapılamadı.'}), 'application/json; charset=utf-8');
      }
    });
    return;
  }

  let reqPath = pathname;
  if(reqPath === '/') reqPath = '/index.html';
  if(reqPath === '/tr' || reqPath === '/tr/') reqPath = '/index.html';
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
