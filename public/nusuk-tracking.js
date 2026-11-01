(function(root){
'use strict';
// Nusuk (Ravza) randevu takibi. Tur bazında yolcuların randevu tarihi/saati,
// Nusuk e-posta/şifresi, vize numarası ve vize belgesi; 5 yaş ve altı çocuklar
// randevu almaz, kız çocuk annesiyle, erkek çocuk babasıyla girer.
const CHILD_MAX_AGE=5;
const PDFJS_VERSION='4.10.38';
const PDFJS_BASE=`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/legacy/build/`;
const TR_MAP={'Ç':'C','Ğ':'G','İ':'I','I':'I','Ö':'O','Ş':'S','Ü':'U','ç':'C','ğ':'G','ı':'I','i':'I','ö':'O','ş':'S','ü':'U'};

const normName=value=>String(value||'').replace(/[ÇĞİIÖŞÜçğıiöşü]/g,c=>TR_MAP[c]||c).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z ]+/g,' ').replace(/\s+/g,' ').trim();
const normPassport=value=>String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const tokens=value=>normName(value).split(' ').filter(t=>t.length>1);
const passengerKey=(listId,passengerId)=>`${listId}:${passengerId}`;

function ageOn(birthDate,refDate){
 const b=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(birthDate||'')),r=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(refDate||''));
 if(!b||!r)return null;
 let age=+r[1]-+b[1];
 if(+r[2]<+b[2]||(+r[2]===+b[2]&&+r[3]<+b[3]))age--;
 return age>=0&&age<130?age:null;
}

function childGender(passenger){
 if(passenger?.gender==='Kadın'||passenger?.gender==='Erkek')return passenger.gender;
 if(passenger?.relationship==='Kızı'||passenger?.relationship==='Annesi')return 'Kadın';
 if(passenger?.relationship==='Oğlu'||passenger?.relationship==='Babası')return 'Erkek';
 return '';
}
const genderOf=childGender;
// Kadınlar ve erkekler Ravza'ya aynı saatte giremez: gruplar ve sıralama cinsiyete göre.
const GENDER_GROUPS=[{id:'Erkek',label:'Erkekler'},{id:'Kadın',label:'Kadınlar'},{id:'',label:'Cinsiyeti belirtilmemiş'}];

// Aynı tarih+saatte hem kadın hem erkek olan randevu dilimleri.
function mixedSlots(adults,read=(row,field)=>row.nusuk[field]||''){
 const slots=new Map();
 adults.forEach(row=>{
  const date=read(row,'date'),time=read(row,'time');if(!date||!time||!row.gender)return;
  const key=`${date}|${time}`,slot=slots.get(key)||{date,time,genders:new Set(),keys:[]};
  slot.genders.add(row.gender);slot.keys.push(row.key);slots.set(key,slot);
 });
 return [...slots.values()].filter(s=>s.genders.size>1).sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

// Çocuğun bağlı olduğu ebeveyn ve o ebeveynin eşi arasından kız için anne,
// erkek için baba seçilir.
function escortFor(child,passengers){
 const gender=childGender(child),role=gender==='Kadın'?'mother':gender==='Erkek'?'father':'';
 const byId=new Map((passengers||[]).map(p=>[String(p.id),p]));
 const parent=byId.get(String(child?.relativePassengerId||''));
 const pool=[];
 if(parent){
  pool.push(parent);
  if(parent.relationship==='Eşi'&&byId.get(String(parent.relativePassengerId||'')))pool.push(byId.get(String(parent.relativePassengerId)));
  (passengers||[]).forEach(p=>{if(p.relationship==='Eşi'&&String(p.relativePassengerId||'')===String(parent.id))pool.push(p);});
 }
 const wanted=role==='mother'?'Kadın':role==='father'?'Erkek':'';
 const escort=wanted?pool.find(p=>p&&p.id!==child.id&&p.gender===wanted)||null:null;
 return {role,gender,escort,parent:parent||null};
}

function referenceDate(tour,passenger){
 return passenger?.nusuk?.date||tour?.departureDate||new Date().toISOString().slice(0,10);
}

function tourRows(lists,tour){
 const adults=[],children=[];
 (lists||[]).filter(list=>String(list.tourId)===String(tour?.id)).forEach(list=>{
  const passengers=list.passengers||[];
  passengers.forEach(passenger=>{
   const age=ageOn(passenger.birthDate,referenceDate(tour,passenger));
   const row={key:passengerKey(list.id,passenger.id),listId:String(list.id),passengerId:String(passenger.id),passenger,nusuk:passenger.nusuk||{},age,gender:genderOf(passenger)};
   if(age!==null&&age<=CHILD_MAX_AGE)children.push({...row,...escortFor(passenger,passengers)});
   else adults.push(row);
  });
 });
 const byName=(a,b)=>String(a.passenger.name||'').localeCompare(String(b.passenger.name||''),'tr');
 const order=row=>GENDER_GROUPS.findIndex(g=>g.id===row.gender);
 return {adults:adults.sort((a,b)=>order(a)-order(b)||byName(a,b)),children:children.sort(byName)};
}

const statusOf=row=>row.nusuk.booked?'booked':'pending';

function summarize(rows){
 const s={total:rows.adults.length,booked:0,pending:0,noVisa:0,noDate:0,children:rows.children.length,men:0,women:0,noGender:0,mixed:mixedSlots(rows.adults).length};
 rows.adults.forEach(r=>{s[statusOf(r)]++;if(!r.nusuk.visaNo)s.noVisa++;if(!r.nusuk.date)s.noDate++;s[r.gender==='Erkek'?'men':r.gender==='Kadın'?'women':'noGender']++;});
 return s;
}

function filterRows(adults,{filter='all',query='',gender='all'}={}){
 const q=normName(query),qp=normPassport(query);
 return adults.filter(r=>(gender==='all'||r.gender===gender)&&(filter==='all'||(filter==='novisa'?!r.nusuk.visaNo:statusOf(r)===filter))&&(!q||normName(r.passenger.name).includes(q)||(qp.length>2&&(normPassport(r.passenger.passportNo).includes(qp)||String(r.nusuk.visaNo||'').includes(qp)))));
}

// pdf.js metin parçaları ({str,x,y}; y yukarıdan aşağı) → vize alanları.
function parseVisaItems(items){
 const list=(items||[]).map(i=>({str:String(i.str||'').trim(),x:+i.x||0,y:+i.y||0})).filter(i=>i.str);
 const latin=s=>/^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ' .-]*$/.test(s);
 const labels=re=>list.filter(i=>re.test(i.str));
 const sameRow=(label,test)=>list.filter(i=>i!==label&&Math.abs(i.y-label.y)<=7&&i.x>label.x+20&&test(i.str)).sort((a,b)=>a.x-b.x);
 const below=(label,test)=>list.filter(i=>i.y>label.y&&i.y-label.y<=30&&test(i.str)).sort((a,b)=>(a.y-b.y)||(a.x-b.x));
 const first=(re,test,allowBelow)=>{for(const label of labels(re)){const hit=sameRow(label,test)[0]||(allowBelow?below(label,test)[0]:null);if(hit)return hit.str;}return '';};
 let visaNo=first(/^Visa No\.?$/i,s=>/^\d{8,12}$/.test(s),true);
 if(!visaNo)visaNo=(list.find(i=>/^\d{10}$/.test(i.str))||{}).str||'';
 let passportNo=normPassport(first(/^Passport No\.?$/i,s=>/^[A-Z0-9]{5,12}$/i.test(s)));
 const mrz=list.filter(i=>/^[A-Z0-9<]{30,44}$/.test(i.str.replace(/\s/g,'')));
 const mrz2=mrz.find(i=>!/^[A-Z0-9]?<[A-Z]/.test(i.str)&&/\d{6}/.test(i.str));
 if(!passportNo&&mrz2)passportNo=normPassport(mrz2.str.slice(0,9).replace(/</g,''));
 let name='';
 for(const label of labels(/^Name$/i)){const parts=sameRow(label,s=>latin(s)&&!/^name$/i.test(s));if(parts.length){name=parts.map(p=>p.str).join(' ');break;}}
 if(!name){const mrz1=mrz.find(i=>/<<[A-Z]/.test(i.str));if(mrz1){const body=mrz1.str.replace(/^[A-Z0-9]?<[A-Z]{3}/,'');const [sur,given]=body.split('<<');name=[given,sur].filter(Boolean).map(s=>s.replace(/</g,' ').trim()).join(' ');}}
 const birth=first(/^Birth Date$/i,s=>/^\d{2}\/\d{2}\/\d{4}$/.test(s));
 const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birth);
 return {visaNo,passportNo,name:normName(name),birthDate:m?`${m[3]}-${m[2]}-${m[1]}`:''};
}

