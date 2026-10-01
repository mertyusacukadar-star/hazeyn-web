'use strict';
const {TABLE,supabaseAdmin,companyRowId,companyDefaultData}=require('./_supabase');
const {authenticateDesktopRequest,USERS_ROW_ID}=require('./_appAuth');
const Companies=require('../public/company-config');
const {validateBusPlans}=require('./_busPlans');
const Trash=require('../public/tour-trash');
const BusCompanies=require('../public/bus-companies');
const SharedRules=require('./_sharedBuses');
const R=require('./_recovery');
const SHARED='turizm-shared-bus-plans-v1';
const DIRECTORY='turizm-company-directory-v1';
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const auth=await authenticateDesktopRequest(req);
  // Complete backups contain financial records, identity documents and account hashes.
  if(auth?.user?.role!=='owner'&&auth?.user?.permissions?.manageRecovery!==true)return res.status(403).json({ok:false,error:'Yedek ve kurtarma yetkiniz bulunmuyor.'});
  const client=supabaseAdmin(), company=req.query?.company;
  if(!Companies.valid(company))R.fail('Geçerli bir firma seçin.',400);
  const action=req.query?.action||'history';
  const resource=req.query?.resource||company;
  if(![company,'sharedBuses','users','companyDirectory'].includes(resource))R.fail('Geçersiz yedek bölümü.',400);
  if(resource==='companyDirectory'&&auth.user.role!=='owner')R.fail('Firma tanımlarını yalnız baş yönetici geri yükleyebilir.',403);
  const id=resource==='companyDirectory'?DIRECTORY:resource==='users'?USERS_ROW_ID:resource==='sharedBuses'?SHARED:companyRowId(company);
  if(req.method==='GET'&&action==='history'){
   const page=Math.max(0,Math.min(10000,Number(req.query?.page)||0));
   const result=await client.from(TABLE).select('id,updated_at,data->reason,data->revision').like('id',R.prefix(id)+'%').order('updated_at',{ascending:false}).range(page*20,page*20+20);
   if(result.error)throw result.error;
   return res.status(200).json({ok:true,items:(result.data||[]).slice(0,20),more:(result.data||[]).length>20});
  }
  if(req.method==='GET'&&action==='export'){
   const records={};
   const directory=await R.read(client,DIRECTORY);records.companyDirectory={data:directory?.data||{companies:Companies.ids.map(id=>Companies.config[id])},revision:directory?.updated_at||''};
   for(const c of Companies.ids){const row=await R.read(client,companyRowId(c));records[c]={data:row?.data||companyDefaultData(c),revision:row?.updated_at||''};}
   for(const [name,key] of [['sharedBuses',SHARED],['users',USERS_ROW_ID]]){const row=await R.read(client,key);records[name]={data:row?.data||(name==='users'?{users:[]}:{plans:[]}),revision:row?.updated_at||''};}
   for(const [name,key] of [...Companies.ids.map(c=>[c,companyRowId(c)]),['sharedBuses',SHARED],['users',USERS_ROW_ID],['companyDirectory',DIRECTORY]]){
    const latest=await R.read(client,key);
    if((latest?.updated_at||'')!==records[name].revision)R.fail('Yedek hazırlanırken kayıtlar değişti. Tutarlı dosya için tekrar yedek indirin.',409);
   }
   const payload={format:'turizm-full-backup',version:1,createdAt:new Date().toISOString(),records};
   return res.status(200).json({...payload,sha256:R.digest(records)});
  }
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(action==='import-tour'){
   const b=body.backup;
   if(resource!==company||b?.format!=='turizm-tour-backup'||b.version!==1||b.company!==company||!b.tour?.id||!Array.isArray(b.lists)||b.lists.some(l=>String(l.tourId)!==String(b.tour.id)||!Array.isArray(l.passengers)))R.fail('Tur yedeği geçersiz veya başka bir firmaya ait.',400);
   const row=await R.read(client,id),current=row?.data||companyDefaultData(company);
   const working={...structuredClone(current),tours:structuredClone(current.accountingTours||current.tours||[])};
   if((working.deletedTours||[]).some(x=>String(x.tour.id)===String(b.tour.id)))R.fail('Bu tur Silinen turlar bölümünde mevcut; oradan geri alın.',409);
   working.deletedTours=[...(working.deletedTours||[]),{tour:b.tour,lists:b.lists,costs:b.costs,bus:b.bus}];
   let next;try{next=Trash.restore(working,b.tour.id);}catch(e){R.fail(e.message,409);}
   next.siteTours=structuredClone(current.siteTours||current.tours||[]);
   validateBusPlans(next);
   if(body.confirm!==true)return res.status(200).json({ok:true,revision:row?.updated_at||'',tours:1,lists:b.lists.length,passengers:b.lists.reduce((n,l)=>n+l.passengers.length,0)});
   R.expected(row,body.revision);next._meta={updatedAt:Date.now(),pendingSync:false};
   return res.status(200).json({ok:true,revision:await R.write(client,id,row,next,'before-tour-import')});
  }
  if(action==='checkpoint'){
   for(const key of [...Companies.ids.map(companyRowId),SHARED,USERS_ROW_ID,DIRECTORY]) await R.snapshot(client,key,await R.read(client,key),'checkpoint');
   return res.status(200).json({ok:true});
  }
  if(action==='preview'||action==='restore'){
   let source;
   if(body.snapshotId){
    if(typeof body.snapshotId!=='string'||!body.snapshotId.startsWith(R.prefix(id)))R.fail('Bu kurtarma noktası seçili firmaya ait değil.',400);
    const saved=await R.read(client,body.snapshotId);
    const s=saved?.data;
    if(!s||s.source!==id||s.sha256!==R.digest(s.state))R.fail('Kurtarma kopyası doğrulanamadı.',400);
    source=s.state;
   }else{
    const b=body.backup;
    if(b?.format!=='turizm-full-backup'||b.version!==1||b.sha256!==R.digest(b.records)||!b.records[resource])R.fail('Yedek dosyasının biçimi veya bütünlüğü geçersiz.',400);
    source=b.records[resource].data;
    if(body.useDeviceDraft===true){
     if(resource!==company||b.deviceDraft?.company!==company||!b.deviceDraft.state)R.fail('Bu dosyada seçili firmaya ait cihaz taslağı yok.',400);
     source=b.deviceDraft.state;
    }
   }
   const row=await R.read(client,id), current=row?.data||companyDefaultData(company);
   let data,counts;
   if(resource==='companyDirectory'){
    if(!Array.isArray(source?.companies)||source.companies.length>100||new Set(source.companies.map(c=>c?.id)).size!==source.companies.length)R.fail('Firma yedeği geçersiz.',400);
    const merged=Object.fromEntries(Companies.ids.map(c=>[c,Companies.config[c]]));
    for(const c of source.companies){
     if(!c||!/^(hazeyn|hakikat|afyon|c_[a-f0-9]{24})$/.test(c.id)||typeof c.name!=='string'||c.name.length<2||c.name.length>70)R.fail('Firma yedeği geçersiz.',400);
     const image=v=>typeof v==='string'&&v.length<=400000&&(/^(assets\/[a-z0-9-]+\.png)$/.test(v)||/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(v));
     if(![c.logo,c.loginLogo,c.receiptLogo].every(image))R.fail('Firma logosu geçersiz.',400);
     merged[c.id]={id:c.id,name:c.name,shortName:c.name,city:String(c.city||'').slice(0,60),receiptPrefix:String(c.receiptPrefix||'F').replace(/[^A-Z0-9]/g,'').slice(0,12),logo:c.logo,loginLogo:c.loginLogo,receiptLogo:c.receiptLogo,accent:/^#[0-9a-f]{6}$/i.test(c.accent)?c.accent:'#397c73',publicUrl:c.id==='hazeyn'?'index.html':''};
    }
    data={companies:Object.values(merged)};counts={companies:data.companies.length};
   }else if(resource==='users'){
    if(!Array.isArray(source?.users)||source.users.some(u=>!u.id||u.role!=='employee'||typeof u.username!=='string'||typeof u.passwordHash!=='string'||typeof u.passwordSalt!=='string'||!Array.isArray(u.companies)||u.companies.some(c=>!Companies.valid(c))))R.fail('Kullanıcı yedeği geçersiz.',400);
    if(new Set(source.users.map(u=>u.id)).size!==source.users.length||new Set(source.users.map(u=>u.username)).size!==source.users.length)R.fail('Yedekte yinelenen kullanıcı var.',400);
    data={users:source.users.map(u=>({...structuredClone(u),authVersion:require('crypto').randomUUID()})),updatedAt:Date.now()};counts={users:data.users.length};
   }else if(resource==='sharedBuses'){
    if(!Array.isArray(source?.plans))R.fail('Ortak otobüs yedeği geçersiz.',400);
    data=structuredClone(source);const states={};for(const c of Companies.ids)states[c]=(await R.read(client,companyRowId(c)))?.data||companyDefaultData(c);
    const seen=new Set();
    for(const p of data.plans){
     if(p.archived)continue;
     SharedRules.validateSources(p.sources,states);validateBusPlans({tourBusPlans:{shared:p.plan}});
     const people=new Set(p.sources.flatMap(s=>BusCompanies.roster(states[s.company],s)).map(x=>x.id));
     if(p.plan.buses.some(b=>Object.values(b.assignments||{}).some(pid=>!people.has(pid))))R.fail('Yedekteki ortak planın yolcuları eksik. Önce firma kayıtlarını geri yükleyin.',409);
     for(const s of p.sources){const key=s.company+':'+s.tourId;if(seen.has(key))R.fail('Yedekte bir tur iki ortak plana bağlı.',400);seen.add(key);}
     p.revision=Math.max(Number(p.revision)||0,Number((current.plans||[]).find(x=>x.id===p.id)?.revision)||0)+1;
    }
    counts={plans:data.plans.filter(p=>!p.archived).length};
   }else{
    data=R.restoredAccounting(current,source);validateBusPlans(data);
    counts={tours:data.tours.length,lists:data.passengerLists.length,passengers:data.passengerLists.reduce((n,l)=>n+(l.passengers||[]).length,0)};
   }
   if(action==='preview')return res.status(200).json({ok:true,revision:row?.updated_at||'',...counts});
   R.expected(row,body.revision);
   if(body.confirm!==true)R.fail('Geri yükleme onayı gerekiyor.',400);
   if(resource===company){
    const shared=await R.read(client,SHARED);
    if((shared?.data?.plans||[]).some(p=>!p.archived&&p.sources.some(s=>s.company===company)))R.fail('Bu firmada ortak otobüs planı var. Diğer firmanın yolcularını korumak için önce ortak plan bağlantısını kaldırın.',409);
   }
   const revision=await R.write(client,id,row,data,'before-restore');
   if(resource==='companyDirectory')Companies.apply(data.companies);
   return res.status(200).json({ok:true,revision});
  }
  return res.status(400).json({ok:false,error:'Geçersiz kurtarma işlemi.'});
 }catch(error){
  console.error('Recovery:',error.statusCode||error.code||'unavailable');
  return res.status(error.statusCode||503).json({ok:false,error:error.statusCode?error.message:'Yedek hizmetine ulaşılamadı. Kayıtlarınız değiştirilmedi.'});
 }
};
