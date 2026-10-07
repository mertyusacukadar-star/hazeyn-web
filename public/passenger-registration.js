(function(root){
'use strict';
const P=typeof module!=='undefined'&&module.exports?require('./bus-plan'):root.TurizmBusPlan;
const relationships=['Kendisi','Eşi','Babası','Oğlu','Kızı'];
const letters=Array.from({length:26},(_,i)=>String.fromCharCode(65+i));
const group=p=>letters.includes(String(p.roomGroup||'').toUpperCase())?String(p.roomGroup).toUpperCase():'';
function hasPayments(accounting){return Array.isArray(accounting?.payments)&&accounting.payments.length>0;}
function tourCurrency(tour,lists=[]){
 if(['USD','EUR','TRY'].includes(tour?.priceCurrency))return tour.priceCurrency;
 const raw=[...Object.values(tour?.roomPrices||{}),tour?.price||''].join(' ').toUpperCase();
 if(/USD|\$/.test(raw))return 'USD';if(/EUR|€/.test(raw))return 'EUR';if(/TRY|\bTL\b|₺/.test(raw))return 'TRY';
 const old=new Set(lists.filter(l=>l.tourId===tour?.id).flatMap(l=>l.passengers||[]).map(p=>p.accounting?.currency).filter(c=>['USD','EUR','TRY'].includes(c)));
 return old.size===1?[...old][0]:tour?.type==='yurtici'?'TRY':'USD';
}
function priceText(value,currency){
 const raw=String(value||'').trim(),number=raw.replace(/\b(?:USD|EUR|TRY|TL)\b|[$€₺]/gi,'').trim();
 return number&&/^[\d.,\s]+$/.test(number)?number+' '+currency:raw;
}
function relationshipText(p,passengers){
 if(!p.relationship)return '—';if(p.relationship==='Kendisi')return 'Kendisi';
 const target=(passengers||[]).find(x=>x.id===p.relativePassengerId);
 return target?target.name+' · '+p.relationship:p.relationship+' (kişi seçilmedi)';
}
const seating=p=>({busNo:String(p?.busNo||'').trim(),seatNo:String(p?.seatNo||'').trim()});
function validate(passengers){
 for(const p of passengers){
  const who=p.name||'Yolcu';
  if(p.relationship&&!relationships.includes(p.relationship))throw Error(who+': yakınlık seçimini kontrol edin.');
  if(p.relationship&&p.relationship!=='Kendisi'){
   if(!p.relativePassengerId)throw Error(who+': kimin '+p.relationship.toLocaleLowerCase('tr-TR')+' olduğunu seçin.');
   if(p.relativePassengerId===p.id||!passengers.some(x=>x.id===p.relativePassengerId&&String(x.name||'').trim()))throw Error(who+': yakınlık için listedeki başka bir yolcuyu seçin.');
  }
  if(p.roomGroup&&!letters.includes(p.roomGroup))throw Error(who+': oda yakınlığı A–Z arasında olmalı.');
  const s=seating(p);if(!s.busNo&&!s.seatNo)continue;
  if(!/^(?:[1-9]|1\d|20)$/.test(s.busNo)||!/^([1-9]\d{0,2})$/.test(s.seatNo))throw Error(who+': otobüs no (1–20) ve koltuk no (1–999) birlikte girilmeli.');
 }
}
function changedSeats(previous,next){
 const old=new Map((previous?.passengers||[]).map(p=>[p.id,p]));
 return next.passengers.filter(p=>{
  const before=old.get(p.id);const s=seating(p);
  return (before&&(previous.tourId!==next.tourId||JSON.stringify(seating(before))!==JSON.stringify(s)))||(!before&&(s.busNo||s.seatNo));
 });
}
function syncPlans(plans,lists,previous,next){
 validate(next.passengers);
 const changed=changedSeats(previous,next);
 if(changed.some(p=>seating(p).busNo)&&!next.tourId)throw Error('Otobüs ve koltuk kaydı için önce tur seçin.');
 const result=JSON.parse(JSON.stringify(plans||{}));
 for(const tourId of new Set([previous?.tourId,next.tourId].filter(Boolean))){
  if(!result[tourId]&&!changed.some(p=>seating(p).busNo&&tourId===next.tourId))continue;
  let plan=P.reconcile(result[tourId],P.roster(lists,tourId)).plan;
  if(tourId===next.tourId){
   const ids=new Set(changed.map(p=>P.key(next.id,p.id)));
   plan.buses.forEach(b=>Object.entries(b.assignments).forEach(([n,id])=>{if(ids.has(id))delete b.assignments[n];}));
   for(const p of changed){
    const {busNo,seatNo}=seating(p);if(!busNo)continue;
    while(plan.buses.length<Number(busNo)){
     let serial=plan.buses.length+1,id='bus-'+serial;while(plan.buses.some(b=>b.id===id))id='registration-bus-'+(++serial);
     plan.buses.push(P.makeBus(id,'Otobüs '+(plan.buses.length+1)));
    }
    const bus=plan.buses[Number(busNo)-1],n=Array.from({length:bus.capacity},(_,i)=>i+1).find(n=>P.seatLabel(bus,n)===seatNo);
    if(!n)throw Error(p.name+': '+busNo+'. otobüste '+seatNo+' numaralı koltuk yok. Otobüs düzeninden kapasite/numaraları kontrol edin.');
    if(bus.assignments[n])throw Error(busNo+'. otobüs '+seatNo+' numaralı koltuk dolu. '+p.name+' için başka koltuk seçin.');
    bus.assignments[n]=P.key(next.id,p.id);
   }
  }
  result[tourId]=plan;
 }
 return result;
}
function currentSeat(plan,listId,p){
 if(!plan)return seating(p);
 const normalized=P.normalizePlan(plan),placed=P.placements(normalized).get(P.key(listId,p.id));
 if(!placed)return {busNo:'',seatNo:''};
 const index=normalized.buses.findIndex(b=>b.id===placed.busId);
 return {busNo:String(index+1),seatNo:P.seatLabel(normalized.buses[index],placed.seat)};
}
function rooms(passengers){
 const types=new Map();
 for(const p of passengers||[]){const type=String(p.roomPeople||p.room||'').trim()||'secilmedi';if(!types.has(type))types.set(type,[]);types.get(type).push(p);}
 const result=[];let sequence=0,person=0;
 for(const [type,items] of [...types].sort((a,b)=>(parseInt(a[0])||99)-(parseInt(b[0])||99))){
  const capacity=Math.max(1,parseInt(type)||1),groups=new Map();
  for(const p of items){const g=group(p);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(p);}
  let index=0;
  for(const [letter,people] of [...groups].sort((a,b)=>(a[0]||'~').localeCompare(b[0]||'~'))){
   for(let i=0;i<people.length;i+=capacity){
    const occupants=people.slice(i,i+capacity).map(p=>({...p,sheetNo:++person}));
    result.push({roomSequence:++sequence,roomIndexInType:index++,roomPeople:type,roomGroup:letter,roomingLabel:({'1':'TEKLİ','2':'İKİLİ','3':'ÜÇLÜ','4':'DÖRTLÜ','5+':'5+ KİŞİLİK'})[type]||'BELİRSİZ',mekkeRoomNo:occupants.find(p=>p.mekkeRoomNo||p.roomNo)?.mekkeRoomNo||occupants.find(p=>p.roomNo)?.roomNo||'',medineRoomNo:occupants.find(p=>p.medineRoomNo||p.roomNo)?.medineRoomNo||occupants.find(p=>p.roomNo)?.roomNo||'',occupants});
   }
  }
 }
 return result;
}
const api={relationships,letters,group,seating,validate,changedSeats,syncPlans,currentSeat,rooms,hasPayments,tourCurrency,priceText,relationshipText};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TurizmPassengerRegistration=api;
})(typeof window==='undefined'?globalThis:window);
