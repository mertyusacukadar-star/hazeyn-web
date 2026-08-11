const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const ADMIN_PASSWORD = process.env.HAZEYN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const PUBLIC_SETTING_KEYS = ['brand','phone','phone2','whatsapp','email','website','instagram','address','heroTitle','heroSubtitle','heroMode','heroBanners','staffBannerKicker','staffBannerTitle','staffBannerSubtitle','staffBannerImage','blogBannerKicker','blogBannerTitle','blogBannerSubtitle','blogBannerImage','searchConsoleVerification','googleMapsEmbedUrl','officeImages','ga4MeasurementId','metaPixelId','googleAdsId','googleAdsWhatsappLabel','googleAdsPhoneLabel','googleAdsFormLabel'];

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml; charset=utf-8', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

function send(res, code, body, type='text/plain; charset=utf-8'){
  res.writeHead(code, {'Content-Type': type, 'Cache-Control':'no-store'});
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

function isAdmin(value){
  return Boolean(ADMIN_PASSWORD) && String(value || '') === String(ADMIN_PASSWORD);
}

function sanitizeAdminState(input){
  const state = JSON.parse(JSON.stringify(input || {}));
  delete state.adminPassword;
  if(state.settings){ delete state.settings.adminPassword; delete state.settings.password; }
  return state;
}

function sanitizePublicState(input){
  const state = sanitizeAdminState(input);
  const settings = {};
  PUBLIC_SETTING_KEYS.forEach(key => { if(Object.prototype.hasOwnProperty.call(state.settings || {}, key)) settings[key] = state.settings[key]; });
  const items = key => (Array.isArray(state[key]) ? state[key] : []).filter(item => !(item && (item.status === 'draft' || item.published === false)));
  return {_meta:{updatedAt:Number(state._meta && state._meta.updatedAt || 0)}, settings, tours:items('tours'), reviews:items('reviews'), gallery:items('gallery'), staff:items('staff'), blogs:items('blogs')};
}

const server = http.createServer((req, res) => {
  ensureDb();
  if(req.url === '/api/login' && req.method === 'POST'){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if(isAdmin(data.password)){
          return send(res, 200, JSON.stringify({ok:true}), 'application/json; charset=utf-8');
        }
        return send(res, 401, JSON.stringify({ok:false, error:'Şifre hatalı.'}), 'application/json; charset=utf-8');
      } catch(e) {
        return send(res, 400, JSON.stringify({ok:false, error:'Geçersiz istek.'}), 'application/json; charset=utf-8');
      }
    });
    return;
  }
  if(req.url.split('?')[0] === '/api/data' && req.method === 'GET'){
    const requestUrl = new URL(req.url, 'http://localhost');
    if(requestUrl.searchParams.get('scope') === 'admin' && !isAdmin(req.headers['x-admin-password'])){
      return send(res, 401, JSON.stringify({ok:false, error:'Yetkisiz.'}), 'application/json; charset=utf-8');
    }
    const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const payload = isAdmin(req.headers['x-admin-password']) ? sanitizeAdminState(raw) : sanitizePublicState(raw);
    return send(res, 200, JSON.stringify(payload), 'application/json; charset=utf-8');
  }
  if(req.url === '/api/data' && req.method === 'POST'){
    if(!isAdmin(req.headers['x-admin-password'])){
      return send(res, 401, JSON.stringify({ok:false, error:'Yetkisiz.'}), 'application/json; charset=utf-8');
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 700 * 1024 * 1024){ req.destroy(); }
    });
    req.on('end', () => {
      try {
        const data = sanitizeAdminState(JSON.parse(body || '{}'));
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        send(res, 200, JSON.stringify({ok:true}), 'application/json; charset=utf-8');
      } catch(e) {
        send(res, 400, JSON.stringify({ok:false, error:'JSON kaydı yapılamadı.'}), 'application/json; charset=utf-8');
      }
    });
    return;
  }

  let reqPath = req.url.split('?')[0];
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
