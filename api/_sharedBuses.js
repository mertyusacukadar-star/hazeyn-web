'use strict';
const crypto=require('crypto');
const Companies=require('../public/company-config');
const P=require('../public/bus-plan');
const C=require('../public/bus-companies');
const {validateBusPlans}=require('./_busPlans');
function fail(message,code=400){const e=Error(message);e.statusCode=code;throw e;}
function accessibleCompanies(auth){return auth?.user?.role==='owner'?[...Companies.ids]:Companies.permitted(auth?.user?.companies);}
function allowed(auth,write=false,required=[]){
 const u=auth?.user,available=accessibleCompanies(auth);
 return Boolean(u&&available.length>=2&&required.every(c=>available.includes(c))&&(u.role==='owner'||(u.permissions?.viewPassengers===true&&(!write||u.permissions?.managePassengers===true))));
}
function tours(state){return state?.accountingTours||state?.tours||[];}
function validateSources(sources,states){
 if(!Array.isArray(sources)||sources.length<2||sources.length>Companies.ids.length||sources.some(s=>!s)||new Set(sources.map(s=>s.company)).size!==sources.length)fail('Her firmadan bir program seçin.');
 return sources.map(s=>{
  if(!Companies.valid(s.company)||typeof s.tourId!=='string'||!tours(states[s.company]).some(t=>String(t.id)===s.tourId))fail('Seçilen program bulunamadı. Listeyi yenileyin.');
  const valid=(states[s.company].passengerLists||[]).filter(l=>String(l.tourId)===s.tourId).map(l=>String(l.id));
  if(s.listIds!==null&&(!Array.isArray(s.listIds)||!s.listIds.length||new Set(s.listIds).size!==s.listIds.length||s.listIds.some(id=>!valid.includes(id))))fail('Seçilen yolcu listesi bu programa ait değil.');
  return {company:s.company,tourId:s.tourId,listIds:s.listIds===null?null:[...s.listIds]};
 });
}
function context(store,states,company,tourId){
 const record=(store.plans||[]).find(p=>!p.archived&&p.sources.some(s=>s.company===company&&s.tourId===tourId));
 const catalog=Object.fromEntries(Object.keys(states).filter(Companies.valid).map(c=>[c,tours(states[c]).map(t=>({id:String(t.id),title:t.title||'',date:t.departureDate||'',status:t.status||'',linked:(store.plans||[]).some(p=>!p.archived&&p.sources.some(s=>s.company===c&&s.tourId===String(t.id))),lists:(states[c].passengerLists||[]).filter(l=>String(l.tourId)===String(t.id)).map(l=>({id:String(l.id),title:l.title||'',count:(l.passengers||[]).length}))}))]));
 const sources=record?.sources.map(s=>{const tour=tours(states[s.company]).find(t=>String(t.id)===s.tourId);return {...s,title:tour?.title||'Eski program',date:tour?.departureDate||''};});
 return {ok:true,record:record?{...record,sources}:null,people:record?record.sources.flatMap(s=>C.roster(states[s.company],s)):[],catalog};
}
function mutate(store,states,body,actor){
 const next=structuredClone(store);next.plans||=[];
 if(body.action==='create'){
  const sources=validateSources(body.sources,states);
  if(next.plans.some(p=>!p.archived&&p.sources.some(s=>sources.some(a=>a.company===s.company&&a.tourId===s.tourId))))fail('Bu programlardan biri zaten ortak planda. Sayfayı yenileyip o planı açın.',409);
  const record={id:crypto.randomUUID(),revision:1,sources,plan:C.seed(sources,states),updatedBy:actor,updatedAt:new Date().toISOString()};
  next.plans.push(record);return {store:next,record};
 }
 const record=next.plans.find(p=>p.id===body.id&&!p.archived);
 if(!record)fail('Ortak plan bulunamadı veya bağlantısı kaldırıldı.',404);
 if(record.revision!==body.revision)fail('Ortak plan başka bir cihazda değişti. Ekrandaki düzeniniz korundu; güncel planı açıp değişiklikleri yeniden uygulayın.',409);
 if(record.sources.some(s=>s.company==='afyon')&&body.companySchema!==2)fail('Firma desteği güncellendi. Uygulamayı yenileyip tekrar deneyin.',409);
 if(body.action==='extend'){
  if(body.companySchema!==2)fail('Uygulamayı yenileyip tekrar deneyin.',409);
  const sources=validateSources(body.sources,states);
  if(record.sources.some(old=>!sources.some(s=>s.company===old.company&&s.tourId===old.tourId&&JSON.stringify(s.listIds)===JSON.stringify(old.listIds))))fail('Mevcut ortak programlar ve liste seçimleri korunmalıdır.');
  const added=sources.filter(s=>!record.sources.some(old=>old.company===s.company));
  if(!added.length)fail('Eklenecek yeni firma seçin.');
  if(next.plans.some(p=>p.id!==record.id&&!p.archived&&p.sources.some(s=>added.some(a=>a.company===s.company&&a.tourId===s.tourId))))fail('Seçilen program zaten başka bir ortak planda.',409);
  const imported=C.seed(added,states,false);
  if(record.plan.buses.length+imported.buses.length>20)fail('Ortak planda en fazla 20 otobüs olabilir.');
  const ids=new Set(record.plan.buses.map(b=>b.id));
  for(const b of imported.buses){while(ids.has(b.id))b.id=crypto.randomUUID();ids.add(b.id);}
  record.sources=sources;record.plan.buses.push(...imported.buses);
 }else if(body.action==='archive'){record.archived=true;}
 else if(body.action==='save'){
  validateBusPlans({tourBusPlans:{shared:body.plan}});
  const ids=new Set(record.sources.flatMap(s=>C.roster(states[s.company],s)).map(p=>p.id));
  if(body.plan.buses.some(b=>Object.values(b.assignments).some(id=>!ids.has(id))))fail('Yolcu listeleri değişti. Güncel ortak planı açıp tekrar yerleştirin.',409);
  const companies=record.sources.map(s=>s.company);
  for(const bus of body.plan.buses){
   const rule=bus.companyRule;
   if(!rule)continue;
   if(!['free','split',...companies].includes(rule.mode))fail('Otobüs firması ortak plana dahil olmalıdır.');
   if(rule.mode==='split'&&(!companies.includes(rule.left)||!companies.includes(C.rightCompany(rule))||rule.left===C.rightCompany(rule)||(rule.center!=='any'&&!companies.includes(rule.center))))fail('Sol ve sağ için plana dahil iki farklı firma seçin.');
  }
  record.plan=P.normalizePlan(body.plan);
 }else fail('Geçersiz ortak plan işlemi.');
 record.revision++;record.updatedAt=new Date().toISOString();record.updatedBy=actor;
 return {store:next,record};
}
module.exports={accessibleCompanies,allowed,context,mutate,validateSources};
