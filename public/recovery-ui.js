(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
 const stamp=s=>s?new Date(s).toLocaleString('tr-TR'):'—';
 function modal(title,html){
  const previous=document.activeElement,d=document.createElement('dialog');d.className='recovery-dialog';d.setAttribute('aria-label',title);
  d.innerHTML=`<header><h2>${esc(title)}</h2><button type="button" data-close aria-label="Kapat">×</button></header><div class="recovery-content">${html}</div><footer class="recovery-footer"><button type="button" class="btn btn-outline dark" data-close>Kapat</button></footer>`;
  document.body.append(d);d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>d.close());d.addEventListener('close',()=>{d.remove();if(previous?.isConnected)previous.focus({preventScroll:true});},{once:true});d.showModal();return d;
 }
 function download(data,name){
  const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);
 }
 function passwordPrompt(confirm=false,buttonLabel){
  return new Promise(resolve=>{
   const d=modal(confirm?'Yedek dosyasını şifrele':'Yedek şifresi',`<p>${confirm?'Dosyayı açmak için bu şifre gerekecek. Unutulan yedek şifresi kurtarılamaz. Uygulama giriş şifrenizden farklı bir şifre kullanın.':'Bu dosyayı indirirken belirlediğiniz şifreyi girin.'}</p><form><label>Yedek şifresi<input type="password" name="password" minlength="8" required autocomplete="${confirm?'new-password':'current-password'}"></label>${confirm?'<label>Şifreyi tekrarla<input type="password" name="repeat" minlength="8" required autocomplete="new-password"></label>':''}<p data-error role="alert"></p><button class="btn btn-gold">${confirm?'Şifrele ve indir':'Yedeği aç'}</button></form>`);
   if(buttonLabel)d.querySelector('form button').textContent=buttonLabel;
   let result=null;d.addEventListener('close',()=>resolve(result),{once:true});d.querySelector('form').onsubmit=e=>{e.preventDefault();const f=e.target;if(confirm&&f.password.value!==f.repeat.value){d.querySelector('[data-error]').textContent='Şifreler eşleşmiyor.';return;}result=f.password.value;d.close();};
  });
 }
 const base64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
 const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 async function cryptKey(password,salt){const source=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},source,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
 async function lock(data,password){
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const value=await crypto.subtle.encrypt({name:'AES-GCM',iv},await cryptKey(password,salt),new TextEncoder().encode(JSON.stringify(data)));
  return {format:'turizm-encrypted-backup',version:1,kdf:'PBKDF2-SHA256',iterations:310000,cipher:'AES-256-GCM',salt:base64(salt),iv:base64(iv),payload:base64(new Uint8Array(value))};
 }
 async function unlock(data,password){
  if(data.version!==1||data.iterations!==310000||data.cipher!=='AES-256-GCM')throw Error('Desteklenmeyen yedek biçimi.');
  try{return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(data.iv)},await cryptKey(password,bytes(data.salt)),bytes(data.payload))));}catch(_){throw Error('Şifre yanlış veya yedek dosyası hasarlı.');}
 }
 async function encryptedDownload(data,name){const password=await passwordPrompt(true);if(!password)return false;download(await lock(data,password),name+'.turizm.json');return true;}
 async function createVault(password){const salt=crypto.getRandomValues(new Uint8Array(16));return {salt:base64(salt),key:await cryptKey(password,salt)};}
 async function seal(data,vault){const iv=crypto.getRandomValues(new Uint8Array(12));const value=await crypto.subtle.encrypt({name:'AES-GCM',iv},vault.key,new TextEncoder().encode(JSON.stringify(data)));return {format:'turizm-encrypted-backup',version:1,kdf:'PBKDF2-SHA256',iterations:310000,cipher:'AES-256-GCM',salt:vault.salt,iv:base64(iv),payload:base64(new Uint8Array(value))};}
 const api={lock,unlock,createVault,seal,passwordPrompt};root.TurizmRecoveryUI=api;
 api.downloadTour=async function(company,state,id){
  const data={format:'turizm-tour-backup',version:1,company,createdAt:new Date().toISOString(),...root.TurizmTourTrash.inspect(state,id)};
  if(!await encryptedDownload(data,company+'-tur-'+id))throw Error('Yedek indirme iptal edildi; tur silinmedi.');
 };
 api.confirmDelete=info=>new Promise(resolve=>{
  const occupied=info.passengers||info.payments||info.costs||info.bus||info.lists.length;
  const d=modal('Tur silinsin mi?',`<h3>${esc(info.tour.title)}</h3><p>${occupied?`${info.passengers} yolcu, ${info.lists.length} liste ve ${info.payments} ödeme kaydı var. Silmeden önce dosya yedeği de indirmek ister misiniz?`:'Bu turda kayıtlı yolcu bulunmuyor.'}</p><p>Tur ve bağlı kayıtlar listeden kaldırılır. Silinen turlardan geri alabilirsiniz; sunucu kaydı öncesinde kurtarma kopyası da oluşturulur.</p><div class="recovery-actions"><button data-cancel class="btn btn-outline dark">Vazgeç</button><button data-delete class="btn btn-outline dark">Silinen turlara taşı</button>${occupied?'<button data-backup class="btn btn-gold">Yedek indir ve sil</button>':''}</div>`);
  let result=false;d.addEventListener('close',()=>resolve(result),{once:true});d.querySelector('[data-cancel]').onclick=()=>d.close();d.querySelector('[data-delete]').onclick=()=>{result='delete';d.close();};const b=d.querySelector('[data-backup]');if(b)b.onclick=()=>{result='backup';d.close();};
 });
 api.create=function(h){
  let dialog,page=0,trashPage=0,fileBackup=null,hasNext=false;
  const request=async(action,body,resource)=>{const res=await fetch(`/api/recovery?company=${encodeURIComponent(h.company())}&action=${action}${resource?'&resource='+encodeURIComponent(resource):''}`,{method:body?'POST':'GET',cache:'no-store',headers:h.headers({'Content-Type':'application/json'}),...(body?{body:JSON.stringify(body)}:{})});const result=await res.json();if(!res.ok)throw Error(result.error||'İşlem tamamlanamadı.');return result;};
  async function run(fn){
   if(dialog?.getAttribute('aria-busy')==='true')return;
   const d=dialog,disabled=new Map();d.querySelector('[data-error]').textContent='';d.querySelectorAll('button:not([data-close]),input,select').forEach(b=>{disabled.set(b,b.disabled);b.disabled=true;});d.setAttribute('aria-busy','true');
   try{await fn();}catch(e){if(d.isConnected)d.querySelector('[data-error]').textContent=e.message;}
   finally{if(d.isConnected){disabled.forEach((v,b)=>{if(b.isConnected)b.disabled=v;});d.removeAttribute('aria-busy');renderTrash();d.querySelector('[data-prev]').disabled=page===0;d.querySelector('[data-next]').disabled=!hasNext;}}
  }
  function renderTrash(){
   const all=h.state().deletedTours||[],host=dialog.querySelector('[data-trash]');trashPage=Math.min(trashPage,Math.max(0,Math.ceil(all.length/8)-1));
   host.innerHTML=all.length?all.slice(trashPage*8,trashPage*8+8).map(x=>`<div class="recovery-row"><div><strong>${esc(x.tour.title)}</strong><small>${stamp(x.deletedAt)} · ${x.passengers||0} yolcu</small></div><div class="recovery-actions recovery-row-actions"><button class="btn btn-outline dark" data-restore-tour="${esc(x.tour.id)}">Geri al</button><button class="btn btn-outline danger" data-purge-tour="${esc(x.tour.id)}">Kalıcı sil</button></div></div>`).join(''):'<p>Silinen tur yok.</p>';
   if(all.length>8)host.insertAdjacentHTML('beforeend',`<div class="recovery-actions"><button data-trash-prev ${trashPage===0?'disabled':''}>Önceki</button><span>${trashPage+1} / ${Math.ceil(all.length/8)}</span><button data-trash-next ${((trashPage+1)*8>=all.length)?'disabled':''}>Sonraki</button></div>`);
   host.querySelectorAll('[data-restore-tour]').forEach(b=>b.onclick=()=>run(async()=>{if(!h.canLeave())return;if(await root.askWorkspaceConfirmation('Bu tur, yolcuları ve ödemeleriyle geri alınsın mı?')){if(await h.restoreTour(b.dataset.restoreTour))h.toast('Tur geri alındı.');}}));
   host.querySelectorAll('[data-purge-tour]').forEach(b=>b.onclick=()=>run(async()=>{if(!h.canLeave())return;const item=all.find(x=>String(x.tour.id)===b.dataset.purgeTour);if(await root.askWorkspaceConfirmation(`“${item.tour.title}” silinen turlardan kalıcı olarak kaldırılsın mı? Bu bölümden geri alınamaz. Önceden oluşturulmuş yedek dosyaları ve sunucu kurtarma kopyaları değişmez.`)){if(await h.purgeTour(b.dataset.purgeTour))h.toast('Tur silinen turlardan kaldırıldı.');}}));
   host.querySelector('[data-trash-prev]')?.addEventListener('click',()=>{trashPage--;renderTrash();});host.querySelector('[data-trash-next]')?.addEventListener('click',()=>{trashPage++;renderTrash();});
  }
  async function history(){
   const resource=dialog.querySelector('[data-history-resource]').value;
   const data=await request('history&page='+page,null,resource);const host=dialog.querySelector('[data-history]');
   host.innerHTML=(data.items||[]).map(x=>`<div class="recovery-row"><div><strong>${stamp(x.updated_at)}</strong><small>${x.reason==='checkpoint'?'Elle oluşturulan nokta':'Değişiklik öncesi kopya'}</small></div><button class="btn btn-outline dark" data-point="${esc(x.id)}">İncele</button></div>`).join('')||'<p>Henüz kurtarma noktası yok. İlk güvenli kayıtta otomatik oluşur; şimdi de oluşturabilirsiniz.</p>';
   host.querySelectorAll('[data-point]').forEach(b=>b.onclick=()=>run(()=>restore({snapshotId:b.dataset.point},resource)));
   hasNext=Boolean(data.more);dialog.querySelector('[data-prev]').disabled=page===0;dialog.querySelector('[data-next]').disabled=!hasNext;dialog.querySelector('[data-page]').textContent='Sayfa '+(page+1);
  }
  async function restore(source,resource=h.company()){
   if(!h.canLeave())return;
   if(resource==='deviceDraft'){resource=h.company();source={...source,useDeviceDraft:true};}
   const preview=await request('preview',source,resource);
   const company=root.TurizmCompanies.config[h.company()].name;
   const summary=resource==='companyDirectory'?`${preview.companies} firma ve logosu geri yüklenecek. Mevcut firmalar silinmez.`:resource==='users'?`${preview.users} çalışan hesabı geri yüklenecek. Mevcut çalışan oturumları kapanır; yedekteki şifreler ve yetkiler geçerli olur.`:resource==='sharedBuses'?`${preview.plans} ortak otobüs planı geri yüklenecek. Tüm firmaların ortak oturma planları etkilenir.`:`${company}: ${preview.tours} tur, ${preview.lists} liste ve ${preview.passengers} yolcu geri yüklenecek. Bu firmanın mevcut muhasebe kayıtlarının yerini alır.`;
   if(!await root.askWorkspaceConfirmation((source.useDeviceDraft?'Dosyadaki eşitlenmemiş cihaz taslağı kullanılacak. ':'')+summary+' Mevcut durum önce kurtarma kopyasına alınır. Devam edilsin mi?'))return;
   await request('restore',{...source,revision:preview.revision,confirm:true},resource);await h.reload();await history();h.toast('Seçilen kayıtlar geri yüklendi.');
  }
  async function browseCloud(provider){
   const title=provider==='google'?'Google Drive':'OneDrive';
   const data=await h.cloud('list',provider);
   const d=modal(title+' yedekleri',`<p>Son 20 dosya. Yedeği doğrudan buluttan açabilirsiniz; bilgisayara indirmek gerekmez.</p><label>Geri yüklenecek bölüm<select data-cloud-resource><option value="${h.company()}">${esc(root.TurizmCompanies.config[h.company()].name)} muhasebe kayıtları</option><option value="sharedBuses">Ortak otobüsler</option><option value="users">Çalışan hesapları</option>${h.admin?.()?'<option value="companyDirectory">Firma tanımları ve logolar</option>':''}<option value="deviceDraft">Bu firmanın eşitlenmemiş cihaz taslağı (varsa)</option></select></label><div>${data.files?.length?data.files.map(f=>`<div class="recovery-row"><div><strong>${esc(stamp(f.createdAt))}</strong><small>${esc(f.name)}</small></div><button class="btn btn-outline dark" data-cloud-file="${esc(f.id)}">İncele</button></div>`).join(''):'<p>Bu hesapta uygulamanın oluşturduğu yedek bulunamadı.</p>'}</div><p data-error role="alert"></p>`);
   d.querySelectorAll('[data-cloud-file]').forEach(b=>b.onclick=async()=>{
    d.querySelector('[data-error]').textContent='';d.querySelectorAll('button:not([data-close])').forEach(x=>x.disabled=true);
    try{const {backup}=await h.cloud('download',provider,{id:b.dataset.cloudFile});const password=await passwordPrompt();if(!password)return;const opened=await unlock(backup,password);const resource=d.querySelector('[data-cloud-resource]').value;d.close();await run(()=>restore({backup:opened},resource));}
    catch(e){if(d.isConnected)d.querySelector('[data-error]').textContent=e.message;}
    finally{d.querySelectorAll('button').forEach(x=>x.disabled=false);}
   });
  }
  return {async open(){
   if(dialog?.isConnected){dialog.focus();return;}
   const company=root.TurizmCompanies.config[h.company()].name;
   let last='Henüz bu cihazdan tam yedek indirilmedi.';try{const t=localStorage.getItem('turizmLastBackupV1');if(t)last='Bu cihazdaki son indirme: '+stamp(t);}catch(_){}
   dialog=modal('Yedek ve kurtarma',`<p class="recovery-intro">${esc(company)} · Merkezi kayıtlar Supabase veritabanında tutulur. GitHub, uygulamanın kodunu saklar.</p><div class="recovery-info"><strong>İki ayrı koruma</strong><p>Her kayıttan önce sunucuda kurtarma kopyası alınır. Sunucunun tamamen kaybına karşı şifreli dosyayı ayrıca farklı bir cihazda veya güvendiğiniz bulut hesabında saklayın.</p><small>Dosya tüm firmaların tüm kayıtlarını, silinen turları, ortak otobüsleri ve kullanıcı hesaplarını içerir. Bağlantıyla tutulan görsellerin dosyaları bu veri yedeğine dahil değildir.</small></div><div class="recovery-actions"><button class="btn btn-gold" data-export>Tüm firmaları yedekle</button><button class="btn btn-outline dark" data-checkpoint>Kurtarma noktası oluştur</button></div><p data-last>${esc(last)}</p><p data-error role="alert"></p><details open><summary>Silinen turlar</summary><div data-trash></div></details><details><summary>Sunucudaki kurtarma noktaları</summary><div data-history>Yükleniyor…</div><div class="recovery-actions"><button data-prev>Önceki</button><span data-page></span><button data-next>Sonraki</button></div></details><details><summary>Dosyadan bu firmayı geri yükle</summary><p>Şifreli tam yedeğinizi seçin. Önce içerik sayıları gösterilir; onaylamadan kayıtlar değişmez. Aşağıdan firma kayıtlarını, ortak otobüsleri veya çalışan hesaplarını ayrı ayrı seçebilirsiniz. Tam kurtarmada önce firma kayıtlarını, sonra ortak otobüsleri yükleyin. Tek tur yedeği de seçebilirsiniz.</p><input type="file" accept=".json" data-file aria-label="Yedek dosyası seç"><button class="btn btn-outline dark" data-import>Dosyayı incele</button></details>`);
   const choices=`<option value="${h.company()}">${esc(company)} muhasebe kayıtları</option><option value="sharedBuses">Ortak otobüs planları</option><option value="users">Çalışan hesapları</option>${h.admin?.()?'<option value="companyDirectory">Firma tanımları ve logolar</option>':''}`;
   dialog.querySelector('[data-history]').insertAdjacentHTML('beforebegin',`<label>Kurtarma geçmişi<select data-history-resource>${choices}</select></label>`);
   dialog.querySelector('[data-file]').insertAdjacentHTML('beforebegin',`<label>Geri yüklenecek bölüm<select data-import-resource>${choices}<option value="deviceDraft">Bu firmanın eşitlenmemiş cihaz taslağı (dosyada varsa)</option></select></label>`);
   dialog.querySelector('[data-history-resource]').onchange=()=>run(async()=>{page=0;await history();});
   const targets=document.createElement('details');targets.className='backup-targets';targets.innerHTML='<summary>Bilgisayar · Google Drive · OneDrive</summary><div data-backup-targets></div>';dialog.querySelector('[data-last]').after(targets);
   root.TurizmBackupDestinations?.mount(targets.querySelector('[data-backup-targets]'),{browseCloud});
   page=0;trashPage=0;renderTrash();
   dialog.querySelector('[data-export]').onclick=()=>run(async()=>{
    const data=await request('export');const draft=await h.deviceDraft?.();if(draft)data.deviceDraft=draft;else if(h.state()?._meta?.pendingSync)data.deviceDraft={company:h.company(),state:h.state()};
    if(await encryptedDownload(data,'turizm-tam-yedek-'+new Date().toISOString().slice(0,10))){const t=new Date().toISOString();try{localStorage.setItem('turizmLastBackupV1',t);}catch(_){}dialog.querySelector('[data-last]').textContent='İndirme başlatıldı: '+stamp(t)+' — dosyanın kaydedildiğini kontrol edin.';}
   });
   dialog.querySelector('[data-checkpoint]').onclick=()=>run(async()=>{await request('checkpoint',{});await history();h.toast('Tüm firmaların kurtarma noktası oluşturuldu.');});
   dialog.querySelector('[data-prev]').onclick=()=>run(async()=>{if(page>0)page--;await history();});dialog.querySelector('[data-next]').onclick=()=>run(async()=>{page++;await history();});
   dialog.querySelector('[data-import]').onclick=()=>run(async()=>{
    const file=dialog.querySelector('[data-file]').files[0];if(!file)throw Error('Önce yedek dosyasını seçin.');if(file.size>100*1024*1024)throw Error('Yedek çok büyük; destek ile güvenli geri yükleme gerekir.');
    fileBackup=JSON.parse(await file.text());if(fileBackup.format==='turizm-encrypted-backup'){const password=await passwordPrompt();if(!password)return;fileBackup=await unlock(fileBackup,password);}
    if(fileBackup.format==='turizm-tour-backup'){
     if(!h.canLeave())return;
     const info=await request('import-tour',{backup:fileBackup});
     if(await root.askWorkspaceConfirmation(`${info.lists} liste ve ${info.passengers} yolcu içeren tur eklensin mi? Mevcut turlarınız korunur.`)){
      await request('import-tour',{backup:fileBackup,confirm:true,revision:info.revision});await h.reload();await history();h.toast('Tur yedekten eklendi.');
     }
    }else await restore({backup:fileBackup},dialog.querySelector('[data-import-resource]').value);
   });
   try{await history();}catch(e){dialog.querySelector('[data-error]').textContent=e.message;}
  }};
 };
})(window);
