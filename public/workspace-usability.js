(function(){
 'use strict';
 if(!document.body.classList.contains('desktop-app')&&!/[?&](desktop|mobile)=1/.test(location.search))return;
 const table=document.getElementById('passengerTable');
 if(table){
  const body=table.tBodies[0],bar=document.createElement('div');bar.className='passenger-editor-tools';
  bar.innerHTML='<label>Yolcu bul<input type="search" placeholder="Ad, soyad, TC veya pasaport ara" aria-label="Formdaki yolcuları ara"></label><span data-count aria-live="polite"></span><div><button type="button" data-prev>← Önceki</button><span data-page></span><button type="button" data-next>Sonraki →</button></div>';
  table.parentElement.before(bar);let page=0;const mobile=matchMedia('(max-width:760px)'),search=bar.querySelector('input');let size=mobile.matches?5:15;
  mobile.addEventListener('change',()=>{size=mobile.matches?5:15;page=0;render();});
  const fold=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  function render(){
   const all=[...body.rows],query=fold(search.value),rows=all.filter(row=>!query||['.p-name','.p-tc','.p-passport'].some(sel=>fold(row.querySelector(sel)?.value).includes(query)));
   page=Math.max(0,Math.min(page,Math.ceil(rows.length/size)-1));const visible=new Set(rows.slice(page*size,(page+1)*size));
   all.forEach((row,i)=>{row.hidden=!visible.has(row);row.dataset.position=(i+1)+'. YOLCU';const name=row.querySelector('.p-name');if(name){name.rows=1;name.style.height='auto';if(visible.has(row))name.style.height=Math.max(36,name.scrollHeight+2)+'px';name.title=name.value;row.querySelector('.remove-row')?.setAttribute('aria-label',(name.value||'Boş yolcu satırı')+' — sil');}});
   bar.querySelector('[data-count]').textContent=rows.length?`${page*size+1}–${Math.min((page+1)*size,rows.length)} / ${rows.length} yolcu`:'Yolcu bulunamadı';
   bar.querySelector('[data-page]').textContent=`${page+1} / ${Math.max(1,Math.ceil(rows.length/size))}`;
   bar.querySelector('[data-prev]').disabled=page===0;bar.querySelector('[data-next]').disabled=(page+1)*size>=rows.length;
  }
  search.oninput=()=>{page=0;render();};bar.querySelector('[data-prev]').onclick=()=>{page--;render();};bar.querySelector('[data-next]').onclick=()=>{page++;render();};
  new MutationObserver(render).observe(body,{childList:true});
  let observedWidth=-1;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==observedWidth){observedWidth=width;render();}}).observe(table.parentElement);
  body.addEventListener('input',e=>{if(e.target.matches('.p-name')){e.target.title=e.target.value;e.target.style.height='auto';e.target.style.height=Math.max(36,e.target.scrollHeight+2)+'px';e.target.closest('tr').querySelector('.remove-row')?.setAttribute('aria-label',(e.target.value||'Boş yolcu satırı')+' — sil');}});
  document.getElementById('addPassengerRow')?.addEventListener('click',()=>queueMicrotask(()=>{search.value='';page=Math.floor((body.rows.length-1)/size);render();const field=body.lastElementChild?.querySelector('.p-name');field?.scrollIntoView({block:'center'});field?.focus();}));
  render();
 }
 function pointTo(target){
  if(typeof target==='function')target=target();
  const el=typeof target==='string'?document.querySelector(target):target;if(!el)return;
  for(let parent=el.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
  el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center',inline:'nearest'});
  el.classList.remove('workspace-attention');void el.offsetWidth;el.classList.add('workspace-attention');el.focus?.({preventScroll:true});setTimeout(()=>el.classList.remove('workspace-attention'),5000);
 }
 let lastField=null;document.addEventListener('focusin',e=>{if(e.target.matches('input,select,textarea')&&!e.target.closest('#toast'))lastField=e.target;});
 document.addEventListener('invalid',e=>pointTo(e.target),true);
 window.TurizmGuidance={pointTo,show(el,message,target){
  const visible=s=>[...document.querySelectorAll(s)].find(x=>x.getClientRects().length&&!x.disabled);
  let destination=target;
  if(!destination){
   if(/yedek|kurtarma|bulut|klasör/i.test(message))destination=visible('[data-target-error], [data-target-setup], #exportBtn');
   else if(/senkronize|merkezi veri/i.test(message))destination=visible('#refreshAdminData');
   else if(/ücret|fiyat/i.test(message))destination=visible('.account-agreed-price, .p-custom-price');
   else if(/ödeme tutarı/i.test(message))destination=visible('.payment-amount');
   else if(/tur seç|program seç|liste başlığı/i.test(message))destination=visible('#listTourSelect, #costTourSelect');
   else if(/yolcu ekle/i.test(message))destination=visible('#addPassengerRow');
   else if(/yetki|erişim/i.test(message))destination=visible('[data-tab="users"]');
   else if(/seç|yaz|eksik|hata|başarısız|geçerli|gereki|önce|kaydedilmemiş|kontrol/i.test(message))destination=(lastField?.getClientRects().length?lastField:null)||visible('.admin-panel.active form, .workspace-tour-tabs, #refreshAdminData');
  }
  el.replaceChildren();const text=document.createElement('span');text.textContent=message;el.append(text);
  if(destination){const button=document.createElement('button');button.type='button';button.textContent='İlgili alana git →';button.onclick=()=>pointTo(destination);el.append(button);}
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Bildirimi kapat');close.onclick=()=>el.classList.remove('show');el.append(close);
  el.setAttribute('role','status');return Boolean(destination);
 }};
})();
