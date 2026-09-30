'use strict';
const assert=require('node:assert/strict');
const Companies=require('../public/company-config'),D=require('../api/_supabase');
const P=require('../public/bus-plan'),C=require('../public/bus-companies'),R=require('../api/_sharedBuses');
assert.deepEqual(Companies.ids,['hazeyn','hakikat','afyon']);
assert.deepEqual(Companies.permitted(['unknown',' AFYON ','hakikat','afyon']),['afyon','hakikat']);
assert.equal(D.normalizeCompanyId(' AFYON '),'afyon');
assert.equal(new Set(Companies.ids.map(D.companyRowId)).size,3);
const afyon=D.companyDefaultData('afyon');
assert.equal(afyon.settings.heroTitle,'Afyon Hakikat');assert.deepEqual(afyon.tours,[]);assert.deepEqual(afyon.passengerLists,[]);
assert(!afyon.settings.phone&&!afyon.settings.whatsapp&&!afyon.settings.email);
assert.equal(new Set(Companies.ids.map(c=>Companies.config[c].receiptPrefix)).size,3);
const states=Object.fromEntries(Companies.ids.map(company=>[company,{tours:[{id:'same-tour',title:company}],passengerLists:[{id:'same-list',tourId:'same-tour',passengers:Array.from({length:8},(_,i)=>({id:'p'+i,name:'QA '+i+' Aile'+Math.floor(i/2)}))}]}]));
const original=JSON.stringify(states),sources=Companies.ids.map(company=>({company,tourId:'same-tour',listIds:null}));
const all=sources.flatMap(s=>C.roster(states[s.company],s));
assert.equal(new Set(all.map(p=>p.id)).size,24);assert.equal(new Set(all.map(p=>p.group)).size,12);
for(const left of Companies.ids)for(const right of Companies.ids.filter(c=>c!==left)){
 const bus={...P.makeBus(),companyRule:{mode:'split',left,center:left,right}},people=all.filter(p=>[left,right].includes(p.company));
 const result=C.autoPlace({buses:[bus]},people),places=P.placements(result.plan);
 assert.equal(places.size,16);assert.equal(C.owner(bus,5),left);assert.equal(C.owner(bus,7),right);
 for(const p of people)assert.equal(C.owner(bus,places.get(p.id).seat),p.company);
 const proposal=C.suggest(people,left);assert.equal(P.placements(proposal.plan).size,16);assert.equal(proposal.plan.buses.length,1);
}
const proposed=C.suggest(all,'afyon');assert.equal(P.placements(proposed.plan).size,24);
for(const bus of proposed.plan.buses)for(const [n,id] of Object.entries(bus.assignments))assert.equal(C.owner(bus,n),all.find(p=>p.id===id).company);
// An old two-company plan is extended without changing a single existing seat.
let created=R.mutate({plans:[]},states,{action:'create',sources:sources.slice(0,2)},'QA');
let placed=C.autoPlace(created.record.plan,all.filter(p=>p.company!=='afyon')).plan;
created=R.mutate(created.store,states,{action:'save',id:created.record.id,revision:1,plan:placed},'QA');
const before=JSON.stringify(created.record.plan);
const extended=R.mutate(created.store,states,{action:'extend',id:created.record.id,revision:2,sources,companySchema:2},'QA');
assert.equal(JSON.stringify(extended.record.plan),before);assert.equal(extended.record.sources.length,3);
assert.equal(R.context(extended.store,states,'afyon','same-tour').record.id,created.record.id);
assert.throws(()=>R.mutate(extended.store,states,{action:'save',id:created.record.id,revision:3,plan:placed},'QA'),e=>e.statusCode===409);
const saved=R.mutate(extended.store,states,{action:'save',id:created.record.id,revision:3,plan:proposed.plan,companySchema:2},'QA');
assert.equal(P.placements(saved.record.plan).size,24);
const duplicate=structuredClone(proposed.plan);duplicate.buses[0].companyRule.right=duplicate.buses[0].companyRule.left;
assert.throws(()=>R.mutate(saved.store,states,{action:'save',id:created.record.id,revision:4,plan:duplicate,companySchema:2},'QA'));
const two={user:{role:'employee',companies:['hakikat','afyon'],permissions:{viewPassengers:true,managePassengers:true}}};
assert(R.allowed(two,true,['hakikat','afyon']));assert(!R.allowed(two,true,Companies.ids));
assert.equal(JSON.stringify(states),original);
console.log('Afyon: isolated defaults/IDs/receipts, every company pair, 3-company placement, legacy extension and seat preservation passed');

(async()=>{
 const {createReceiptPdf}=require('../api/_receiptPdf');
 const pdf=await createReceiptPdf({companyId:'afyon',state:afyon,list:{title:'QA',passengers:[]},tour:{title:'QA'},passenger:{name:'QA Yolcu',accounting:{agreedPrice:500,currency:'USD',payments:[]}},payment:{receiptNo:'AFH-QA',amount:100,paidAt:'2026-09-30'}});
 assert.equal(pdf.subarray(0,4).toString(),'%PDF');assert(pdf.length>20000);
 const authPath=require.resolve('../api/_appAuth');
 require.cache[authPath]={id:authPath,filename:authPath,loaded:true,exports:{authenticateDesktopRequest:async()=>({user:{role:'owner'}}),hasUserPermission:()=>true}};
 process.env.WHATSAPP_ACCESS_TOKEN='synthetic-token';process.env.WHATSAPP_PHONE_NUMBER_ID='synthetic-number';
 delete process.env.AFYON_WHATSAPP_ACCESS_TOKEN;delete process.env.AFYON_WHATSAPP_PHONE_NUMBER_ID;delete process.env.AFYON_WHATSAPP_BUSINESS_NUMBER;
 const handler=require('../api/whatsapp');
 const status=async company=>{let code,result;await handler({method:'GET',headers:{'x-company-id':company},query:{action:'status'}},{setHeader(){},status(n){code=n;return this;},json(v){result=v;}});assert.equal(code,200);return result;};
 assert.equal((await status('hazeyn')).connected,true);
 const branchStatus=await status('afyon');assert.equal(branchStatus.connected,false);assert.equal(branchStatus.senderNumber,'');
 console.log('Afyon PDF generation and independent WhatsApp configuration passed (no messages sent)');
})().catch(error=>{console.error(error);process.exitCode=1;});
