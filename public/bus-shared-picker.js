(function(){
'use strict';
const C=window.TurizmBusCompanies,P=window.TurizmBusPlan,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.chooseSharedBusSource=function({company,tourId,catalog,existingSources}){
 return new Promise(resolve=>{
  const base=(existingSources||[{company,tourId,listIds:null}]).map(({company,tourId,listIds})=>({company,tourId,listIds}));
  const others=Object.keys(catalog).filter(c=>C.names[c]&&!base.some(s=>s.company===c));
  const origin=document.activeElement,dialog=document.createElement('dialog');
  dialog.className='passenger-picker shared-bus-picker';dialog.setAttribute('aria-label','Firmaların yolcularını birleştir');
  dialog.innerHTML=`<div class="picker-heading"><h2>${existingSources?'Ortak plana firma ekle':'Firmalar arası ortak otobüs'}</h2><button type="button" data-close aria-label="Kapat">×</button></div><p>Bir veya birden fazla firmanın programını seçin. Yolcu ve ödeme kayıtları kendi firmalarında kalır.</p>${others.map(c=>`<fieldset data-company="${c}"><legend>${esc(C.names[c])}</legend><label class="shared-list-choice"><input type="checkbox" data-include ${others.length===1?'checked':''}> Bu firmanın yolcularını dahil et</label><div data-fields ${others.length===1?'':'hidden'}><label>Program ara<input type="search" data-search placeholder="Program adı veya tarih"></label><label>Birleştirilecek program<select data-tour><option value="">Program seçin</option></select></label><div data-lists></div></div></fieldset>`).join('')}<p>Mevcut koltuklar korunur. Eklenen firmanın kayıtlı otobüsleri ayrı araçlar olarak alınır; diğer yolcular yerleştirilmek üzere bekler.</p><p class="picker-error" role="status"></p><div class="picker-actions"><button type="button" data-close>Vazgeç</button><button type="button" class="picker-primary" data-create>${existingSources?'Firmayı plana ekle':'Ortak planı oluştur'}</button></div>`;
  document.body.append(dialog);let choice=null;
  for(const field of dialog.querySelectorAll('fieldset')){
   const c=field.dataset.company,select=field.querySelector('[data-tour]'),search=field.querySelector('[data-search]'),lists=field.querySelector('[data-lists]');
   const renderLists=()=>{const tour=catalog[c].find(t=>t.id===select.value);lists.innerHTML=tour?`<p>Dahil edilecek yolcu listeleri</p><label class="shared-list-choice"><input type="checkbox" data-all checked> Tüm listeler (yeni eklenenler dahil)</label>${tour.lists.map(l=>`<label class="shared-list-choice"><input type="checkbox" data-list="${esc(l.id)}" checked disabled>${esc(l.title)} · ${l.count} yolcu</label>`).join('')}`:'';};
   const renderTours=()=>{const previous=select.value,q=P.fold(search.value);select.innerHTML='<option value="">Program seçin</option>'+catalog[c].filter(t=>P.fold(t.title+' '+t.date).includes(q)).map(t=>`<option value="${esc(t.id)}" ${t.linked?'disabled':''}>${esc(t.title)} · ${esc(t.date||'Tarihsiz')} · ${t.lists.reduce((n,l)=>n+l.count,0)} yolcu${t.linked?' · Ortak planda':''}</option>`).join('');select.value=previous;renderLists();};
   field.querySelector('[data-include]').onchange=e=>{field.querySelector('[data-fields]').hidden=!e.target.checked;};
   search.oninput=renderTours;select.onchange=renderLists;
   lists.onchange=e=>{if(e.target.matches('[data-all]'))lists.querySelectorAll('[data-list]').forEach(el=>{el.disabled=e.target.checked;el.checked=true;});};
   renderTours();
  }
  dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dialog.close());
  dialog.querySelector('[data-create]').onclick=()=>{
   const added=[],error=dialog.querySelector('.picker-error');
   for(const field of dialog.querySelectorAll('fieldset')){
    if(!field.querySelector('[data-include]').checked)continue;
    const c=field.dataset.company,id=field.querySelector('[data-tour]').value;
    if(!id){error.textContent=C.names[c]+' için bir program seçin.';return;}
    const listIds=field.querySelector('[data-all]').checked?null:[...field.querySelectorAll('[data-list]:checked')].map(el=>el.dataset.list);
    if(listIds&&!listIds.length){error.textContent=C.names[c]+' için en az bir liste seçin.';return;}
    added.push({company:c,tourId:id,listIds});
   }
   if(!added.length){error.textContent='Dahil edilecek en az bir firma ve program seçin.';return;}
   choice=[...base,...added];dialog.close();
  };
  dialog.addEventListener('close',()=>{dialog.remove();origin?.focus({preventScroll:true});resolve(choice);},{once:true});dialog.showModal();
 });
};
})();