// Önce pasaport no, sonra ad-soyad (aynı kelimeler) eşleşir; birden fazla aday varsa
// doğum tarihi ayırt eder, yine de belirsizse otomatik atanmaz.
function matchPassenger(parsed,candidates){
 const pass=normPassport(parsed?.passportNo);
 if(pass){const hit=candidates.filter(c=>normPassport(c.passenger.passportNo)===pass);if(hit.length===1)return {row:hit[0],by:'passport'};}
 const vt=tokens(parsed?.name);if(vt.length<2)return {row:null,by:''};
 const scored=candidates.map(c=>{const pt=tokens(c.passenger.name);const common=vt.filter(t=>pt.includes(t)).length;const full=common===vt.length||common===pt.length;return {c,ok:full&&common>=2,common};}).filter(s=>s.ok);
 if(!scored.length)return {row:null,by:''};
 const best=Math.max(...scored.map(s=>s.common));
 let top=scored.filter(s=>s.common===best).map(s=>s.c);
 if(top.length>1&&parsed.birthDate)top=top.filter(c=>c.passenger.birthDate===parsed.birthDate);
 return top.length===1?{row:top[0],by:'name'}:{row:null,by:'ambiguous'};
}

const isoToDate=value=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(value||''));return m?new Date(Date.UTC(+m[1],+m[2]-1,+m[3])):null;};

