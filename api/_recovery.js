'use strict';
// Recovery records live in the private data table, never in the public site payload.
const crypto = require('crypto');
const {TABLE} = require('./_supabase');
const fail = (message, statusCode=409) => { const e=Error(message); e.statusCode=statusCode; throw e; };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value==='object' ? Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])) : value;
const digest = data => crypto.createHash('sha256').update(JSON.stringify(canonical(data))).digest('hex');
const prefix = id => `recovery-v1:${Buffer.from(id).toString('base64url')}:`;
async function read(client,id){
  const result=await client.from(TABLE).select('data,updated_at').eq('id',id).maybeSingle();
  if(result.error) throw result.error;
  return result.data;
}
async function snapshot(client,id,row,reason='before-save'){
  if(!row) return null;
  const hash=digest(row.data), key=prefix(id)+hash;
  const data={format:'turizm-recovery',version:1,source:id,createdAt:new Date().toISOString(),revision:row.updated_at,reason,sha256:hash,state:row.data};
  const result=await client.from(TABLE).insert({id:key,data,updated_at:data.createdAt});
  if(result.error && result.error.code!=='23505') fail('Kurtarma kopyası oluşturulamadı. Mevcut kayıt korundu; lütfen tekrar deneyin.',503);
  return key;
}
async function write(client,id,previous,data,reason='before-save'){
  await snapshot(client,id,previous,reason);
  const revision=new Date(Math.max(Date.now(),(Date.parse(previous?.updated_at)||0)+1)).toISOString();
  const record={data,updated_at:revision};
  const result=previous
    ? await client.from(TABLE).update(record).eq('id',id).eq('updated_at',previous.updated_at).select('id')
    : await client.from(TABLE).insert({id,...record}).select('id');
  if(result.error?.code==='23505'||(!result.error&&!result.data?.length)) fail('Bu kayıt başka bir cihazda değişti. Değişiklikleriniz cihazda korundu. Güncel veriyi alıp tekrar deneyin.');
  if(result.error) throw result.error;
  return revision;
}
function expected(row,revision){
  if(revision !== (row?.updated_at||'')) fail('Veri sürümü değişti. Güncel veriyi alıp işlemi tekrar deneyin.');
}
function restoredAccounting(current,backup){
  if(!backup || !Array.isArray(backup.passengerLists) || !Array.isArray(backup.accountingTours||backup.tours)) fail('Bu dosyada geçerli bir muhasebe yedeği bulunamadı.',400);
  const tours=backup.accountingTours||backup.tours;
  const validIds=items=>items.every(x=>x&&typeof x.id==='string'&&x.id.trim())&&new Set(items.map(x=>x.id)).size===items.length;
  if(!validIds(tours)||!validIds(backup.passengerLists)||backup.passengerLists.some(l=>!Array.isArray(l.passengers)||l.passengers.some(p=>!p||typeof p!=='object'||Array.isArray(p))))fail('Yedekte tur veya yolcu listesi yapısı bozuk; mevcut kayıtlar korunuyor.',400);
  if(backup.deletedTours!==undefined&&!Array.isArray(backup.deletedTours))fail('Silinen tur yedeği geçersiz.',400);
  for(const k of ['tourCosts','tourBusPlans'])if(backup[k]!==undefined&&(!backup[k]||typeof backup[k]!=='object'||Array.isArray(backup[k])))fail('Yedekte gider veya otobüs verisi geçersiz.',400);
  const next=structuredClone(current);
  next.siteTours=structuredClone(current.siteTours||current.tours||[]);
  next.tours=next.accountingTours=structuredClone(backup.accountingTours||backup.tours);
  for(const key of ['passengerLists','tourCosts','tourBusPlans','deletedTours']) next[key]=structuredClone(backup[key]||(key==='passengerLists'||key==='deletedTours'?[]:{}));
  next._meta={updatedAt:Date.now(),pendingSync:false};
  return next;
}
module.exports={digest,prefix,read,snapshot,write,expected,fail,restoredAccounting};
