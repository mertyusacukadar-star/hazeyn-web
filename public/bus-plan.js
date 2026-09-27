(function(root){
'use strict';
const copy = value => JSON.parse(JSON.stringify(value));
const key = (listId,passengerId) => JSON.stringify([String(listId),String(passengerId)]);
const fold = value => String(value || '').toLocaleUpperCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/İ/g,'I');
function roster(lists,tourId){
  return (lists || []).filter(l=>String(l.tourId)===String(tourId)).flatMap(l=>(l.passengers || []).map(p=>{
    const parts=String(p.name || '').trim().split(/\s+/); const id=key(l.id,p.id);
    return {id,name:String(p.name || 'İsimsiz yolcu'),listTitle:String(l.title || ''),surname:String(p.surname || p.lastName || (parts.length>1?parts.at(-1):'')),order:0};
  })).map((p,i)=>({...p,order:i+1,group:p.surname?fold(p.surname):p.id}));
}
function makeBus(id='bus-1',name='Otobüs 1'){return {id,name,capacity:49,limit:49,doorAfter:6,rear:5,assignments:{}};}
function normalizePlan(value){
  const ids=new Set(), people=new Set();
  const buses=(Array.isArray(value?.buses)?value.buses:[]).slice(0,20).filter(b=>b&&typeof b.id==='string'&&b.id&&!ids.has(b.id)&&(ids.add(b.id),true)).map(b=>{
    const integer=(v,f,min,max)=>Number.isInteger(Number(v))?Math.min(max,Math.max(min,Number(v))):f;
    const capacity=integer(b.capacity,49,1,80), assignments={};
    Object.entries(b.assignments || {}).forEach(([seat,p])=>{if(/^\d+$/.test(seat)&&Number(seat)>=1&&Number(seat)<=capacity&&typeof p==='string'&&p.length<500&&!people.has(p)){assignments[Number(seat)]=p;people.add(p);}});
    return {id:b.id.slice(0,100),name:String(b.name || 'Otobüs').slice(0,80),capacity,limit:integer(b.limit,capacity,0,capacity),doorAfter:integer(b.doorAfter,6,0,20),rear:integer(b.rear,5,0,5),assignments};
  });
  return {version:1,buses};
}
function seats(bus){
  const rows=[],rear=Math.min(bus.rear,bus.capacity);let number=1,row=0;
  while(number<=bus.capacity-rear){
    const values=[null,null,null,null];
    const door=bus.doorAfter>0&&(row===bus.doorAfter||row===bus.doorAfter+1);
    for(let c=0;c<4;c++){if(c>1&&door)continue;if(number<=bus.capacity-rear)values[c]=number++;}
    rows.push({values,door});row++;
  }
  return {rows,rear:Array.from({length:rear},()=>number++)};
}
function placements(plan){return new Map(plan.buses.flatMap(b=>Object.entries(b.assignments).map(([seat,id])=>[id,{busId:b.id,seat:Number(seat)}])));}
function reconcile(plan,people){const next=normalizePlan(plan),valid=new Set(people.map(p=>p.id));let removed=0;next.buses.forEach(b=>Object.entries(b.assignments).forEach(([s,p])=>{if(!valid.has(p)){delete b.assignments[s];removed++;}}));return {plan:next,removed};}
function move(plan,ids,busId,startSeat){
  const next=copy(plan),bus=next.buses.find(b=>b.id===busId);const selected=[...new Set(ids)];
  if(!bus||!selected.length)throw Error('Önce yolcu ve otobüs seçin.');
  next.buses.forEach(b=>Object.entries(b.assignments).forEach(([s,p])=>{if(selected.includes(p))delete b.assignments[s];}));
  const free=Array.from({length:bus.capacity},(_,i)=>i+1).filter(s=>!bus.assignments[s]&&(!startSeat||s>=startSeat));
  if(free.length<selected.length)throw Error('Seçilen yolcular için yeterli boş koltuk yok. Başka bir koltuk veya otobüs seçin.');
  // Prefer neighboring seat numbers for a family when no exact start was chosen.
  const run=!startSeat?free.findIndex((s,i)=>selected.every((_,j)=>free[i+j]===s+j)):-1;
  const chosen=run>=0?free.slice(run):free;
  selected.forEach((p,i)=>bus.assignments[chosen[i]]=p);return next;
}
function autoPlace(plan,people){
  let next=reconcile(plan,people).plan;const groups=new Map(),warnings=[];let cursor=0;
  people.forEach(p=>{if(!groups.has(p.group))groups.set(p.group,[]);groups.get(p.group).push(p);});
  for(const family of groups.values()){
    const assigned=placements(next),pending=family.filter(p=>!assigned.has(p.id));if(!pending.length)continue;
    const occupiedBuses=[...new Set(family.filter(p=>assigned.has(p.id)).map(p=>assigned.get(p.id).busId))];
    const candidates=occupiedBuses.length===1?next.buses.filter(b=>b.id===occupiedBuses[0]):occupiedBuses.length>1?[]:next.buses.slice(cursor);
    const target=candidates.find(b=>Math.min(b.capacity,b.limit)-Object.keys(b.assignments).length>=pending.length);
    if(!target){warnings.push(`${family[0].surname || family[0].name}: ${pending.length} kişi yerleşmedi; aynı otobüste yeterli yer/hedef yok.`);continue;}
    next=move(next,pending.map(p=>p.id),target.id);cursor=Math.max(cursor,next.buses.findIndex(b=>b.id===target.id));
  }
  return {plan:next,warnings};
}
const api={key,fold,roster,makeBus,normalizePlan,seats,placements,reconcile,move,autoPlace};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TurizmBusPlan=api;
})(typeof window==='undefined'?globalThis:window);
