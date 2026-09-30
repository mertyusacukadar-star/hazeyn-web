const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
for(const file of ['vercel.json','public/vercel.json']) {
  const config=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  const route=(source,name)=>({source,destination:'/api/site-page?route='+name});
  const rewrites=[
    ...['/','/tr','/tr/','/index.html'].map(s=>route(s,'home')),
    ...['/merak-edilenler','/merak-edilenler/','/merak-edilenler.html'].map(s=>route(s,'blog')),
    ...['/deneyimli-kadro','/deneyimli-kadro/','/deneyimli-kadro.html'].map(s=>route(s,'staff')),
    ...['/umraniye-umre-turu','/umraniye-umre-turu/','/umraniye-umre-turu.html'].map(s=>route(s,'local')),
    ...['/umre-fiyatlari','/umre-fiyatlari/','/umre-fiyatlari.html'].map(s=>route(s,'prices')),
    route('/sitemap.xml','sitemap'),
    {source:'/rehber/:slug',destination:'/api/site-page?route=article&slug=:slug'},
    {source:'/rehber/:slug/',destination:'/api/site-page?route=article&slug=:slug'},
    {source:'/rehber/:slug.html',destination:'/api/site-page?route=article&slug=:slug'},
    {source:'/programlar/:slug.html',destination:'/api/site-page?route=program&slug=:slug'},
    {source:'/admin',destination:'/admin.html'},
    {source:'/:slug([a-z0-9-]+)',destination:'/api/site-page?route=program&slug=:slug'},
    {source:'/:slug([a-z0-9-]+)/',destination:'/api/site-page?route=program&slug=:slug'}
  ];
  config.rewrites=rewrites;
  config.redirects=(config.redirects||[]).filter(r=>r.source!=='/program.html');
  config.redirects.push({source:'/program.html',has:[{type:'query',key:'slug',value:'(?<tourSlug>[a-z0-9-]+)'}],destination:'/:tourSlug',permanent:true});
  const prefix=file.startsWith('public/')?'':'public/';
  config.functions={...config.functions,'api/site-page.js':{includeFiles:prefix+'{index.html,merak-edilenler.html,deneyimli-kadro.html,api/_public-snapshot.json}'}};
  fs.writeFileSync(path.join(root,file),JSON.stringify(config,null,2)+'\n');
}
