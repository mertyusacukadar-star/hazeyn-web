(function(root){
'use strict';
// Muhasebe sekmesindeki "Ödeme Durumu" bölümü: yolcuları program bazında
// tamamını ödeyen / kısmi ödeyen / hiç ödemeyen diye ayırır ve Excel'e verir.
// Tutarlar app.js'teki passengerAccountSnapshot ile aynı hesaptan gelir.
const STATUSES=[
 {id:'paid',label:'Tamamını Ödeyenler',short:'Ödedi',sheet:'Tamamını Ödeyenler',color:'1F7A45',fill:'E3F4E8'},
 {id:'partial',label:'Kısmi Ödeyenler',short:'Kısmi',sheet:'Kısmi Ödeyenler',color:'9A6200',fill:'FFF1D2'},
 {id:'unpaid',label:'Hiç Ödemeyenler',short:'Ödemedi',sheet:'Hiç Ödemeyenler',color:'A23B32',fill:'FBE3E0'}
];
const EPS=0.005,CURRENCIES=['USD','EUR','TRY'];
const statusInfo=id=>STATUSES.find(s=>s.id===id)||STATUSES[2];
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const norm=v=>String(v||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i').trim();

function classify(row){
 const price=num(row.agreedPrice),paid=num(row.paid);
 if(paid<=EPS)return 'unpaid';
 if(price-paid<=EPS)return 'paid';
 return 'partial';
}

function makeRow(source){
 const payments=(source.payments||[]).filter(p=>!p.voided&&num(p.amount)>0);
 const lastPaymentAt=payments.map(p=>String(p.paidAt||'')).filter(Boolean).sort().pop()||'';
 const row={
  programId:String(source.programId||''),programTitle:String(source.programTitle||'Programsız Liste'),programDate:String(source.programDate||''),
  listId:String(source.listId||''),passengerId:String(source.passengerId||''),
  name:String(source.name||'İsimsiz yolcu'),phone:String(source.phone||''),roomPeople:String(source.roomPeople||''),
  currency:CURRENCIES.includes(source.currency)?source.currency:'TRY',
  agreedPrice:num(source.agreedPrice),paid:num(source.paid),
  lastPaymentAt,paymentCount:payments.length
 };
 row.balance=row.agreedPrice-row.paid;
 row.noPrice=row.agreedPrice<=EPS;
 row.status=classify(row);
 return row;
}

function emptyTotals(){return {contract:{},paid:{},balance:{}};}
function addTotals(totals,row){
 ['contract','paid','balance'].forEach(key=>{totals[key][row.currency]=(totals[key][row.currency]||0)+(key==='contract'?row.agreedPrice:row[key]);});
}

function programs(rows){
 const map=new Map();
 rows.forEach(row=>{
  if(!map.has(row.programId))map.set(row.programId,{id:row.programId,title:row.programTitle,date:row.programDate,count:0,counts:{paid:0,partial:0,unpaid:0},totals:emptyTotals()});
  const program=map.get(row.programId);
  program.count+=1;program.counts[row.status]+=1;addTotals(program.totals,row);
 });
 return [...map.values()].sort((a,b)=>String(b.date).localeCompare(String(a.date))||a.title.localeCompare(b.title,'tr'));
}

function summarize(rows){
 const result={count:rows.length,counts:{paid:0,partial:0,unpaid:0},totals:emptyTotals()};
 rows.forEach(row=>{result.counts[row.status]+=1;addTotals(result.totals,row);});
 return result;
}

function sortRows(rows){
 return [...rows].sort((a,b)=>String(b.programDate).localeCompare(String(a.programDate))||a.programTitle.localeCompare(b.programTitle,'tr')||a.name.localeCompare(b.name,'tr'));
}

function filter(rows,{programId='',status='all',query=''}={}){
 const q=norm(query);
 return sortRows(rows.filter(row=>(!programId||row.programId===programId)&&(status==='all'||row.status===status)&&(!q||norm([row.name,row.phone,row.programTitle].join(' ')).includes(q))));
}

function currencyText(values,formatMoney){
 const parts=CURRENCIES.filter(c=>Math.abs(num(values[c]))>0.0001).map(c=>formatMoney(values[c],c));
 return parts.length?parts.join(' / '):'—';
}

function fileName(programTitle,date=new Date()){
 const slug=String(programTitle||'tum-programlar').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü]+/gi,'-').replace(/^-+|-+$/g,'')||'program';
 const day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 return `odeme-durumu-${slug}-${day}.xlsx`;
}

const isoToDate=value=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(value||''));return m?new Date(Date.UTC(+m[1],+m[2]-1,+m[3])):null;};

