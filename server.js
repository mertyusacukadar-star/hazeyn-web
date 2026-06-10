const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

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

const server = http.createServer((req, res) => {
  ensureDb();
  if(req.url === '/api/data' && req.method === 'GET'){
    return send(res, 200, fs.readFileSync(DB_PATH, 'utf8'), 'application/json; charset=utf-8');
  }
  if(req.url === '/api/data' && req.method === 'POST'){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 700 * 1024 * 1024){ req.destroy(); }
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
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
