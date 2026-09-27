'use strict';
const assert=require('node:assert/strict');
const P=require('../public/bus-plan'),C=require('../public/bus-companies'),R=require('../api/_sharedBuses');
const {validateBusPlans}=require('../api/_busPlans');
function fixture(company,count=8){return {tours:[{id:'same-tour',title:'Aynı adlı tur'}],passengerLists:[{id:'same-list',tourId:'same-tour',title:'Test',passengers:Array.from({length:count},(_,i)=>({id:'p'+i,name:'Yolcu '+i+' Aile'+Math.floor(i/2),accounting:{payments:[{amount:100}]},tc:'SECRET'}))}],tourBusPlans:{}};}
const states={hazeyn:fixture('hazeyn'),hakikat:fixture('hakikat')};
const sources=['hazeyn','hakikat'].map(company=>({company,tourId:'same-tour',listIds:null}));
const original=JSON.stringify(states),people=sources.flatMap(s=>C.roster(states[s.company],s));
assert.equal(new Set(people.map(p=>p.id)).size,16);assert.notEqual(people[0].group,people[8].group);
assert(!JSON.stringify(people).includes('SECRET'));assert(!JSON.stringify(people).includes('payments'));
const b={...P.makeBus(),companyRule:{mode:'split',left:'hakikat',center:'hazeyn'}};
const result=C.autoPlace({buses:[b]},people),places=P.placements(result.plan);
assert.equal(places.size,16);assert.equal(result.warnings.length,0);
for(const p of people){assert.equal(C.owner(b,places.get(p.id).seat),p.company);assert(!P.isStaff(b,places.get(p.id).seat));}
const renumbered=P.renumber(b,{5:'101',7:'102'});assert.equal(C.owner(renumbered,5),'hakikat');assert.equal(C.owner(renumbered,7),'hazeyn');
const manual=P.move(result.plan,[people[0].id],b.id,1);assert.equal(P.placements(C.autoPlace(manual,people).plan).get(people[0].id).seat,1);
const moved=C.moveManual({buses:[...result.plan.buses,{...P.makeBus('second'),companyRule:{mode:'hakikat',left:'hakikat',center:'hakikat'}}]},[people[0]],'second');
assert.equal(P.placements(moved).get(people[0].id).busId,'second'); // explicit exception allowed
for(const side of ['hazeyn','hakikat']){
 const proposal=C.suggest(people,side);assert.equal(proposal.plan.buses.length,1);assert.equal(P.placements(proposal.plan).size,16);
 assert.equal(proposal.plan.buses[0].companyRule.left,side);
}
const manyStates={hazeyn:fixture('hazeyn',46),hakikat:fixture('hakikat',6)};
// Use individual families to verify one full dedicated bus followed by shared overflow.
manyStates.hazeyn.passengerLists[0].passengers.forEach((p,i)=>p.surname='Surname'+i);
const many=sources.flatMap(s=>C.roster(manyStates[s.company],s)),suggestion=C.suggest(many);
assert.equal(suggestion.plan.buses[0].companyRule.mode,'hazeyn');assert.equal(Object.keys(suggestion.plan.buses[0].assignments).length,45);
assert.equal(suggestion.plan.buses[1].companyRule.mode,'split');assert.equal(P.placements(suggestion.plan).size,52);
assert.equal(C.owner(b,45),'hakikat');assert.equal(C.owner(b,47),'hazeyn');assert.equal(C.owner(b,49),'hazeyn');
const owner={user:{role:'owner'}},single={user:{role:'employee',companies:['hazeyn'],permissions:{viewPassengers:true,managePassengers:true}}};
assert(R.allowed(owner,true));assert(!R.allowed(single));assert(!R.allowed(null));
assert(!R.allowed({user:{role:'employee',companies:['hazeyn','hakikat'],permissions:{viewPassengers:true}}},true));
const created=R.mutate({plans:[]},states,{action:'create',sources},'QA');
assert.equal(R.context(created.store,states,'hazeyn','same-tour').record.id,R.context(created.store,states,'hakikat','same-tour').record.id);
assert.throws(()=>R.mutate(created.store,states,{action:'create',sources},'QA'),e=>e.statusCode===409);
assert.throws(()=>R.mutate(created.store,states,{action:'save',id:created.record.id,revision:0,plan:result.plan},'QA'),e=>e.statusCode===409);
const saved=R.mutate(created.store,states,{action:'save',id:created.record.id,revision:1,plan:result.plan},'QA');
assert.equal(saved.record.revision,2);assert.equal(P.placements(saved.record.plan).size,16);
const alien=structuredClone(result.plan);alien.buses[0].assignments[49]='unknown';
assert.throws(()=>R.mutate(saved.store,states,{action:'save',id:saved.record.id,revision:2,plan:alien},'QA'),e=>e.statusCode===409);
const archived=R.mutate(saved.store,states,{action:'archive',id:saved.record.id,revision:2},'QA');
assert.equal(R.context(archived.store,states,'hakikat','same-tour').record,null);assert.equal(archived.store.plans[0].plan.buses.length,1);
assert.equal(JSON.stringify(states),original); // Company records, IDs and payments are never mutated.
assert.throws(()=>R.validateSources([{...sources[0],listIds:['foreign']},sources[1]],states));
const restricted=R.context(created.store,states,'hazeyn','same-tour');assert(!JSON.stringify(restricted).includes('SECRET'));
const invalid={...b,companyRule:{mode:'invalid',left:'hakikat',center:'hazeyn'}};assert.throws(()=>validateBusPlans({tourBusPlans:{t:{buses:[invalid]}}}));
// Existing assignments from each company retain identity even if all source IDs match.
states.hazeyn.tourBusPlans['same-tour']={buses:[{...P.makeBus(),assignments:{5:P.key('same-list','p0')}}]};
states.hakikat.tourBusPlans['same-tour']={buses:[{...P.makeBus(),assignments:{5:P.key('same-list','p0')}}]};
const imported=C.seed(sources,states);assert.equal(imported.buses.length,2);assert.equal(P.placements(imported).size,2);assert.notEqual(imported.buses[0].id,imported.buses[1].id);
console.log('shared buses: company identity, sides, dedicated buses, manual overrides, canonical records, conflicts, permissions and data preservation passed');
