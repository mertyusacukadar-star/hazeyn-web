// Generate static entry points from the original SEO templates and PUBLIC data only.
// No credentials or accounting state are read or written.
const fs = require('node:fs');
const path = require('node:path');
const pages = require('../site-render');
const origin = 'https://www.hazeynturizm.com';
async function main() {
  const response = await fetch(origin + '/api/data');
  if (!response.ok) throw new Error('Public content unavailable: ' + response.status);
  const data = await response.json();
  if (!Array.isArray(data.blogs) || !data.settings) throw new Error('Invalid public response');
  const state = {settings:data.settings, reviews:data.reviews || [], tours:data.tours || [], blogs:data.blogs};
  const publicDir = path.join(__dirname, '../public');
  const polish = html => html.replaceAll('/assets/hero.svg', '/assets/umre-makkah-sunrise.png').replace('</head>', '<link rel="stylesheet" href="/public-polish.css?v=20260929-3"></head>');
  const saved = state.blogs.map(pages.normalizeBlog);
  const known = new Set(saved.map(blog => blog.slug));
  const blogs = [...saved, ...pages.requiredBlogs.filter(blog => !known.has(blog.slug))];
  fs.mkdirSync(path.join(publicDir, 'rehber'), {recursive:true});
  for (const blog of blogs) {
    const html = polish(pages.renderArticlePage(state, blog, origin));
    fs.writeFileSync(path.join(publicDir, 'rehber', blog.slug + '.html'), html);
  }
  let local = polish(pages.renderLocalPage({...state,tours:[]}, origin));
  local = local.replace('<div class="seo-grid-3"><article class="seo-card"><h3>İstanbul çıkışlı yeni programlarımız hazırlanıyor</h3><p>Güncel kalkış tarihleri için ekibimize ulaşın.</p></article></div>', '<div class="tour-grid" id="localTours"><p>Güncel programlar yükleniyor… <a href="/tr#umre">Tüm programları gör</a></p></div>');
  local = local.replace('</body>', '<script src="/umre-visuals.js?v=20260929-2"></script><script src="/local-tours.js?v=20260929-3"></script></body>');
  fs.writeFileSync(path.join(publicDir, 'umraniye-umre-turu.html'), local);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), pages.renderSitemap(state, origin));
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), pages.renderRobots(origin));
  console.log('Restored local landing page and ' + blogs.length + ' guide pages.');
}
main().catch(error => {console.error(error);process.exitCode=1;});