function buildWorkbook(ExcelJS,rows,{companyName='',tourTitle='',includeCredentials=false,generatedAt=new Date()}={}){
 const workbook=new ExcelJS.Workbook();workbook.creator=companyName;workbook.created=generatedAt;
 const thin={style:'thin',color:{argb:'FFD6DCD8'}},border={top:thin,left:thin,bottom:thin,right:thin};
 const sheet=(name,cols,color)=>{
  const ws=workbook.addWorksheet(name,{views:[{showGridLines:false,state:'frozen',ySplit:3}]});
  ws.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,paperSize:9};
  ws.mergeCells(1,1,1,cols.length);
  const t=ws.getCell(1,1);t.value=`${String(companyName).toLocaleUpperCase('tr-TR')} • ${tourTitle.toLocaleUpperCase('tr-TR')} • ${name.toLocaleUpperCase('tr-TR')}`;t.font={bold:true,size:13};ws.getRow(1).height=26;
  ws.mergeCells(2,1,2,cols.length);ws.getCell(2,1).value=`Hazırlanma: ${generatedAt.toLocaleDateString('tr-TR')} ${generatedAt.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}`;ws.getCell(2,1).font={size:10,color:{argb:'FF66757A'}};
  const h=ws.getRow(3);h.values=cols.map(c=>c[0]);h.height=22;
  h.eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+color}};c.alignment={vertical:'middle',horizontal:'center',wrapText:true};c.border=border;});
  cols.forEach((c,i)=>{ws.getColumn(i+1).width=c[1];});
  return ws;
 };
 const adultCols=[['NO',6],['AD SOYAD',30],['CİNSİYET',10],['PASAPORT NO',15],['VİZE NO',15],['RANDEVU TARİHİ',14],['SAAT',9],...(includeCredentials?[['NUSUK E-POSTA',30],['NUSUK ŞİFRE',18]]:[]),['RANDEVU ALINDI',14]];
 const mixed=new Set(mixedSlots(rows.adults).flatMap(s=>s.keys));
 const addAdults=(name,items,color)=>{
  const ws=sheet(name,adultCols,color);
  items.forEach((r,i)=>{
   const n=r.nusuk||{};
   const row=ws.addRow([i+1,r.passenger.name||'',r.gender||'Belirtilmemiş',r.passenger.passportNo||'',n.visaNo||'',isoToDate(n.date)||'',n.time||'',...(includeCredentials?[n.email||'',n.password||'']:[]),n.booked?'EVET':'HAYIR']);
   row.eachCell({includeEmpty:true},c=>{c.border=border;c.alignment={vertical:'middle'};});
   row.getCell(6).numFmt='dd.mm.yyyy';
   if(mixed.has(r.key))[6,7].forEach(c=>{row.getCell(c).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFBE3E0'}};row.getCell(c).font={bold:true,color:{argb:'FFA23B32'}};});
   const st=row.getCell(adultCols.length);st.font={bold:true,color:{argb:n.booked?'FF1F7A45':'FFA23B32'}};
  });
  if(!items.length)ws.addRow(['','Bu grupta yolcu yok.']);else ws.autoFilter={from:{row:3,column:1},to:{row:3+items.length,column:adultCols.length}};
 };
 addAdults('Tüm Yolcular',rows.adults,'1C4A52');
 addAdults('Erkekler',rows.adults.filter(r=>r.gender==='Erkek'),'2F5D8A');
 addAdults('Kadınlar',rows.adults.filter(r=>r.gender==='Kadın'),'8A3F6B');
 addAdults('Randevu Alınanlar',rows.adults.filter(r=>r.nusuk.booked),'1F7A45');
 addAdults('Randevu Alınmayanlar',rows.adults.filter(r=>!r.nusuk.booked),'A23B32');
 const kids=sheet('5 Yaş ve Altı',[['NO',6],['AD SOYAD',30],['YAŞ',7],['CİNSİYET',10],['KİMİNLE GİRER',30],['REFAKATÇİ RANDEVU',18],['REFAKATÇİ DURUMU',16]],'9A6200');
 rows.children.forEach((c,i)=>{
  const e=c.escort,en=e?.nusuk||{};
  const row=kids.addRow([i+1,c.passenger.name||'',c.age,c.gender||'',e?`${c.role==='mother'?'Annesi':'Babası'}: ${e.name}`:'Eşleşen ebeveyn yok',en.date?`${en.date.split('-').reverse().join('.')} ${en.time||''}`.trim():'',e?(en.booked?'Randevu alındı':'Randevu yok'):'']);
  row.eachCell({includeEmpty:true},cell=>{cell.border=border;});
 });
 if(!rows.children.length)kids.addRow(['','5 yaş ve altı yolcu yok.']);
 return workbook;
}

function fileName(tourTitle,date=new Date()){
 const slug=String(tourTitle||'tur').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü]+/gi,'-').replace(/^-+|-+$/g,'')||'tur';
 return `nusuk-${slug}-${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}.xlsx`;
}

/* ---------- Tarayıcı: PDF okuma ---------- */
let pdfjsPromise=null;
function loadPdfJs(){
 if(!pdfjsPromise)pdfjsPromise=import(PDFJS_BASE+'pdf.min.mjs').then(lib=>{lib.GlobalWorkerOptions.workerSrc=PDFJS_BASE+'pdf.worker.min.mjs';return lib;}).catch(error=>{pdfjsPromise=null;throw error;});
 return pdfjsPromise;
}

const canvasBlob=(canvas,quality)=>new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];

// Sayfadaki vesikalığı bulur: sol üstte, sayfa genişliğinin küçük bir kısmı.
function photoBox(pdfjs,ops,vp){
 const O=pdfjs.OPS;let m=[1,0,0,1,0,0];const stack=[];
 for(let k=0;k<ops.fnArray.length;k++){
  const fn=ops.fnArray[k];
  if(fn===O.save)stack.push(m);else if(fn===O.restore)m=stack.pop()||[1,0,0,1,0,0];else if(fn===O.transform)m=mul(m,ops.argsArray[k]);
  else if(fn===O.paintImageXObject||fn===O.paintJpegXObject){
   const w=Math.abs(m[0]),h=Math.abs(m[3]),x=m[4],y=vp.height-(m[5]+m[3]);
   if(x<vp.width*0.2&&y>vp.height*0.05&&y<vp.height*0.3&&w>vp.width*0.12&&w<vp.width*0.4&&h>vp.width*0.12&&h<vp.width*0.45)return {x,y,w,h};
  }
 }
 return null;
}

