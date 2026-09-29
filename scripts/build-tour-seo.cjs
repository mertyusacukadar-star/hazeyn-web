// Public-data-only HTML snapshots, followed by existing live-data hydration.
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const metadata=require('../public/tour-seo');
const root=path.join(__dirname,'..');
const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function main(){
  const response=await fetch('https://www.hazeynturizm.com/api/data');
  if(!response.ok) throw new Error('Public data unavailable');
  const state=await response.json();
  if(!Array.isArray(state.tours)) throw new Error('Invalid public tours');
  const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'public/umre-visuals.js'),'utf8'),context);
  const tours=state.tours.filter(t=>t.type==='umre'&&t.status==='active'&&/^[a-z0-9-]+$/.test(t.slug));
  const template=fs.readFileSync(path.join(root,'public/program.html'),'utf8');
  fs.mkdirSync(path.join(root,'public/programlar'),{recursive:true});
  for(const source of tours){
    const tour={...source,image:context.window.umreVisual(source,source.image)};
    const meta=metadata(tour,state.settings);
    const banner=context.window.umreBanner(tour,source.detailBannerImage);
    const prices=Object.entries(tour.roomPrices||{}).map(([room,price])=>`<li>${escape(room)} kişilik odada kişi başı: <strong>${escape(price)}</strong></li>`).join('');
    const main=`<section class="seo-hero program-wide-hero"><img class="seo-hero-media" src="${escape(banner)}" alt="${escape(tour.title)}"><div class="container seo-hero-copy"><span class="eyebrow">İstanbul çıkışlı Umre programları</span><h1>${escape(tour.title)}</h1><p>${escape(tour.departureDate||'Kalkış tarihi rezervasyon öncesinde teyit edilir')} · ${escape(tour.durationDays)} gün</p></div></section><div class="container seo-content"><section class="seo-card"><h2>Oda fiyatları ve konaklama</h2><ul>${prices}</ul><p>Fiyatlar kişi başıdır. Kontenjan rezervasyon öncesinde teyit edilir.</p><p>Mekke: ${escape(tour.mekkeHotelName)}<br>Medine: ${escape(tour.medineHotelName)}</p><p><a href="/tr#iletisim">Bilgi ve rezervasyon için Hazeyn Turizm’e ulaşın</a></p></section></div>`;
    let html=template.replace(/<title>[^<]*<\/title>/,`<title>${escape(meta.title)}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${escape(meta.description)}" />`).replace(/<main id="main-content">[\s\S]*?<\/main>/,`<main id="main-content">${main}</main>`);
    html=html.replace('</head>',`<link rel="canonical" href="${escape(meta.url)}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:url" content="${escape(meta.url)}"><meta property="og:image" content="${escape(meta.image)}"><meta name="twitter:card" content="summary_large_image"><script id="tourStructuredData" type="application/ld+json">${JSON.stringify(meta.schema).replace(/</g,'\\u003c')}</script></head>`);
    fs.writeFileSync(path.join(root,'public/programlar',tour.slug+'.html'),html);
  }
  for(const file of ['vercel.json','public/vercel.json']){
    const config=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
    config.rewrites=config.rewrites.filter(r=>!r.destination.startsWith('/programlar/'));
    const position=config.rewrites.findIndex(r=>r.source==='/:slug([a-z0-9-]+)');
    config.rewrites.splice(position<0?config.rewrites.length:position,0,...tours.flatMap(t=>[{source:'/'+t.slug,destination:'/programlar/'+t.slug+'.html'},{source:'/'+t.slug+'/',destination:'/programlar/'+t.slug+'.html'}]));
    fs.writeFileSync(path.join(root,file),JSON.stringify(config,null,2)+'\n');
  }
  const homeFile=path.join(root,'public/index.html');
  const links='<nav aria-label="Umre programlarına hızlı erişim"><ul>'+tours.map(t=>`<li><a href="/${escape(t.slug)}">${escape(t.title)} — ${escape(t.durationDays)} gün</a></li>`).join('')+'</ul></nav>';
  fs.writeFileSync(homeFile,fs.readFileSync(homeFile,'utf8').replace(/<!-- TOUR_DISCOVERY_START -->[\s\S]*?<!-- TOUR_DISCOVERY_END -->/,'<!-- TOUR_DISCOVERY_START -->\n'+links+'\n<!-- TOUR_DISCOVERY_END -->'));
  console.log(`${tours.length} public tour HTML pages generated.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
