// Odalama Düzenle: odalar kart olarak görünür. Yolcuya dokun → gideceği odaya dokun; bir kişiye
// dokunursan yer değiştirirler. Farenin sürüklemesi de aynı işi yapar ve kenara gelince liste kayar.
(function(root){
'use strict';
const TYPE_LABEL={'1':'Tekli','2':'İkili','3':'Üçlü','4':'Dörtlü','5+':'5+ Kişilik'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const fold=v=>String(v||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i');

function open(options){
 const {title,people,layout,types,capacity,onSave,confirm:ask=async m=>window.confirm(m),toast=m=>window.alert(m)}=options;
 const byId=new Map(people.map(p=>[p.id,p]));
 let rooms=layout.rooms.map(r=>({...r,ids:[...r.ids]})),pool=[...layout.unassigned],selected='',query='',history=[],dirty=false,saving=false;

 const overlay=document.createElement('div');
 overlay.className='rb-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Odalama düzenle');
 overlay.innerHTML=`<div class="rb-panel">
  <header class="rb-head">
   <div class="rb-title"><small>ODALAMA DÜZENLE</small><strong>${esc(title)}</strong></div>
   <input class="rb-search" type="search" placeholder="Yolcu ara, Enter ile seç" autocomplete="off">
   <div class="rb-actions"><button type="button" class="icon-btn" data-rb="undo" disabled>Geri al</button><button type="button" class="icon-btn" data-rb="cancel">Vazgeç</button><button type="button" class="btn rb-save" data-rb="save">Kaydet</button></div>
  </header>
  <div class="rb-status" aria-live="polite"></div>
  <div class="rb-scroll"></div>
 </div>`;
 const scroller=overlay.querySelector('.rb-scroll'),status=overlay.querySelector('.rb-status'),search=overlay.querySelector('.rb-search');

 const roomOf=id=>rooms.findIndex(r=>r.ids.includes(id));
 const snapshot=()=>{history.push(JSON.stringify({rooms,pool}));if(history.length>60)history.shift();dirty=true;};
 const restore=()=>{const last=history.pop();if(!last)return;({rooms,pool}=JSON.parse(last));selected='';render();};

 function personHtml(id){
  const p=byId.get(id)||{name:'?'},g=p.gender==='Kadın'?'k':p.gender==='Erkek'?'e':'',hit=query&&fold(p.name).includes(query);
  const meta=[p.relation&&p.relation!=='—'?p.relation:'',p.roomGroup?'Grup '+p.roomGroup:''].filter(Boolean).join(' · ');
  return `<button type="button" class="rb-person ${g} ${selected===id?'selected':''} ${hit?'hit':''} ${query&&!hit?'dim':''}" data-person="${esc(id)}" title="${esc(p.name)}"><span class="rb-name">${esc(p.name||'İsimsiz')}</span>${meta?`<small>${esc(meta)}</small>`:''}</button>`;
 }
 function roomHtml(room,index,number){
  const cap=capacity(room.type),free=cap-room.ids.length,women=room.ids.filter(id=>byId.get(id)?.gender==='Kadın').length,men=room.ids.filter(id=>byId.get(id)?.gender==='Erkek').length;
  const target=selected&&roomOf(selected)!==index&&free>0;
  return `<div class="rb-room ${free>0?'':'full'} ${room.ids.length?'':'empty-room'} ${target?'target':''}" data-room="${index}">
   <div class="rb-room-head"><b>Oda ${number}</b><select data-room-type="${index}" aria-label="Oda tipi">${types.map(t=>`<option value="${t}" ${t===room.type?'selected':''}>${TYPE_LABEL[t]}</option>`).join('')}</select><span class="rb-count">${room.ids.length}/${cap}${women||men?` · ${women?women+'K':''}${women&&men?' ':''}${men?men+'E':''}`:''}</span></div>
   <div class="rb-occupants">${room.ids.map(personHtml).join('')}${Array.from({length:Math.max(0,free)},()=>`<button type="button" class="rb-free" data-room-free="${index}">${selected?'Buraya taşı':'Boş yer'}</button>`).join('')}</div>
   <div class="rb-nums"><input data-room-num="mekkeRoomNo" data-room-index="${index}" value="${esc(room.mekkeRoomNo||'')}" placeholder="Mekke oda no"><input data-room-num="medineRoomNo" data-room-index="${index}" value="${esc(room.medineRoomNo||'')}" placeholder="Medine oda no"></div>
  </div>`;
 }
 function render(){
  const keep=scroller.scrollTop;let number=0;
  const sections=types.map(type=>{
   const list=rooms.map((r,i)=>[r,i]).filter(([r])=>r.type===type);
   const count=list.reduce((n,[r])=>n+r.ids.length,0);
   // Seçim yapınca hiçbir kart yer değiştirmez; boş tipler hep aynı küçük düğmeyle görünür.
   if(!list.length)return `<div class="rb-type rb-type-empty"><button type="button" class="rb-add" data-add-room="${type}">+ ${TYPE_LABEL[type]} oda aç</button></div>`;
   return `<section class="rb-type"><h3>${TYPE_LABEL[type]} odalar <span>${list.filter(([r])=>r.ids.length).length} oda · ${count} kişi</span></h3>
    <div class="rb-grid">${list.map(([r,i])=>roomHtml(r,i,++number)).join('')}<button type="button" class="rb-add" data-add-room="${type}">+ Yeni ${TYPE_LABEL[type].toLocaleLowerCase('tr-TR')} oda<small>${selected?'seçili yolcu buraya geçer':'&nbsp;'}</small></button></div></section>`;
  }).join('');
  const poolHtml=pool.length?`<section class="rb-type rb-pool"><h3>Oda tipi seçilmemiş <span>${pool.length} kişi · boş yeri olan bir odaya taşıyın</span></h3><div class="rb-pool-list">${pool.map(personHtml).join('')}</div></section>`:'';
  scroller.innerHTML=poolHtml+sections;
  scroller.scrollTop=keep;
  const p=byId.get(selected);
  status.innerHTML=p?`<span><b>${esc(p.name)}</b> seçildi → gideceği odaya ya da yer değiştireceği kişiye dokunun.</span><button type="button" class="link-btn" data-rb="clear">Seçimi bırak</button>`
   :'<span>1) Yolcuya dokunun 2) Gideceği odaya dokunun. Bir kişinin üstüne dokunursanız ikisi yer değiştirir. Fareyle sürükleyebilirsiniz de.</span>';
  overlay.querySelector('[data-rb="undo"]').disabled=!history.length;
 }

 function moveTo(id,index){
  const room=rooms[index];if(!room||room.ids.includes(id))return false;
  if(room.ids.length>=capacity(room.type)){toast('Bu oda dolu. Oradaki bir kişinin üstüne bırakırsanız yer değiştirirler.');return false;}
  snapshot();
  const from=roomOf(id);if(from>=0)rooms[from].ids=rooms[from].ids.filter(x=>x!==id);else pool=pool.filter(x=>x!==id);
  room.ids.push(id);return true;
 }
 function swap(a,b){
  if(a===b)return false;
  const ra=roomOf(a),rb=roomOf(b);
  if(ra<0||rb<0){
   // Oda tipi olmayan yolcu ancak boş yere geçer; kimse odasız kalmaz.
   const target=ra<0?rb:ra;return moveTo(ra<0?a:b,target);
  }
  snapshot();
  if(ra===rb){const ids=rooms[ra].ids,i=ids.indexOf(a),j=ids.indexOf(b);[ids[i],ids[j]]=[ids[j],ids[i]];}
  else{rooms[ra].ids[rooms[ra].ids.indexOf(a)]=b;rooms[rb].ids[rooms[rb].ids.indexOf(b)]=a;}
  return true;
 }
 function addRoom(type){
  snapshot();rooms.push({type,ids:[],mekkeRoomNo:'',medineRoomNo:''});
  if(selected){const from=roomOf(selected);if(from>=0)rooms[from].ids=rooms[from].ids.filter(x=>x!==selected);else pool=pool.filter(x=>x!==selected);rooms[rooms.length-1].ids.push(selected);}
 }
 function dropOn(id,el){
  const person=el?.closest('[data-person]'),room=el?.closest('[data-room]'),add=el?.closest('[data-add-room]');
  let changed=false;
  if(person&&person.dataset.person!==id)changed=swap(id,person.dataset.person);
  else if(add){selected=id;addRoom(add.dataset.addRoom);changed=true;}
  else if(room)changed=moveTo(id,Number(room.dataset.room));
  if(changed)selected='';
  render();
  if(changed)flash(id);
 }
 function flash(id){const el=scroller.querySelector(`[data-person="${CSS.escape(id)}"]`);if(!el)return;el.classList.add('moved');setTimeout(()=>el.classList.remove('moved'),900);}

 overlay.addEventListener('click',async e=>{
  if(drag.suppress){drag.suppress=false;return;}
  const action=e.target.closest('[data-rb]')?.dataset.rb;
  if(action==='undo'){restore();return;}
  if(action==='clear'){selected='';render();return;}
  if(action==='cancel'){close();return;}
  if(action==='save'){save();return;}
  const add=e.target.closest('[data-add-room]');
  if(add){addRoom(add.dataset.addRoom);const moved=selected;selected='';render();if(moved)flash(moved);return;}
  if(e.target.closest('select,input'))return;
  const person=e.target.closest('[data-person]');
  if(person){
   const id=person.dataset.person;
   if(!selected||selected===id){selected=selected===id?'':id;render();return;}
   dropOn(selected,person);return;
  }
  const room=e.target.closest('[data-room]');
  if(room&&selected)dropOn(selected,room);
 });
 overlay.addEventListener('change',e=>{
  const type=e.target.closest('[data-room-type]');
  if(type){
   const room=rooms[Number(type.dataset.roomType)];
   if(room.ids.length>capacity(type.value)){toast(TYPE_LABEL[type.value]+' odaya en çok '+capacity(type.value)+' kişi sığar. Önce fazla kişiyi başka odaya taşıyın.');type.value=room.type;return;}
   snapshot();room.type=type.value;render();return;
  }
 });
 overlay.addEventListener('input',e=>{
  const num=e.target.closest('[data-room-num]');
  if(num){dirty=true;rooms[Number(num.dataset.roomIndex)][num.dataset.roomNum]=num.value;return;}
  if(e.target===search){query=fold(search.value.trim());render();}
 });
 search.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;e.preventDefault();
  const first=scroller.querySelector('.rb-person.hit');if(!first)return;
  selected=first.dataset.person;query='';search.value='';render();
  scroller.querySelector(`[data-person="${CSS.escape(selected)}"]`)?.scrollIntoView({block:'center',behavior:'smooth'});
 });
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if(selected){selected='';render();}else close();}});

 // Fareyle sürükleme: dokunmatikte kaydırma bozulmasın diye yalnız fare/kalemde açık.
 const drag={id:'',startX:0,startY:0,active:false,ghost:null,x:0,y:0,raf:0,suppress:false,over:null};
 function autoScroll(){
  if(!drag.active)return;
  const box=scroller.getBoundingClientRect(),edge=Math.min(90,box.height/4);
  let dy=0;if(drag.y<box.top+edge)dy=-Math.ceil((box.top+edge-drag.y)/4);else if(drag.y>box.bottom-edge)dy=Math.ceil((drag.y-(box.bottom-edge))/4);
  if(dy)scroller.scrollTop+=Math.max(-28,Math.min(28,dy));
  drag.raf=requestAnimationFrame(autoScroll);
 }
 function markOver(){
  const el=document.elementFromPoint(drag.x,drag.y),target=el?.closest('[data-person],[data-room],[data-add-room]');
  if(drag.over===target)return;drag.over?.classList.remove('drop-over');drag.over=target&&overlay.contains(target)?target:null;drag.over?.classList.add('drop-over');
 }
 scroller.addEventListener('pointerdown',e=>{
  const person=e.target.closest('[data-person]');
  if(!person||e.pointerType==='touch'||e.button!==0)return;
  drag.id=person.dataset.person;drag.startX=e.clientX;drag.startY=e.clientY;drag.active=false;
 });
 window.addEventListener('pointermove',onMove);
 window.addEventListener('pointerup',onUp);
 function onMove(e){
  if(!drag.id)return;drag.x=e.clientX;drag.y=e.clientY;
  if(!drag.active){
   if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<7)return;
   drag.active=true;selected=drag.id;render();overlay.classList.add('dragging');window.getSelection()?.removeAllRanges();
   drag.ghost=document.createElement('div');drag.ghost.className='rb-ghost';drag.ghost.textContent=byId.get(drag.id)?.name||'';overlay.appendChild(drag.ghost);
   drag.raf=requestAnimationFrame(autoScroll);
  }
  e.preventDefault();
  drag.ghost.style.transform=`translate(${e.clientX+12}px,${e.clientY+12}px)`;
  markOver();
 }
 function onUp(){
  if(!drag.id)return;
  const was=drag.active,id=drag.id,target=drag.over;
  drag.id='';drag.active=false;cancelAnimationFrame(drag.raf);drag.ghost?.remove();drag.ghost=null;drag.over?.classList.remove('drop-over');drag.over=null;overlay.classList.remove('dragging');
  if(!was)return;
  drag.suppress=true;setTimeout(()=>{drag.suppress=false;},0);
  if(target)dropOn(id,target);else{selected='';render();}
 }

 async function save(){
  if(saving)return;saving=true;const button=overlay.querySelector('[data-rb="save"]');button.disabled=true;button.textContent='Kaydediliyor…';
  try{if(await onSave(rooms.filter(r=>r.ids.length)))teardown();}
  catch(error){toast(error.message||'Odalama kaydedilemedi.');}
  finally{saving=false;button.disabled=false;button.textContent='Kaydet';}
 }
 async function close(){if(dirty&&!await ask('Odalamada kaydedilmemiş değişiklikler var. Kaydetmeden kapatılsın mı?'))return;teardown();}
 function teardown(){window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp);overlay.remove();document.documentElement.classList.remove('rb-open');}

 document.body.appendChild(overlay);document.documentElement.classList.add('rb-open');
 render();search.focus({preventScroll:true});
 return {close:teardown};
}
root.TurizmRoomingBoard={open};
})(window);
