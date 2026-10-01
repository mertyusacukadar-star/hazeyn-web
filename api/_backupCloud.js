'use strict';
const crypto=require('crypto');
const {TABLE}=require('./_supabase');
const R=require('./_recovery');
const connectionId=p=>'turizm-cloud-connection-v1:'+p;
const names={google:'Google Drive',onedrive:'OneDrive'};
function config(provider){
 if(!Object.hasOwn(names,provider))R.fail('Geçersiz yedek hedefi.',400);
 const google=provider==='google';
 return {provider,name:names[provider],clientId:process.env[google?'GOOGLE_BACKUP_CLIENT_ID':'MICROSOFT_BACKUP_CLIENT_ID'],clientSecret:process.env[google?'GOOGLE_BACKUP_CLIENT_SECRET':'MICROSOFT_BACKUP_CLIENT_SECRET'],
  redirect:(process.env.BACKUP_PUBLIC_ORIGIN||'https://www.hazeynturizm.com').replace(/\/$/,'')+'/api/backup-cloud?action=callback',
  authorize:google?'https://accounts.google.com/o/oauth2/v2/auth':'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  token:google?'https://oauth2.googleapis.com/token':'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  scope:google?'https://www.googleapis.com/auth/drive.file':'offline_access https://graph.microsoft.com/Files.ReadWrite.AppFolder https://graph.microsoft.com/User.Read'};
}
function encryptionKey(){const source=process.env.BACKUP_TOKEN_ENCRYPTION_KEY||process.env.DESKTOP_SESSION_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY;if(!source)R.fail('Bulut bağlantısı için sunucu şifreleme anahtarı eksik.',503);return crypto.createHash('sha256').update('turizm-cloud-v1\0'+source).digest();}
function seal(value){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',encryptionKey(),iv),data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return {iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')};}
function unseal(value){const decipher=crypto.createDecipheriv('aes-256-gcm',encryptionKey(),Buffer.from(value.iv,'base64'));decipher.setAuthTag(Buffer.from(value.tag,'base64'));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(value.data,'base64')),decipher.final()]).toString());}
async function put(client,id,old,data){
 const updated_at=new Date(Math.max(Date.now(),(Date.parse(old?.updated_at)||0)+1)).toISOString();
 const q=old?client.from(TABLE).update({data,updated_at}).eq('id',id).eq('updated_at',old.updated_at):client.from(TABLE).insert({id,data,updated_at});
 const result=await q.select('id');if(result.error?.code==='23505'||!result.error&&!result.data?.length)R.fail('Bulut bağlantısı değişti. İşlemi yeniden deneyin.');if(result.error)throw result.error;
 return {data,updated_at};
}
async function remote(url,options={}){const res=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});if(!res.ok)R.fail('Bulut hizmeti işlemi tamamlamadı. Hesap bağlantısını, kotayı ve interneti kontrol edin.',502);return res;}
async function json(url,options){return (await remote(url,options)).json();}
async function start(client,provider){
 const c=config(provider);if(!c.clientId||!c.clientSecret)R.fail(`${c.name} için sunucu OAuth kurulumu gerekiyor. Hesap henüz bağlanmadı.`,503);
 const state=crypto.randomBytes(32).toString('base64url'),verifier=crypto.randomBytes(48).toString('base64url');
 const id='turizm-cloud-oauth-v1:'+crypto.createHash('sha256').update(state).digest('hex');
 await put(client,id,null,{provider,expiresAt:Date.now()+10*60000,used:false,secret:seal({verifier})});
 const params=new URLSearchParams({client_id:c.clientId,redirect_uri:c.redirect,response_type:'code',scope:c.scope,state,code_challenge_method:'S256',code_challenge:crypto.createHash('sha256').update(verifier).digest('base64url')});
 if(provider==='google'){params.set('access_type','offline');params.set('prompt','consent');}else params.set('prompt','select_account');
 return c.authorize+'?'+params;
}
async function callback(client,query){
 if(typeof query.state!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(query.state))R.fail('Bağlantı onayı geçersiz veya süresi dolmuş.',400);
 const id='turizm-cloud-oauth-v1:'+crypto.createHash('sha256').update(query.state).digest('hex');
 const row=await R.read(client,id),state=row?.data;
 if(!state||state.used||state.expiresAt<Date.now())R.fail('Bağlantı onayı geçersiz veya süresi dolmuş.',400);
 await put(client,id,row,{provider:state.provider,used:true,expiresAt:state.expiresAt});
 if(query.error||!query.code)R.fail('Hesap bağlantısı onaylanmadı.',400);
 const c=config(state.provider),verifier=unseal(state.secret).verifier;
 const tokens=await json(c.token,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:c.clientId,client_secret:c.clientSecret,code:query.code,redirect_uri:c.redirect,grant_type:'authorization_code',code_verifier:verifier})});
 if(!tokens.refresh_token||!tokens.access_token)R.fail('Kalıcı yedek izni alınamadı. Hesabı yeniden bağlayın.',400);
 const headers={Authorization:'Bearer '+tokens.access_token};
 const profile=state.provider==='google'?await json('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)',{headers}):await json('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName',{headers});
 const key=connectionId(state.provider),existing=await R.read(client,key);
 await put(client,key,existing,{provider:state.provider,connected:true,account:profile.user?.emailAddress||profile.mail||profile.userPrincipalName||c.name,connectedAt:new Date().toISOString(),secret:seal({...tokens,expiresAt:Date.now()+Number(tokens.expires_in||3600)*1000})});
 return c.name;
}
async function status(client){
 const result={};for(const provider of Object.keys(names)){const c=config(provider),row=await R.read(client,connectionId(provider));result[provider]={configured:Boolean(c.clientId&&c.clientSecret),connected:row?.data?.connected===true,account:row?.data?.account||'',lastSuccess:row?.data?.lastSuccess||''};}return result;
}
async function credentials(client,provider){
 const id=connectionId(provider),c=config(provider);let row=await R.read(client,id);
 if(!row?.data?.connected||!row.data.secret)R.fail(`${c.name} hesabını önce bağlayın.`,409);
 let tokens=unseal(row.data.secret);
 if(!tokens.expiresAt||tokens.expiresAt<Date.now()+60000){
  const fresh=await json(c.token,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:c.clientId,client_secret:c.clientSecret,refresh_token:tokens.refresh_token,grant_type:'refresh_token'})});
  if(!fresh.access_token)R.fail('Hesap izni yenilenemedi. Bulut hesabını yeniden bağlayın.',502);
  tokens={...tokens,...fresh,expiresAt:Date.now()+Number(fresh.expires_in||3600)*1000};row=await put(client,id,row,{...row.data,secret:seal(tokens)});
 }
 return {id,row,headers:{Authorization:'Bearer '+tokens.access_token}};
}
async function folder(client,provider,creds){
 if(provider==='onedrive')return (await json('https://graph.microsoft.com/v1.0/me/drive/special/approot',{headers:creds.headers})).id;
 if(creds.row.data.folderId)return creds.row.data.folderId;
 const existing=await json('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q:"trashed = false and mimeType = 'application/vnd.google-apps.folder' and appProperties has { key='turizmBackup' and value='v1' }",fields:'files(id)',pageSize:'1'}),{headers:creds.headers});
 const found=existing.files?.[0]||await json('https://www.googleapis.com/drive/v3/files?fields=id',{method:'POST',headers:{...creds.headers,'Content-Type':'application/json'},body:JSON.stringify({name:'Turizm Muhasebe Yedekleri',mimeType:'application/vnd.google-apps.folder',appProperties:{turizmBackup:'v1'}})});
 creds.row=await put(client,creds.id,creds.row,{...creds.row.data,folderId:found.id});return found.id;
}
function validEncrypted(data){return data?.format==='turizm-encrypted-backup'&&data.version===1&&data.cipher==='AES-256-GCM'&&data.kdf==='PBKDF2-SHA256'&&data.iterations===310000&&['salt','iv','payload'].every(k=>typeof data[k]==='string'&&/^[A-Za-z0-9+/]+={0,2}$/.test(data[k]))&&Buffer.from(data.salt,'base64').length===16&&Buffer.from(data.iv,'base64').length===12;}
async function upload(client,provider,data){
 if(!validEncrypted(data))R.fail('Yalnız şifreli Turizm yedeği buluta gönderilebilir.',400);
 const content=JSON.stringify(data);if(Buffer.byteLength(content)>3500000)R.fail('Yedek doğrudan aktarım sınırını aşıyor. Şifreli dosyayı indirip buluta yükleyin.',413);
 const creds=await credentials(client,provider),parent=await folder(client,provider,creds);
 const name='turizm-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomUUID().slice(0,8)+'.turizm.json';
 let file;
 if(provider==='google'){
  const boundary='turizm_'+crypto.randomBytes(16).toString('hex');
  const body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name,parents:[parent],appProperties:{turizmBackup:'v1'}})}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
  file=await json('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size',{method:'POST',headers:{...creds.headers,'Content-Type':'multipart/related; boundary='+boundary},body});
 }else file=await json(`https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(parent)}:/${encodeURIComponent(name)}:/content`,{method:'PUT',headers:{...creds.headers,'Content-Type':'application/json'},body:content});
 if(!file.id||Number(file.size)!==Buffer.byteLength(content))R.fail('Bulut dosyasının boyutu doğrulanamadı. Yedek başarılı sayılmadı.',502);
 const lastSuccess=new Date().toISOString();await put(client,creds.id,creds.row,{...creds.row.data,lastSuccess});
 return {id:file.id,name:file.name||name,lastSuccess};
}
async function list(client,provider){
 const creds=await credentials(client,provider),parent=await folder(client,provider,creds);
 if(provider==='google'){
  const data=await json('https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q:`'${parent.replace(/'/g,"\\'")}' in parents and trashed = false and appProperties has { key='turizmBackup' and value='v1' }`,fields:'files(id,name,createdTime,size)',orderBy:'createdTime desc',pageSize:'20'}),{headers:creds.headers});
  return {files:(data.files||[]).map(f=>({id:f.id,name:f.name,createdAt:f.createdTime,size:Number(f.size)})),parent};
 }
 const data=await json(`https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(parent)}/children?$select=id,name,createdDateTime,size&$orderby=createdDateTime%20desc&$top=20`,{headers:creds.headers});
 return {files:(data.value||[]).filter(f=>f.name?.startsWith('turizm-')&&f.name?.endsWith('.turizm.json')).map(f=>({id:f.id,name:f.name,createdAt:f.createdDateTime,size:f.size})),parent};
}
async function download(client,provider,id){
 if(typeof id!=='string'||!/^[A-Za-z0-9_!.-]{1,250}$/.test(id))R.fail('Geçersiz yedek dosyası.',400);
 const creds=await credentials(client,provider),parent=await folder(client,provider,creds);
 const metadata=provider==='google'?await json(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,size,parents,appProperties`,{headers:creds.headers}):await json(`https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(id)}?$select=id,name,size,parentReference`,{headers:creds.headers});
 const inside=provider==='google'?metadata.parents?.includes(parent)&&metadata.appProperties?.turizmBackup==='v1':metadata.parentReference?.id===parent;
 if(!inside||!metadata.name?.endsWith('.turizm.json')||Number(metadata.size)>3500000)R.fail('Bu dosya uygulamanın yedek klasöründe değil veya boyutu desteklenmiyor.',400);
 const data=await json(provider==='google'?`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`:`https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(id)}/content`,{headers:creds.headers});
 if(!validEncrypted(data))R.fail('Buluttaki dosya geçerli bir şifreli yedek değil.',400);return data;
}
async function disconnect(client,provider){config(provider);const id=connectionId(provider),row=await R.read(client,id);if(row)await put(client,id,row,{provider,connected:false,disconnectedAt:new Date().toISOString()});}
module.exports={config,seal,unseal,put,start,callback,status,upload,list,download,disconnect,validEncrypted};
