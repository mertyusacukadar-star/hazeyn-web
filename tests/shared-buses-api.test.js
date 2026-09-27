'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
let auth={user:{role:'owner',displayName:'QA'}},conflict=false,readFailure=false;
const companies=['hazeyn','hakikat'];
const rows=Object.fromEntries(companies.map(c=>[c,{id:c,updated_at:'2026-01-01T00:00:00.000Z',data:{tours:[{id:c+'-tour',title:c}],passengerLists:[{id:'l',tourId:c+'-tour',passengers:[{id:'p',name:'QA Test',tc:'PRIVATE',accounting:{payments:[{amount:500}]}}]}]}}]));
const original=JSON.stringify(rows),reads=[],writes=[];
const client={from(){let filters=[],change,operation;return {
 select(){return this;},eq(k,v){filters.push([k,v]);return this;},
 async maybeSingle(){const id=filters.find(f=>f[0]==='id')[1];reads.push(id);return readFailure?{error:Error('offline')}:{data:structuredClone(rows[id]||null)};},
 update(value){operation='update';change=value;return this;},insert(value){operation='insert';change=value;return this;},
 then(resolve,reject){try{const id=operation==='insert'?change.id:filters.find(f=>f[0]==='id')[1];writes.push(id);let result;if(conflict)result=operation==='insert'?{error:{code:'23505'}}:{data:[]};else if(operation==='insert'&&rows[id])result={error:{code:'23505'}};else if(operation==='update'&&filters.some(([k,v])=>rows[id]?.[k]!==v))result={data:[]};else{rows[id]={...(rows[id]||{}),...structuredClone(change),id};result={data:[{id}]};}return Promise.resolve(result).then(resolve,reject);}catch(e){return Promise.reject(e).then(resolve,reject);}}
 };}};
const supabasePath=require.resolve('../api/_supabase'),authPath=require.resolve('../api/_appAuth');
require.cache[supabasePath]={id:supabasePath,filename:supabasePath,loaded:true,exports:{TABLE:'test',supabaseAdmin:()=>client,companyRowId:c=>c,companyDefaultData:()=>({})}};
require.cache[authPath]={id:authPath,filename:authPath,loaded:true,exports:{authenticateDesktopRequest:async()=>auth}};
const handler=require('../api/bus-shared');
async function request(method,body,company='hazeyn'){let status;const headers={};let result;await handler({method,body,query:{company,tourId:company+'-tour'}},{setHeader(k,v){headers[k]=v;},status(n){status=n;return this;},json(v){result=v;}});assert.equal(headers['Cache-Control'],'no-store');return {status,body:result};}
(async()=>{
 auth=null;assert.equal((await request('GET')).status,403);assert.equal(reads.length,0);
 auth={user:{role:'owner',displayName:'QA'}};
 const sources=companies.map(company=>({company,tourId:company+'-tour',listIds:null}));
 conflict=true;assert.equal((await request('POST',{action:'create',sources})).status,409);conflict=false;
 const created=await request('POST',{action:'create',sources});assert.equal(created.status,200);const record=created.body.record;
 assert(record);assert.equal((await request('GET',null,'hakikat')).body.record.id,record.id);
 assert(!JSON.stringify(created.body).includes('PRIVATE'));assert(!JSON.stringify(created.body).includes('payments'));
 const companyBefore=JSON.stringify(Object.fromEntries(companies.map(c=>[c,rows[c]])));assert.equal(companyBefore,original);
 conflict=true;assert.equal((await request('POST',{action:'save',id:record.id,revision:1,plan:record.plan})).status,409);conflict=false;
 assert.equal(rows['turizm-shared-bus-plans-v1'].data.plans[0].revision,1);
 assert.equal((await request('POST',{action:'save',id:record.id,revision:1,plan:record.plan})).status,200);
 assert.equal((await request('POST',{action:'save',id:record.id,revision:1,plan:record.plan})).status,409);
 auth={user:{role:'employee',companies:['hazeyn'],permissions:{viewPassengers:true,managePassengers:true}}};reads.length=0;
 const restricted=await request('GET');assert.equal(restricted.status,200);assert(restricted.body.restricted);assert.equal(restricted.body.record,null);assert.deepEqual(reads,['turizm-shared-bus-plans-v1']);
 assert.equal((await request('GET',null,'hakikat')).status,403);assert.equal((await request('POST',{action:'create',sources})).status,403);
 auth={user:{role:'employee',companies,permissions:{viewPassengers:true}}};assert.equal((await request('GET')).status,200);assert.equal((await request('POST',{action:'save'})).status,403);
 assert(writes.every(id=>id==='turizm-shared-bus-plans-v1'));
 assert.equal(JSON.stringify(Object.fromEntries(companies.map(c=>[c,rows[c]]))),original);
 console.log('shared bus API: authorization, minimal disclosure, canonical store, insert/update conflicts and untouched company records passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
