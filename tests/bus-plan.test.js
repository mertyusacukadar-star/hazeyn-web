const assert=require('node:assert/strict');
const P=require('../public/bus-plan');
const {validateBusPlans}=require('../api/_busPlans');
const {filterStateByPermissions,assertStateChangeAllowed}=require('../api/_appAuth');
const {separateTourCollections,sanitizePublicState}=require('../api/_supabase');
const list=(id,tourId,names)=>({id,tourId,passengers:names.map((name,i)=>({id:String(i),name,accounting:{payments:[{amount:100}]}}))});
const lists=[list('l1','t1',['Ali Yılmaz','Ayşe Kaya','Fatma YILMAZ','Mehmet Kaya','Ece Ak']),list('l2','t1',['Cem Ak']),list('l3','t2',['Başka Yolcu'])];
const before=JSON.stringify(lists),people=P.roster(lists,'t1');
assert.equal(people.length,6);assert.equal(people[0].group,people[2].group);
assert.notEqual(P.key('a:b','c'),P.key('a','b:c'));
let plan={version:1,buses:[{...P.makeBus('b1'),limit:3},{...P.makeBus('b2'),limit:4}]};
const result=P.autoPlace(plan,people);const placed=P.placements(result.plan);
assert.equal(result.warnings.length,0);assert.equal(placed.get(people[0].id).busId,'b1');assert.equal(placed.get(people[2].id).seat,6);
assert.equal(placed.get(people[1].id).busId,'b2');assert.equal(placed.get(people[3].id).seat,6);
assert.equal(Object.keys(result.plan.buses[0].assignments).length,2); // Next family won't be split to fill target 3.
assert.equal(placed.get(people[5].id).busId,'b2');
assert.equal(JSON.stringify(lists),before);assert.equal(Object.keys(plan.buses[0].assignments).length,0);
const manual=P.move(plan,[people[0].id,people[2].id],'b2',10);
assert.equal(P.placements(P.autoPlace(manual,people).plan).get(people[0].id).seat,10);
const moved=P.move(manual,[people[0].id],'b1',49);assert.equal(P.placements(moved).get(people[0].id).seat,49);assert.equal(Object.keys(moved.buses[1].assignments).length,1);
assert.throws(()=>P.move(plan,people.map(p=>p.id),'b1',48),/yeterli/);
let noFit=P.autoPlace({buses:[{...P.makeBus('small'),capacity:1,limit:1}]},people);assert.equal(P.placements(noFit.plan).size,0);assert.equal(noFit.warnings.length,3);
assert.equal(P.placements(P.autoPlace({buses:[{...P.makeBus('skip'),limit:0},P.makeBus('second')]},people).plan).get(people[0].id).busId,'second');
const oneManual=P.move(plan,[people[0].id],'b2',11);const continued=P.autoPlace(oneManual,people);assert.equal(P.placements(continued.plan).get(people[2].id).busId,'b2');
for(let capacity=1;capacity<=80;capacity++)for(const rear of [0,5]){
 const layout=P.seats({...P.makeBus(),capacity,rear});const seatNumbers=layout.rows.flatMap(r=>r.values.filter(Boolean)).concat(layout.rear);
 assert.deepEqual(seatNumbers,Array.from({length:capacity},(_,i)=>i+1));
}
assert.equal(P.seats(P.makeBus()).rows.filter(r=>r.door).length,2);assert.equal(P.seats(P.makeBus()).rear.length,5);
const repaired=P.reconcile(result.plan,people.slice(1));assert.equal(repaired.removed,1);assert.equal(P.placements(repaired.plan).size,5);
const saved={tourBusPlans:{t1:result.plan},passengerLists:lists,tours:[{id:'t1'}],siteTours:[{id:'site'}],accountingTours:[{id:'t1'}]};
validateBusPlans(saved);
assert.throws(()=>validateBusPlans({tourBusPlans:{t1:{buses:[{...P.makeBus(),capacity:999}]}}}),/geçersiz/);
const duplicate=structuredClone(saved);duplicate.tourBusPlans.t1.buses[1].assignments[49]=people[0].id;assert.throws(()=>validateBusPlans(duplicate),/geçersiz/);
const viewer={kind:'desktop',user:{role:'employee',permissions:{viewPassengers:true}}};
const changed={...saved,tourBusPlans:{}};
assert.throws(()=>assertStateChangeAllowed(changed,saved,viewer));
assert.deepEqual(filterStateByPermissions(structuredClone(changed),saved,viewer).tourBusPlans,saved.tourBusPlans);
assert.doesNotThrow(()=>assertStateChangeAllowed(changed,saved,{kind:'desktop',user:{role:'employee',permissions:{managePassengers:true}}}));
assert.deepEqual(separateTourCollections({tours:[]},saved,'desktop').tourBusPlans,saved.tourBusPlans);
assert.deepEqual(separateTourCollections({tourBusPlans:{},tours:[]},saved,'site').tourBusPlans,saved.tourBusPlans);
assert.equal(sanitizePublicState(saved).tourBusPlans,undefined);
assert.deepEqual(P.normalizePlan(JSON.parse(JSON.stringify(result.plan))),result.plan);
const routes=require('../public/workspace-ui');assert.deepEqual(routes.parseRoute(routes.routeFor('t1','buses')),{id:'t1',tab:'buses'});
console.log('bus-plan family placement, manual moves, capacities, preservation, permissions and routes passed');

