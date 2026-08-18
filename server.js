const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  TABLE, BUCKET,
  supabaseAdmin, ensureBucket,
  checkAdmin, verifyAdminCredential,
  normalizeCompanyId, companyRowId, companyDefaultData,
  sanitizeAdminState, sanitizePublicState
} = require('./api/_supabase');
const {
  login: loginDesktopUser,
  readUsers,
  publicUser,
  authenticateDesktopRequest,
  authorizeDataRequest,
  applyDesktopAudit,
  filterStateByPermissions,
  assertStateChangeAllowed,
  saveEmployee,
  deleteEmployee
} = require('./api/_appAuth');
const {
  slugify,
  normalizeTour,
  normalizeBlog,
  requiredBlogs,
  renderProgramPage,
  renderPricesPage,
  renderArticlePage,
  renderLocalPage,
  renderSitemap,
  renderRobots
} = require('./site-render');
const { renderHomePage } = require('./home-render');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml; charset=utf-8', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon'
};

function send(res, code, body, type='text/plain; charset=utf-8', headers={}){
  res.writeHead(code, {
    'Content-Type': type,
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'strict-origin-when-cross-origin',
    ...headers
  });
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

function readJsonBody(req, maxBytes = 1024 * 1024){
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > maxBytes){
        const error = new Error('İstek çok büyük.');
        error.statusCode = 413;
        reject(error);
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch(error) {
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function companyFromRequest(req, requestUrl){
  return normalizeCompanyId(requestUrl.searchParams.get('company') || req.headers['x-company-id']);
}

function localDbPath(companyId){
  return normalizeCompanyId(companyId) === 'hakikat' ? path.join(DATA_DIR, 'db-hakikat.json') : DB_PATH;
}

function readLocalState(companyId = 'hazeyn'){
  try { return JSON.parse(fs.readFileSync(localDbPath(companyId), 'utf8')); }
  catch(e) { return companyDefaultData(companyId); }
}

async function readCentralState(companyId = 'hazeyn'){
  try {
    const client = supabaseAdmin();
    const { data, error } = await client.from(TABLE).select('data').eq('id', companyRowId(companyId)).maybeSingle();
    if(error) throw error;
    return data && data.data ? data.data : readLocalState(companyId);
  } catch(error) {
    console.error('Supabase veri okuma hatası:', error);
    return readLocalState(companyId);
  }
}

function cleanFileName(name){
  const ext = path.extname(String(name || '')).toLowerCase() || '.jpg';
  const base = path.basename(String(name || 'image'), ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 60) || 'image';
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
}

function siteOrigin(req){
  const forwarded = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwarded || (req.socket && req.socket.encrypted ? 'https' : 'http');
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.hazeynturizm.com').split(',')[0].trim();
  if(/^(www\.)?hazeynturizm\.com(?::\d+)?$/i.test(host)) return 'https://www.hazeynturizm.com';
  return `${protocol}://${host}`.replace(/\/$/, '');
}

const server = http.createServer(async (req, res) => {
  ensureDb();
  const requestUrl = new URL(req.url, 'http://localhost');
  const pathname = requestUrl.pathname;
  if(pathname === '/api/app-auth'){
    const action = requestUrl.searchParams.get('action') || '';
    try {
      if(req.method === 'POST' && action === 'login'){
        const body = await readJsonBody(req);
        const result = await loginDesktopUser(body.username, body.password);
        if(!result) return send(res, 401, JSON.stringify({ok:false, error:'Kullanıcı adı veya şifre hatalı.'}), 'application/json; charset=utf-8');
        return send(res, 200, JSON.stringify({ok:true, ...result}), 'application/json; charset=utf-8');
      }

      const auth = await authenticateDesktopRequest(req);
      if(!auth) return send(res, 401, JSON.stringify({ok:false, error:'Oturum geçersiz veya süresi dolmuş.'}), 'application/json; charset=utf-8');
      if(req.method === 'GET' && action === 'me'){
        return send(res, 200, JSON.stringify({ok:true, user:auth.user}), 'application/json; charset=utf-8');
      }
      if(auth.user.role !== 'owner'){
        return send(res, 403, JSON.stringify({ok:false, error:'Bu işlem yalnızca baş yöneticiye açıktır.'}), 'application/json; charset=utf-8');
      }
      if(req.method === 'GET' && action === 'users'){
        const store = await readUsers();
        return send(res, 200, JSON.stringify({ok:true, users:store.users.map(publicUser)}), 'application/json; charset=utf-8');
      }
      if(req.method === 'POST' && action === 'save-user'){
        const body = await readJsonBody(req);
        const user = await saveEmployee(body.user || body);
        return send(res, 200, JSON.stringify({ok:true, user}), 'application/json; charset=utf-8');
      }
      if(req.method === 'POST' && action === 'delete-user'){
        const body = await readJsonBody(req);
        await deleteEmployee(body.id);
        return send(res, 200, JSON.stringify({ok:true}), 'application/json; charset=utf-8');
      }
      return send(res, 405, JSON.stringify({ok:false, error:'Desteklenmeyen işlem.'}), 'application/json; charset=utf-8');
    } catch(error) {
      console.error('Masaüstü kullanıcı işlemi hatası:', error);
      const status = error.statusCode || (/en az|zaten|bulunamadı|yaz/i.test(String(error.message || '')) ? 400 : 500);
      return send(res, status, JSON.stringify({ok:false, error:error.message || 'Kullanıcı işlemi tamamlanamadı.'}), 'application/json; charset=utf-8');
    }
  }
  if(pathname === '/api/login' && req.method === 'POST'){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const companyId = normalizeCompanyId(data.company || req.headers['x-company-id']);
        if(verifyAdminCredential(data.password, companyId)){
          return send(res, 200, JSON.stringify({ok:true, company:companyId}), 'application/json; charset=utf-8');
        }
        return send(res, 401, JSON.stringify({ok:false, error:'Şifre hatalı.'}), 'application/json; charset=utf-8');
      } catch(e) {
        return send(res, 400, JSON.stringify({ok:false, error:'Geçersiz istek.'}), 'application/json; charset=utf-8');
      }
    });
    return;
  }
  if(pathname === '/api/data' && req.method === 'GET'){
    const wantsAdmin = requestUrl.searchParams.get('scope') === 'admin';
    const requestedCompanyId = companyFromRequest(req, requestUrl);
    const companyId = wantsAdmin ? requestedCompanyId : 'hazeyn';
    let authorization = wantsAdmin ? await authorizeDataRequest(req, companyId) : null;
    if(wantsAdmin && !authorization){
      return send(res, 401, JSON.stringify({ok:false, error:'Yetkisiz.'}), 'application/json; charset=utf-8');
    }
    if(requestUrl.searchParams.get('action') === 'upload-config'){
      authorization = authorization || await authorizeDataRequest(req, requestedCompanyId);
      if(!authorization){
        return send(res, 401, JSON.stringify({ok:false, error:'Yetkisiz.'}), 'application/json; charset=utf-8');
      }
      return send(res, 200, JSON.stringify({
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        bucket: BUCKET
      }), 'application/json; charset=utf-8');
    }
    const rawState = await readCentralState(companyId);
    const payload = wantsAdmin ? sanitizeAdminState(rawState) : sanitizePublicState(rawState);
    return send(res, 200, JSON.stringify(payload), 'application/json; charset=utf-8', {'X-Hazeyn-Data-Source':'supabase','X-Turizm-Company':companyId});
  }
  if(pathname === '/api/media-upload' && req.method === 'POST'){
    const companyId = companyFromRequest(req, requestUrl);
    if(!await authorizeDataRequest(req, companyId)){
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
        const requestedFolder = String(req.headers['x-upload-folder'] || 'uploads').replace(/[^a-z0-9-_\/]/gi, '').replace(/^\/+/, '').slice(0, 70) || 'uploads';
        const folder = `${companyId}/${requestedFolder}`;
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
    const companyId = companyFromRequest(req, requestUrl);
    const authorization = await authorizeDataRequest(req, companyId);
    if(!authorization){
      return send(res, 401, JSON.stringify({ok:false, error:'Bu firma hesabı için yetkin yok veya oturumun sona ermiş.'}), 'application/json; charset=utf-8');
    }
    if(requestUrl.searchParams.get('action') === 'signed-upload'){
      let uploadBody = '';
      req.on('data', chunk => {
        uploadBody += chunk;
        if(uploadBody.length > 1024 * 1024) req.destroy();
      });
      req.on('end', async () => {
        try {
          const input = JSON.parse(uploadBody || '{}');
          const requestedFolder = String(input.folder || 'uploads').replace(/[^a-z0-9-_\/]/gi, '').replace(/^\/+/, '').slice(0, 70) || 'uploads';
          const folder = `${companyId}/${requestedFolder}`;
          const objectPath = `${folder}/${cleanFileName(input.filename || 'image.jpg')}`;
          const client = supabaseAdmin();
          await ensureBucket(client);
          const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(objectPath);
          if(error) throw error;
          return send(res, 200, JSON.stringify({ok:true, bucket:BUCKET, path:objectPath, token:data.token, signedUrl:data.signedUrl}), 'application/json; charset=utf-8');
        } catch(error) {
          console.error('İmzalı görsel yükleme bağlantısı hatası:', error);
          return send(res, 500, JSON.stringify({ok:false, error:'Yükleme bağlantısı oluşturulamadı.'}), 'application/json; charset=utf-8');
        }
      });
      return;
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 700 * 1024 * 1024){ req.destroy(); }
    });
    req.on('end', async () => {
      try {
        let data = sanitizeAdminState(JSON.parse(body || '{}'));
        const client = supabaseAdmin();
        if(authorization.kind === 'desktop'){
          const { data: existing, error: readError } = await client.from(TABLE).select('data').eq('id', companyRowId(companyId)).maybeSingle();
          if(readError) throw readError;
          const previousState = existing && existing.data ? existing.data : companyDefaultData(companyId);
          data = filterStateByPermissions(data, previousState, authorization);
          assertStateChangeAllowed(data, previousState, authorization);
          data = applyDesktopAudit(data, previousState, authorization);
        }
        const { error } = await client.from(TABLE).upsert({
          id: companyRowId(companyId),
          data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        if(error) throw error;
        try {
          fs.writeFileSync(localDbPath(companyId), JSON.stringify(data, null, 2));
        } catch(localBackupError) {
          // Vercel çalışma dizini salt okunurdur; merkezi Supabase kaydı başarılıysa
          // yerel yedek hatası kullanıcı kaydını başarısız göstermemelidir.
          if(localBackupError && localBackupError.code !== 'EROFS') console.warn('Yerel veri yedeği yazılamadı:', localBackupError);
        }
        send(res, 200, JSON.stringify({ok:true, source:'supabase', company:companyId}), 'application/json; charset=utf-8');
      } catch(e) {
        console.error('Supabase veri kayıt hatası:', e);
        const status = Number(e && e.statusCode) || 502;
        send(res, status, JSON.stringify({ok:false, error:e && e.statusCode ? e.message : 'Merkezi veri kaydı yapılamadı.'}), 'application/json; charset=utf-8');
      }
    });
    return;
  }

  const origin = siteOrigin(req);
  if(pathname === '/' || pathname === '/tr' || pathname === '/tr/'){
    const state = await readCentralState();
    return send(res, 200, renderHomePage(state), 'text/html; charset=utf-8', {'Cache-Control':'public, max-age=60, stale-while-revalidate=300'});
  }
  if(pathname === '/robots.txt'){
    return send(res, 200, renderRobots(origin), 'text/plain; charset=utf-8', {'Cache-Control':'public, max-age=3600, stale-while-revalidate=86400'});
  }
  if(pathname === '/sitemap.xml'){
    const state = await readCentralState();
    return send(res, 200, renderSitemap(state, origin), 'application/xml; charset=utf-8', {'Cache-Control':'public, max-age=900, stale-while-revalidate=86400'});
  }
  if(pathname === '/umre-fiyatlari' || pathname === '/umre-fiyatlari/'){
    const state = await readCentralState();
    return send(res, 200, renderPricesPage(state, origin), 'text/html; charset=utf-8', {'Cache-Control':'public, max-age=300, stale-while-revalidate=900'});
  }
  if(pathname === '/umraniye-umre-turu' || pathname === '/umraniye-umre-turu/'){
    const state = await readCentralState();
    return send(res, 200, renderLocalPage(state, origin), 'text/html; charset=utf-8', {'Cache-Control':'public, max-age=300, stale-while-revalidate=900'});
  }

  if(pathname.startsWith('/rehber/') && !path.extname(pathname)){
    const state = await readCentralState();
    const requestedSlug = slugify(decodeURIComponent(pathname.slice('/rehber/'.length)).replace(/\/$/, ''));
    const savedBlogs = (state.blogs || []).map(normalizeBlog);
    const knownBlogs = new Set(savedBlogs.map(item => item.slug));
    const blogs = [...savedBlogs, ...requiredBlogs.filter(item => !knownBlogs.has(item.slug)).map(normalizeBlog)];
    const blog = blogs.find(item => item.slug === requestedSlug);
    if(blog) return send(res, 200, renderArticlePage(state, blog, origin), 'text/html; charset=utf-8', {'Cache-Control':'public, max-age=300, stale-while-revalidate=900'});
    const legacyBlog = blogs.find(item => slugify(item.title) === requestedSlug || (Array.isArray(item.legacySlugs) && item.legacySlugs.map(slugify).includes(requestedSlug)));
    if(legacyBlog) return send(res, 301, '', 'text/plain; charset=utf-8', {Location:`/rehber/${legacyBlog.slug}`, 'Cache-Control':'public, max-age=86400'});
  }

  if(pathname !== '/' && !path.extname(pathname) && !['/tr','/tr/','/admin','/deneyimli-kadro','/merak-edilenler'].includes(pathname)){
    const state = await readCentralState();
    const requestedSlug = slugify(decodeURIComponent(pathname).replace(/^\/+|\/+$/g, ''));
    const tours = (state.tours || []).map(normalizeTour);
    const tour = tours.find(item => item.slug === requestedSlug && item.status !== 'draft');
    if(tour) return send(res, 200, renderProgramPage(state, tour, origin), 'text/html; charset=utf-8', {'Cache-Control':'public, max-age=300, stale-while-revalidate=900'});
    const legacyTour = tours.find(item => item.status !== 'draft' && (slugify(item.title) === requestedSlug || (Array.isArray(item.legacySlugs) && item.legacySlugs.map(slugify).includes(requestedSlug))));
    if(legacyTour) return send(res, 301, '', 'text/plain; charset=utf-8', {Location:`/${legacyTour.slug}`, 'Cache-Control':'public, max-age=86400'});
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
    const cache = ext === '.html'
      ? 'no-cache'
      : ['.png','.jpg','.jpeg','.svg','.webp','.ico'].includes(ext)
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=300, stale-while-revalidate=86400';
    send(res, 200, data, mime[ext] || 'application/octet-stream', {'Cache-Control':cache});
  });
});

server.listen(PORT, () => {
  console.log(`Hazeyn web sitesi çalışıyor: http://localhost:${PORT}`);
  console.log(`Yönetici paneli: http://localhost:${PORT}/admin`);
});
