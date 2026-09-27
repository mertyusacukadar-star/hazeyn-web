(function(){
'use strict';
const P=window.TurizmBusPlan;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.createBusWorkspace=function(root,hooks){
 let model,plan,baseline='',active='',query='',filter='unassigned',page=1,selected=new Set(),saving=false,notice='';
 const bus=()=>plan?.buses.find(b=>b.id===active);
 const formDirty=()=>{const b=bus();return b&&[...root.querySelectorAll('[data-bus-setting]')].some(el=>String(b[el.dataset.busSetting])!==el.value);};
 const dirty=()=>Boolean(model)&&(saving||JSON.stringify(plan)!==baseline||formDirty());
 function status(text){notice=text;const el=root.querySelector('[data-bus-notice]');if(el)el.textContent=text;}
 function open(next){
   if(model&&model.key===next.key&&dirty())return;
   model=next;const saved=P.normalizePlan(next.plan);baseline=JSON.stringify(saved);
   const reconciled=P.reconcile(saved,next.people);plan=reconciled.plan;selected.clear();query='';page=1;
   if(!next.canEdit)baseline=JSON.stringify(plan);
   if(!plan.buses.some(b=>b.id===active))active=plan.buses[0]?.id||'';
   notice=reconciled.removed?'Listeden çıkarılan yolcuların eski koltukları boşaltıldı. Planı kaydedin.':'';
   render();
 }
 function applySettings(){
   if(!bus())return true;
   const b=bus(), values={};
   for(const el of root.querySelectorAll('[data-bus-setting]')){
     if(!el.checkValidity()){el.reportValidity();return false;}
     values[el.dataset.busSetting]=el.type==='number'?Number(el.value):el.value.trim();
   }
   if(!values.name){status('Otobüs adını yazın.');return false;}
   if(values.limit>values.capacity){status('Otomatik hedef, koltuk kapasitesini aşamaz.');return false;}
   if(Object.keys(b.assignments).some(s=>Number(s)>values.capacity)){status('Kapasiteyi küçültmeden önce kaldırılacak koltuklardaki yolcuları taşıyın.');return false;}
   Object.assign(b,values);return true;
 }
 function seatMarkup(n){
   if(!n)return '<span class="bus-seat-gap"></span>';
   const id=bus().assignments[n],person=model.people.find(p=>p.id===id);
   return `<button type="button" class="bus-seat ${person?'occupied':''} ${selected.has(id)?'selected':''}" data-seat="${n}" ${!model.canEdit?'disabled':''} title="${esc(person?.name||'Boş koltuk')}" aria-label="Koltuk ${n}: ${esc(person?.name||'Boş')}"><b>${n}</b><span>${esc(person?.name||'Boş')}</span></button>`;
 }
 function renderMap(){
   const target=root.querySelector('[data-bus-map]');if(!target)return;
   if(!bus()){target.innerHTML='<div class="bus-empty">İlk otobüsü ekleyerek başlayın.</div>';return;}
   const layout=P.seats(bus());
   target.innerHTML=`<div class="bus-front"><span>◉ ŞOFÖR</span><span>ÖN KAPI ↗</span></div><div class="bus-cabin">${layout.rows.map((r,i)=>`<div class="bus-seat-row ${r.door?(layout.rows[i-1]?.door?'door-end':'door-start'):''}">${seatMarkup(r.values[0])}${seatMarkup(r.values[1])}<span class="bus-aisle"></span>${r.door?`<span class="bus-door">${layout.rows[i-1]?.door?'↗':'ORTA KAPI'}</span>`:seatMarkup(r.values[2])+seatMarkup(r.values[3])}</div>`).join('')}<div class="bus-rear" style="--rear-count:${layout.rear.length||1}">${layout.rear.map(seatMarkup).join('')}</div></div><div class="bus-map-foot">Arka bölüm · ${bus().capacity} koltuk</div>`;
 }
 function renderPeople(){
   const placed=P.placements(plan),target=root.querySelector('[data-bus-people]');if(!target)return;
   const filtered=model.people.filter(p=>(filter==='all'||(filter==='unassigned'?!placed.has(p.id):placed.get(p.id)?.busId===active))&&P.fold(p.name+' '+p.listTitle).includes(P.fold(query)));
   const pages=Math.max(1,Math.ceil(filtered.length/20));page=Math.min(pages,page);
   target.innerHTML=filtered.slice((page-1)*20,page*20).map(p=>{
     const spot=placed.get(p.id),vehicle=plan.buses.find(b=>b.id===spot?.busId);
     return `<div class="bus-person"><label><input type="checkbox" data-person="${esc(p.id)}" ${selected.has(p.id)?'checked':''} ${!model.canEdit?'disabled':''}><span><b>${esc(p.name)}</b><small>Liste ${p.order} · ${esc(vehicle?`${vehicle.name} / Koltuk ${spot.seat}`:'Henüz yerleşmedi')}</small></span></label>${p.surname&&model.canEdit?`<button type="button" class="bus-family" data-family="${esc(p.group)}" title="Aynı soyadlı yolcuları seç">Soyadı seç</button>`:''}</div>`;
   }).join('')||'<p class="bus-empty">Bu filtrede yolcu yok.</p>';
   root.querySelector('[data-people-pages]').innerHTML=`<span>${filtered.length} yolcu · ${page}/${pages}</span><button type="button" data-action="prev" ${page===1?'disabled':''}>←</button><button type="button" data-action="next" ${page===pages?'disabled':''}>→</button>`;
   root.querySelector('[data-selected-count]').textContent=`${selected.size} yolcu seçili`;
   const totals=root.querySelector('[data-bus-totals]');totals.textContent=`${model.people.length} yolcu · ${placed.size} yerleşti · ${model.people.length-placed.size} bekliyor`;
 }
 function render(){
   const b=bus();const edit=model.canEdit;
   root.innerHTML=`<div class="bus-heading"><div><span class="workspace-kicker">YOLCULUK PLANI</span><h2>Otobüs düzeni</h2><p data-bus-totals></p></div><div class="bus-actions"><button type="button" data-action="discard" ${!edit?'hidden':''}>Vazgeç</button><button type="button" class="primary" data-action="save" ${!edit?'hidden':''}>Planı kaydet</button></div></div>
   <p class="bus-help">Yolcuyu seçin, boş koltuğa dokunun. Dolu koltuğa dokunarak yolcuyu seçebilir, ardından başka koltuğa taşıyabilirsiniz. Değişiklikler “Planı kaydet” ile kaydedilir.</p>
   <div class="bus-notice" role="status" data-bus-notice>${esc(notice)}</div>
   <div class="bus-tabs" role="group" aria-label="Otobüsler">${plan.buses.map(v=>`<button type="button" data-bus="${esc(v.id)}" aria-pressed="${v.id===active}"><b>${esc(v.name)}</b><small>${Object.keys(v.assignments).length} / ${v.capacity} kişi</small></button>`).join('')}<button type="button" data-action="add" ${!edit?'hidden':''}>+ Otobüs ekle</button></div>
   ${b?`<details class="bus-settings"><summary>Otobüs ayarları · ${esc(b.name)} · otomatik hedef ${b.limit} kişi</summary><div class="bus-settings-fields"><label>Otobüs adı<input data-bus-setting="name" value="${esc(b.name)}" maxlength="80" required ${!edit?'disabled':''}></label><label>Koltuk sayısı<input type="number" data-bus-setting="capacity" value="${b.capacity}" min="1" max="80" step="1" required ${!edit?'disabled':''}></label><label>Otomatik hedef<input type="number" data-bus-setting="limit" value="${b.limit}" min="0" max="80" step="1" required ${!edit?'disabled':''}></label><label>Orta kapı önündeki sıra<input type="number" data-bus-setting="doorAfter" value="${b.doorAfter}" min="0" max="20" step="1" required ${!edit?'disabled':''}></label><label>Arka sıra koltukları<input type="number" data-bus-setting="rear" value="${b.rear}" min="0" max="5" step="1" required ${!edit?'disabled':''}></label></div><p>Hedefi kapasiteden düşük tutarak sonraki otobüse erken geçebilirsiniz. Hedef 0 ise otomatik yerleştirme bu otobüsü atlar; elle yerleştirme mümkündür. Orta kapı 0 ise koridorda kapı boşluğu bırakılmaz.</p><button type="button" data-action="settings" ${!edit?'hidden':''}>Ayarları uygula</button> <button type="button" data-action="remove" ${!edit?'hidden':''}>Bu otobüsü kaldır</button></details>`:''}
   <div class="bus-automation"><div><b>Liste sırasıyla, aileler birlikte</b><p>Aynı soyadlılar ilk geçtikleri sıraya göre gruplanır. Mevcut koltuklar korunur. Sığmayan gruplar bölünmez. Soyadı ayrı kaydedilmemişse adın son kelimesi kullanılır.</p></div><button type="button" data-action="auto" ${!edit?'hidden':''}>Boşta kalanları otomatik yerleştir</button></div>
   <div class="bus-layout"><section class="bus-roster"><h3>Yolcular</h3><input type="search" data-bus-search aria-label="Otobüs için yolcu ara" placeholder="Ad, soyad veya liste ara" value="${esc(query)}"><select data-bus-filter aria-label="Otobüs yolcu filtresi"><option value="unassigned" ${filter==='unassigned'?'selected':''}>Yerleşmeyenler</option><option value="current" ${filter==='current'?'selected':''}>Bu otobüsteki yolcular</option><option value="all" ${filter==='all'?'selected':''}>Tüm yolcular</option></select><div class="bus-selection"><b data-selected-count></b><button type="button" data-action="clear-selection">Seçimi kaldır</button></div><div class="bus-selection-actions" ${!edit?'hidden':''}><button type="button" data-action="move">Seçilenleri bu otobüse al</button><button type="button" data-action="unseat">Koltuktan çıkar</button></div><div data-bus-people></div><nav class="bus-people-pages" data-people-pages aria-label="Yolcu sayfaları"></nav></section><section class="bus-map-panel"><div class="bus-map-caption"><h3>${esc(b?.name||'Koltuk planı')}</h3><span>2 + 2 · Orta koridor</span></div><div data-bus-map></div></section></div>`;
   renderPeople();renderMap();
 }
 root.addEventListener('input',e=>{if(e.target.matches('[data-bus-search]')){query=e.target.value;page=1;renderPeople();}});
 root.addEventListener('change',e=>{
   if(e.target.matches('[data-bus-filter]')){filter=e.target.value;page=1;renderPeople();}
   if(e.target.matches('[data-person]')){const id=e.target.dataset.person;if(e.target.checked)selected.add(id);else selected.delete(id);renderPeople();renderMap();}
 });
 root.addEventListener('click',async e=>{
   const button=e.target.closest('button');if(!button||saving)return;
   const action=button.dataset.action;
   try{
    if(action==='prev'||action==='next'){page+=action==='prev'?-1:1;renderPeople();return;}
    if(action==='clear-selection'){selected.clear();renderPeople();renderMap();return;}
    if(button.dataset.bus){if(model.canEdit&&!applySettings())return;active=button.dataset.bus;page=1;render();return;}
    if(!model.canEdit)return;
    if(button.dataset.family){model.people.filter(p=>p.group===button.dataset.family).forEach(p=>selected.add(p.id));renderPeople();renderMap();return;}
    if(button.dataset.seat){
      const n=Number(button.dataset.seat),occupant=bus().assignments[n];
      if(occupant){
        if(selected.size===1&&!selected.has(occupant)){
          if(!applySettings())return;
          const chosen=[...selected][0],old=P.placements(plan).get(chosen);
          if(!old){status('Bu koltuk dolu. Önce boş bir koltuk seçin veya buradaki yolcuyu koltuktan çıkarın.');return;}
          if(!await window.askWorkspaceConfirmation('Seçili yolcu ile bu koltuktaki yolcunun yerleri değiştirilsin mi?'))return;
          plan.buses.find(b=>b.id===old.busId).assignments[old.seat]=occupant;bus().assignments[n]=chosen;selected.clear();
        }else{selected.clear();selected.add(occupant);status('Yolcu seçildi. Taşımak için boş koltuğa dokunun.');renderPeople();renderMap();return;}
      }else{if(!applySettings())return;plan=P.move(plan,model.people.filter(p=>selected.has(p.id)).map(p=>p.id),active,n);selected.clear();}
      notice='Yerleşim değişti. Planı kaydetmeyi unutmayın.';render();return;
    }
    if(action==='discard'){
      if(!await window.askWorkspaceConfirmation('Kaydedilmemiş otobüs düzeninden vazgeçilsin mi?'))return;
      plan=P.normalizePlan(model.plan);baseline=JSON.stringify(plan);selected.clear();active=plan.buses[0]?.id||'';notice='Kayıtlı plan geri yüklendi.';render();return;
    }
    if(!applySettings())return;
    if(action==='add'){
      if(plan.buses.length>=20){status('Bir turda en fazla 20 otobüs eklenebilir.');return;}
      let number=1;while(plan.buses.some(b=>b.name===`Otobüs ${number}`))number++;
      const v=P.makeBus(crypto.randomUUID(),`Otobüs ${number}`);plan.buses.push(v);active=v.id;notice='Otobüs eklendi. Kapasite ve hedefi otobüs ayarlarından değiştirebilirsiniz.';
    }
    if(action==='settings')notice='Ayarlar uygulandı. Koltuk numaraları korunur; planı kaydedin.';
    if(action==='remove'){
      if(!await window.askWorkspaceConfirmation('Bu otobüs plandan kaldırılsın mı? İçindeki yolcular yerleşmeyenler listesine döner; yolcu kayıtları silinmez.'))return;
      plan.buses=plan.buses.filter(b=>b.id!==active);active=plan.buses[0]?.id||'';notice='Otobüs kaldırıldı; yolcular korunuyor.';
    }
    if(action==='auto'){
      if(!plan.buses.length){status('Önce otobüs ekleyin.');return;}
      const result=P.autoPlace(plan,model.people);plan=result.plan;
      notice=result.warnings.length?result.warnings.join('\n'):'Otomatik yerleştirme tamamlandı. Kontrol edip planı kaydedin.';
    }
    if(action==='move'){plan=P.move(plan,model.people.filter(p=>selected.has(p.id)).map(p=>p.id),active);selected.clear();notice='Seçilen yolcular bu otobüse taşındı.';}
    if(action==='unseat'){plan.buses.forEach(b=>Object.entries(b.assignments).forEach(([s,id])=>{if(selected.has(id))delete b.assignments[s];}));selected.clear();notice='Seçilen yolcular yerleşmeyenler listesine alındı.';}
    if(action==='save'){
      saving=true;root.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);status('Plan kaydediliyor…');
      const result=await hooks.save(model.tourId,P.normalizePlan(plan));
      if(result.ok||result.storedLocally){
        model.plan=P.normalizePlan(plan);baseline=JSON.stringify(plan);
        notice=result.ok?'Otobüs planı kaydedildi.':'Plan bu cihazda saklandı; merkezi kayıt tamamlanmadı. Bağlantı gelince Planı kaydet ile tekrar deneyin.';
      }else notice='Plan kaydedilemedi. Düzeniniz ekranda korunuyor; tekrar deneyin.';
      saving=false;
    }
    render();
   }catch(error){saving=false;notice=error.message;render();}
 });
 return {open,isDirty:dirty,reset:()=>{model=null;plan=null;baseline='';selected.clear();root.innerHTML='';}};
};
})();
