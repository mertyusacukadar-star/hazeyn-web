'use strict';
const crypto=require('crypto');
const P=require('../public/bus-plan');
const C=require('../public/bus-companies');
const {validateBusPlans}=require('./_busPlans');
function fail(message,code=400){const e=Error(message);e.statusCode=code;throw e;}
function allowed(auth,write=false){
 const u=auth?.user;return Boolean(u&&(u.role==='owner'||(['hazeyn','hakikat'].every(c=>u.companies?.includes(c))&&u.permissions?.viewPassengers===true&&(!write||u.permissions?.managePassengers===true))));
}
function tours(state){return state.accountingTours||state.tours||[];}
function validateSources(sources,states){
 if(!Array.isArray(sources)||sources.length!==2||new Set(sources.map(s=>s.company)).size!==2)fail('Her firmadan bir program seçin.');
 return sources.map(s=>{
  if(!['hazeyn','hakikat'].includes(s.company)||typeof s.tourId!=='string'||!tours(states[s.company]).some(t=>String(t.id)===s.tourId))fail('Seçilen program bulunamadı. Listeyi yenileyin.');
  const valid=(states[s.company].passengerLists||[]).filter(l=>String(l.tourId)===s.tourId).map(l=>String(l.id));
  if(s.listIds!==null&&(!Array.isArray(s.listIds)||!s.listIds.length||new Set(s.listIds).size!==s.listIds.length||s.listIds.some(id=>!valid.includes(id))))fail('Seçilen yolcu listesi bu programa ait değil.');
  return {company:s.company,tourId:s.tourId,listIds:s.listIds===null?null:[...s.listIds]};
 });
}
function context(store,states,company,tourId){
 const record=(store.plans||[]).find(p=>!p.archived&&p.sources.some(s=>s.company===company&&s.tourId===tourId));
 const catalog=Object.fromEntries(['hazeyn','hakikat'].map(c=>[c,tours(states[c]).map(t=>({id:String(t.id),title:t.title||'',date:t.departureDate||'',status:t.status||'',linked:(store.plans||[]).some(p=>!p.archived&&p.sources.some(s=>s.company===c&&s.tourId===String(t.id))),lists:(states[c].passengerLists||[]).filter(l=>String(l.tourId)===String(t.id)).map(l=>({id:String(l.id),title:l.title||'',count:(l.passengers||[]).length}))}))]));
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
 if(body.action==='archive'){record.archived=true;}
 else if(body.action==='save'){
  validateBusPlans({tourBusPlans:{shared:body.plan}});
  const ids=new Set(record.sources.flatMap(s=>C.roster(states[s.company],s)).map(p=>p.id));
  if(body.plan.buses.some(b=>Object.values(b.assignments).some(id=>!ids.has(id))))fail('Yolcu listeleri değişti. Güncel ortak planı açıp tekrar yerleştirin.',409);
  record.plan=P.normalizePlan(body.plan);
 }else fail('Geçersiz ortak plan işlemi.');
 record.revision++;record.updatedAt=new Date().toISOString();record.updatedBy=actor;
 return {store:next,record};
}
module.exports={allowed,context,mutate,validateSources};
