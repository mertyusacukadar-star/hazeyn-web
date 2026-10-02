'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),Sync=require('../public/state-sync');
const source=fs.readFileSync(require.resolve('../public/app.js'),'utf8'),start=source.indexOf('    async function saveData(options = {}) {'),end=source.indexOf('    async function saveLegacyData(',start),actual=source.slice(start,end);
const base={_meta:{serverRevision:'1',updatedAt:1},settings:{},passengerLists:[{id:'l',passengers:[{id:'p',name:'Test',accounting:{payments:[]}}]}],tourBusPlans:{t:{version:1,buses:[]}}};
async function run({intent=base,baseline=base,remotes=[base],responses=[{ok:true,status:200,revision:'saved'}]}){
 const posts=[],warnings=[],cache=[];let reads=0;
 const env={IS_APP_MODE:true,state:structuredClone(intent),serverBase:baseline&&structuredClone(baseline),currentCompanyId:'hazeyn',clone:structuredClone,mergeDefaults:structuredClone,Date,Math,window:{TurizmStateSync:Sync,dispatchEvent(){}},Event:class{},authorizedHeaders:h=>h,statePayloadForSave:structuredClone,
  fetchRemoteData:async()=>structuredClone(remotes[Math.min(reads++,remotes.length-1)]),cacheDataLocally:async s=>cache.push(structuredClone(s)),rememberServerBase:async s=>env.serverBase=structuredClone(s),toast:m=>warnings.push(m),
  fetch:async(_,opts)=>{posts.push(JSON.parse(opts.body));const r=responses[Math.min(posts.length-1,responses.length-1)];return {...r,json:async()=>r};}};
 const ok=await vm.runInNewContext(actual+';saveData()',env);return {ok,posts,warnings,cache,state:env.state,baseline:env.serverBase};
}
(async()=>{
 const remote=structuredClone(base);remote._meta.serverRevision='2';remote.passengerLists[0].passengers[0].accounting.payments.push({id:'paid',amount:100});
 const noOp=await run({remotes:[remote]});assert.equal(noOp.ok,true);assert.equal(noOp.posts.length,0);assert.equal(noOp.state.passengerLists[0].passengers[0].accounting.payments.length,1);
 const intent=structuredClone(base);intent.tourBusPlans.t.buses=[{id:'b',name:'Empty bus',assignments:{}}];
 const save=await run({intent,remotes:[remote]});assert.equal(save.ok,true);assert.equal(save.posts[0]._meta.serverRevision,'2');assert.equal(save.posts[0].passengerLists[0].passengers[0].accounting.payments.length,1);assert.equal(save.state.tourBusPlans.t.buses.length,1);
 const newer=structuredClone(remote);newer._meta.serverRevision='3';newer.passengerLists[0].passengers.push({id:'p2',name:'New passenger'});
 const raced=await run({intent,remotes:[remote,newer],responses:[{ok:false,status:409,error:'Conflict'},{ok:true,status:200,revision:'4'}]});assert.equal(raced.ok,true);assert.equal(raced.posts.length,2);assert.equal(raced.posts[1]._meta.serverRevision,'3');assert.equal(raced.state.passengerLists[0].passengers.length,2);assert.equal(raced.state._meta.serverRevision,'4');
 const competing=structuredClone(remote);competing.tourBusPlans.t.buses=[{id:'other',name:'Other layout',assignments:{}}];
 const conflict=await run({intent,remotes:[competing]});assert.equal(conflict.ok,false);assert.equal(conflict.posts.length,0);assert.equal(conflict.state.tourBusPlans.t.buses[0].id,'b');assert.equal(conflict.state._meta.pendingSync,true);
 const offline=await run({intent,remotes:[null]});assert.equal(offline.ok,false);assert.equal(offline.cache.length,1);assert.equal(offline.posts.length,0);
 const untracked=await run({intent,baseline:null,remotes:[remote]});assert.equal(untracked.ok,false);assert.equal(untracked.posts.length,0);
 console.log('Actual save path: unchanged stale state refreshes, empty bus saves with new payment preserved, CAS race retries, competing plan/missing base/offline drafts remain intact.');
})().catch(e=>{console.error(e);process.exitCode=1;});