function buildWorkbook(ExcelJS,rows,{companyName='',programTitle='',generatedAt=new Date()}={}){
 const workbook=new ExcelJS.Workbook();
 workbook.creator=companyName;workbook.created=generatedAt;
 const sorted=sortRows(rows),list=programs(sorted),multi=list.length>1;
 const scope=programTitle||(multi?'Tüm Programlar':(list[0]?.title||''));
 const thin={style:'thin',color:{argb:'FFD6DCD8'}};
 const border={top:thin,left:thin,bottom:thin,right:thin};
 const money='#,##0.00';
 const title=(sheet,text,width)=>{
  sheet.mergeCells(1,1,1,width);
  const cell=sheet.getCell(1,1);
  cell.value=`${String(companyName).toLocaleUpperCase('tr-TR')} • ${text.toLocaleUpperCase('tr-TR')}`;
  cell.font={bold:true,size:14,color:{argb:'FF1C2B2E'}};cell.alignment={vertical:'middle'};
  sheet.getRow(1).height=28;
  sheet.mergeCells(2,1,2,width);
  const sub=sheet.getCell(2,1);
  sub.value=`${scope} • Hazırlanma: ${generatedAt.toLocaleDateString('tr-TR')} ${generatedAt.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}`;
  sub.font={size:10,color:{argb:'FF66757A'}};
 };
 const header=(sheet,rowNo,values,color)=>{
  const row=sheet.getRow(rowNo);row.values=values;row.height=22;
  row.eachCell(cell=>{cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+color}};cell.alignment={vertical:'middle',horizontal:'center',wrapText:true};cell.border=border;});
 };
 const setup=(sheet,landscape)=>{sheet.pageSetup={orientation:landscape?'landscape':'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,paperSize:9,margins:{left:0.3,right:0.3,top:0.4,bottom:0.4,header:0.15,footer:0.15}};};

 // Özet: program + para birimi başına bir satır.
 const summary=workbook.addWorksheet('Özet',{views:[{showGridLines:false,state:'frozen',ySplit:4}]});
 setup(summary,true);
 const summaryCols=['PROGRAM','TARİH','YOLCU','TAMAMINI ÖDEYEN','KISMİ ÖDEYEN','HİÇ ÖDEMEYEN','PARA BİRİMİ','TOPLAM ÜCRET','TAHSİL EDİLEN','KALAN'];
 title(summary,'Ödeme Durumu Raporu',summaryCols.length);
 header(summary,4,summaryCols,'1C4A52');
 [36,14,9,15,13,14,12,16,16,16].forEach((w,i)=>{summary.getColumn(i+1).width=w;});
 list.forEach(program=>{
  const currencies=CURRENCIES.filter(c=>Math.abs(num(program.totals.contract[c]))>0.0001||Math.abs(num(program.totals.paid[c]))>0.0001);
  (currencies.length?currencies:['TRY']).forEach((currency,index)=>{
   const row=summary.addRow([index?'':program.title,index?'':(isoToDate(program.date)||''),index?'':program.count,index?'':program.counts.paid,index?'':program.counts.partial,index?'':program.counts.unpaid,currency,num(program.totals.contract[currency]),num(program.totals.paid[currency]),num(program.totals.balance[currency])]);
   row.eachCell({includeEmpty:true},cell=>{cell.border=border;cell.alignment={vertical:'middle'};});
   [8,9,10].forEach(c=>{row.getCell(c).numFmt=money;});row.getCell(2).numFmt='dd.mm.yyyy';
   row.getCell(4).font={bold:true,color:{argb:'FF1F7A45'}};row.getCell(5).font={bold:true,color:{argb:'FF9A6200'}};row.getCell(6).font={bold:true,color:{argb:'FFA23B32'}};
  });
 });
 if(!list.length)summary.addRow(['Bu kapsamda yolcu kaydı yok.']);

 const detailCols=[
  ['NO',6],['AD SOYAD',30],['TELEFON',16],...(multi?[['PROGRAM',30],['PROGRAM TARİHİ',13]]:[]),['ODA',8],['PARA BİRİMİ',10],['ÜCRET',14],['ÖDENEN',14],['KALAN',14],['SON ÖDEME',13],['ÖDEME SAYISI',10],['DURUM',16]
 ];
 const addDetail=(name,items,color,fill)=>{
  const sheet=workbook.addWorksheet(name,{views:[{showGridLines:false,state:'frozen',ySplit:4}]});
  setup(sheet,true);
  title(sheet,name,detailCols.length);
  header(sheet,4,detailCols.map(c=>c[0]),color);
  detailCols.forEach((c,i)=>{sheet.getColumn(i+1).width=c[1];});
  items.forEach((item,index)=>{
   const info=statusInfo(item.status);
   const values=[index+1,item.name,item.phone,...(multi?[item.programTitle,isoToDate(item.programDate)||'']:[]),item.roomPeople?`${item.roomPeople} kişilik`:'',item.currency,item.agreedPrice,item.paid,item.balance,isoToDate(item.lastPaymentAt)||'',item.paymentCount,item.noPrice&&item.status==='unpaid'?'Ücret girilmemiş':info.short];
   const row=sheet.addRow(values);
   row.eachCell({includeEmpty:true},cell=>{cell.border=border;cell.alignment={vertical:'middle'};});
   const base=multi?7:5;
   [base+1,base+2,base+3].forEach(c=>{row.getCell(c).numFmt=money;});
   row.getCell(base+4).numFmt='dd.mm.yyyy';if(multi)row.getCell(5).numFmt='dd.mm.yyyy';
   const statusCell=row.getCell(detailCols.length);
   statusCell.font={bold:true,color:{argb:'FF'+info.color}};statusCell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+info.fill}};
   if(fill&&index%2===1)row.eachCell(cell=>{if(cell!==statusCell)cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF7F9F8'}};});
  });
  if(!items.length)sheet.addRow(['','Bu grupta yolcu yok.']);
  else sheet.autoFilter={from:{row:4,column:1},to:{row:4+items.length,column:detailCols.length}};
  return sheet;
 };
 addDetail('Tüm Yolcular',sorted,'1C4A52',true);
 STATUSES.forEach(s=>addDetail(s.sheet,sorted.filter(r=>r.status===s.id),s.color,true));
 return workbook;
}

function createPanel(options){
 const o=options||{};
 const root=o.root;if(!root)return {refresh(){}};
 const $=sel=>root.querySelector(sel);
 const esc=o.escapeHtml||(v=>String(v??''));
 const ui={programId:'',status:'all',query:''};
 let rows=[];
 try{const saved=JSON.parse(localStorage.getItem('turizmPaymentStatusV1')||'{}');if(STATUSES.some(s=>s.id===saved.status)||saved.status==='all')ui.status=saved.status;}catch(e){}
 const remember=()=>{try{localStorage.setItem('turizmPaymentStatusV1',JSON.stringify({status:ui.status}));}catch(e){}};

 function renderPrograms(list){
  const select=$('[data-ps-program]');if(!select)return;
  if(ui.programId&&!list.some(p=>p.id===ui.programId))ui.programId='';
  select.innerHTML=(list.length>1?`<option value="">Tüm programlar (${list.reduce((n,p)=>n+p.count,0)} yolcu)</option>`:'')+list.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}${p.date?` • ${esc(o.formatDate?o.formatDate(p.date):p.date)}`:''} (${p.count})</option>`).join('');
  if(list.length===1)ui.programId=list[0].id;
  select.value=ui.programId;
  select.closest('label').hidden=list.length<2;
 }

 function renderTabs(summary){
  const tabs=$('[data-ps-tabs]');if(!tabs)return;
  const items=[{id:'all',label:'Tümü',count:summary.count},...STATUSES.map(s=>({id:s.id,label:s.label,count:summary.counts[s.id]}))];
  tabs.innerHTML=items.map(t=>`<button type="button" class="ps-tab ps-${t.id}${ui.status===t.id?' active':''}" data-ps-status="${t.id}" aria-pressed="${ui.status===t.id}"><span>${esc(t.label)}</span><b>${t.count}</b></button>`).join('');
 }

 function renderTotals(summary){
  const box=$('[data-ps-totals]');if(!box)return;
  const fm=o.formatMoney||((v,c)=>`${v} ${c}`);
  const paidShare=summary.count?Math.round((summary.counts.paid/summary.count)*100):0;
  box.innerHTML=`<span><small>Toplam ücret</small><b>${esc(currencyText(summary.totals.contract,fm))}</b></span><span><small>Tahsil edilen</small><b>${esc(currencyText(summary.totals.paid,fm))}</b></span><span><small>Kalan</small><b>${esc(currencyText(summary.totals.balance,fm))}</b></span><span class="ps-progress" title="Tamamını ödeyen yolcu oranı"><small>Tamamını ödeyen</small><b>%${paidShare}</b><i style="--ps-share:${paidShare}%"></i></span>`;
 }

 function renderTable(items,multi){
  const box=$('[data-ps-table]');if(!box)return;
  const fm=o.formatMoney||((v,c)=>`${v} ${c}`),fd=o.formatDate||(v=>v);
  if(!items.length){box.innerHTML=`<div class="empty small">${rows.length?'Bu filtrede yolcu yok.':'Ödeme durumu göstermek için yolcu kaydı ekleyin.'}</div>`;return;}
  const canOpen=o.canOpen?o.canOpen():false;
  box.innerHTML=`<table class="ps-table"><thead><tr><th>#</th><th>Yolcu</th>${multi?'<th>Program</th>':''}<th>Oda</th><th class="num">Ücret</th><th class="num">Ödenen</th><th class="num">Kalan</th><th>Son ödeme</th><th>Durum</th>${canOpen?'<th></th>':''}</tr></thead><tbody>${items.map((r,i)=>{
   const info=statusInfo(r.status);
   const badge=r.noPrice&&r.status==='unpaid'?'Ücret girilmemiş':r.balance<-EPS?'Fazla ödeme':info.short;
   return `<tr class="ps-row ps-${r.status}"><td data-label="#">${i+1}</td><td data-label="Yolcu"><b>${esc(r.name)}</b>${r.phone?`<small>${esc(r.phone)}</small>`:''}</td>${multi?`<td data-label="Program">${esc(r.programTitle)}${r.programDate?`<small>${esc(fd(r.programDate))}</small>`:''}</td>`:''}<td data-label="Oda">${r.roomPeople?`${esc(r.roomPeople)} kişilik`:'—'}</td><td class="num" data-label="Ücret">${r.noPrice?'—':esc(fm(r.agreedPrice,r.currency))}</td><td class="num" data-label="Ödenen">${r.paid>EPS?esc(fm(r.paid,r.currency)):'—'}</td><td class="num ps-balance" data-label="Kalan">${r.noPrice?'—':esc(fm(Math.max(r.balance,0),r.currency))}</td><td data-label="Son ödeme">${r.lastPaymentAt?esc(fd(r.lastPaymentAt)):'—'}${r.paymentCount>1?`<small>${r.paymentCount} ödeme</small>`:''}</td><td data-label="Durum"><span class="ps-badge ps-${r.status}">${esc(badge)}</span></td>${canOpen?`<td class="ps-actions"><button class="icon-btn" type="button" data-open-debtor="${esc(r.passengerId)}" data-debtor-list="${esc(r.listId)}" data-debtor-name="${esc(r.name)}">Ödeme Aç</button></td>`:''}</tr>`;
  }).join('')}</tbody></table>`;
 }

 function refresh(){
  rows=(o.getRows?o.getRows():[]).map(makeRow);
  const list=programs(rows);
  renderPrograms(list);
  const scoped=rows.filter(r=>!ui.programId||r.programId===ui.programId);
  const summary=summarize(scoped);
  renderTabs(summary);renderTotals(summary);
  const multi=!ui.programId&&list.length>1;
  renderTable(filter(scoped,{status:ui.status,query:ui.query}),multi);
  const excel=$('[data-ps-excel]');if(excel){excel.hidden=!(o.canExport?o.canExport():true);excel.disabled=!scoped.length;}
 }

 async function exportExcel(){
  if(o.canExport&&!o.canExport()){o.toast?.('Excel indirme yetkin yok.');return;}
  const ExcelJS=o.ExcelJS?o.ExcelJS():root.ownerDocument?.defaultView?.ExcelJS;
  if(!ExcelJS){o.toast?.('Excel hazırlama bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');return;}
  const scoped=rows.filter(r=>!ui.programId||r.programId===ui.programId);
  if(!scoped.length){o.toast?.('İndirilecek yolcu yok.');return;}
  const programTitle=ui.programId?(scoped[0]?.programTitle||''):'';
  try{
   const workbook=buildWorkbook(ExcelJS,scoped,{companyName:o.companyName?o.companyName():'',programTitle});
   const buffer=await workbook.xlsx.writeBuffer();
   const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
   const link=document.createElement('a');
   link.href=URL.createObjectURL(blob);link.download=fileName(programTitle||'tum-programlar');
   document.body.appendChild(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(link.href),2000);
   o.toast?.('Ödeme durumu Excel olarak indirildi.');
  }catch(error){console.error('Ödeme durumu Excel hazırlanamadı.',error);o.toast?.('Excel dosyası hazırlanamadı.');}
 }

 root.addEventListener('click',event=>{
  const tab=event.target.closest('[data-ps-status]');
  if(tab){ui.status=tab.dataset.psStatus;remember();refresh();return;}
  if(event.target.closest('[data-ps-excel]'))exportExcel();
 });
 root.addEventListener('change',event=>{if(event.target.matches('[data-ps-program]')){ui.programId=event.target.value;refresh();}});
 root.addEventListener('input',event=>{if(event.target.matches('[data-ps-search]')){ui.query=event.target.value;refresh();}});
 return {refresh,exportExcel};
}

const api={STATUSES,classify,makeRow,programs,summarize,filter,buildWorkbook,fileName,createPanel};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TurizmPaymentStatus=api;
})(typeof window==='undefined'?globalThis:window);