async function readVisaPdf(file,onPage){
 const pdfjs=await loadPdfJs();
 const doc=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
 const pages=[];
 for(let n=1;n<=doc.numPages;n++){
  const page=await doc.getPage(n);
  const vp=page.getViewport({scale:1});
  const text=await page.getTextContent();
  const parsed=parseVisaItems(text.items.map(i=>({str:i.str,x:i.transform[4],y:vp.height-i.transform[5]})));
  const box=photoBox(pdfjs,await page.getOperatorList(),vp);
  const scale=1.8,view=page.getViewport({scale});
  const canvas=document.createElement('canvas');canvas.width=Math.round(view.width);canvas.height=Math.round(view.height);
  // 'print' niyeti requestAnimationFrame beklemez; sekme arka plandayken de çizer.
  await page.render({canvasContext:canvas.getContext('2d'),viewport:view,intent:'print'}).promise;
  const pageBlob=await canvasBlob(canvas,0.8);
  let photoBlob=null,photoUrl='';
  if(box){
   const c=document.createElement('canvas');c.width=Math.round(box.w*scale);c.height=Math.round(box.h*scale);
   c.getContext('2d').drawImage(canvas,box.x*scale,box.y*scale,box.w*scale,box.h*scale,0,0,c.width,c.height);
   photoBlob=await canvasBlob(c,0.88);photoUrl=URL.createObjectURL(photoBlob);
  }
  pages.push({file:file.name,pageNo:n,parsed,pageBlob,photoBlob,photoUrl});
  page.cleanup();onPage?.(n,doc.numPages);
 }
 await doc.destroy();
 return pages;
}

