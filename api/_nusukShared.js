'use strict';
// Firmalar arası ortak Nusuk: aynı tarihte Ravza'ya girecek Hazeyn / Hakikat /
// Afyon programları elle birleştirilir. Birleştirme kaydı ortak satırda tutulur;
// yolcu ve Nusuk bilgisi her zaman kendi firmasının kaydında kalır ve oraya yazılır.
const crypto=require('crypto');
const Companies=require('../public/company-config');
const Recovery=require('./_recovery');
const Nusuk=require('./_nusuk');
const {companyRowId,companyDefaultData}=require('./_supabase');

const STORE_ID='turizm-shared-nusuk-v1';
const NUSUK_TYPES=['umre','hac'];
const FIELDS=['date','time','email','password','booked','bookedAt','visaNo','visaPage','visaPhoto','visaUploadedAt'];

function fail(message,code=400){const e=Error(message);e.statusCode=code;throw e;}
function accessibleCompanies(auth){return auth?.user?.role==='owner'?[...Companies.ids]:Companies.permitted(auth?.user?.companies);}
// Görmek: yolcu görme yetkisi; birleştirmek/düzenlemek: Nusuk yetkisi. Dahil tüm firmalara erişim şart.
function allowed(auth,write=false,required=[]){
 const u=auth?.user,available=accessibleCompanies(auth);
 return Boolean(u&&available.length>=2&&required.every(c=>available.includes(c))&&(u.role==='owner'||(u.permissions?.viewPassengers===true&&(!write||u.permissions?.manageNusuk===true))));
}
function tours(state){return (state?.accountingTours||state?.tours||[]).filter(t=>NUSUK_TYPES.includes(t.type||'umre'));}
function activeRecord(store,company,tourId){return (store.groups||[]).find(g=>!g.archived&&g.sources.some(s=>s.company===company&&s.tourId===tourId));}

function validateSources(sources,states){
 if(!Array.isArray(sources)||sources.length<2||sources.length>Companies.ids.length||sources.some(s=>!s)||new Set(sources.map(s=>s.company)).size!==sources.length)fail('Her firmadan bir program seçin; en az iki firma gerekir.');
 return sources.map(s=>{
  if(!Companies.valid(s.company)||typeof s.tourId!=='string'||!states[s.company]||!tours(states[s.company]).some(t=>String(t.id)===s.tourId))fail('Seçilen Umre programı bulunamadı. Listeyi yenileyin.');
  return {company:s.company,tourId:s.tourId};
 });
}

function sourceLists(state,source,auth,hasUserPermission){
 const lists=(state.passengerLists||[]).filter(l=>String(l.tourId)===source.tourId);
 const copy=JSON.parse(JSON.stringify({passengerLists:lists}));
 // Bu uç yalnız masaüstü oturumu kabul eder; yetki kontrolü her zaman çalışan yetkisine göre yapılır.
 Nusuk.redactForClient(copy,{kind:'desktop',user:auth?.user},hasUserPermission);
 return copy.passengerLists.map(l=>({company:source.company,id:String(l.id),title:l.title||'',passengers:(l.passengers||[]).map(p=>({id:p.id,name:p.name,gender:p.gender,birthDate:p.birthDate,passportNo:p.passportNo,relationship:p.relationship,relativePassengerId:p.relativePassengerId,nusuk:p.nusuk}))}));
}

function context(store,states,company,tourId,auth,hasUserPermission){
 const record=activeRecord(store,company,tourId);
 const catalog=Object.fromEntries(Object.keys(states).filter(Companies.valid).map(c=>[c,tours(states[c]).map(t=>({id:String(t.id),title:t.title||'',date:t.departureDate||'',linked:Boolean(activeRecord(store,c,String(t.id))),count:(states[c].passengerLists||[]).filter(l=>String(l.tourId)===String(t.id)).reduce((n,l)=>n+(l.passengers||[]).length,0)}))]));
 const sources=record?record.sources.map(s=>{const t=tours(states[s.company]).find(x=>String(x.id)===s.tourId);return {...s,title:t?.title||'Silinmiş program',date:t?.departureDate||''};}):[];
 return {ok:true,canCombine:allowed(auth,true),record:record?{id:record.id,revision:record.revision,sources,updatedBy:record.updatedBy,updatedAt:record.updatedAt}:null,lists:record?record.sources.flatMap(s=>states[s.company]?sourceLists(states[s.company],s,auth,hasUserPermission):[]):[],catalog};
}

