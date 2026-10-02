(function(root){
 'use strict';
 const providers={local:'Bilgisayar / harici disk',google:'Google Drive',onedrive:'OneDrive'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
 const date=s=>s?new Date(s).toLocaleString('tr-TR'):'Henüz başarılı yedek yok';
 let hooks,dbPromise,busy=false,timer;const mounts=new Map();
 function database(){
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open('turizmBackupTargetsV1',1);r.onupgradeneeded=()=>r.result.createObjectStore('targets',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Bu cihazda yedek ayarları saklanamıyor.'));});return dbPromise;
 }
 async function storage(operation,value){
  const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('targets',operation==='getAll'?'readonly':'readwrite');const r=tx.objectStore('targets')[operation](...(value===undefined?[]:[value]));let result;r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Yedek ayarları saklanamadı.'));});
 }
 function due(t,now=Date.now()){return !t.lastChecked||now-new Date(t.lastChecked).getTime()>=(t.interval||15)*60000;}
 function selected(targets){return targets.filter(t=>providers[t.id]&&t.enabled===true);}
 async function writeTarget(t,backup,now=Date.now(),force=false){
  const stamp=new Date(now).toISOString();
  const draftHash=backup.deviceDraft?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(backup.deviceDraft))))).map(n=>n.toString(16).padStart(2,'0')).join(''):'';
  const fingerprint=backup.sha256+draftHash;
  if(!force&&t.sha256===fingerprint&&t.lastSuccess?.slice(0,10)===stamp.slice(0,10))return {...t,lastChecked:stamp,error:''};
  if(!t.vault)throw Error('Bu hedef için yedek şifresi belirleyin.');
  const data=await root.TurizmRecoveryUI.seal(backup,t.vault);
  let name=`turizm-${stamp.replace(/[:.]/g,'-')}-${crypto.randomUUID().slice(0,8)}.turizm.json`;
  if(t.id==='local'){
   if(!t.handle)throw Error('Önce bilgisayardaki yedek klasörünü seçin.');
   if(await t.handle.queryPermission({mode:'readwrite'})!=='granted')throw Error('Klasör yazma izni gerekiyor. İzin ver düğmesini kullanın.');
   const file=await t.handle.getFileHandle(name,{create:true}),writer=await file.createWritable();
   try{await writer.write(JSON.stringify(data));await writer.close();}catch(e){try{await writer.abort();}catch(_){}throw Error('Dosya yazılamadı. Diski ve klasör iznini kontrol edin.');}
  }else{
   const result=await hooks.cloud('upload',t.id,{backup:data});
   if(!result.ok||!result.id)throw Error('Bulut yüklemesi doğrulanamadı.');name=result.name;
  }
  return {...t,lastSuccess:stamp,lastChecked:stamp,lastFile:name,sha256:fingerprint,error:''};
 }
 async function refreshAll(){for(const [host,opts]of mounts){if(!host.isConnected)mounts.delete(host);else await render(host,opts);}}
 async function backupNow(force=false){
  if(busy||!hooks?.ready())return;busy=true;
  const execute=async()=>{
   const targets=selected(await storage('getAll')).filter(t=>force||due(t));if(!targets.length)return;
   let backup;try{backup=await hooks.fetchBackup();}catch(e){for(const t of targets)await storage('put',{...t,error:e.message||'Sunucu yedeği alınamadı.',lastChecked:new Date().toISOString()});return;}
   for(const t of targets){let result;try{result=await writeTarget(t,backup,Date.now(),force);}catch(e){result={...t,error:e.message||'Yedek tamamlanamadı.',lastChecked:new Date().toISOString()};}
    // A selection change while the request was in flight must not re-enable a target.
    const current=(await storage('getAll')).find(x=>x.id===t.id);if(current)await storage('put',{...current,lastSuccess:result.lastSuccess,lastChecked:result.lastChecked,lastFile:result.lastFile,sha256:result.sha256,error:result.error});
   }
  };
  try{if(navigator.locks)await navigator.locks.request('turizm-auto-backup',{ifAvailable:true},lock=>lock?execute():undefined);else await execute();}
  catch(e){hooks.toast?.(e.message||'Otomatik yedek tamamlanamadı.');}
  finally{busy=false;await refreshAll();}
 }
 async function change(id,patch){const t=(await storage('getAll')).find(x=>x.id===id)||{id,interval:15,enabled:false};await storage('put',{...t,...patch});}
 async function setup(id){
  let handle;if(id==='local'){try{handle=await root.showDirectoryPicker({id:'turizm-backups',mode:'readwrite'});}catch(e){if(e.name==='AbortError')return;throw Error('Klasör seçimi bu tarayıcıda kullanılamıyor. Şifreli yedeği elle indirebilir veya bulut seçebilirsiniz.');}}
  const password=await root.TurizmRecoveryUI.passwordPrompt(true,'Şifreyi kullan');if(!password)return;
  const vault=await root.TurizmRecoveryUI.createVault(password);
  await change(id,{vault,...(handle?{handle}:{}),sha256:null,lastChecked:null,error:''});await refreshAll();
 }
 async function setupCloud(id,c){
  if(hooks.setupAllowed&&!hooks.setupAllowed())throw Error('İlk bağlantı kurulumunu baş yönetici tamamlamalı. Sonrasında Hesap bağla ile devam edebilirsin.');
  const d=document.createElement('dialog');d.className='recovery-dialog';d.setAttribute('aria-label',providers[id]+' bağlantı kurulumu');
  const google=id==='google',url=google?'https://console.cloud.google.com/apis/credentials':'https://entra.microsoft.com/';
  d.innerHTML=`<header><h2>${providers[id]} bağlantı kurulumu</h2><button type="button" data-close aria-label="Kapat">×</button></header><div class="recovery-content"><p>Bu bir defalık uygulama kaydıdır. Sonraki bağlantılar Hesap bağla düğmesiyle yapılır. Google/Microsoft şifrenizi bu forma yazmayın.</p><ol><li><a href="${url}" target="_blank" rel="noopener noreferrer">${google?'Google Cloud':'Microsoft Entra'} panelini aç</a>. ${google?'Drive API’yi etkinleştirin; izin ekranını ve Web application türünde OAuth istemcisini oluşturun. Kalıcı kullanım için yayın durumunu tamamlayın.':'Uygulama kaydı oluşturun. Kişisel hesap kullanacaksanız kişisel Microsoft hesaplarını da destekleyen hesap türünü seçin. Web yönlendirmesi ve Files.ReadWrite.AppFolder, User.Read, offline_access izinlerini ekleyin.'}</li><li>İzin ekranından uygulamaya dönüş adresi:<div class="cloud-redirect-note"><p>Bu adres muhasebe uygulamasının bağlantı altyapısına aittir. Firmalar aynı dönüş adresini kullanır; bağlanacak Google / Microsoft hesabını sen seçersin.</p><textarea readonly rows="2" aria-label="Yönlendirme adresi">${esc(c.redirect||'https://www.hazeynturizm.com/api/backup-cloud?action=callback')}</textarea><button type="button" class="btn btn-outline dark" data-copy-redirect>Adresi kopyala</button><span data-copy-status role="status"></span></div></li><li>Oluşturduğunuz istemci kimliğini ve gizli anahtarın <strong>değerini</strong> aşağıya girin. Bunlar sunucuda şifrelenir; tekrar ekrana getirilmez.</li></ol><form><label>İstemci kimliği (Client ID)<input name="clientId" required autocomplete="off"></label><label>Gizli anahtar değeri (Client secret)<input name="clientSecret" type="password" required autocomplete="new-password"></label><p data-error role="alert"></p><button type="submit" class="btn btn-gold">Kurulumu kaydet</button></form></div><footer class="recovery-footer"><button type="button" data-close class="btn btn-outline dark">Kapat</button></footer>`;
  d.querySelector('[data-copy-redirect]').onclick=async()=>{try{await navigator.clipboard.writeText(d.querySelector('[aria-label="Yönlendirme adresi"]').value);d.querySelector('[data-copy-status]').textContent='Adres kopyalandı.';}catch(_){d.querySelector('[aria-label="Yönlendirme adresi"]').select();d.querySelector('[data-copy-status]').textContent='Adresin tamamını kopyalayabilirsin.';}};
  document.body.append(d);d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>d.close());d.onclose=()=>{d.querySelector('form').reset();d.remove();};d.showModal();
  d.querySelector('form').onsubmit=async e=>{e.preventDefault();const form=e.target,b=form.querySelector('button');b.disabled=true;try{await hooks.cloud('configure',id,{clientId:form.clientId.value,clientSecret:form.clientSecret.value});form.reset();d.close();await refreshAll();hooks.toast('Kurulum kaydedildi. Hesap bağla ile Google/Microsoft hesabınıza izin verin.');}catch(e){d.querySelector('[data-error]').textContent=e.message;}finally{b.disabled=false;}};
 }
 async function render(host,opts={}){
  let targets;try{targets=await storage('getAll');}catch(e){host.textContent=e.message;return;}
  let cloud={},statusError='';try{cloud=(await hooks.cloud('status')).providers;}catch(e){statusError=e.message;}
  if(!host.isConnected)return;
  const supported=typeof root.showDirectoryPicker==='function';
  host.innerHTML=`<p>Bir, iki veya üç hedef seçin. Bilgisayara dosya kaydetmeden yalnız Google Drive veya OneDrive kullanabilirsiniz.</p><div class="recovery-actions"><button class="btn btn-outline dark" data-target-all>Üçünü de seç</button><button class="btn btn-outline dark" data-target-none>Seçimi temizle</button></div>${statusError?`<p class="backup-target-warning">${esc(statusError)}</p>`:''}${Object.entries(providers).map(([id,label])=>{
   const t=targets.find(x=>x.id===id)||{id,enabled:false},c=cloud[id]||{},local=id==='local';
   const state=local?(t.handle?'Klasör: '+t.handle.name:'Klasör seçilmedi'):(c.connected?'Bağlı: '+c.account:c.configured?'Hesap bağlanmadı':'Bağlantı kurulumu henüz tamamlanmadı');
   return `<section class="backup-target-card ${t.enabled?'is-selected':''}"><label class="backup-target-choice"><input type="checkbox" data-target-select="${id}" ${t.enabled?'checked':''}><strong>${label}</strong></label><small>${esc(state)}</small><p>Son başarılı ${local?'dosya':'bulut yüklemesi'}: ${esc(date(t.lastSuccess||c.lastSuccess))}</p>${t.error?`<p class="backup-target-warning" role="alert">${esc(t.error)}</p>`:''}<div class="recovery-actions">${local?`<button class="btn btn-outline dark" data-target-setup="${id}" ${supported?'':'disabled'}>${t.handle?'Klasör / şifre değiştir':'Klasör ve şifre seç'}</button>${t.handle?'<button class="btn btn-outline dark" data-target-permit>İzin ver</button>':''}`:`<button class="btn btn-outline dark" data-target-connect="${id}" >${c.connected?'Hesabı değiştir':'Hesap bağla'}</button><button class="btn btn-outline dark" data-target-setup="${id}">${t.vault?'Yedek şifresini değiştir':'Yedek şifresi belirle'}</button>${c.connected?`<button class="btn btn-outline dark" data-target-browse="${id}">Buluttan geri yükle</button><button class="btn btn-outline dark" data-target-disconnect="${id}">Bağlantıyı kaldır</button>`:''}`}<label>Otomatik yedek sıklığı<select data-target-interval="${id}">${[5,15,60,1440].map(m=>`<option value="${m}" ${(t.interval||15)===m?'selected':''}>${m===1440?'Günde bir':m+' dakika'}</option>`).join('')}</select></label></div>${!local?`<div data-connect-link="${id}"></div>${hooks.setupAllowed?.()?`<button type="button" class="btn btn-outline dark" data-target-configure="${id}">Bağlantı kurulumu</button>`:''}`:''}${!local&&!t.vault?'<small>Bu cihazda otomatik yedek için bir şifre belirleyin.</small>':''}${local&&!supported?'<small>Bu tarayıcı otomatik klasör yazmayı desteklemiyor. “Tüm firmaları yedekle” ile dosya indirebilir veya bulut hedefi kullanabilirsiniz.</small>':''}</section>`;
  }).join('')}<p class="hint-text">Seçimler bu cihazda saklanır. Uygulama açıkken ve yedek yetkili kullanıcı giriş yapmışken otomatik çalışır. Her hedefin sonucu ayrı gösterilir. Yedekler şifrelenir; şifreyi güvenli bir yerde saklayın. Dosyalar otomatik silinmez.</p><div class="recovery-actions"><button class="btn btn-gold" data-target-run ${busy||!selected(targets).length?'disabled':''}>${busy?'Yedekleniyor…':'Seçili hedeflere şimdi yedekle'}</button><button class="btn btn-outline dark" data-target-refresh>Bağlantıları yenile</button></div><p data-target-error role="alert"></p>`;
  const action=fn=>async()=>{host.querySelector('[data-target-error]').textContent='';try{await fn();}catch(e){if(host.isConnected)host.querySelector('[data-target-error]').textContent=e.message;}};
  host.querySelectorAll('[data-target-select]').forEach(el=>el.onchange=action(async()=>{await change(el.dataset.targetSelect,{enabled:el.checked});await refreshAll();}));
  for(const [selector,enabled]of [['[data-target-all]',true],['[data-target-none]',false]])host.querySelector(selector).onclick=action(async()=>{for(const id of Object.keys(providers))await change(id,{enabled});await refreshAll();});
  host.querySelectorAll('[data-target-setup]').forEach(b=>b.onclick=action(()=>setup(b.dataset.targetSetup)));
  host.querySelector('[data-target-permit]')?.addEventListener('click',action(async()=>{const t=targets.find(x=>x.id==='local');if(await t.handle.requestPermission({mode:'readwrite'})!=='granted')throw Error('Klasör yazma izni verilmedi.');await refreshAll();}));
  host.querySelectorAll('[data-target-configure]').forEach(b=>b.onclick=action(()=>setupCloud(b.dataset.targetConfigure,cloud[b.dataset.targetConfigure]||{})));
  host.querySelectorAll('[data-target-connect]').forEach(b=>b.onclick=action(async()=>{
   const id=b.dataset.targetConnect;if(!cloud[id]?.configured){await setupCloud(id,cloud[id]||{});return;}const {url}=await hooks.cloud('start',id,{}),u=new URL(url);
   if(u.protocol!=='https:'||u.hostname!==(id==='google'?'accounts.google.com':'login.microsoftonline.com'))throw Error('Hesap bağlantı adresi doğrulanamadı.');
   const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.className='btn btn-gold';link.textContent=providers[id]+' izin ekranını aç';host.querySelector(`[data-connect-link="${id}"]`).replaceChildren(link);
  }));
  host.querySelectorAll('[data-target-disconnect]').forEach(b=>b.onclick=action(async()=>{const id=b.dataset.targetDisconnect;if(await root.askWorkspaceConfirmation(providers[id]+' bağlantısı uygulamadan kaldırılsın mı? Buluttaki dosyalar kalır.')){await hooks.cloud('disconnect',id,{});await change(id,{enabled:false});await refreshAll();}}));
  host.querySelectorAll('[data-target-browse]').forEach(b=>b.onclick=action(()=>opts.browseCloud?.(b.dataset.targetBrowse)));
  host.querySelectorAll('[data-target-interval]').forEach(el=>el.onchange=action(async()=>{await change(el.dataset.targetInterval,{interval:Number(el.value)});await refreshAll();}));
  host.querySelector('[data-target-run]').onclick=action(async()=>{host.querySelector('[data-target-run]').disabled=true;host.querySelector('[data-target-run]').textContent='Yedekleniyor…';await backupNow(true);});
  host.querySelector('[data-target-refresh]').onclick=action(refreshAll);
 }
 root.TurizmBackupDestinations={due,selected,writeTarget,backupNow,mount(host,opts){mounts.set(host,opts||{});render(host,opts);},install(value){hooks=value;if(timer)return;timer=setInterval(()=>backupNow(),60000);root.addEventListener('focus',()=>{refreshAll();backupNow();});root.addEventListener('turizm-authenticated',()=>backupNow());root.addEventListener('turizm-data-saved',()=>backupNow());}};
})(typeof window==='undefined'?globalThis:window);