// Automatic allocation reserves the four front seats; explicit manual moves
// may use them and must survive normalization, saving and another auto pass.
assert(result.plan.buses.every(b=>[1,2,3,4].every(n=>!b.assignments[n])));
const staffManual=P.move(result.plan,[people[0].id],'b1',1);
assert.equal(P.placements(P.autoPlace(staffManual,people).plan).get(people[0].id).seat,1);
validateBusPlans({tourBusPlans:{t1:staffManual}});
const numbered=P.renumber(staffManual.buses[0],{1:'101',2:'102'});
assert.equal(numbered.assignments[1],people[0].id);
assert.equal(P.seatLabel(numbered,1),'101');assert.equal(P.seatLabel(numbered,3),'3');
assert.throws(()=>P.renumber(numbered,{1:'2'}),/birden fazla/);
assert.throws(()=>P.renumber(numbered,{1:'0'}),/tam sayı/);
assert.deepEqual(P.normalizePlan({buses:[numbered]}).buses[0],numbered);
validateBusPlans({tourBusPlans:{t1:{buses:[numbered]}}});
const badLabels=structuredClone(numbered);badLabels.seatLabels={1:'2'};
assert.throws(()=>validateBusPlans({tourBusPlans:{t1:{buses:[badLabels]}}}),/geçersiz/);
const standard=P.layoutSettings(P.makeBus());assert.equal(P.customCapacity(standard),49);
for(const side of ['left','right'])for(const enabled of [true,false])for(const count of [1,2,3]){
  const layout={...standard,leftRows:8,leftPerRow:count,rightFrontRows:4,rightBackRows:3,rightPerRow:count,doorEnabled:enabled,doorSide:side,doorAfter:4};
  const bus={...P.makeBus(),capacity:P.customCapacity(layout),limit:0,layout};
  assert(P.validLayout(layout));const grid=P.seats(bus);
  assert.deepEqual(grid.rows.flatMap(r=>r.values.filter(Boolean)).concat(grid.rear),Array.from({length:bus.capacity},(_,i)=>i+1));
  assert.equal(grid.rows.filter(r=>r.door).length,enabled?2:0);
  assert.deepEqual(P.normalizePlan({buses:[bus]}).buses[0],bus);
  validateBusPlans({tourBusPlans:{t1:{buses:[bus]}}});
}
const withBackRows={...P.makeBus(),doorBackRows:2};
assert.equal(P.seats(withBackRows).rows.slice(8).filter(r=>r.right.some(Boolean)).length,2);
assert.equal(P.seats(withBackRows).rows.flatMap(r=>r.values).filter(Boolean).length+5,49);
const {buildPrintHtml}=require('../public/bus-print');
const print=buildPrintHtml({model:{people:[...people,{id:'safe',name:'<script> & test'}],companyName:'QA',tourTitle:'Test turu'},buses:[{...numbered,assignments:{1:'safe'}},P.makeBus('second','Otobüs 2')]});
assert(print.includes('&lt;script&gt; &amp; test'));assert(!print.includes('<script>'));
assert(print.includes('<b>101</b>'));assert(print.includes('Görevli'));assert(print.includes('KAPTAN'));assert(print.includes('Otobüs 2'));
assert.equal((print.match(/class="seat"/g)||[]).length,98);
const {isoDate}=require('../public/passenger-fields');
assert.equal(isoDate('29','2','2024'),'2024-02-29');assert.equal(isoDate('29','2','2025'),'');
assert.equal(isoDate('31','4','2026'),'');assert.equal(isoDate('','',''),'');assert.equal(isoDate('15','5','1985'),'1985-05-15');
console.log('bus staff override, custom geometry, numbering, print escaping and explicit date validation passed');
