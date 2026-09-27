(function(){
'use strict';
const C=window.TurizmBusCompanies,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.chooseSharedBusSource=function({company,tourId,catalog}){
 return new Promise(resolve=>{
  const other=C.opposite(company),origin=document.activeElement,dialog=document.createElement('dialog');dialog.className='passenger-picker shared-bus-picker';dialog.setAttribute('aria-label','Diğer firmanın yolcularını birleştir');
  dialog.innerHTML=`<div class="picker-heading"><h2>İki firma, ortak otobüs</h2><button type="button" data-close aria-label="Kapat">×</button></div><p>${esc(C.names[other])} yolcularını bu programla birlikte yerleştirmek ister misiniz? Yolcu ve ödeme kayıtları kendi firmalarında kalır.</p><label>Diğer programı ara<input type="search" placeholder="Program adı veya tarih"></label><label>Birleştirilecek ${esc(C.names[other])} programı<select data-tour><option value="">Program seçin</option></select></label><div data-lists></div><p>Mevcut otobüslerdeki yerleşimler ayrı araçlar olarak korunur. Ardından otobüsleri ve sağ-sol paylaşımını düzenleyebilirsiniz.</p><p class="picker-error" role="status"></p><div class="picker-actions"><button type="button" data-close>Vazgeç</button><button type="button" class="picker-primary" data-create>Ortak planı oluştur</button></div>`;
  document.body.append(dialog);let choice=null;
  const select=dialog.querySelector('[data-tour]'),search=dialog.querySelector('input'),listBox=dialog.querySelector('[data-lists]');
  function renderTours(){const previous=select.value,q=window.TurizmBusPlan.fold(search.value);select.innerHTML='<option value="">Program seçin</option>'+(catalog[other]||[]).filter(t=>window.TurizmBusPlan.fold(t.title+' '+t.date).includes(q)).map(t=>`<option value="${esc(t.id)}" ${t.linked?'disabled':''}>${esc(t.title)} · ${esc(t.date||'Tarihsiz')} · ${t.lists.reduce((n,l)=>n+l.count,0)} yolcu${t.linked?' · Ortak planda':''}</option>`).join('');select.value=previous;renderLists();}
  function renderLists(){const tour=(catalog[other]||[]).find(t=>t.id===select.value);listBox.innerHTML=tour?`<p>Dahil edilecek yolcu listeleri</p><label class="shared-list-choice"><input type="checkbox" data-all checked> Programın tüm listeleri (yeni eklenenler dahil)</label><div data-choices>${tour.lists.map(l=>`<label class="shared-list-choice"><input type="checkbox" data-list="${esc(l.id)}" checked disabled>${esc(l.title)} · ${l.count} yolcu</label>`).join('')}</div>`:'';}
  search.oninput=renderTours;select.onchange=renderLists;listBox.onchange=e=>{if(e.target.matches('[data-all]'))listBox.querySelectorAll('[data-list]').forEach(c=>{c.disabled=e.target.checked;c.checked=true;});};
  dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dialog.close());
  dialog.querySelector('[data-create]').onclick=()=>{if(!select.value){dialog.querySelector('.picker-error').textContent='Önce diğer firmanın programını seçin.';return;}const listIds=listBox.querySelector('[data-all]').checked?null:[...listBox.querySelectorAll('[data-list]:checked')].map(c=>c.dataset.list);if(listIds&&!listIds.length){dialog.querySelector('.picker-error').textContent='En az bir yolcu listesi seçin.';return;}choice=[{company,tourId,listIds:null},{company:other,tourId:select.value,listIds}];dialog.close();};
  dialog.addEventListener('close',()=>{dialog.remove();origin?.focus({preventScroll:true});resolve(choice);},{once:true});renderTours();dialog.showModal();
 });
};
})();
