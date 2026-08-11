const { TABLE, ROW_ID, supabaseAdmin, readDefaultData } = require('./_supabase');
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
} = require('../site-render');
const { renderHomePage } = require('../home-render');

function originOf(req){
  const forwardedProto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.hazeynturizm.com').split(',')[0].trim();
  if(/^(www\.)?hazeynturizm\.com(?::\d+)?$/i.test(forwardedHost)) return 'https://www.hazeynturizm.com';
  const protocol = forwardedProto === 'http' ? 'http' : 'https';
  return `${protocol}://${forwardedHost}`.replace(/\/$/, '');
}

async function readState(){
  try{
    const client = supabaseAdmin();
    const { data, error } = await client.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle();
    if(error) throw error;
    return data && data.data ? data.data : readDefaultData();
  }catch(error){
    console.error('SEO sayfası Supabase okuma hatası:', error);
    return readDefaultData();
  }
}

function send(res, status, body, type, cache){
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res.status(status).send(body);
}

module.exports = async function handler(req, res){
  if(req.method !== 'GET') return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8', 'no-store');

  const route = String(req.query && req.query.route || '');
  const requestedPath = String(req.query && req.query.slug || '').replace(/^\/+|\/+$/g, '');
  const requestedSlug = requestedPath ? slugify(requestedPath) : '';
  const origin = originOf(req);

  if(route === 'robots') return send(res, 200, renderRobots(origin), 'text/plain; charset=utf-8', 'public, max-age=3600, stale-while-revalidate=86400');

  const state = await readState();
  if(route === 'home') return send(res, 200, renderHomePage(state), 'text/html; charset=utf-8', 'public, max-age=60, stale-while-revalidate=300');
  if(route === 'sitemap') return send(res, 200, renderSitemap(state, origin), 'application/xml; charset=utf-8', 'public, max-age=900, stale-while-revalidate=86400');
  if(route === 'prices') return send(res, 200, renderPricesPage(state, origin), 'text/html; charset=utf-8', 'public, max-age=300, stale-while-revalidate=900');
  if(route === 'local') return send(res, 200, renderLocalPage(state, origin), 'text/html; charset=utf-8', 'public, max-age=300, stale-while-revalidate=900');

  if(route === 'article'){
    const savedBlogs = (Array.isArray(state.blogs) ? state.blogs : []).map(normalizeBlog);
    const known = new Set(savedBlogs.map(item => item.slug));
    const blogs = [...savedBlogs, ...requiredBlogs.filter(item => !known.has(item.slug)).map(normalizeBlog)];
    const blog = blogs.find(item => item.slug === requestedSlug);
    if(blog) return send(res, 200, renderArticlePage(state, blog, origin), 'text/html; charset=utf-8', 'public, max-age=300, stale-while-revalidate=900');
    const legacyBlog = blogs.find(item => slugify(item.title) === requestedSlug || (Array.isArray(item.legacySlugs) && item.legacySlugs.map(slugify).includes(requestedSlug)));
    if(legacyBlog){
      res.setHeader('Location', `/rehber/${legacyBlog.slug}`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(301).send('');
    }
  }

  if(route === 'program'){
    const tours = (Array.isArray(state.tours) ? state.tours : []).map(normalizeTour);
    const tour = tours.find(item => item.status !== 'draft' && item.slug === requestedSlug);
    if(tour) return send(res, 200, renderProgramPage(state, tour, origin), 'text/html; charset=utf-8', 'public, max-age=300, stale-while-revalidate=900');
    const legacy = tours.find(item => item.status !== 'draft' && (slugify(item.title) === requestedSlug || (Array.isArray(item.legacySlugs) && item.legacySlugs.map(slugify).includes(requestedSlug))));
    if(legacy){
      res.setHeader('Location', `/${legacy.slug}`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(301).send('');
    }
  }

  return send(res, 404, 'Sayfa bulunamadı', 'text/plain; charset=utf-8', 'no-store');
};
