'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const DB=require('./memory-db'),Trash=require('../public/tour-trash');
const seed={tours:[{id:'t',title:'Test'}],siteTours:[{id:'public',title:'Sitedeki tur'}],passengerLists:[{id:'l',tourId:'t',passengers:[{id:'p',name:'Test',accounting:{agreedPrice:100,payments:[{id:'pay',amount:20}]}}]}],tourCosts:{t:{hotel:50}},tourBusPlans:{},_meta:{updatedAt:1}};
const db=DB({hazeyn:{id:'hazeyn',data:seed,updated_at:'2026-10-01T00:00:00.000Z'},hakikat:{id:'hakikat',data:{...structuredClone(seed),tours:[]},updated_at:'2026-09-30T00:00:00.000Z'}});
const supabase=require('../api/_supabase'),auth=require('../api/_appAuth');
let user={role:'owner'},kind='desktop';
require.cache[require.resolve('../api/_supabase')].exports={...supabase,TABLE:'test',supabaseAdmin:()=>db,companyRowId:c=>c};
require.cache[require.resolve('../api/_appAuth')].exports={...auth,authenticateDesktopRequest:async()=>user?{user}:null,authorizeDataRequest:async()=>user?{kind,user}:null};
// Reload after replacing the database dependency; no real service is contacted.
delete require.cache[require.resolve('../api/_recovery')];
const R=require('../api/_recovery'),handler=require('../api/recovery'),dataHandler=require('../api/data');
async function request(action,body,company='hazeyn',method=body?'POST':'GET',resource){
 let status=200,result;await handler({method,query:{company,action,resource},body},{setHeader(){},status(v){status=v;return this;},json(v){result=v;}});return {status,body:result};
}
async function dataRequest(method,body,scope='admin'){
 let status=200,result;await dataHandler({method,query:{company:'hazeyn',scope},body,headers:{}},{setHeader(){},status(v){status=v;return this;},json(v){result=v;}});return {status,body:result};
}
(async()=>{
 const source=JSON.stringify(seed),removed=Trash.remove(seed,'t',{name:'QA'});
 assert.equal(JSON.stringify(seed),source);assert.equal(removed.tours.length,0);assert.equal(removed.passengerLists.length,0);assert.equal(removed.deletedTours[0].payments,1);
 const restored=Trash.restore(removed,'t');assert.deepEqual(restored.passengerLists,seed.passengerLists);assert.deepEqual(restored.tourCosts,seed.tourCosts);assert.deepEqual(restored.siteTours,seed.siteTours);
 assert.throws(()=>Trash.restore({...removed,tours:seed.tours},'t'),/Aynı kimlik/);
 assert.equal(R.digest({b:1,a:2}),R.digest({a:2,b:1}),'JSONB ordering cannot invalidate checksums');
 const old=await R.read(db,'hazeyn');db.failSnapshot=true;
 await assert.rejects(()=>R.write(db,'hazeyn',old,{lost:true}),/Kurtarma kopyası/);assert.deepEqual(db.rows.hazeyn.data,seed);
 db.failSnapshot=false;const rev=await R.write(db,'hazeyn',old,removed);
 assert(rev);const point=Object.values(db.rows).find(r=>r.id.startsWith(R.prefix('hazeyn')));assert.deepEqual(point.data.state,seed);
 await assert.rejects(()=>R.write(db,'hazeyn',old,{lost:true}),/başka bir cihaz/);assert.deepEqual(db.rows.hazeyn.data,removed);
 user=null;assert.equal((await request('export')).status,403);user={role:'employee',companies:['hazeyn'],permissions:{exportBackup:true}};assert.equal((await request('export')).status,403);
 user={role:'owner'};const backup=(await request('export')).body;assert.equal(backup.sha256,R.digest(backup.records));assert(backup.records.afyon);assert(backup.records.users);assert(backup.records.sharedBuses);
 const history=await request('history');assert.equal(history.status,200);assert(history.body.items.length);assert(!JSON.stringify(history.body).includes('agreedPrice'));
 const preview=await request('preview',{snapshotId:point.id});assert.equal(preview.body.passengers,1);
 assert.equal((await request('restore',{snapshotId:point.id,revision:'stale',confirm:true})).status,409);
 assert.equal((await request('restore',{snapshotId:point.id,revision:preview.body.revision,confirm:true})).status,200);
 assert.deepEqual(db.rows.hazeyn.data.siteTours,seed.siteTours);assert.equal(db.rows.hazeyn.data.passengerLists[0].passengers[0].accounting.payments[0].amount,20);
 assert.equal((await request('preview',{snapshotId:point.id},'hakikat')).status,400);
 const tampered=structuredClone(backup);tampered.records.hazeyn.data.tours=[{id:'tampered'}];assert.equal((await request('preview',{backup:tampered})).status,400);
 const draftBackup={...backup,deviceDraft:{company:'hazeyn',state:{...seed,tours:[...seed.tours,{id:'draft',title:'Kaydedilmemiş'}]}}};
 assert.equal((await request('preview',{backup:draftBackup,useDeviceDraft:true})).body.tours,2);
 assert.equal((await request('preview',{backup:draftBackup,useDeviceDraft:true},'hakikat')).status,400);
 const malformed=structuredClone(backup);malformed.records.hazeyn.data.passengerLists=[{id:'broken',passengers:null}];malformed.sha256=R.digest(malformed.records);
 assert.equal((await request('preview',{backup:malformed})).status,400);
 const read=await dataRequest('GET');assert.equal(read.body._meta.serverRevision,db.rows.hazeyn.updated_at);
 assert.equal((await dataRequest('POST',{...read.body,_meta:{}})).status,409,'Old desktop clients cannot bypass concurrency');
 const save=await dataRequest('POST',read.body);assert.equal(save.status,200);assert(save.body.revision);assert(!Object.hasOwn(db.rows.hazeyn.data._meta,'serverRevision'));
 const publicData=await dataRequest('GET',null,'public');assert(!Object.hasOwn(publicData.body,'deletedTours'));assert(!Object.hasOwn(publicData.body,'passengerLists'));assert.deepEqual(publicData.body.tours,seed.siteTours);
 db.rows['turizm-shared-bus-plans-v1']={id:'turizm-shared-bus-plans-v1',data:{plans:[{sources:[{company:'hazeyn',tourId:'t'}]}]},updated_at:rev};
 const latest=(await dataRequest('GET')).body;const withDeletion=Trash.remove(latest,'t');assert.equal((await dataRequest('POST',withDeletion)).status,409,'Shared plan references must be unlinked first');
 const beforeShared=structuredClone(db.rows.hazeyn);assert.equal((await request('restore',{snapshotId:point.id,revision:beforeShared.updated_at,confirm:true})).status,409);assert.deepEqual(db.rows.hazeyn,beforeShared);
 // A lost whole database can be rebuilt in sections; current unrelated company stays unchanged.
 const beforeHakikat=structuredClone(db.rows.hakikat);
 const importFile={format:'turizm-tour-backup',version:1,company:'afyon',...Trash.inspect(seed,'t')};
 const importPreview=await request('import-tour',{backup:importFile},'afyon');assert.equal(importPreview.status,200);assert.equal(importPreview.body.passengers,1);
 assert.equal((await request('import-tour',{backup:importFile,confirm:true,revision:importPreview.body.revision},'afyon')).status,200);
 assert.equal((await request('import-tour',{backup:importFile},'afyon')).status,409,'Import must not duplicate existing passenger IDs');
 assert.equal((await request('import-tour',{backup:importFile},'hakikat')).status,400);
 const usersFile=structuredClone(backup);usersFile.records.users.data={users:[{id:'employee1',username:'qa',role:'employee',companies:['afyon'],permissions:{viewPassengers:true},passwordHash:'synthetic-hash',passwordSalt:'synthetic-salt',authVersion:'old'}]};usersFile.sha256=R.digest(usersFile.records);
 const userPreview=await request('preview',{backup:usersFile},'hazeyn','POST','users');assert.equal(userPreview.body.users,1);
 assert.equal((await request('restore',{backup:usersFile,revision:userPreview.body.revision,confirm:true},'hazeyn','POST','users')).status,200);
 assert.notEqual(db.rows[auth.USERS_ROW_ID].data.users[0].authVersion,'old','Restoring accounts must revoke prior sessions');
 const sharedPreview=await request('preview',{backup},'hazeyn','POST','sharedBuses');assert.equal(sharedPreview.body.plans,0);
 assert.equal((await request('restore',{backup,revision:sharedPreview.body.revision,confirm:true},'hazeyn','POST','sharedBuses')).status,200);
 assert.deepEqual(db.rows.hakikat,beforeHakikat);
 // Employees without tour management cannot bypass permissions through the compatibility field.
 const employee={kind:'desktop',user:{role:'employee',permissions:{managePassengers:true}}};
 const filtered=auth.filterStateByPermissions({tours:[],accountingTours:[]},{tours:seed.tours,accountingTours:seed.tours},employee);assert.deepEqual(filtered.accountingTours,seed.tours);
 const window={},context=vm.createContext({window,crypto:require('node:crypto').webcrypto,TextEncoder,TextDecoder,Uint8Array,btoa,atob});vm.runInContext(fs.readFileSync('public/recovery-ui.js','utf8'),context);
 const encrypted=await window.TurizmRecoveryUI.lock(backup,'synthetic-test-secret');assert(!JSON.stringify(encrypted).includes('agreedPrice'));assert.deepEqual(JSON.parse(JSON.stringify(await window.TurizmRecoveryUI.unlock(encrypted,'synthetic-test-secret'))),backup);
 await assert.rejects(()=>window.TurizmRecoveryUI.unlock(encrypted,'incorrect'),/Şifre yanlış/);
 const html=fs.readFileSync('public/admin.html','utf8');assert(html.indexOf('workspace-theme.js')<html.indexOf('<body'));assert(html.includes('html.app-booting body>*:not(#appBoot)'));assert(!fs.readFileSync('public/workspace-ui.js','utf8').includes('Klasik görünüme dön'));
 console.log('Recovery: lossless tour undo, snapshots, storage failures, races, owner scope, company isolation, public isolation, restore, shared-plan guards and encrypted backup round-trip passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
