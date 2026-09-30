(function(){
'use strict';
const P=window.TurizmBusPlan,C=window.TurizmBusCompanies;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.createBusWorkspace=function(root,hooks){
 let model,plan,baseline='',active='',query='',filter='unassigned',page=1,selected=new Set(),saving=false,notice='',numberEditing=false,numberDraft={},companyFilter='all';
 const companyIds=()=>model?.shared?.sources.map(s=>s.company)||[];
 const currentRule=()=>{const ids=companyIds(),rule=bus()?.companyRule||{mode:'split',left:ids[0],center:ids[0],right:ids[1]};const right=C.rightCompany(rule);return {...rule,right:ids.includes(right)?right:ids.find(c=>c!==rule.left)};};
 const bus=()=>plan?.buses.find(b=>b.id===active);
 const formDirty=()=>{const b=bus();return b&&[...root.querySelectorAll('[data-bus-setting]')].some(el=>String(b[el.dataset.busSetting]??'')!==el.value);};
 const layoutDirty=()=>{if(!bus())return false;const l=P.layoutSettings(bus());return [...root.querySelectorAll('[data-layout]')].some(el=>String(l[el.dataset.layout])!==el.value);};
 const companyRuleDirty=()=>Boolean(model?.shared&&bus())&&[...root.querySelectorAll('[data-company-rule]')].some(el=>String(currentRule()[el.dataset.companyRule])!==el.value);
 const dirty=()=>Boolean(model)&&(saving||JSON.stringify(plan)!==baseline||formDirty()||layoutDirty()||companyRuleDirty()||(numberEditing&&Object.entries(numberDraft).some(([n,value])=>value!==P.seatLabel(bus(),n))));
 function status(text){notice=text;const el=root.querySelector('[data-bus-notice]');if(el)el.textContent=text;}
 function open(next){
   if(model&&model.key===next.key&&dirty())return;
   numberEditing=false;numberDraft={};model=next;const saved=P.normalizePlan(next.plan);baseline=JSON.stringify(saved);
   const reconciled=P.reconcile(saved,next.people);plan=reconciled.plan;selected.clear();query='';page=1;companyFilter='all';
   if(!next.canEdit)baseline=JSON.stringify(plan);
   if(!plan.buses.some(b=>b.id===active))active=plan.buses[0]?.id||'';
   notice=reconciled.removed?'Listeden çıkarılan yolcuların eski koltukları boşaltıldı. Planı kaydedin.':'';
   render();
 }
 function applySettings(forceLayout=false){
   if(!bus())return true;
   const b=bus(), values={};
   for(const el of root.querySelectorAll('[data-bus-setting]')){
     if(!el.checkValidity()){el.reportValidity();return false;}
     values[el.dataset.busSetting]=el.dataset.busSetting==='doorBackRows'&&el.value===''?undefined:el.type==='number'?Number(el.value):el.value.trim();
   }
   if(!values.name){status('Otobüs adını yazın.');return false;}
   const usingLayout=forceLayout||Boolean(b.layout)||layoutDirty();
   if(usingLayout){const l={};for(const el of root.querySelectorAll('[data-layout]')){if(!el.checkValidity()){el.reportValidity();return false;}l[el.dataset.layout]=el.dataset.layout==='doorEnabled'?el.value==='true':el.type==='number'?Number(el.value):el.value;}if(l.doorSide==='right')l.doorAfter=l.rightFrontRows;if(!P.validLayout(l)){status('Özel düzen 4–80 koltuk içermelidir. Sağ-sol sıra ve arka koltuk sayılarını kontrol edin.');return false;}values.layout=l;values.capacity=P.customCapacity(l);values.rear=l.rear;values.doorAfter=l.doorEnabled?l.doorAfter:0;values.doorBackRows=undefined;values.limit=Math.min(values.limit,values.capacity);}
   if(values.limit>values.capacity){status('Otomatik hedef, koltuk kapasitesini aşamaz.');return false;}
   if(Object.keys(b.assignments).some(s=>Number(s)>values.capacity)){status('Kapasiteyi küçültmeden önce kaldırılacak koltuklardaki yolcuları taşıyın.');return false;}
   let candidate={...b,...values};
   if(model.shared)candidate.companyRule=Object.fromEntries([...root.querySelectorAll('[data-company-rule]')].map(el=>[el.dataset.companyRule,el.value]));
   if(model.shared&&candidate.companyRule.mode==='split'&&candidate.companyRule.left===candidate.companyRule.right){status('Sol ve sağ taraf için iki farklı firma seçin.');return false;}
   if(candidate.doorBackRows===undefined)delete candidate.doorBackRows;
   if(!usingLayout&&candidate.doorAfter>0&&candidate.doorBackRows!==undefined){
     const actual=P.seats(candidate).rows.slice(candidate.doorAfter+2).filter(r=>r.values[2]||r.values[3]).length;
     if(actual!==candidate.doorBackRows){status('Bu kadar arka sıra için kapasite yeterli değil. Koltuk sayısını artırın veya arka sıra sayısını azaltın.');return false;}
   }
   try{candidate=P.renumber(candidate,numberEditing?numberDraft:b.seatLabels);}catch(error){status(error.message);return false;}
   plan.buses[plan.buses.findIndex(v=>v.id===active)]=candidate;
   return true;
 }
 function seatMarkup(n){
   if(!n)return '<span class="bus-seat-gap"></span>';
   const id=bus().assignments[n],person=model.people.find(p=>p.id===id);
   const label=P.seatLabel(bus(),n),staff=P.isStaff(bus(),n);
   const occupant=person?.name||(staff?'Görevli':'Boş');
   if(numberEditing)return `<label class="bus-seat bus-number-cell"><small>Numara</small><input type="number" min="1" max="999" step="1" required data-seat-number="${n}" aria-label="${n}. koltuğun numarası" value="${esc(numberDraft[n]??label)}"><span>${esc(occupant)}</span></label>`;
   return `<button type="button" class="bus-seat ${person?.company||''} ${staff?'staff':''} ${person?'occupied':''} ${selected.has(id)?'selected':''}" data-seat="${n}" ${!model.canEdit?'disabled':''} title="${esc(occupant)}" aria-label="Koltuk ${esc(label)}: ${esc(occupant)}"><b>${esc(label)}</b><span>${esc(occupant)}</span>${person?.company?`<small class="bus-company-tag ${person.company}">${esc(C.names[person.company].split(' · ')[0])}</small>`:''}</button>`;
 }
 function renderMap(){
   const target=root.querySelector('[data-bus-map]');if(!target)return;
   if(!bus()){target.innerHTML='<div class="bus-empty">İlk otobüsü ekleyerek başlayın.</div>';return;}
   const layout=P.seats(bus());
   const side=(r,which,index)=>{const entries=r[which],previous=layout.rows[index-1],following=layout.rows[index+1];const first=!previous?.door,last=!following?.door;return r.door&&r.doorSide===which?'<div class="bus-side-door '+(first?'door-first ':'')+(last?'door-last':'')+'">'+(first?'ORTA KAPI ↗':'')+'</div>':entries.map(seatMarkup).join('');};
   target.innerHTML=`${model.shared?`<div class="bus-company-sides"><span>${esc(C.names[bus().companyRule?.mode==='split'?bus().companyRule.left:bus().companyRule?.mode]||'Serbest')} · SOL</span><span>${esc(C.names[bus().companyRule?.mode==='split'?C.rightCompany(bus().companyRule):bus().companyRule?.mode]||'Serbest')} · SAĞ</span></div>`:''}<div class="bus-front"><div class="bus-captain"><span>◉</span><b>KAPTAN</b></div><span>ÖN KAPI ↗</span></div><div class="bus-cabin">${layout.rows.map((r,index)=>`<div class="bus-seat-row"><div class="bus-side" style="--seat-columns:${layout.leftPerRow}">${side(r,'left',index)}</div><span class="bus-aisle"></span><div class="bus-side" style="--seat-columns:${layout.rightPerRow}">${side(r,'right',index)}</div></div>`).join('')}<div class="bus-rear" style="--rear-count:${layout.rear.length||1}">${layout.rear.map(seatMarkup).join('')}</div></div><div class="bus-map-foot">Arka bölüm · ${bus().capacity} koltuk · ${Math.min(4,bus().capacity)} görevli yeri</div>`;

 }
 function renderPeople(){
   const placed=P.placements(plan),target=root.querySelector('[data-bus-people]');if(!target)return;
   const filtered=model.people.filter(p=>(companyFilter==='all'||p.company===companyFilter)&&(filter==='all'||(filter==='unassigned'?!placed.has(p.id):placed.get(p.id)?.busId===active))&&P.fold(p.name+' '+p.listTitle).includes(P.fold(query)));
   const pages=Math.max(1,Math.ceil(filtered.length/20));page=Math.min(pages,page);
   target.innerHTML=filtered.slice((page-1)*20,page*20).map(p=>{
     const spot=placed.get(p.id),vehicle=plan.buses.find(b=>b.id===spot?.busId);
     return `<div class="bus-person"><label><input type="checkbox" data-person="${esc(p.id)}" ${selected.has(p.id)?'checked':''} ${!model.canEdit?'disabled':''}><span><b>${esc(p.name)}</b><small>${p.company?esc(C.names[p.company])+' · ':''}Liste ${p.order} · ${esc(vehicle?`${vehicle.name} / Koltuk ${P.seatLabel(vehicle,spot.seat)}`:'Henüz yerleşmedi')}</small></span></label>${p.surname&&model.canEdit?`<button type="button" class="bus-family" data-family="${esc(p.group)}" title="Aynı soyadlı yolcuları seç">Soyadı seç</button>`:''}</div>`;
   }).join('')||'<p class="bus-empty">Bu filtrede yolcu yok.</p>';
   root.querySelector('[data-people-pages]').innerHTML=`<span>${filtered.length} yolcu · ${page}/${pages}</span><button type="button" data-action="prev" ${page===1?'disabled':''}>←</button><button type="button" data-action="next" ${page===pages?'disabled':''}>→</button>`;
   root.querySelector('[data-selected-count]').textContent=`${selected.size} yolcu seçili`;
   if(model.shared&&bus()){const mismatches=model.people.filter(p=>{const spot=placed.get(p.id);return spot?.busId===active&&C.owner(bus(),spot.seat)&&C.owner(bus(),spot.seat)!==p.company;});const hint=root.querySelector('[data-company-exceptions]');if(hint)hint.textContent=mismatches.length?mismatches.length+' yolcu firma tarafının dışında elle yerleştirilmiş. Bu istisnalar otomatik yerleştirmede korunur.':'';}
   const totals=root.querySelector('[data-bus-totals]');totals.textContent=`${model.people.length} yolcu · ${placed.size} yerleşti · ${model.people.length-placed.size} bekliyor`;
 }
 function render(){
   const b=bus();const edit=model.canEdit;const l=b?P.layoutSettings(b):null;
   const rule=currentRule(),companyOptions=companyIds().map(c=>[c,C.names[c]]);
   const ruleSelect=(key,label,options)=>`<label>${label}<select data-company-rule="${key}" ${!edit?'disabled':''}>${options.map(([value,text])=>`<option value="${value}" ${rule[key]===value?'selected':''}>${text}</option>`).join('')}</select></label>`;
   const lf=(key,label,min,max)=>`<label>${label}<input type="number" data-layout="${key}" value="${l[key]}" min="${min}" max="${max}" step="1" required ${!edit?'disabled':''}></label>`;
   root.innerHTML=`<div class="bus-heading"><div><span class="workspace-kicker">YOLCULUK PLANI</span><h2>Otobüs düzeni</h2><p data-bus-totals></p></div><div class="bus-actions"><button type="button" data-action="print" ${!b||!model.canPrint?'disabled':''}>Bu otobüsü yazdır</button><button type="button" data-action="print-all" ${!plan.buses.length||!model.canPrint?'disabled':''}>Tümünü yazdır</button><button type="button" data-action="discard" ${!edit?'hidden':''}>Vazgeç</button><button type="button" class="primary" data-action="save" ${!edit?'hidden':''}>Planı kaydet</button></div></div>
   <p class="bus-help">Yolcuyu seçin, boş koltuğa dokunun. Dolu koltuğa dokunarak yolcuyu seçebilir, ardından başka koltuğa taşıyabilirsiniz. İlk dört koltuk “Görevli” yeridir; otomatik yerleştirme buraları atlar, elle yolcu koyabilirsiniz. Değişiklikler “Planı kaydet” ile kaydedilir.</p>
   <div class="bus-notice" role="status" data-bus-notice>${esc(notice)}</div>
   <section class="bus-shared-panel"><div><b>${model.shared?'Firmalar arası ortak plan':'Diğer firmanın yolcuları da aynı otobüste mi?'}</b><p>${model.shared?model.shared.sources.map(s=>esc(C.names[s.company]+' / '+s.title+(s.date?' · '+s.date:'')+' · '+model.people.filter(p=>p.company===s.company).length+' yolcu')+(s.listIds?' · seçili '+s.listIds.length+' liste':' · tüm listeler')).join('<br>'):'Program seçerek diğer firmaların yolcularını aynı oturma düzeninde birleştirin.'}</p></div><div class="bus-actions">${model.shared?'<button type="button" data-action="shared-refresh">Güncel ortak planı aç</button>'+(edit?(model.canExtend?'<button type="button" data-action="shared-extend">Başka firma ekle</button>':'')+'<button type="button" data-action="shared-unlink">Ortak plan bağlantısını kaldır</button>':''):model.canCombine&&edit?'<button type="button" data-action="shared-combine">Diğer firmayla birleştir</button>':'<small>Birleştirmek için iki firmaya erişim ve yolcu düzenleme yetkisi gerekir.</small>'}</div></section>
   ${model.shared&&b?`<section class="bus-settings bus-company-rules"><b>Bu otobüste firma paylaşımı</b><div class="bus-settings-fields">${ruleSelect('mode','Otobüsün kullanımı',[['split','Sağ / sol firma paylaşımı'],...companyOptions.map(([c,n])=>[c,'Tamamı '+n]),['free','Serbest yerleşim']])}${ruleSelect('left','Sol tarafın firması',companyOptions)}${ruleSelect('right','Sağ tarafın firması',companyOptions)}${ruleSelect('center','Arka ortadaki tek koltuk',[...companyOptions,['any','Tüm firmalar kullanabilir']])}</div><p>Her otobüsün sol ve sağ tarafına iki farklı firma seçin. Üçüncü firma için başka otobüs ayırabilir veya elle istisna yapabilirsiniz. Arka sıranın sol/sağ koltukları da bu paylaşımı izler. İlk dört görevli yeri otomatikte boş bırakılır. Elle yapılan istisnalar korunur.</p><button type="button" data-action="company-rules" ${!edit?'hidden':''}>Firma paylaşımını uygula</button></section>`:''}
   ${model.shared&&edit?'<div class="bus-shared-tools"><button type="button" data-action="suggest-buses">Sayıya göre otobüsleri hazırla</button><button type="button" data-action="reallocate">Yerleşimi firma taraflarına göre yeniden dağıt</button><p>Hazırlama: 45 yolcuya ulaşan firmaya ayrı otobüs, kalanlara paylaşımlı otobüs önerir. Yeniden dağıtma elle yapılan yerleri değiştirir; önce onayınız alınır.</p></div>':''}
   <div class="bus-tabs" role="group" aria-label="Otobüsler">${plan.buses.map(v=>`<button type="button" data-bus="${esc(v.id)}" aria-pressed="${v.id===active}"><b>${esc(v.name)}</b><small>${Object.keys(v.assignments).length} / ${v.capacity} koltuk</small></button>`).join('')}<button type="button" data-action="add" ${!edit?'hidden':''}>+ Otobüs ekle</button></div>
   ${b?`<details class="bus-settings"><summary>Otobüs ayarları · ${esc(b.name)} · otomatik hedef ${b.limit} kişi</summary><div class="bus-settings-fields"><label>Otobüs adı<input data-bus-setting="name" value="${esc(b.name)}" maxlength="80" required ${!edit?'disabled':''}></label><label>Koltuk sayısı<input type="number" data-bus-setting="capacity" value="${b.capacity}" min="1" max="80" step="1" required ${!edit||b.layout?'disabled':''}></label><label>Otomatik hedef<input type="number" data-bus-setting="limit" value="${b.limit}" min="0" max="80" step="1" required ${!edit?'disabled':''}></label><label>Orta kapı önündeki sıra<input type="number" data-bus-setting="doorAfter" value="${b.doorAfter}" min="0" max="30" step="1" required ${!edit||b.layout?'disabled':''}></label><label>Orta kapı arkasındaki sıra<input type="number" data-bus-setting="doorBackRows" value="${b.doorBackRows??''}" placeholder="Otomatik" min="0" max="20" step="1" ${!edit||b.layout?'disabled':''}></label><label>Arka sıra koltukları<input type="number" data-bus-setting="rear" value="${b.rear}" min="0" max="5" step="1" required ${!edit||b.layout?'disabled':''}></label></div><p>Hedefi kapasiteden düşük tutarak sonraki otobüse erken geçebilirsiniz. Hedef 0 ise otomatik yerleştirme bu otobüsü atlar; elle yerleştirme mümkündür. Orta kapı 0 ise koridorda kapı boşluğu bırakılmaz. Kapı arkasındaki ayar sağ taraftaki ikili sıraları belirler; boş bırakırsanız otomatik hesaplanır. Kapasite sabit kalır, kalan koltuklar sol tarafta devam eder. İlk dört koltuğu otomatik yerleştirme boş bırakır. İsterseniz yolcuyu seçip bu koltuklara elle yerleştirebilirsiniz.</p><details class="bus-custom-settings"><summary>Sağ-sol koltukları ve kapıyı özelleştir</summary><p>Özel düzen toplam koltuk sayısını hesaplar. Sağ kapının yeri, sağ ön sıra sayısına göre belirlenir. Sol kapıda kapı konumunu ayrıca seçin.</p><div class="bus-settings-fields">${lf('leftRows','Sol sıra sayısı',0,30)}${lf('leftPerRow','Sol sırada koltuk',1,3)}${lf('rightFrontRows','Sağ ön sıra sayısı',0,30)}${lf('rightBackRows','Sağ arka sıra sayısı',0,30)}${lf('rightPerRow','Sağ sırada koltuk',1,3)}${lf('rear','Arka sıra koltukları (özel)',0,5)}<label>Orta kapı<select data-layout="doorEnabled" ${!edit?'disabled':''}><option value="true" ${l.doorEnabled?'selected':''}>Var</option><option value="false" ${!l.doorEnabled?'selected':''}>Yok</option></select></label><label>Kapı tarafı<select data-layout="doorSide" ${!edit?'disabled':''}><option value="right" ${l.doorSide==='right'?'selected':''}>Sağ</option><option value="left" ${l.doorSide==='left'?'selected':''}>Sol</option></select></label>${lf('doorAfter','Sol kapı önündeki sıra',0,30)}${lf('doorRows','Kapı boşluğu (sıra)',1,3)}</div><button type="button" data-action="custom-layout" ${!edit?'hidden':''}>Özel düzeni uygula</button> <button type="button" data-action="standard-layout" ${!edit?'hidden':''}>Standart 49 koltuk düzeni</button></details><button type="button" data-action="settings" ${!edit?'hidden':''}>Ayarları uygula</button> <button type="button" data-action="remove" ${!edit?'hidden':''}>Bu otobüsü kaldır</button></details>`:''}
   <div class="bus-automation"><div><b>Liste sırasıyla, aileler birlikte</b><p>Aynı soyadlılar ilk geçtikleri sıraya göre gruplanır. Mevcut koltuklar korunur. Sığmayan gruplar bölünmez. Soyadı ayrı kaydedilmemişse adın son kelimesi kullanılır.</p></div><button type="button" data-action="auto" ${!edit?'hidden':''}>Boşta kalanları otomatik yerleştir</button></div>
   <div class="bus-layout"><section class="bus-roster"><h3>Yolcular</h3><input type="search" data-bus-search aria-label="Otobüs için yolcu ara" placeholder="Ad, soyad veya liste ara" value="${esc(query)}"><select data-bus-filter aria-label="Otobüs yolcu filtresi"><option value="unassigned" ${filter==='unassigned'?'selected':''}>Yerleşmeyenler</option><option value="current" ${filter==='current'?'selected':''}>Bu otobüsteki yolcular</option><option value="all" ${filter==='all'?'selected':''}>Tüm yolcular</option></select>${model.shared?`<select data-company-filter aria-label="Yolcu firması"><option value="all">Tüm firmalar</option>${companyOptions.map(([c,n])=>`<option value="${c}" ${companyFilter===c?'selected':''}>${esc(n)}</option>`).join('')}</select>`:''}<div class="bus-selection"><b data-selected-count></b><button type="button" data-action="clear-selection">Seçimi kaldır</button></div><div class="bus-selection-actions" ${!edit?'hidden':''}><button type="button" data-action="move">Seçilenleri bu otobüse al</button><button type="button" data-action="unseat">Koltuktan çıkar</button></div><div data-bus-people></div><nav class="bus-people-pages" data-people-pages aria-label="Yolcu sayfaları"></nav></section><section class="bus-map-panel"><div class="bus-map-caption"><h3>${esc(b?.name||'Koltuk planı')}</h3><span>${b?.layout?b.layout.leftPerRow+' + '+b.layout.rightPerRow:'2 + 2'} · Orta koridor</span></div><div class="bus-number-tools" ${!edit||!b?'hidden':''}><button type="button" data-action="numbers">${numberEditing?'Numaraları uygula':'Koltuk numaralarını düzenle'}</button>${numberEditing?'<button type="button" data-action="numbers-cancel">Numara düzenlemeyi iptal et</button><p>İki numarayı değiştirmek için ikisini de düzenleyin. Yolcular aynı koltukta kalır; yinelenen numaralar kabul edilmez.</p>':''}</div><p class="bus-exceptions" data-company-exceptions></p><div data-bus-map></div></section></div>`;
   renderPeople();renderMap();
 }
 root.addEventListener('input',e=>{if(e.target.matches('[data-seat-number]'))numberDraft[e.target.dataset.seatNumber]=e.target.value;if(e.target.matches('[data-bus-search]')){query=e.target.value;page=1;renderPeople();}});
 root.addEventListener('change',e=>{
   if(e.target.matches('[data-company-rule="left"], [data-company-rule="right"]')){
    const key=e.target.dataset.companyRule,other=root.querySelector('[data-company-rule="'+(key==='left'?'right':'left')+'"]');
    if(other.value===e.target.value)other.value=currentRule()[key];
   }
   if(e.target.matches('[data-company-filter]')){companyFilter=e.target.value;page=1;renderPeople();}
   if(e.target.matches('[data-bus-filter]')){filter=e.target.value;page=1;renderPeople();}
   if(e.target.matches('[data-person]')){const id=e.target.dataset.person;if(e.target.checked)selected.add(id);else selected.delete(id);renderPeople();renderMap();}
 });
 root.addEventListener('click',async e=>{
   const button=e.target.closest('button');if(!button||saving)return;
   const action=button.dataset.action;
   try{
    if(['shared-combine','shared-extend','shared-unlink','shared-refresh'].includes(action)){
      if(action!=='shared-refresh'&&(!model.canEdit||dirty())){status('Önce düzeninizi Planı kaydet ile kaydedin veya Vazgeç ile geri alın.');return;}
      if(action==='shared-refresh'&&dirty()&&!await window.askWorkspaceConfirmation('Kaydedilmemiş düzen bırakılıp güncel ortak plan açılsın mı?'))return;
      saving=true;
      try{await hooks[action==='shared-combine'?'combine':action==='shared-extend'?'extend':action==='shared-unlink'?'unlink':'refresh']();}finally{saving=false;}
      return;
    }
    if(action==='print'||action==='print-all'){
      if(!model.canPrint){status('Çıktı almak için yolcu dışa aktarma yetkisi gerekir.');return;}
      if(model.canEdit&&!applySettings())return;
      window.printBusPlans({model,plan,buses:action==='print'?[bus()]:plan.buses});return;
    }
    if(action==='numbers-cancel'){numberEditing=false;numberDraft={};render();return;}
    if(action==='prev'||action==='next'){page+=action==='prev'?-1:1;renderPeople();return;}
    if(action==='clear-selection'){selected.clear();renderPeople();renderMap();return;}
    if(button.dataset.bus){if(model.canEdit&&!applySettings())return;numberEditing=false;numberDraft={};active=button.dataset.bus;page=1;render();return;}
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
      numberEditing=false;numberDraft={};plan=P.normalizePlan(model.plan);baseline=JSON.stringify(plan);selected.clear();active=plan.buses[0]?.id||'';notice='Kayıtlı plan geri yüklendi.';render();return;
    }
    if(action==='standard-layout'){
      if(!await window.askWorkspaceConfirmation('Standart 49 koltuk, sağ orta kapı ve arka 5 koltuk düzenine dönülsün mü? Yolcular ve özel numaralar korunur.'))return;
      const b=bus();if(Object.keys(b.assignments).some(n=>Number(n)>49)){status('49. koltuktan sonraki yolcuları önce taşıyın.');return;}
      const next=P.renumber({...b,capacity:49,rear:5,doorAfter:6,limit:Math.min(b.limit,49)},b.seatLabels);delete next.layout;delete next.doorBackRows;
      plan.buses[plan.buses.findIndex(v=>v.id===active)]=next;numberEditing=false;numberDraft={};notice='Standart düzen geri yüklendi. Planı kaydedin.';render();return;
    }
    if(!applySettings(action==='custom-layout'))return;
    if(action==='numbers'){
      numberEditing=!numberEditing;numberDraft=numberEditing?Object.fromEntries(Array.from({length:bus().capacity},(_,i)=>[i+1,P.seatLabel(bus(),i+1)])):{};
      render();return;
    }
    numberEditing=false;numberDraft={};
    if(action==='add'){
      if(plan.buses.length>=20){status('Bir turda en fazla 20 otobüs eklenebilir.');return;}
      let number=1;while(plan.buses.some(b=>b.name===`Otobüs ${number}`))number++;
      const v=P.makeBus(crypto.randomUUID(),`Otobüs ${number}`);if(model.shared)v.companyRule={...currentRule(),mode:'split'};plan.buses.push(v);active=v.id;notice='Otobüs eklendi. Kapasite ve hedefi otobüs ayarlarından değiştirebilirsiniz.';
    }
    if(action==='custom-layout')notice='Özel düzen uygulandı. İlk dört koltuk otomatik yerleştirmede görevlilere ayrılır. Planı kaydedin.';
    if(action==='settings')notice='Ayarlar uygulandı. Koltuk numaraları korunur; planı kaydedin.';
    if(action==='remove'){
      if(!await window.askWorkspaceConfirmation('Bu otobüs plandan kaldırılsın mı? İçindeki yolcular yerleşmeyenler listesine döner; yolcu kayıtları silinmez.'))return;
      plan.buses=plan.buses.filter(b=>b.id!==active);active=plan.buses[0]?.id||'';notice='Otobüs kaldırıldı; yolcular korunuyor.';
    }
    if(action==='company-rules')notice='Firma paylaşımı uygulandı. Mevcut yerler korunur. Taşımak için elle seçin veya yeniden dağıtın; ardından planı kaydedin.';
    if(action==='suggest-buses'||action==='reallocate'){
      if(!await window.askWorkspaceConfirmation(action==='suggest-buses'?'Mevcut taslak otobüs ve yerleşimlerin yerine sayıya göre yeni bir öneri hazırlansın mı? Kaydetmeden önce Vazgeç ile kayıtlı plana dönebilirsiniz.':'Elle yapılan yerleşimler sıfırlanıp yolcular seçilen firma taraflarına yeniden dağıtılsın mı?'))return;
      const result=action==='suggest-buses'?C.suggest(model.people,bus()?.companyRule?.left||'hazeyn'):C.autoPlace({version:1,buses:plan.buses.map(b=>({...b,assignments:{}}))},model.people);
      plan=result.plan;active=plan.buses[0]?.id||'';selected.clear();notice=result.warnings.length?result.warnings.join('\n'):'Öneri hazır. Kontrol edip Planı kaydet düğmesine basın.';
    }
    if(action==='auto'){
      if(!plan.buses.length){status('Önce otobüs ekleyin.');return;}
      const result=(model.shared?C:P).autoPlace(plan,model.people);plan=result.plan;
      notice=result.warnings.length?result.warnings.join('\n'):'Otomatik yerleştirme tamamlandı. Kontrol edip planı kaydedin.';
    }
    if(action==='move'){plan=model.shared?C.moveManual(plan,model.people.filter(p=>selected.has(p.id)),active):P.move(plan,model.people.filter(p=>selected.has(p.id)).map(p=>p.id),active);selected.clear();notice='Seçilen yolcular bu otobüse taşındı.';}
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
 return {open,isDirty:dirty,reset:()=>{saving=false;numberEditing=false;numberDraft={};model=null;plan=null;baseline='';selected.clear();root.innerHTML='';}};
};
})();
