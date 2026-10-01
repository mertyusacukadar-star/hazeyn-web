(function(root){
'use strict';
const companies=typeof module!=='undefined'&&module.exports?require('./company-config'):root.TurizmCompanies;
const companyIds=()=>companies?.ids||['hazeyn','hakikat','afyon'];
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
const seatLabel=(bus,n)=>String(bus.seatLabels?.[n] ?? n);
const isStaff=(bus,n)=>Number(n)>=1&&Number(n)<=Math.min(4,bus.capacity);
const passengerCapacity=bus=>Math.max(0,bus.capacity-4);
function customCapacity(layout){return layout.leftRows*layout.leftPerRow+(layout.rightFrontRows+layout.rightBackRows)*layout.rightPerRow+layout.rear;}
function validLayout(l){return l&&[l.leftRows,l.rightFrontRows,l.rightBackRows].every(v=>Number.isInteger(v)&&v>=0&&v<=30)&&[l.leftPerRow,l.rightPerRow].every(v=>Number.isInteger(v)&&v>=1&&v<=3)&&Number.isInteger(l.rear)&&l.rear>=0&&l.rear<=5&&typeof l.doorEnabled==='boolean'&&['left','right'].includes(l.doorSide)&&Number.isInteger(l.doorAfter)&&l.doorAfter>=0&&l.doorAfter<=30&&Number.isInteger(l.doorRows)&&l.doorRows>=1&&l.doorRows<=3&&customCapacity(l)>=4&&customCapacity(l)<=80;}
function layoutSettings(bus){
  if(bus.layout)return copy(bus.layout);
  const grid=seats(bus),front=bus.doorAfter>0?bus.doorAfter:grid.rows.length;
  return {leftRows:grid.rows.filter(r=>r.values[0]||r.values[1]).length,leftPerRow:2,rightFrontRows:grid.rows.slice(0,front).filter(r=>r.values[2]||r.values[3]).length,rightBackRows:grid.rows.slice(front+2).filter(r=>r.values[2]||r.values[3]).length,rightPerRow:2,rear:Math.min(bus.rear,bus.capacity),doorEnabled:bus.doorAfter>0,doorSide:'right',doorAfter:Math.max(0,bus.doorAfter),doorRows:2};
}
function renumber(bus,labels={}){
  const seen=new Set(), seatLabels={};
  for(let n=1;n<=bus.capacity;n++){
    const value=String(labels[n] ?? n).trim();
    if(!/^[1-9]\d{0,2}$/.test(value))throw Error('Koltuk numaraları 1–999 arasında tam sayı olmalıdır.');
    if(seen.has(value))throw Error(`${value} numarası birden fazla koltukta kullanılıyor. Her koltuğa farklı numara verin.`);
    seen.add(value);if(value!==String(n))seatLabels[n]=value;
  }
  const next={...bus};delete next.seatLabels;
  if(Object.keys(seatLabels).length)next.seatLabels=seatLabels;
  return next;
}
function normalizePlan(value){
  const ids=new Set(), people=new Set();
  const buses=(Array.isArray(value?.buses)?value.buses:[]).slice(0,20).filter(b=>b&&typeof b.id==='string'&&b.id&&!ids.has(b.id)&&(ids.add(b.id),true)).map(b=>{
    const integer=(v,f,min,max)=>Number.isInteger(Number(v))?Math.min(max,Math.max(min,Number(v))):f;
    const capacity=integer(b.capacity,49,1,80), assignments={};
    Object.entries(b.assignments || {}).forEach(([seat,p])=>{if(/^\d+$/.test(seat)&&Number(seat)>=1&&Number(seat)<=capacity&&typeof p==='string'&&p.length<500&&!people.has(p)){assignments[Number(seat)]=p;people.add(p);}});
    let next={id:b.id.slice(0,100),name:String(b.name || 'Otobüs').slice(0,80),capacity,limit:integer(b.limit,capacity,0,capacity),doorAfter:integer(b.doorAfter,6,0,30),rear:integer(b.rear,5,0,5),assignments};
    if(b.doorBackRows!==undefined&&b.doorBackRows!==null&&b.doorBackRows!=='')next.doorBackRows=integer(b.doorBackRows,0,0,20);
    if(validLayout(b.layout)&&customCapacity(b.layout)===capacity)next.layout=copy(b.layout);
    if(b.companyRule&&['free','split',...companyIds()].includes(b.companyRule.mode)&&companyIds().includes(b.companyRule.left)&&[...companyIds(),'any'].includes(b.companyRule.center))next.companyRule={mode:b.companyRule.mode,left:b.companyRule.left,center:b.companyRule.center};
    if(next.companyRule && b.companyRule.right !== undefined && companyIds().includes(b.companyRule.right))next.companyRule.right=b.companyRule.right;
    try{next=renumber(next,b.seatLabels);}catch(_){} // Invalid imported labels fall back to the original numbering.
    return next;
  });
  return {version:1,buses};
}
function seats(bus){
  if(validLayout(bus.layout)){
    const l=bus.layout,rows=[];let left=0,right=0,n=1,row=0;
    const rightRows=l.rightFrontRows+l.rightBackRows;
    while(left<l.leftRows||right<rightRows||(l.doorEnabled&&row<l.doorAfter+l.doorRows)){
      const door=l.doorEnabled&&row>=l.doorAfter&&row<l.doorAfter+l.doorRows;
      const leftDoor=door&&l.doorSide==='left',rightDoor=door&&l.doorSide==='right';
      const a=Array(l.leftPerRow).fill(null),b=Array(l.rightPerRow).fill(null);
      if(!leftDoor&&left<l.leftRows){for(let i=0;i<a.length;i++)a[i]=n++;left++;}
      if(!rightDoor&&right<rightRows){for(let i=0;i<b.length;i++)b[i]=n++;right++;}
      rows.push({left:a,right:b,values:[...a,...b],door,doorSide:l.doorSide});row++;
    }
    return {rows,rear:Array.from({length:l.rear},()=>n++),leftPerRow:l.leftPerRow,rightPerRow:l.rightPerRow};
  }
  const rows=[],rear=Math.min(bus.rear,bus.capacity);let number=1,row=0;
  while(number<=bus.capacity-rear){
    const values=[null,null,null,null];
    const door=bus.doorAfter>0&&(row===bus.doorAfter||row===bus.doorAfter+1);
    const behindLimit=bus.doorAfter>0&&bus.doorBackRows!==undefined&&row>=bus.doorAfter+2+bus.doorBackRows;
    for(let c=0;c<4;c++){if(c>1&&(door||behindLimit))continue;if(number<=bus.capacity-rear)values[c]=number++;}
    rows.push({values,left:values.slice(0,2),right:values.slice(2),door,doorSide:'right'});row++;
  }
  return {rows,rear:Array.from({length:rear},()=>number++),leftPerRow:2,rightPerRow:2};
}
function placements(plan){return new Map(plan.buses.flatMap(b=>Object.entries(b.assignments).map(([seat,id])=>[id,{busId:b.id,seat:Number(seat)}])));}
function reconcile(plan,people){const next=normalizePlan(plan),valid=new Set(people.map(p=>p.id));let removed=0;next.buses.forEach(b=>Object.entries(b.assignments).forEach(([s,p])=>{if(!valid.has(p)){delete b.assignments[s];removed++;}}));return {plan:next,removed};}
function move(plan,ids,busId,startSeat){
  const next=copy(plan),bus=next.buses.find(b=>b.id===busId);const selected=[...new Set(ids)];
  if(!bus||!selected.length)throw Error('Önce yolcu ve otobüs seçin.');
  next.buses.forEach(b=>Object.entries(b.assignments).forEach(([s,p])=>{if(selected.includes(p))delete b.assignments[s];}));
  const free=Array.from({length:bus.capacity},(_,i)=>i+1).filter(s=>(startSeat||!isStaff(bus,s))&&!bus.assignments[s]&&(!startSeat||s>=startSeat));
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
    const target=candidates.find(b=>Math.min(b.limit-Object.keys(b.assignments).length, passengerCapacity(b)-Object.keys(b.assignments).filter(n=>!isStaff(b,n)).length)>=pending.length);
    if(!target){warnings.push(`${family[0].surname || family[0].name}: ${pending.length} kişi yerleşmedi; aynı otobüste yeterli yer/hedef yok.`);continue;}
    next=move(next,pending.map(p=>p.id),target.id);cursor=Math.max(cursor,next.buses.findIndex(b=>b.id===target.id));
  }
  return {plan:next,warnings};
}
const api={key,fold,roster,makeBus,seatLabel,isStaff,passengerCapacity,customCapacity,validLayout,layoutSettings,renumber,normalizePlan,seats,placements,reconcile,move,autoPlace};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TurizmBusPlan=api;
})(typeof window==='undefined'?globalThis:window);