function mutate(store,states,body,actor){
 const next=structuredClone(store);next.groups||=[];
 const now=new Date().toISOString();
 if(body.action==='create'){
  const sources=validateSources(body.sources,states);
  if(sources.some(s=>activeRecord(next,s.company,s.tourId)))fail('Seçilen programlardan biri zaten ortak Nusuk\'ta. Sayfayı yenileyin.',409);
  const record={id:crypto.randomUUID(),revision:1,sources,updatedBy:actor,updatedAt:now};
  next.groups.push(record);return {store:next,record};
 }
 const record=next.groups.find(g=>g.id===body.id&&!g.archived);
 if(!record)fail('Ortak Nusuk bulunamadı veya bağlantısı kaldırıldı.',404);
 if(record.revision!==body.revision)fail('Ortak Nusuk başka bir cihazda değişti. Sayfayı yenileyin.',409);
 if(body.action==='extend'){
  const sources=validateSources(body.sources,states);
  if(record.sources.some(old=>!sources.some(s=>s.company===old.company&&s.tourId===old.tourId)))fail('Mevcut programlar korunmalıdır.');
  const added=sources.filter(s=>!record.sources.some(old=>old.company===s.company));
  if(!added.length)fail('Eklenecek yeni firma seçin.');
  if(added.some(s=>activeRecord(next,s.company,s.tourId)))fail('Seçilen program zaten başka bir ortak Nusuk\'ta.',409);
  record.sources=sources;
 }else if(body.action==='archive')record.archived=true;
 else fail('Geçersiz ortak Nusuk işlemi.');
 record.revision++;record.updatedAt=now;record.updatedBy=actor;
 return {store:next,record};
}

// Ortak görünümden gelen değişiklikleri her yolcunun kendi firma kaydına yazar.
// Yalnız birleştirmedeki programın listelerindeki yolculara ve Nusuk alanlarına izin verilir.
function applyToState(state,company,source,changes){
 for(const change of changes){
  const list=(state.passengerLists||[]).find(l=>String(l.id)===String(change.listId)&&String(l.tourId)===source.tourId);
  const passenger=list&&(list.passengers||[]).find(p=>String(p.id)===String(change.passengerId));
  if(!passenger)fail('Yolcu kaydı değişmiş. Ortak Nusuk\'u yenileyip tekrar deneyin.',409);
  const patch={};
  for(const key of FIELDS)if(Object.prototype.hasOwnProperty.call(change.patch||{},key))patch[key]=key==='booked'?change.patch[key]===true:String(change.patch[key]??'').slice(0,300);
  for(const key of ['visaPage','visaPhoto'])if(patch[key]&&!Nusuk.ownsPath(company,patch[key]))fail('Vize dosyası bu firmaya ait değil.',400);
  passenger.nusuk={...(passenger.nusuk&&typeof passenger.nusuk==='object'?passenger.nusuk:{}),...patch};
 }
 state._meta={...(state._meta||{}),updatedAt:Math.max(Date.now(),Number(state._meta?.updatedAt||0)+1),pendingSync:false};
 return state;
}

async function saveChanges(client,record,changes){
 if(!Array.isArray(changes)||!changes.length||changes.length>500)fail('Kaydedilecek değişiklik yok.');
 const byCompany=new Map();
 for(const change of changes){
  const source=record.sources.find(s=>s.company===change?.company);
  if(!source)fail('Değişiklik ortak Nusuk\'taki bir firmaya ait değil.',400);
  if(!byCompany.has(source.company))byCompany.set(source.company,{source,items:[]});
  byCompany.get(source.company).items.push(change);
 }
 for(const [company,{source,items}] of byCompany){
  for(let attempt=0;;attempt++){
   const row=await Recovery.read(client,companyRowId(company));
   const state=applyToState(structuredClone(row?.data||companyDefaultData(company)),company,source,items);
   try{await Recovery.write(client,companyRowId(company),row,state,'before-nusuk-shared');break;}
   catch(error){if(error.statusCode===409&&attempt<2)continue;throw error;}
  }
 }
}

module.exports={STORE_ID,FIELDS,accessibleCompanies,allowed,tours,validateSources,context,mutate,applyToState,saveChanges,activeRecord};
