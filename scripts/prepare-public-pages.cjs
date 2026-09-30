const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),publicDir=path.join(root,'public');
async function prepare() {
  const response=await fetch('https://www.hazeynturizm.com/api/data');
  if(!response.ok) throw Error('Public content unavailable');
  const source=await response.json();
  if(!Array.isArray(source.tours)||!source.settings) throw Error('Invalid public data');
  // Explicit whitelist: published site content only, never accounting/passengers.
  const state={_meta:source._meta,settings:source.settings,tours:source.tours,blogs:source.blogs||[],staff:source.staff||[],gallery:source.gallery||[],reviews:source.reviews||[]};
  fs.writeFileSync(path.join(publicDir,'api/_public-snapshot.json'),JSON.stringify(state));
  fs.writeFileSync(path.join(publicDir,'api/_site-render.cjs'),fs.readFileSync(path.join(root,'site-render.js'),'utf8').replaceAll("require('./public/","require('../"));
  const render=require('../public/api/_site-pages.cjs');
  const nav=render.pages.header(state.settings).match(/<div class="nav-links" id="navLinks">([\s\S]*?)<\/div>/)[1];
  for(const name of ['index.html','merak-edilenler.html','deneyimli-kadro.html','program.html','admin.html']) {
    const file=path.join(publicDir,name);
    let html=fs.readFileSync(file,'utf8');
    if(name!=='admin.html') {
      html=render.content(html,'navLinks',nav);
      html=html.replace(/\s*<link rel="stylesheet" href="\/public-polish.css[^>]*>/g,'');
      html=html.replace('</head>','<link rel="stylesheet" href="/public-polish.css?v=20260930-1"></head>');
    }
    html=html.replace(/\s*<script src="\/?(?:umre-visuals|tour-card)\.js[^>]*><\/script>/g,'');
    html=html.replace(/(<script src="\/?app\.js)[^"]*"/,`<script src="/umre-visuals.js?v=20260930-1"></script><script src="/tour-card.js?v=20260930-1"></script>$1?v=20260930-1"`);
    fs.writeFileSync(file,html);
  }
  for(const name of ['index.html','merak-edilenler.html','deneyimli-kadro.html']) fs.writeFileSync(path.join(publicDir,name),render.template(name,state));
  fs.writeFileSync(path.join(publicDir,'umraniye-umre-turu.html'),render.local(state));
  fs.writeFileSync(path.join(publicDir,'umre-fiyatlari.html'),render.prices(state));
  fs.mkdirSync(path.join(publicDir,'programlar'),{recursive:true});
  for(const tour of state.tours.filter(t=>t.status!=='draft'&&/^[a-z0-9-]+$/.test(t.slug))) fs.writeFileSync(path.join(publicDir,'programlar',tour.slug+'.html'),render.pages.renderProgramPage(render.prepared(state),tour,render.origin));
  const saved=state.blogs.map(render.pages.normalizeBlog),known=new Set(saved.map(b=>b.slug));
  const blogs=[...saved,...render.pages.requiredBlogs.filter(b=>!known.has(b.slug)).map(render.pages.normalizeBlog)];
  fs.mkdirSync(path.join(publicDir,'rehber'),{recursive:true});
  for(const blog of blogs) fs.writeFileSync(path.join(publicDir,'rehber',blog.slug+'.html'),render.pages.renderArticlePage(state,blog,render.origin).replaceAll('/assets/hero.svg','/assets/umre-makkah-sunrise.png'));
  fs.writeFileSync(path.join(publicDir,'sitemap.xml'),render.pages.renderSitemap(state,render.origin));
  fs.writeFileSync(path.join(publicDir,'robots.txt'),render.pages.renderRobots(render.origin));
  console.log('Prepared complete first-paint HTML, shared navigation, covers and '+blogs.length+' guides.');
}
module.exports=prepare;
if(require.main===module) prepare().catch(e=>{console.error(e);process.exitCode=1;});
