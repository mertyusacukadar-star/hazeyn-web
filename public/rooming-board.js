// Odalama Düzenle: odalar kart olarak görünür. Yolcuya dokun → gideceği odaya dokun; bir kişiye
// dokunursan yer değiştirirler. Odaya girmemiş yolcular her oda tipinin altında bekler; aile/soyad
// ya da kayıt sırasıyla dizilir, toplu seçilip oda tipine ayrılabilir. Odalar tek tek ya da topluca bozulabilir.
(function(root){
'use strict';
const TYPE_LABEL={'1':'Tekli','2':'İkili','3':'Üçlü','4':'Dörtlü','5+':'5+ Kişilik'};
const WAIT_LABEL={'1':'tek kalacaklar','2':'ikili kalacaklar','3':'üçlü kalacaklar','4':'dörtlü kalacaklar','5+':'5+ kişilik kalacaklar'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const fold=v=>String(v||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i');
const surname=name=>{const parts=String(name||'').trim().split(/\s+/);return parts.length>1?parts[parts.length-1]:'';};
// "Hamza Çukadar" → "Hamza Çukadar'ın", "Ayşe Kaya" → "Ayşe Kaya'nın"
function genitive(name){
 const text=String(name||'').trim(),lower=text.toLocaleLowerCase('tr-TR'),vowels=lower.match(/[aeıioöuü]/g)||['e'];
 const suffix={a:'ın',ı:'ın',e:'in',i:'in',o:'un',u:'un',ö:'ün',ü:'ün'}[vowels[vowels.length-1]];
 return text+"'"+(/[aeıioöuü]$/.test(lower)?'n':'')+suffix;
}
const ORDER_KEY='turizmRoomingOrderV1';
const readOrder=()=>{try{return localStorage.getItem(ORDER_KEY)==='saved'?'saved':'family';}catch(_){return 'family';}};
const writeOrder=v=>{try{localStorage.setItem(ORDER_KEY,v);}catch(_){}};

function open(options){
 const {title,people,layout,types,capacity,onSave,confirm:ask=async m=>window.confirm(m),toast=m=>window.alert(m)}=options;
 const byId=new Map(people.map(p=>[p.id,p])),savedIndex=new Map(people.map((p,i)=>[p.id,i]));
 const typeOf=new Map(people.map(p=>[p.id,types.includes(String(p.roomPeople||''))?String(p.roomPeople):'']));
 let rooms=layout.rooms.map(r=>({...r,ids:[...r.ids]})),waiting=[...layout.unassigned],want={};
 waiting.forEach(id=>{want[id]=typeOf.get(id)||'';});
 let selected=[],query='',order=readOrder(),history=[],dirty=false,saving=false;

 // Aile kümeleri: yakınlık bağı ya da aynı soyad aynı kümeye girer.
 const parent=new Map(people.map(p=>[p.id,p.id]));
 const findRoot=id=>{while(parent.get(id)!==id){parent.set(id,parent.get(parent.get(id)));id=parent.get(id);}return id;};
 const join=(a,b)=>{if(parent.has(a)&&parent.has(b))parent.set(findRoot(a),findRoot(b));};
 const bySurname=new Map();
 people.forEach(p=>{if(p.relativeId&&p.relationship&&p.relationship!=='Kendisi')join(p.id,p.relativeId);const s=fold(surname(p.name));if(s){if(bySurname.has(s))join(p.id,bySurname.get(s));else bySurname.set(s,p.id);}});
 function relationLabel(p){
  if(!p.relationship||p.relationship==='Kendisi')return '';
  const target=byId.get(p.relativeId);
  return target?genitive(target.name)+' '+p.relationship.toLocaleLowerCase('tr-TR'):p.relationship;
 }
 // Kümeyi bağ sırasıyla diz: kimseye bağlı olmayan (Kendisi) önce, ona bağlananlar arkasından.
 function familyOrder(ids){
  const set=new Set(ids),groups=new Map();
  ids.forEach(id=>{const r=findRoot(id);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(id);});
  const ordered=[...groups.values()].map(list=>{
   list.sort((a,b)=>savedIndex.get(a)-savedIndex.get(b));
   const out=[],seen=new Set(),visit=id=>{if(seen.has(id))return;seen.add(id);out.push(id);list.filter(x=>byId.get(x).relativeId===id&&!seen.has(x)).forEach(visit);};
   list.filter(id=>!set.has(byId.get(id).relativeId)||byId.get(id).relationship==='Kendisi').forEach(visit);list.forEach(visit);
   return out;
  });
  ordered.sort((a,b)=>fold(surname(byId.get(a[0]).name)).localeCompare(fold(surname(byId.get(b[0]).name)),'tr')||savedIndex.get(a[0])-savedIndex.get(b[0]));
  return ordered;
 }
 const blocks=ids=>order==='saved'?[[...ids].sort((a,b)=>savedIndex.get(a)-savedIndex.get(b))]:familyOrder(ids);

 const overlay=document.createElement('div');
 overlay.className='rb-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Odalama düzenle');
 overlay.innerHTML=`<div class="rb-panel">
  <header class="rb-head">
   <div class="rb-title"><small>ODALAMA DÜZENLE</small><strong>${esc(title)}</strong></div>
   <input class="rb-search" type="search" placeholder="Yolcu ara, Enter ile seç" autocomplete="off">
   <div class="rb-actions"><button type="button" class="icon-btn" data-rb="undo" disabled>Geri al</button><button type="button" class="icon-btn" data-rb="dissolve-all">Tümünü boz</button><button type="button" class="icon-btn" data-rb="cancel">Vazgeç</button><button type="button" class="btn rb-save" data-rb="save">Kaydet</button></div>
  </header>
  <div class="rb-status" aria-live="polite"></div>
  <div class="rb-toolbar"><span>Bekleyenleri sırala:</span><div class="rb-seg" role="group" aria-label="Bekleyenlerin sırası"><button type="button" data-order="family">Aile / soyad</button><button type="button" data-order="saved">Kayıt sırası</button></div><small>Aile / soyad: yakınlık seçilenler ve aynı soyadlılar alt alta durur.</small></div>
  <div class="rb-scroll"></div>
 </div>`;
 const scroller=overlay.querySelector('.rb-scroll'),status=overlay.querySelector('.rb-status'),search=overlay.querySelector('.rb-search');

 const roomOf=id=>rooms.findIndex(r=>r.ids.includes(id));
 const isWaiting=id=>waiting.includes(id);
 const snapshot=()=>{history.push(JSON.stringify({rooms,waiting,want}));if(history.length>80)history.shift();dirty=true;};
 const restore=()=>{const last=history.pop();if(!last)return;({rooms,waiting,want}=JSON.parse(last));selected=[];render();};
 const take=id=>{const from=roomOf(id);if(from>=0)rooms[from].ids=rooms[from].ids.filter(x=>x!==id);waiting=waiting.filter(x=>x!==id);};
 const park=(id,type)=>{take(id);waiting.push(id);want[id]=type;};

 function personHtml(id){
  const p=byId.get(id)||{name:'?'},g=p.gender==='Kadın'?'k':p.gender==='Erkek'?'e':'',hit=query&&fold(p.name).includes(query);
  const meta=[relationLabel(p),p.roomGroup?'Grup '+p.roomGroup:''].filter(Boolean).join(' · ');
  return `<button type="button" class="rb-person ${g} ${selected.includes(id)?'selected':''} ${hit?'hit':''} ${query&&!hit?'dim':''}" data-person="${esc(id)}" title="${esc(p.name)}"><span class="rb-name">${esc(p.name||'İsimsiz')}</span>${meta?`<small>${esc(meta)}</small>`:''}</button>`;
 }
 function roomHtml(room,index,number){
  const cap=capacity(room.type),free=cap-room.ids.length,women=room.ids.filter(id=>byId.get(id)?.gender==='Kadın').length,men=room.ids.filter(id=>byId.get(id)?.gender==='Erkek').length;
  const target=selected.length&&selected.some(id=>roomOf(id)!==index)&&free>0;
  return `<div class="rb-room ${free>0?'':'full'} ${room.ids.length?'':'empty-room'} ${target?'target':''}" data-room="${index}">
   <div class="rb-room-head"><b>Oda ${number}</b><select data-room-type="${index}" aria-label="Oda tipi">${types.map(t=>`<option value="${t}" ${t===room.type?'selected':''}>${TYPE_LABEL[t]}</option>`).join('')}</select><span class="rb-count">${room.ids.length}/${cap}${women||men?` · ${women?women+'K':''}${women&&men?' ':''}${men?men+'E':''}`:''}</span><button type="button" class="rb-dissolve" data-dissolve="${index}" title="Odayı boz: kişiler bekleyenlere döner">Boz</button></div>
   <div class="rb-occupants">${room.ids.map(personHtml).join('')}${Array.from({length:Math.max(0,free)},()=>`<button type="button" class="rb-free" data-room-free="${index}">${selected.length?'Buraya taşı':'Boş yer'}</button>`).join('')}</div>
   <div class="rb-nums"><input data-room-num="mekkeRoomNo" data-room-index="${index}" value="${esc(room.mekkeRoomNo||'')}" placeholder="Mekke oda no"><input data-room-num="medineRoomNo" data-room-index="${index}" value="${esc(room.medineRoomNo||'')}" placeholder="Medine oda no"></div>
  </div>`;
 }
 function waitingHtml(ids,type){
  if(!ids.length)return '';
  const list=blocks(ids);
  return `<div class="rb-wait"><div class="rb-wait-head"><b>${type?'Bekleyen '+WAIT_LABEL[type]:'Oda tipi seçilmemiş'} <span>${ids.length} kişi</span></b>${type?`<button type="button" class="icon-btn" data-autofill="${type}">${order==='saved'?'Kayıt sırasıyla':'Aile sırasıyla'} odalara yerleştir</button>`:'<small>Kişileri seçip yukarıdan oda tipini verin ya da doğrudan bir odaya taşıyın.</small>'}</div>
   <div class="rb-clusters">${list.map(block=>{
    const names=[...new Set(block.map(id=>surname(byId.get(id).name)).filter(Boolean))];
    const head=order==='family'&&block.length>1?`<div class="rb-cluster-head"><span>${esc(names.slice(0,2).join(' / ')||'Bağlı yolcular')} · ${block.length} kişi</span><button type="button" class="link-btn" data-pick="${esc(block.join(','))}">Hepsini seç</button></div>`:'';
    return `<div class="rb-cluster ${order==='saved'?'flat':''}">${head}${block.map(personHtml).join('')}</div>`;
   }).join('')}</div></div>`;
 }
 function render(){
  const keep=scroller.scrollTop;let number=0;
  const sections=types.map(type=>{
   const list=rooms.map((r,i)=>[r,i]).filter(([r])=>r.type===type),wait=waiting.filter(id=>want[id]===type);
   const count=list.reduce((n,[r])=>n+r.ids.length,0);
   // Seçim yapınca hiçbir kart yer değiştirmez; boş tipler hep aynı küçük düğmeyle görünür.
   if(!list.length&&!wait.length)return `<div class="rb-type rb-type-empty"><button type="button" class="rb-add" data-add-room="${type}">+ ${TYPE_LABEL[type]} oda aç</button></div>`;
   return `<section class="rb-type"><h3>${TYPE_LABEL[type]} odalar <span>${list.filter(([r])=>r.ids.length).length} oda · ${count} kişi yerleşti${wait.length?' · '+wait.length+' kişi bekliyor':''}</span></h3>
    <div class="rb-grid">${list.map(([r,i])=>roomHtml(r,i,++number)).join('')}<button type="button" class="rb-add" data-add-room="${type}">+ Yeni ${TYPE_LABEL[type].toLocaleLowerCase('tr-TR')} oda<small>${selected.length?'seçilenler buraya geçer':'&nbsp;'}</small></button></div>
    ${waitingHtml(wait,type)}</section>`;
  }).join('');
  const none=waiting.filter(id=>!want[id]);
  scroller.innerHTML=(none.length?`<section class="rb-type rb-pool">${waitingHtml(none,'')}</section>`:'')+sections;
  scroller.scrollTop=keep;
  overlay.querySelectorAll('[data-order]').forEach(b=>b.classList.toggle('active',b.dataset.order===order));
  const names=selected.map(id=>byId.get(id)?.name).filter(Boolean);
  const typeButtons=selected.length&&selected.every(isWaiting)?`<span class="rb-type-pick">Oda tipi: ${types.map(t=>`<button type="button" data-set-type="${t}">${TYPE_LABEL[t]}</button>`).join('')}</span>`:'';
  status.innerHTML=names.length?`<span><b>${esc(names.length>2?names.length+' kişi':names.join(', '))}</b> seçildi → ${selected.length>1?'boş yeri olan odaya ya da yeni odaya dokunun.':'gideceği odaya ya da yer değiştireceği kişiye dokunun.'}</span>${typeButtons}<button type="button" class="link-btn" data-rb="clear">Seçimi bırak</button>`
   :'<span>1) Yolcuya dokunun 2) Gideceği odaya dokunun. Bir kişinin üstüne dokunursanız ikisi yer değiştirir. Bekleyenlerden birden çok kişi seçip birlikte taşıyabilirsiniz.</span>';
  overlay.querySelector('[data-rb="undo"]').disabled=!history.length;
  overlay.querySelector('[data-rb="dissolve-all"]').disabled=!rooms.some(r=>r.ids.length);
 }

 function moveTo(ids,index){
  const room=rooms[index];if(!room)return false;
  const incoming=ids.filter(id=>!room.ids.includes(id)),free=capacity(room.type)-room.ids.length;
  if(!incoming.length)return false;
  if(incoming.length>free){toast(free?`Bu odada ${free} boş yer var; ${incoming.length} kişi seçili.`:'Bu oda dolu. Oradaki bir kişinin üstüne bırakırsanız yer değiştirirler.');return false;}
  snapshot();incoming.forEach(id=>{take(id);room.ids.push(id);});return true;
 }
 function swap(a,b){
  if(a===b)return false;
  const ra=roomOf(a),rb=roomOf(b);
  if(ra<0&&rb<0)return false;
  snapshot();
  if(ra<0||rb<0){
   // Bekleyen kişi odadakinin yerine girer, odadaki kişi o odanın tipiyle bekleyenlere döner.
   const inRoom=ra<0?b:a,outside=ra<0?a:b,room=rooms[ra<0?rb:ra],at=room.ids.indexOf(inRoom);
   waiting=waiting.filter(x=>x!==outside);room.ids[at]=outside;waiting.push(inRoom);want[inRoom]=room.type;return true;
  }
  if(ra===rb){const ids=rooms[ra].ids,i=ids.indexOf(a),j=ids.indexOf(b);[ids[i],ids[j]]=[ids[j],ids[i]];}
  else{rooms[ra].ids[rooms[ra].ids.indexOf(a)]=b;rooms[rb].ids[rooms[rb].ids.indexOf(b)]=a;}
  return true;
 }
 // Seçilenler sığdığı kadar yeni odaya bölünür (ör. 6 kişi → iki üçlü oda).
 function addRooms(type,ids){
  snapshot();const cap=capacity(type);
  if(!ids.length){rooms.push({type,ids:[],mekkeRoomNo:'',medineRoomNo:''});return;}
  for(let i=0;i<ids.length;i+=cap){const chunk=ids.slice(i,i+cap);chunk.forEach(take);rooms.push({type,ids:chunk,mekkeRoomNo:'',medineRoomNo:''});}
 }
 function dissolve(index){const room=rooms[index];if(!room)return;snapshot();room.ids.forEach(id=>{waiting.push(id);want[id]=room.type;});rooms.splice(index,1);}
 function autofill(type){
  const ids=blocks(waiting.filter(id=>want[id]===type)).flat();if(!ids.length)return;
  // Önce bu tipteki boş yerler, sonra yeni odalar.
  snapshot();const cap=capacity(type);
  rooms.filter(r=>r.type===type).forEach(r=>{while(r.ids.length<cap&&ids.length){const id=ids.shift();take(id);r.ids.push(id);}});
  for(let i=0;i<ids.length;i+=cap){const chunk=ids.slice(i,i+cap);chunk.forEach(take);rooms.push({type,ids:chunk,mekkeRoomNo:'',medineRoomNo:''});}
 }
 function dropOn(ids,el){
  const person=el?.closest('[data-person]'),room=el?.closest('[data-room]'),add=el?.closest('[data-add-room]');
  let changed=false;
  if(person&&!ids.includes(person.dataset.person)){
   if(ids.length===1)changed=swap(ids[0],person.dataset.person);
   else if(roomOf(person.dataset.person)>=0)changed=moveTo(ids,roomOf(person.dataset.person));
  }
  else if(add){addRooms(add.dataset.addRoom,ids);changed=true;}
  else if(room)changed=moveTo(ids,Number(room.dataset.room));
  if(changed)selected=[];
  render();
  if(changed)ids.forEach(flash);
 }
 function flash(id){const el=scroller.querySelector(`[data-person="${CSS.escape(id)}"]`);if(!el)return;el.classList.add('moved');setTimeout(()=>el.classList.remove('moved'),900);}

 overlay.addEventListener('click',async e=>{
  if(drag.suppress){drag.suppress=false;return;}
  const action=e.target.closest('[data-rb]')?.dataset.rb;
  if(action==='undo'){restore();return;}
  if(action==='clear'){selected=[];render();return;}
  if(action==='cancel'){close();return;}
  if(action==='save'){save();return;}
  if(action==='dissolve-all'){if(!await ask('Bütün odalar bozulsun mu? Kişiler oda tiplerinin altında bekleyenlere döner. Kaydetmeden önce Geri al ile dönebilirsiniz.'))return;snapshot();rooms.forEach(r=>r.ids.forEach(id=>{waiting.push(id);want[id]=r.type;}));rooms=[];selected=[];render();return;}
  const orderButton=e.target.closest('[data-order]');
  if(orderButton){order=orderButton.dataset.order;writeOrder(order);render();return;}
  const setType=e.target.closest('[data-set-type]');
  if(setType){snapshot();selected.forEach(id=>{want[id]=setType.dataset.setType;});selected=[];render();return;}
  const pick=e.target.closest('[data-pick]');
  if(pick){const ids=pick.dataset.pick.split(',');selected=[...new Set([...selected.filter(isWaiting),...ids])];render();return;}
  const dis=e.target.closest('[data-dissolve]');
  if(dis){dissolve(Number(dis.dataset.dissolve));selected=[];render();return;}
  const fill=e.target.closest('[data-autofill]');
  if(fill){autofill(fill.dataset.autofill);selected=[];render();return;}
  const add=e.target.closest('[data-add-room]');
  if(add){const moved=[...selected];addRooms(add.dataset.addRoom,moved);selected=[];render();moved.forEach(flash);return;}
  if(e.target.closest('select,input'))return;
  const person=e.target.closest('[data-person]');
  if(person){
   const id=person.dataset.person;
   if(selected.includes(id)){selected=selected.filter(x=>x!==id);render();return;}
   if(!selected.length){selected=[id];render();return;}
   // Bekleyenler birlikte seçilebilir; odadaki kişiye dokununca seçilen(ler) oraya geçer ya da yer değiştirir.
   if(isWaiting(id)&&selected.every(isWaiting)){selected=[...selected,id];render();return;}
   dropOn(selected,person);return;
  }
  const room=e.target.closest('[data-room]');
  if(room&&selected.length)dropOn(selected,room);
 });
 overlay.addEventListener('change',e=>{
  const type=e.target.closest('[data-room-type]');
  if(type){
   const room=rooms[Number(type.dataset.roomType)];
   if(room.ids.length>capacity(type.value)){toast(TYPE_LABEL[type.value]+' odaya en çok '+capacity(type.value)+' kişi sığar. Önce fazla kişiyi başka odaya taşıyın.');type.value=room.type;return;}
   snapshot();room.type=type.value;render();
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
  const id=first.dataset.person;selected=isWaiting(id)&&selected.every(isWaiting)?[...new Set([...selected,id])]:[id];query='';search.value='';render();
  scroller.querySelector(`[data-person="${CSS.escape(id)}"]`)?.scrollIntoView({block:'center',behavior:'smooth'});
 });
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if(selected.length){selected=[];render();}else close();}});

 // Fareyle sürükleme: dokunmatikte kaydırma bozulmasın diye yalnız fare/kalemde açık.
 const drag={id:'',startX:0,startY:0,active:false,ghost:null,x:0,y:0,raf:0,suppress:false,over:null,ids:[]};
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
   drag.active=true;
   // Seçili bekleyenlerden birini sürüklemek hepsini taşır.
   drag.ids=selected.includes(drag.id)&&selected.length>1?[...selected]:[drag.id];
   selected=[...drag.ids];render();overlay.classList.add('dragging');window.getSelection()?.removeAllRanges();
   drag.ghost=document.createElement('div');drag.ghost.className='rb-ghost';drag.ghost.textContent=drag.ids.length>1?drag.ids.length+' kişi':byId.get(drag.id)?.name||'';overlay.appendChild(drag.ghost);
   drag.raf=requestAnimationFrame(autoScroll);
  }
  e.preventDefault();
  drag.ghost.style.transform=`translate(${e.clientX+12}px,${e.clientY+12}px)`;
  markOver();
 }
 function onUp(){
  if(!drag.id)return;
  const was=drag.active,ids=drag.ids,target=drag.over;
  drag.id='';drag.ids=[];drag.active=false;cancelAnimationFrame(drag.raf);drag.ghost?.remove();drag.ghost=null;drag.over?.classList.remove('drop-over');drag.over=null;overlay.classList.remove('dragging');
  if(!was)return;
  drag.suppress=true;setTimeout(()=>{drag.suppress=false;},0);
  if(target)dropOn(ids,target);else{selected=[];render();}
 }

 async function save(){
  if(saving)return;
  const typed=waiting.filter(id=>want[id]);
  if(typed.length&&!await ask(`${typed.length} kişi oda tipi seçilmiş ama henüz bir odaya yerleşmedi. Kaydedersen bunlar kayıt sırasıyla kendiliğinden odalanır. Devam edilsin mi?`))return;
  saving=true;const button=overlay.querySelector('[data-rb="save"]');button.disabled=true;button.textContent='Kaydediliyor…';
  try{if(await onSave(rooms.filter(r=>r.ids.length),Object.fromEntries(waiting.map(id=>[id,want[id]||'']))))teardown();}
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
