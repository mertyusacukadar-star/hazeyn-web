'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const db=require('./memory-db')(),supabase=require('../api/_supabase'),auth=require('../api/_appAuth');
let owner=true;
require.cache[require.resolve('../api/_supabase')].exports={...supabase,TABLE:'test',supabaseAdmin:()=>db};
require.cache[require.resolve('../api/_appAuth')].exports={...auth,authenticateDesktopRequest:async()=>owner?{user:{role:'owner'}}:{user:{role:'employee'}}};
process.env.BACKUP_TOKEN_ENCRYPTION_KEY='synthetic-test-key';
for(const k of ['GOOGLE_BACKUP_CLIENT_ID','GOOGLE_BACKUP_CLIENT_SECRET','MICROSOFT_BACKUP_CLIENT_ID','MICROSOFT_BACKUP_CLIENT_SECRET'])process.env[k]='synthetic-'+k;
const Cloud=require('../api/_backupCloud'),handler=require('../api/backup-cloud');
const body={format:'turizm-encrypted-backup',version:1,kdf:'PBKDF2-SHA256',iterations:310000,cipher:'AES-256-GCM',salt:Buffer.alloc(16).toString('base64'),iv:Buffer.alloc(12).toString('base64'),payload:Buffer.alloc(64).toString('base64')};
let badSize=false,failUpload=false,outside=false,requests=[];
global.fetch=async(url,options={})=>{
 url=String(url);requests.push({url,method:options.method||'GET'});
 const respond=data=>new Response(JSON.stringify(data),{status:200});
 if(url.includes('/token'))return respond({access_token:'test-access',refresh_token:'test-refresh',expires_in:3600});
 if(url.includes('/about?'))return respond({user:{emailAddress:'qa@example.invalid'}});
 if(url.includes('/me?$select'))return respond({mail:'qa@example.invalid'});
 if(url.includes('special/approot'))return respond({id:'app-folder'});
 if(url.includes('/upload/drive/')||url.includes(':/content')){
  if(failUpload)return new Response('{}',{status:503});
  return respond({id:'file-1',name:'turizm-qa.turizm.json',size:badSize?1:Buffer.byteLength(JSON.stringify(body))});
 }
 if(url.includes('/files?'))return respond({files:[{id:'app-folder',name:'turizm-qa.turizm.json',createdTime:'2026-10-01',size:123}]});
 if(url.includes('/children?'))return respond({value:[{id:'file-1',name:'turizm-qa.turizm.json',createdDateTime:'2026-10-01',size:123},{id:'other',name:'other.txt'}]});
 if(url.includes('/files/file-1?fields'))return respond({id:'file-1',name:'turizm-qa.turizm.json',size:123,parents:[outside?'unrelated':'app-folder'],appProperties:{turizmBackup:'v1'}});
 if(url.includes('/items/file-1?$select'))return respond({id:'file-1',name:'turizm-qa.turizm.json',size:123,parentReference:{id:outside?'unrelated':'app-folder'}});
 if(url.includes('?alt=media')||url.endsWith('/content'))return respond(body);
 throw Error('Unexpected network request in test: '+url);
};
async function request(action,provider,body,method=body?'POST':'GET'){
 let code=200,value;await handler({method,query:{action,provider},body},{setHeader(){},status(c){code=c;return this;},json(v){value=v;},send(v){value=v;}});return{code,value};
}
(async()=>{
 assert.throws(()=>Cloud.config('toString'),/Geçersiz/);
 assert.equal(Cloud.validEncrypted({format:'plaintext',passengers:[]}),false);
 owner=false;for(const action of ['status','start','upload','list','download','disconnect'])assert.equal((await request(action,'google',{})).code,403);owner=true;
 const sealed=Cloud.seal({refresh_token:'private'});assert(!JSON.stringify(sealed).includes('private'));assert.equal(Cloud.unseal(sealed).refresh_token,'private');
 const key=process.env.GOOGLE_BACKUP_CLIENT_SECRET;delete process.env.GOOGLE_BACKUP_CLIENT_SECRET;assert.equal((await Cloud.status(db)).google.configured,false);await assert.rejects(()=>Cloud.start(db,'google'),/kurulumu gerekiyor/);process.env.GOOGLE_BACKUP_CLIENT_SECRET=key;
 for(const provider of ['google','onedrive']){
  const url=new URL(await Cloud.start(db,provider));assert.equal(url.searchParams.get('code_challenge_method'),'S256');assert(url.searchParams.get('state'));assert(!url.toString().includes('CLIENT_SECRET'));
  await Cloud.callback(db,{state:url.searchParams.get('state'),code:'synthetic-code'});
  await assert.rejects(()=>Cloud.callback(db,{state:url.searchParams.get('state'),code:'replay'}),/geçersiz/);
  const status=(await Cloud.status(db))[provider];assert(status.connected);assert.equal(status.account,'qa@example.invalid');assert(!JSON.stringify(db.rows).includes('test-refresh'));
  await assert.rejects(()=>Cloud.upload(db,provider,{passengers:[]}),/Yalnız şifreli/);
  const file=await Cloud.upload(db,provider,body);assert(file.id);assert((await Cloud.status(db))[provider].lastSuccess);
  assert.equal((await Cloud.list(db,provider)).files.length,1);
  assert.deepEqual(await Cloud.download(db,provider,'file-1'),body);
  outside=true;await assert.rejects(()=>Cloud.download(db,provider,'file-1'),/klasöründe değil/);outside=false;
  const last=(await Cloud.status(db))[provider].lastSuccess;badSize=true;await assert.rejects(()=>Cloud.upload(db,provider,body),/boyutu doğrulanamadı/);badSize=false;assert.equal((await Cloud.status(db))[provider].lastSuccess,last);
  failUpload=true;await assert.rejects(()=>Cloud.upload(db,provider,body),/işlemi tamamlamadı/);failUpload=false;assert.equal((await Cloud.status(db))[provider].lastSuccess,last);
 }
 await Cloud.disconnect(db,'google');assert.equal((await Cloud.status(db)).google.connected,false);assert(!db.rows['turizm-cloud-connection-v1:google'].data.secret);
 assert(requests.every(r=>!r.url.includes('test-access')&&!r.url.includes('test-refresh')),'Tokens never go in URLs');
 const window={addEventListener(){}};const context=vm.createContext({window,crypto:crypto.webcrypto,TextEncoder,TextDecoder,Uint8Array,btoa,atob,URL,setInterval:()=>1});
 vm.runInContext(fs.readFileSync('public/recovery-ui.js','utf8'),context);vm.runInContext(fs.readFileSync('public/backup-destinations.js','utf8'),context);
 let diskWrites=0,uploads=[];window.TurizmBackupDestinations.install({cloud:async(action,provider,data)=>{assert.equal(action,'upload');assert.equal(data.backup.format,'turizm-encrypted-backup');uploads.push(provider);return{ok:true,id:'file',name:'file.turizm.json'};}});
 const vault=await window.TurizmRecoveryUI.createVault('synthetic-backup-secret'),clone=structuredClone(vault);
 const sample={format:'turizm-full-backup',sha256:'test',records:{hazeyn:{passengers:[{name:'Synthetic'}]}}};
 assert.deepEqual(JSON.parse(JSON.stringify(await window.TurizmRecoveryUI.unlock(await window.TurizmRecoveryUI.seal(sample,clone),'synthetic-backup-secret'))),sample);
 const handle={queryPermission:async()=>'granted',getFileHandle:async()=>({createWritable:async()=>({write:async data=>{diskWrites++;assert.equal(JSON.parse(data).format,'turizm-encrypted-backup');},close:async()=>{}})})};
 for(let mask=0;mask<8;mask++){
  diskWrites=0;uploads=[];const targets=['local','google','onedrive'].map((id,i)=>({id,enabled:Boolean(mask&(1<<i)),vault,handle}));
  for(const t of window.TurizmBackupDestinations.selected(targets))assert((await window.TurizmBackupDestinations.writeTarget(t,sample)).lastSuccess);
  assert.equal(diskWrites,mask&1?1:0,'Cloud-only backup must never write a local file');assert.deepEqual(uploads,['google','onedrive'].filter((_,i)=>mask&(1<<(i+1))));
 }
 window.TurizmBackupDestinations.install({cloud:async()=>{throw Error('cloud failed');}});
 await assert.rejects(()=>window.TurizmBackupDestinations.writeTarget({id:'google',vault},sample),/cloud failed/);
 console.log('Cloud backup: owner scope, OAuth state/PKCE/replay, encrypted tokens, upload verification/failures, folder ownership, direct restore and all 8 independent destination combinations passed. No live provider used.');
})().catch(e=>{console.error(e);process.exitCode=1;});
