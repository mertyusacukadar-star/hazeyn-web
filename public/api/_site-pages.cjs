const fs = require('node:fs');
const path = require('node:path');
const pages = require('./_site-render.cjs');
const design = require('../umre-visuals');
const card = require('../tour-card');
const root = path.join(__dirname,'..');
const origin = 'https://www.hazeynturizm.com';
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = data => JSON.stringify(data).replace(/</g,'\\u003c');
function content(html,id,value) {
  const open = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\bid="${id}"[^>]*>`,'i').exec(html);
  if(!open) return html;
  const start = open.index+open[0].length;
  const tag = new RegExp(`<(/?)${open[1]}\\b[^>]*>`,'gi');
  tag.lastIndex=start;
  let depth=1,match;
  while((match=tag.exec(html))) {
    depth += match[1] ? -1 : 1;
    if(depth===0) return html.slice(0,start)+value+html.slice(match.index);
  }
  return html;
}
function prepared(input) {
  return {...input,settings:design.settings(input.settings),tours:(input.tours || []).map(design.tour)};
}
function template(name,input) {
  const state=prepared(input);
  // Static paths let both serverless and Node-server bundlers include templates.
  let html=name==='index.html' ? fs.readFileSync(path.join(__dirname,'../index.html'),'utf8')
    : name==='merak-edilenler.html' ? fs.readFileSync(path.join(__dirname,'../merak-edilenler.html'),'utf8')
    : fs.readFileSync(path.join(__dirname,'../deneyimli-kadro.html'),'utf8');
  html=html.replace(/<script id="hazeynPublicData"[\s\S]*?<\/script>/g,'');
  html=html.replace(/<div class="nav-actions">/g,'<div class="nav-actions" id="navActions">');
  html=content(html,'navLinks',pages.header(state.settings).match(/<div class="nav-links" id="navLinks">([\s\S]*?)<\/div>/)[1]);
  html=content(html,'navActions',pages.header(state.settings).match(/<div class="nav-actions" id="navActions">([\s\S]*?)<\/div>/)[1]);
  if(name==='index.html') {
    const tours=pages.activeUmreTours(state);
    html=content(html,'umreTours',tours.map(card).join(''));
    const hero=(state.settings.heroBanners || [])[0];
    if(hero) {
      // Replace the whole background block, not just the inner slide's closing tag.
      // Templates are also regenerated from their last published copy.
      html=html.replace(/<div class="hero-bg"[^>]*>[\s\S]*?(?=<div class="hero-overlay")/,`<div class="hero-bg"><div class="hero-slide active" style="background-image:url('${escape(hero.image)}')"></div></div>\n      `);
      html=content(html,'heroTitle',escape(hero.title));
      html=content(html,'heroSubtitle',escape(hero.subtitle));
    }
  }
  for(const [prefix,id] of [['blog','blogPageHero'],['staff','staffPageHero']]) {
    const image=String(state.settings[prefix+'BannerImage'] || '').replace(/["\\\n\r]/g,'');
    html=html.replace(new RegExp(`(<section[^>]*id="${id}")[^>]*>`),`$1 style="background-image:linear-gradient(135deg,rgba(8,8,10,.9),rgba(${prefix==='blog'?'72,48,10,.58':'22,22,24,.55'})),url(&quot;${escape(image)}&quot;)">`);
    for(const field of ['Kicker','Title','Subtitle']) html=content(html,prefix+'Banner'+field,escape(state.settings[prefix+'Banner'+field] || (field==='Title' ? prefix==='blog'?'Merak Edilenler':'Deneyimli Kadro' : '')));
  }
  if(name==='merak-edilenler.html') {
    const saved=(state.blogs||[]).map(pages.normalizeBlog),known=new Set(saved.map(b=>b.slug));
    state.blogs=[...saved,...pages.requiredBlogs.filter(b=>!known.has(b.slug)).map(pages.normalizeBlog)];
    html=content(html,'blogGrid',state.blogs.slice(0,6).map(b=>`<a class="blog-card" href="/rehber/${escape(b.slug)}"><span>${escape(b.category)}</span><h3>${escape(b.title)}</h3><p>${escape(b.summary)}</p><span class="text-btn">Devamını Oku →</span></a>`).join(''));
    html=content(html,'blogSearchStatus',state.blogs.length+' yazı · Sayfa 1 / '+Math.ceil(state.blogs.length/6));
  }
  if(name==='deneyimli-kadro.html') html=content(html,'staffGrid',(state.staff||[]).map(s=>`<article class="staff-card"><div class="staff-photo"><img src="${escape(s.image)}" alt="${escape(s.name)}" loading="lazy"></div><div><span>${escape(s.role)}</span><h3>${escape(s.name)}</h3><p>${escape(s.bio)}</p></div></article>`).join(''));
  html=html.replace('</head>','<script id="hazeynPublicData" type="application/json">'+json(state)+'</script></head>');
  return html;
}
function local(state) {
  return pages.renderLocalPage(prepared(state),origin).replaceAll('/assets/hero.svg','/assets/umre-makkah-sunrise.png').replaceAll('class="seo-grid-3"','class="tour-grid"');
}
function prices(state) {
  return pages.renderPricesPage(prepared(state),origin).replaceAll('/assets/hero.svg','/assets/umre-makkah-sunrise.png').replaceAll('class="seo-grid-3"','class="tour-grid"');
}
module.exports={template,prepared,content,local,prices,pages,origin};
