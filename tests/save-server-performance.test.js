'use strict';
const assert=require('node:assert/strict'),DB=require('./memory-db'),C=require('../public/company-config');
const S=require('../api/_supabase'),directoryId='turizm-company-directory-v1',custom='c_0123456789abcdef01234567';
const db=DB({[directoryId]:{id:directoryId,updated_at:'2026-10-01T00:00:00.000Z',data:{companies:[{id:custom,name:'Synthetic branch',logo:'x'.repeat(3*1024*1024)}]}}});
require.cache[require.resolve('../api/_supabase')].exports={...S,supabaseAdmin:()=>db};
delete require.cache[require.resolve('../api/_recovery')];
const D=require('../api/_companies'),R=require('../api/_recovery'),A=require('../api/_appAuth'),handler=require('../api/data');
const primary=C.ids[0];
process.env.DESKTOP_SESSION_SECRET='performance-test-session-secret';
process.env.ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'unused';
async function call(method,token,body,company=primary){
 let status=200,result,headers={};
 await handler({method,query:{scope:'admin',company},headers:{authorization:'Bearer '+token},body},{setHeader(k,v){headers[k]=v;},status(v){status=v;return this;},json(v){result=v;}});
 return {status,result,headers};
}
(async()=>{
 const first=await D.load(db);assert.equal(C.config[custom].name,'Synthetic branch');assert.equal(db.reads.length,1);assert.equal(db.reads[0].projection,'data,updated_at');
 first.data.companies[0].name='Cannot mutate cache';
 db.reads.length=0;C.apply([]);await D.load(db);
 assert.equal(C.config[custom].name,'Synthetic branch');assert.deepEqual(db.reads.map(r=>r.projection),['updated_at'],'Warm directory transfers a fresh revision, never the 3 MB logos');
 const other=DB({[directoryId]:{id:directoryId,updated_at:db.rows[directoryId].updated_at,data:{companies:[]}}});
 await D.load(other);assert(!C.valid(custom),'Directories cannot leak between database clients');await D.load(db);assert(C.valid(custom));
 db.rows[directoryId].updated_at='2026-10-02T00:00:00.000Z';db.rows[directoryId].data.companies[0].name='Changed remotely';db.reads.length=0;
 await D.load(db);assert.equal(C.config[custom].name,'Changed remotely');assert.deepEqual(db.reads.map(r=>r.projection),['updated_at','data,updated_at']);
 // Real signed employee sessions; their current grants are never cached.
 const employee=await A.saveEmployee({displayName:'Synthetic employee',username:'performanceqa',password:'test-only-password',companies:[primary],permissions:{viewPassengers:true,managePassengers:true}});
 const session=await A.login(employee.username,'test-only-password');assert(session);
 const state={tours:[{id:'t',title:'Synthetic tour'}],accountingTours:[{id:'t',title:'Synthetic tour'}],siteTours:[],passengerLists:[{id:'l',tourId:'t',passengers:[{id:'p',name:'Synthetic passenger'}]}],_meta:{updatedAt:1}};
 db.rows[S.companyRowId(primary)]={id:S.companyRowId(primary),data:state,updated_at:'2026-10-02T01:00:00.000Z'};
 db.reads.length=0;const get=await call('GET',session.token);assert.equal(get.status,200);
 assert.equal(db.reads.filter(r=>r.filters.some(f=>f[1]===directoryId)).length,1,'Data handler and session validation share the request directory read');
 assert.equal(db.reads.length,3,'Employee read: directory revision, current employee, company state');assert(get.headers['Server-Timing'].includes('directory;dur='));
 const edit=structuredClone(get.result);edit.passengerLists[0].passengers[0].name='Updated synthetic passenger';
 db.reads.length=0;db.writes.length=0;const saved=await call('POST',session.token,edit);assert.equal(saved.status,200);
 assert.equal(db.reads.length,3);assert.equal(db.reads.filter(r=>r.projection==='updated_at').length,1);assert.equal(db.writes.length,2,'Snapshot still completes before the revision-checked update');
 assert(db.writes[0].startsWith(R.prefix(S.companyRowId(primary))));assert.equal(db.writes[1],S.companyRowId(primary));
 const paymentState=structuredClone(saved.result.state);paymentState.passengerLists[0].passengers[0].name='Must not be saved';const before=structuredClone(db.rows[S.companyRowId(primary)]);
 db.failSnapshot=true;const failed=await call('POST',session.token,paymentState);assert.equal(failed.status,503);assert.deepEqual(db.rows[S.companyRowId(primary)],before);db.failSnapshot=false;
 const user=db.rows[A.USERS_ROW_ID].data.users.find(u=>u.id===employee.id);user.active=false;
 assert.equal((await call('POST',session.token,paymentState)).status,401,'Cached logos must not cache revoked employee authorization');assert.deepEqual(db.rows[S.companyRowId(primary)],before);
 user.active=true;const directory=structuredClone(db.rows[directoryId]);delete db.rows[directoryId];await D.load(db);assert(!C.valid(custom),'Remote company removal invalidates the cache immediately');
 db.rows[directoryId]=directory;await D.load(db);assert(C.valid(custom),'Restoring the directory reloads it');
 db.failRead=true;assert.equal((await call('POST',session.token,paymentState)).status,503,'Directory database failure is fail-closed');assert.deepEqual(db.rows[S.companyRowId(primary)],before);
 C.apply([]);console.log('Server save performance: large logos reused only after fresh revision check; one directory read per request, immediate directory/employee revocation, database separation, backup failures and CAS safety passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
