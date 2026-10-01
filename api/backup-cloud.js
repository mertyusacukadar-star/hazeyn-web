'use strict';
const {supabaseAdmin}=require('./_supabase');
const {authenticateDesktopRequest}=require('./_appAuth');
const Cloud=require('./_backupCloud');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 const action=req.query?.action||'status';
 try{
  const client=supabaseAdmin();
  if(action==='callback'&&req.method==='GET'){
   let ok=false;try{await Cloud.callback(client,req.query||{});ok=true;}catch(_){}
   res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
   return res.status(ok?200:400).send(`<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Turizm Muhasebe · Yedek</title><style>body{background:#14272b;color:#eaf4ef;font:17px/1.7 system-ui;padding:10vh 8vw}main{max-width:620px;margin:auto}a{color:#a1e2c7}</style><main><h1>${ok?'Hesap bağlandı':'Hesap bağlanamadı'}</h1><p>${ok?'Muhasebe uygulamasına dönüp bu hedefi seçin ve yedek şifrenizi belirleyin. Bu pencereyi kapatabilirsiniz.':'Bağlantı izni verilmedi veya süresi doldu. Muhasebe uygulamasından yeniden deneyin.'}</p><a href="/admin.html?desktop=1">Muhasebe uygulamasına dön</a></main></html>`);
  }
  const auth=await authenticateDesktopRequest(req);
  if(auth?.user?.role!=='owner'&&auth?.user?.permissions?.manageRecovery!==true)return res.status(403).json({ok:false,error:'Bulut yedekleri yalnızca baş yönetici tarafından yönetilebilir.'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},provider=req.query?.provider||body.provider;
  if(action==='configure'&&req.method==='POST'){
   if(auth.user.role!=='owner')return res.status(403).json({ok:false,error:'İlk bağlantı kurulumu yalnız baş yöneticiye açıktır.'});
   return res.status(200).json(await Cloud.configure(client,provider,body));
  }
  if(action==='status'&&req.method==='GET')return res.status(200).json({ok:true,providers:await Cloud.status(client)});
  if(action==='start'&&req.method==='POST')return res.status(200).json({ok:true,url:await Cloud.start(client,provider)});
  if(action==='upload'&&req.method==='POST')return res.status(200).json({ok:true,...await Cloud.upload(client,provider,body.backup)});
  if(action==='list'&&req.method==='GET')return res.status(200).json({ok:true,...await Cloud.list(client,provider)});
  if(action==='download'&&req.method==='POST')return res.status(200).json({ok:true,backup:await Cloud.download(client,provider,body.id)});
  if(action==='disconnect'&&req.method==='POST'){await Cloud.disconnect(client,provider);return res.status(200).json({ok:true});}
  return res.status(405).json({ok:false,error:'Geçersiz bulut yedek işlemi.'});
 }catch(e){console.error('Cloud backup:',e.statusCode||e.code||'unavailable');return res.status(e.statusCode||503).json({ok:false,error:e.statusCode?e.message:'Bulut yedek hizmetine ulaşılamadı.'});}
};
