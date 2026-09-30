(function(root){
'use strict';
const P=typeof module!=='undefined'&&module.exports?require('./bus-plan'):root.TurizmBusPlan;
const Companies=typeof module!=='undefined'&&module.exports?require('./company-config'):root.TurizmCompanies;
const names=Object.fromEntries(Companies.ids.map(c=>[c,Companies.config[c].shortName+' · '+Companies.config[c].city]));
const opposite=c=>c==='hazeyn'?'hakikat':'hazeyn';
const rightCompany=rule=>rule.right||opposite(rule.left);
const personKey=(company,id)=>JSON.stringify([company,id]);
function roster(state,source){
 const lists=(state.passengerLists||[]).filter(l=>!source.listIds||source.listIds.includes(String(l.id)));
 return P.roster(lists,source.tourId).map(p=>({...p,id:personKey(source.company,p.id),company:source.company,companyName:names[source.company],group:JSON.stringify([source.company,p.group])}));
}
function owner(bus,n){
 const rule=bus.companyRule;if(!rule||rule.mode==='free')return '';
 if(rule.mode!=='split')return rule.mode;
 const grid=P.seats(bus);
 for(const row of grid.rows){if(row.left.includes(Number(n)))return rule.left;if(row.right.includes(Number(n)))return rightCompany(rule);}
 const index=grid.rear.indexOf(Number(n)),half=Math.floor(grid.rear.length/2);
 if(index<0)return '';if(index<half)return rule.left;if(index>=grid.rear.length-half)return rightCompany(rule);
 return rule.center==='any'?'':rule.center;
}
function freeSeats(bus,company){return Array.from({length:bus.capacity},(_,i)=>i+1).filter(n=>!P.isStaff(bus,n)&&!bus.assignments[n]&&(!owner(bus,n)||owner(bus,n)===company));}
function moveManual(plan,people,busId){
 let next=structuredClone(plan);const target=next.buses.find(b=>b.id===busId);
 if(!target||!people.length)throw Error('Önce yolcu ve otobüs seçin.');
 const ids=new Set(people.map(p=>p.id));next.buses.forEach(b=>Object.entries(b.assignments).forEach(([n,id])=>{if(ids.has(id))delete b.assignments[n];}));
 for(const p of people){const preferred=freeSeats(target,p.company)[0];const fallback=Array.from({length:target.capacity},(_,i)=>i+1).find(n=>!P.isStaff(target,n)&&!target.assignments[n]);const seat=preferred||fallback;if(!seat)throw Error('Bu otobüste yeterli boş yolcu koltuğu yok. Görevli yerine yerleştirmek için koltuğa dokunun.');target.assignments[seat]=p.id;}
 return next;
}
function autoPlace(plan,people){
 let next=P.reconcile(plan,people).plan;const groups=new Map(),warnings=[];
 for(const p of people){if(!groups.has(p.group))groups.set(p.group,[]);groups.get(p.group).push(p);}
 for(const family of groups.values()){
   const placements=P.placements(next),pending=family.filter(p=>!placements.has(p.id));if(!pending.length)continue;
   const existing=[...new Set(family.filter(p=>placements.has(p.id)).map(p=>placements.get(p.id).busId))];
   const candidates=existing.length===1?next.buses.filter(b=>b.id===existing[0]):existing.length>1?[]:next.buses;
   const target=candidates.find(b=>b.limit-Object.keys(b.assignments).length>=pending.length&&freeSeats(b,pending[0].company).length>=pending.length);
   if(!target){warnings.push(`${names[pending[0].company]} · ${family[0].surname||family[0].name}: ${pending.length} kişi için aynı otobüste uygun taraf/hedef yok.`);continue;}
   const seats=freeSeats(target,pending[0].company);pending.forEach((p,i)=>target.assignments[seats[i]]=p.id);
 }
 return {plan:next,warnings};
}
function seed(sources,states,emptyFallback=true){
 const buses=[];
 for(const source of sources){
  const valid=new Set(roster(states[source.company],source).map(p=>p.id));
  for(const b of P.normalizePlan(states[source.company].tourBusPlans?.[source.tourId]).buses){
   const assignments={};for(const [n,id] of Object.entries(b.assignments)){const key=personKey(source.company,id);if(valid.has(key))assignments[n]=key;}
   buses.push({...b,id:source.company+'-'+b.id,name:names[source.company].split(' · ')[0]+' · '+b.name,companyRule:{mode:source.company,left:source.company,center:source.company},assignments});
  }
 }
 if(!buses.length&&emptyFallback)buses.push({...P.makeBus(),companyRule:{mode:'split',left:sources[0].company,center:sources[0].company,right:sources[1].company}});
 if(buses.length>20)throw Error('Programlarda toplam 20’den fazla otobüs var. Önce ayrı planları düzenleyin.');
 return {version:1,buses};
}
// Build a proposal without touching the saved plan. Dedicated buses come first;
// mixed buses allocate each side independently and never split a surname group.
function suggest(people,left='hazeyn'){
 const companies=[...new Set(people.map(p=>p.company))];
 let plan={version:1,buses:[]},counter=0;
 const add=(mode,l=left,r=companies.find(c=>c!==l)||opposite(l))=>{
  if(plan.buses.length>=20)throw Error('Öneri 20 otobüsü aşıyor. Planı daha küçük programlarla oluşturun.');
  plan.buses.push({...P.makeBus('suggest-'+(++counter),'Otobüs '+counter),companyRule:{mode,left:l,center:l,right:r}});
 };
 for(const company of companies){const count=people.filter(p=>p.company===company).length;for(let n=0;n<Math.floor(count/45);n++)add(company,company);}
 let result=autoPlace(plan,people);plan=result.plan;
 while(P.placements(plan).size<people.length){
  const before=P.placements(plan),pending=people.filter(p=>!before.has(p.id)),waiting=[...new Set(pending.map(p=>p.company))];
  const l=waiting.includes(left)?left:waiting[0],r=waiting.find(c=>c!==l);
  add(r?'split':l,l,r||opposite(l));result=autoPlace(plan,people);
  if(P.placements(result.plan).size===before.size){
   plan.buses.pop();add(pending[0].company,pending[0].company);result=autoPlace(plan,people);
   if(P.placements(result.plan).size===before.size)break;
  }
  plan=result.plan;
 }
 return result;
}
const api={names,opposite,rightCompany,personKey,roster,owner,freeSeats,moveManual,autoPlace,seed,suggest};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.TurizmBusCompanies=api;
})(typeof window==='undefined'?globalThis:window);