/* ---------- Tarayıcı: panel ---------- */
function createPanel(options){
 const o=options||{};const rootEl=o.root;if(!rootEl)return {refresh(){},isDirty:()=>false};
 const esc=o.escapeHtml||(v=>String(v??''));const fd=o.formatDate||(v=>v);
 const ui={tourId:'',filter:'all',query:'',gender:'all',bulkGender:'Erkek',bulkDate:'',bulkTime:''};
 const drafts=new Map(),shown=new Set(),urlCache=new Map();
 let current={adults:[],children:[]},tour=null,busy=false;
 const can=()=>o.canManage?o.canManage():false;
 const value=(row,field)=>{const d=drafts.get(row.key);return d&&Object.prototype.hasOwnProperty.call(d,field)?d[field]:(row.nusuk[field]??'');};

 function tours(){return (o.getTours?o.getTours():[]);}
 function draw(){
  const list=tours(),fixed=o.fixedTourId?o.fixedTourId():'';
  if(fixed)ui.tourId=fixed;
  if(!list.some(t=>String(t.id)===String(ui.tourId)))ui.tourId=list[0]?String(list[0].id):'';
  tour=list.find(t=>String(t.id)===String(ui.tourId))||null;
  current=tour?tourRows(o.getLists?o.getLists():[],tour):{adults:[],children:[]};
  const s=summarize(current),manage=can();
  const items=filterRows(current.adults,ui);
  const mix=mixedSlots(current.adults,value),mixKeys=new Set(mix.flatMap(m=>m.keys));
  const pw=row=>{const n=row.nusuk;if(!manage)return n.credentialsHidden?(n.storedCredentials||[]).includes('password')?'<span class="nk-muted">Kayıtlı (gizli)</span>':'<span class="nk-muted">—</span>':'—';const visible=shown.has(row.key);return `<span class="nk-pw"><input class="nk-in" data-field="password" type="${visible?'text':'password'}" value="${esc(value(row,'password'))}" autocomplete="new-password" aria-label="Nusuk şifresi"><button type="button" class="nk-eye" data-nk-eye="${esc(row.key)}" title="${visible?'Gizle':'Göster'}" aria-label="Şifreyi ${visible?'gizle':'göster'}">${visible?'🙈':'👁'}</button></span>`;};
  const email=row=>manage?`<input class="nk-in" data-field="email" type="email" value="${esc(value(row,'email'))}" placeholder="ornek@mail.com" autocomplete="off" aria-label="Nusuk e-postası">`:(row.nusuk.credentialsHidden?((row.nusuk.storedCredentials||[]).includes('email')?'<span class="nk-muted">Kayıtlı (gizli)</span>':'<span class="nk-muted">—</span>'):esc(row.nusuk.email||'—'));
  const field=(row,f,type,label)=>manage?`<input class="nk-in" data-field="${f}" type="${type}" value="${esc(value(row,f))}" aria-label="${label}">`:esc(f==='date'?fd(row.nusuk.date||'')||'—':row.nusuk[f]||'—');
  const photo=row=>row.nusuk.visaPhoto?`<img class="nk-photo" data-nk-photo="${esc(row.nusuk.visaPhoto)}" alt="${esc(row.passenger.name)} vesikalık">`:'<span class="nk-photo nk-photo-empty" title="Vize yüklenmedi">?</span>';
  rootEl.innerHTML=`
  <div class="nk-head"><div><span class="section-kicker">NUSUK RANDEVU</span><h3>Ravza / Nusuk Takibi</h3><small>Yolcuların randevu tarihi, saati, Nusuk hesabı ve vizesi. 5 yaş ve altı çocuklar randevu almaz; kız annesiyle, erkek babasıyla girer.</small></div>
   <div class="nk-actions">${manage?`<label class="btn btn-outline dark nk-upload">Vizeleri Yükle (PDF)<input type="file" accept="application/pdf" multiple data-nk-upload hidden></label>`:''}${o.canExport&&o.canExport()?`<button type="button" class="btn btn-gold" data-nk-excel ${tour?'':'disabled'}>Excel İndir</button>`:''}</div></div>
  ${fixed?'':`<label class="nk-tour"><span>Umre programı</span><select data-nk-tour>${list.length?list.map(t=>`<option value="${esc(t.id)}" ${String(t.id)===String(ui.tourId)?'selected':''}>${esc(t.title)}${t.departureDate?` • ${esc(fd(t.departureDate))}`:''}</option>`).join(''):'<option value="">Umre programı yok</option>'}</select></label>`}
  ${tour?`<div class="nk-stats"><button type="button" data-nk-filter="all" class="${ui.filter==='all'?'active':''}"><span>Randevu gereken</span><b>${s.total}</b></button><button type="button" data-nk-filter="booked" class="nk-ok ${ui.filter==='booked'?'active':''}"><span>Randevu alındı</span><b>${s.booked}</b></button><button type="button" data-nk-filter="pending" class="nk-bad ${ui.filter==='pending'?'active':''}"><span>Alınmadı</span><b>${s.pending}</b></button><button type="button" data-nk-filter="novisa" class="nk-warn ${ui.filter==='novisa'?'active':''}"><span>Vize no eksik</span><b>${s.noVisa}</b></button><a href="#nkChildren" class="nk-kid"><span>5 yaş ve altı</span><b>${s.children}</b></a></div>
  <div class="nk-tools"><label class="nk-search"><span>Yolcu ara</span><input type="search" data-nk-search value="${esc(ui.query)}" placeholder="Ad, pasaport veya vize no"></label>
   <div class="nk-gender" role="group" aria-label="Cinsiyete göre göster"><button type="button" data-nk-gender="all" class="${ui.gender==='all'?'active':''}">Tümü</button><button type="button" data-nk-gender="Erkek" class="nk-men ${ui.gender==='Erkek'?'active':''}">Erkekler <b>${s.men}</b></button><button type="button" data-nk-gender="Kadın" class="nk-women ${ui.gender==='Kadın'?'active':''}">Kadınlar <b>${s.women}</b></button>${s.noGender?`<button type="button" data-nk-gender="" class="nk-nogender ${ui.gender===''?'active':''}">Cinsiyet yok <b>${s.noGender}</b></button>`:''}</div>
   ${manage?`<div class="nk-bulk"><label><span>Kime</span><select data-nk-bulk-gender><option value="Erkek" ${ui.bulkGender==='Erkek'?'selected':''}>Erkeklere</option><option value="Kadın" ${ui.bulkGender==='Kadın'?'selected':''}>Kadınlara</option></select></label><label><span>Randevu tarihi</span><input type="date" data-nk-bulk-date value="${esc(ui.bulkDate)}"></label><label><span>Saat</span><input type="time" data-nk-bulk-time value="${esc(ui.bulkTime)}"></label><button type="button" class="icon-btn" data-nk-bulk>Boş olanlara uygula</button></div>`:''}</div>
  ${mix.length?`<div class="nk-alert" role="alert"><b>Kadın ve erkek aynı saate giremez.</b> ${mix.map(m=>`${esc(fd(m.date))} ${esc(m.time)} (${m.keys.length} yolcu)`).join(', ')} saatinde iki cinsiyet birden var. Saatleri ayırın.</div>`:''}
  ${s.noGender?`<div class="nk-alert nk-alert-soft">${s.noGender} yolcunun cinsiyeti seçilmemiş. Yolcu listesinden seçin; aksi halde saat ayrımı kontrol edilemez.</div>`:''}
  <div class="nk-table-wrap"><table class="nk-table"><thead><tr><th title="Randevu alındı">✓</th><th>Foto</th><th>Yolcu</th><th>Vize no</th><th>Tarih</th><th>Saat</th><th>Nusuk e-posta</th><th>Şifre</th><th></th></tr></thead><tbody>${GENDER_GROUPS.map(g=>{const group=items.filter(r=>r.gender===g.id);if(!group.length)return '';const all=current.adults.filter(r=>r.gender===g.id);const times=[...new Set(all.map(r=>[value(r,'date'),value(r,'time')].filter(Boolean).join(' ')).filter(t=>t.includes(':')))].sort();return `<tr class="nk-group nk-group-${g.id==='Erkek'?'men':g.id==='Kadın'?'women':'none'}"><td colspan="9"><b>${g.label}</b> • ${all.length} yolcu • ${all.filter(r=>r.nusuk.booked).length} randevu alındı${times.length?` • Saatler: ${times.map(t=>esc(t.replace(/^(\d{4})-(\d{2})-(\d{2})/,'$3.$2.$1'))).join(', ')}`:''}</td></tr>`+group.map(row=>rowHtml(row)).join('');}).join('')||`<tr><td colspan="9" class="nk-empty">${current.adults.length?'Bu filtrede yolcu yok.':'Bu programda randevu alınacak yolcu yok.'}</td></tr>`}</tbody></table></div>`:'<div class="empty">Nusuk takibi için önce bir Umre programı oluşturun.</div>'}
  ${tour?`${manage&&drafts.size?`<div class="nk-savebar"><span><b>${drafts.size}</b> yolcuda kaydedilmemiş değişiklik</span><span><button type="button" class="icon-btn" data-nk-discard>Vazgeç</button><button type="button" class="btn btn-gold" data-nk-save ${busy?'disabled':''}>${busy?'Kaydediliyor…':'Değişiklikleri Kaydet'}</button></span></div>`:''}
  <section class="nk-children" id="nkChildren"><h4>5 yaş ve altı (randevu alınmaz)</h4>${childrenHtml()}</section>`:''}
  <dialog class="nk-dialog" data-nk-dialog></dialog>`;
  loadPhotos();

  function rowHtml(row){return `<tr data-key="${esc(row.key)}" class="${row.nusuk.booked?'nk-booked':''}${drafts.has(row.key)?' nk-dirty':''}${mixKeys.has(row.key)?' nk-mixed':''}"><td data-label="Randevu alındı"><input type="checkbox" class="nk-check" data-nk-book ${row.nusuk.booked?'checked':''} ${manage?'':'disabled'} aria-label="${esc(row.passenger.name)} randevu alındı"></td><td data-label="Foto">${photo(row)}</td><td data-label="Yolcu"><b>${esc(row.passenger.name||'İsimsiz yolcu')}</b><small>${esc(row.passenger.passportNo||'Pasaport no yok')}${row.age!==null?` • ${row.age} yaş`:''}${row.gender?'':' • <span class="nk-warn-text">Cinsiyet seçilmemiş</span>'}</small></td><td data-label="Vize no">${manage?`<input class="nk-in nk-visa" data-field="visaNo" inputmode="numeric" value="${esc(value(row,'visaNo'))}" placeholder="Vize no" aria-label="Vize numarası">`:esc(row.nusuk.visaNo||'—')}</td><td data-label="Tarih">${field(row,'date','date','Randevu tarihi')}</td><td data-label="Saat">${field(row,'time','time','Randevu saati')}${mixKeys.has(row.key)?'<small class="nk-warn-text">Bu saatte karşı cinsten yolcu var</small>':''}</td><td data-label="Nusuk e-posta">${email(row)}</td><td data-label="Şifre">${pw(row)}</td><td class="nk-row-actions">${row.nusuk.visaPage?`<button type="button" class="icon-btn" data-nk-visa="${esc(row.nusuk.visaPage)}" data-nk-name="${esc(row.passenger.name)}">Vizesini gör</button>`:'<span class="nk-muted">Vize yok</span>'}</td></tr>`;}

  function childrenHtml(){return current.children.length?`<div class="nk-child-grid">${current.children.map(c=>{const e=c.escort,en=e?.nusuk||{};return `<article class="nk-child ${e?'':'nk-child-missing'}"><div class="nk-child-top">${photo(c)}<div><b>${esc(c.passenger.name||'İsimsiz')}</b><small>${c.age} yaş • ${esc(c.gender||'Cinsiyet yok')}${c.nusuk.visaNo?` • Vize ${esc(c.nusuk.visaNo)}`:''}</small></div>${c.nusuk.visaPage?`<button type="button" class="icon-btn" data-nk-visa="${esc(c.nusuk.visaPage)}" data-nk-name="${esc(c.passenger.name)}">Vizesini gör</button>`:''}</div><p>${e?`${c.role==='mother'?'Annesiyle':'Babasıyla'} girer: <b>${esc(e.name)}</b>`:`${c.role==='mother'?'Annesi':c.role==='father'?'Babası':'Ebeveyni'} eşleşmedi. Yolcu listesinde yakınlığı (${c.role==='mother'?'Kızı':'Oğlu'} → ebeveyn) seçin.`}</p>${e?`<span class="nk-chip ${en.booked?'ok':'bad'}">${en.booked?'Randevusu alındı':'Randevusu yok'}${en.date?` • ${esc(fd(en.date))} ${esc(en.time||'')}`:''}</span>`:''}</article>`;}).join('')}</div>`:'<p class="nk-muted">Bu programda 5 yaş ve altı yolcu yok.</p>';}
 }

 async function signed(paths){
  const now=Date.now(),need=[...new Set(paths)].filter(p=>p&&!(urlCache.get(p)?.exp>now));
  if(need.length&&o.viewUrls){try{const urls=await o.viewUrls(need);Object.entries(urls||{}).forEach(([p,u])=>urlCache.set(p,{url:u,exp:now+8*60*1000}));}catch(e){console.warn('Vize görseli bağlantısı alınamadı.',e);}}
  return Object.fromEntries(paths.map(p=>[p,urlCache.get(p)?.url||'']));
 }
 async function loadPhotos(){
  const imgs=[...rootEl.querySelectorAll('[data-nk-photo]')];if(!imgs.length)return;
  const urls=await signed(imgs.map(i=>i.dataset.nkPhoto));
  imgs.forEach(i=>{if(urls[i.dataset.nkPhoto])i.src=urls[i.dataset.nkPhoto];});
 }

 function setDraft(key,field,val){
  const row=current.adults.find(r=>r.key===key);if(!row)return;
  const d={...(drafts.get(key)||{})};
  if(String(row.nusuk[field]??'')===String(val))delete d[field];else d[field]=val;
  if(Object.keys(d).length)drafts.set(key,d);else drafts.delete(key);
 }

 async function persist(changes,message){
  if(!changes.length||busy)return false;
  busy=true;draw();
  try{const ok=await o.save(changes);if(ok){changes.forEach(c=>{const d=drafts.get(c.key);if(d&&c.fromDraft)drafts.delete(c.key);});o.toast?.(message);}return ok;}
  finally{busy=false;draw();}
 }

 async function openVisa(path,name){
  const dlg=rootEl.querySelector('[data-nk-dialog]');
  const url=(await signed([path]))[path];
  if(!url){o.toast?.('Vize görüntülenemedi. Bağlantıyı kontrol edin.');return;}
  dlg.innerHTML=`<form method="dialog" class="nk-dialog-head"><b>${esc(name)} • Vize</b><span><a class="icon-btn" href="${esc(url)}" target="_blank" rel="noopener">Yeni sekmede aç</a><button class="icon-btn" value="close" aria-label="Kapat">✕</button></span></form><img class="nk-visa-img" src="${esc(url)}" alt="${esc(name)} vizesi">`;
  dlg.showModal?.();
 }

 // Vize PDF'leri: sayfa sayfa oku, eşleştir, onaydan sonra yükle ve kaydet.
 async function importVisas(files){
  if(!tour){o.toast?.('Önce Umre programını seçin.');return;}
  const dlg=rootEl.querySelector('[data-nk-dialog]');
  dlg.innerHTML=`<div class="nk-progress"><b>Vizeler okunuyor…</b><span data-nk-progress>Hazırlanıyor</span></div>`;dlg.showModal?.();
  let pages=[];
  try{for(const f of files)pages=pages.concat(await readVisaPdf(f,(n,total)=>{const p=dlg.querySelector('[data-nk-progress]');if(p)p.textContent=`${f.name}: ${n} / ${total} sayfa`;}));}
  catch(error){console.error(error);dlg.innerHTML=`<div class="nk-progress"><b>PDF okunamadı.</b><span>İnternet bağlantısını kontrol edip tekrar deneyin.</span><form method="dialog"><button class="btn btn-gold">Kapat</button></form></div>`;return;}
  const used=new Set();
  const plan=pages.map(p=>{const m=matchPassenger(p.parsed,current.adults.concat(current.children).filter(r=>!used.has(r.key)));if(m.row)used.add(m.row.key);return {...p,match:m.row?m.row.key:'',by:m.by};});
  const everyone=current.adults.concat(current.children);
  const option=(sel)=>`<option value="">— Eşleştirme yok —</option>${everyone.map(r=>`<option value="${esc(r.key)}" ${r.key===sel?'selected':''}>${esc(r.passenger.name)}${r.passenger.passportNo?` (${esc(r.passenger.passportNo)})`:''}</option>`).join('')}`;
  const matched=plan.filter(p=>p.match).length;
  dlg.innerHTML=`<form method="dialog" class="nk-dialog-head"><b>${pages.length} vize okundu • ${matched} eşleşti</b><button class="icon-btn" value="close" aria-label="Kapat">✕</button></form>
   <p class="nk-muted">Pasaport numarası veya ad-soyad ile eşleştirildi. Yanlış ya da boş olanları seçerek düzeltin; onaylayınca vize sayfası ve vesikalık gizli depoya yüklenir.</p>
   <div class="nk-review">${plan.map((p,i)=>`<div class="nk-review-row ${p.match?'':'nk-review-miss'}">${p.photoUrl?`<img src="${p.photoUrl}" alt="">`:'<span class="nk-photo nk-photo-empty">?</span>'}<div><b>${esc(p.parsed.name||'İsim okunamadı')}</b><small>Vize ${esc(p.parsed.visaNo||'?')} • Pasaport ${esc(p.parsed.passportNo||'?')} • ${esc(p.file)} s.${p.pageNo}</small><small class="nk-by">${p.by==='passport'?'Pasaport no ile eşleşti':p.by==='name'?'Ad-soyad ile eşleşti':p.by==='ambiguous'?'Birden fazla benzer isim var, seçin':'Eşleşmedi, seçin'}</small></div><select data-nk-plan="${i}">${option(p.match)}</select></div>`).join('')}</div>
   <div class="nk-dialog-foot"><button type="button" class="icon-btn" data-nk-cancel>Vazgeç</button><button type="button" class="btn btn-gold" data-nk-confirm>Onayla ve yükle</button></div>`;
  dlg.onclick=async event=>{
   if(event.target.closest('[data-nk-cancel]')){dlg.close();return;}
   if(!event.target.closest('[data-nk-confirm]'))return;
   dlg.querySelectorAll('[data-nk-plan]').forEach(s=>{plan[+s.dataset.nkPlan].match=s.value;});
   const chosen=plan.filter(p=>p.match);
   const keys=chosen.map(p=>p.match);if(new Set(keys).size!==keys.length){o.toast?.('Aynı yolcuya iki vize seçildi. Lütfen düzeltin.');return;}
   if(!chosen.length){dlg.close();return;}
   dlg.innerHTML=`<div class="nk-progress"><b>Vizeler yükleniyor…</b><span data-nk-progress>0 / ${chosen.length}</span></div>`;
   const changes=[];let done=0;
   try{
    for(const p of chosen){
     const row=everyone.find(r=>r.key===p.match);
     const base={tourId:tour.id,listId:row.listId,passengerId:row.passengerId};
     const visaPage=await o.uploadPrivate({...base,kind:'visa',blob:p.pageBlob});
     const visaPhoto=p.photoBlob?await o.uploadPrivate({...base,kind:'photo',blob:p.photoBlob}):'';
     changes.push({key:row.key,listId:row.listId,passengerId:row.passengerId,patch:{visaNo:p.parsed.visaNo||row.nusuk.visaNo||'',visaPage,visaPhoto,visaUploadedAt:new Date().toISOString()},oldPaths:[row.nusuk.visaPage,row.nusuk.visaPhoto].filter(Boolean)});
     const el=dlg.querySelector('[data-nk-progress]');if(el)el.textContent=`${++done} / ${chosen.length}`;
    }
   }catch(error){console.error(error);dlg.close();o.toast?.('Vize yüklemesi yarıda kaldı. Bağlantıyı kontrol edip tekrar deneyin.');return;}
   dlg.close();
   const ok=await persist(changes,`${changes.length} yolcunun vizesi kaydedildi.`);
   if(ok&&o.removePaths){const old=changes.flatMap(c=>c.oldPaths);if(old.length)o.removePaths(old).catch(()=>{});}
   pages.forEach(p=>p.photoUrl&&URL.revokeObjectURL(p.photoUrl));
  };
 }

 async function exportExcel(){
  const ExcelJS=o.ExcelJS?o.ExcelJS():null;
  if(!ExcelJS||!tour){o.toast?.('Excel hazırlama bileşeni yüklenemedi.');return;}
  try{
   const workbook=buildWorkbook(ExcelJS,current,{companyName:o.companyName?o.companyName():'',tourTitle:tour.title||'',includeCredentials:can()});
   const blob=new Blob([await workbook.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
   const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=fileName(tour.title);document.body.appendChild(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(link.href),2000);o.toast?.('Nusuk listesi Excel olarak indirildi.');
  }catch(error){console.error(error);o.toast?.('Excel dosyası hazırlanamadı.');}
 }

 rootEl.addEventListener('click',event=>{
  const t=event.target;
  const filter=t.closest('[data-nk-filter]');if(filter){ui.filter=filter.dataset.nkFilter;draw();return;}
  const eye=t.closest('[data-nk-eye]');if(eye){const k=eye.dataset.nkEye;shown.has(k)?shown.delete(k):shown.add(k);draw();return;}
  const visa=t.closest('[data-nk-visa]');if(visa){openVisa(visa.dataset.nkVisa,visa.dataset.nkName);return;}
  if(t.closest('[data-nk-excel]')){exportExcel();return;}
  if(t.closest('[data-nk-discard]')){drafts.clear();draw();return;}
  const gender=t.closest('[data-nk-gender]');if(gender){ui.gender=gender.dataset.nkGender;draw();return;}
  if(t.closest('[data-nk-save]')){
   const clash=mixedSlots(current.adults,value).filter(m=>m.keys.some(k=>drafts.has(k)));
   if(clash.length){o.toast?.(`Kadın ve erkek aynı saate giremez: ${clash.map(m=>`${fd(m.date)} ${m.time}`).join(', ')}. Saatleri ayırıp tekrar kaydedin.`);return;}
   persist([...drafts].map(([key,patch])=>{const r=current.adults.find(x=>x.key===key)||{};return {key,listId:r.listId,passengerId:r.passengerId,patch,fromDraft:true};}).filter(c=>c.listId),'Nusuk bilgileri kaydedildi.');return;}
  if(t.closest('[data-nk-bulk]')){
   if(!ui.bulkDate&&!ui.bulkTime){o.toast?.('Önce tarih veya saat seçin.');return;}
   const label=ui.bulkGender==='Kadın'?'kadın':'erkek';
   let n=0;current.adults.filter(r=>r.gender===ui.bulkGender).forEach(r=>{let touched=false;if(ui.bulkDate&&!value(r,'date')){setDraft(r.key,'date',ui.bulkDate);touched=true;}if(ui.bulkTime&&!value(r,'time')){setDraft(r.key,'time',ui.bulkTime);touched=true;}if(touched)n++;});
   draw();o.toast?.(n?`${n} ${label} yolcuya tarih/saat eklendi. Kaydetmeyi unutmayın.`:`Tarihi/saati boş ${label} yolcu yok.`);return;
  }
 });
 rootEl.addEventListener('change',event=>{
  const t=event.target;
  if(t.matches('[data-nk-tour]')){ui.tourId=t.value;ui.filter='all';draw();return;}
  if(t.matches('[data-nk-upload]')){const files=[...t.files||[]];t.value='';if(files.length)importVisas(files);return;}
  if(t.matches('[data-nk-book]')){const key=t.closest('tr').dataset.key,row=current.adults.find(r=>r.key===key);if(!row)return;const booked=t.checked;persist([{key,listId:row.listId,passengerId:row.passengerId,patch:{booked,bookedAt:booked?new Date().toISOString():''}}],booked?'Randevu alındı olarak işaretlendi.':'Randevu işareti kaldırıldı.');return;}
  if(t.matches('[data-nk-bulk-date]')){ui.bulkDate=t.value;return;}
  if(t.matches('[data-nk-bulk-time]')){ui.bulkTime=t.value;return;}
  if(t.matches('[data-nk-bulk-gender]')){ui.bulkGender=t.value;return;}
  if(t.matches('.nk-in[data-field]')){const tr=t.closest('tr');setDraft(tr.dataset.key,t.dataset.field,t.value.trim());draw();}
 });
 rootEl.addEventListener('input',event=>{if(event.target.matches('[data-nk-search]')){ui.query=event.target.value;const pos=event.target.selectionStart;draw();const s=rootEl.querySelector('[data-nk-search]');s.focus();s.setSelectionRange(pos,pos);}});
 if(typeof window!=='undefined')window.addEventListener('beforeunload',event=>{if(drafts.size){event.preventDefault();event.returnValue='';}});
 return {refresh:draw,isDirty:()=>drafts.size>0};
}

const api={CHILD_MAX_AGE,PDFJS_VERSION,GENDER_GROUPS,normName,normPassport,ageOn,childGender,genderOf,mixedSlots,escortFor,tourRows,summarize,filterRows,parseVisaItems,matchPassenger,buildWorkbook,fileName,loadPdfJs,readVisaPdf,createPanel,passengerKey};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TurizmNusuk=api;
})(typeof window==='undefined'?globalThis:window);
