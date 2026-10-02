(function(root){
'use strict';
const P=typeof module!=='undefined'&&module.exports?require('./bus-plan'):root.TurizmBusPlan;
const C=typeof module!=='undefined'&&module.exports?require('./bus-companies'):root.TurizmBusCompanies;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function buildPrintHtml({model,buses,showRows=true}){
 const people=new Map(model.people.map(p=>[p.id,p]));
 const pages=[];
 for(const bus of buses){
   const layout={...P.seats(bus),rows:P.numberedRows(bus)},chunks=[];
   const rowsPerPage=Math.max(layout.leftPerRow,layout.rightPerRow)>2?10:12;
   for(let i=0;i<layout.rows.length;i+=rowsPerPage)chunks.push(layout.rows.slice(i,i+rowsPerPage));
   if(!chunks.length)chunks.push([]);
   const seat=n=>n?`<div class="seat"><b>${esc(P.seatLabel(bus,n))}</b><span>${esc(people.get(bus.assignments[n])?.name||(P.isStaff(bus,n)?'Görevli':'Boş'))}</span>${people.get(bus.assignments[n])?.company?`<small>${esc(C.names[people.get(bus.assignments[n]).company])}</small>`:''}</div>`:'<div></div>';
   chunks.forEach((rows,index)=>{
     pages.push(`<section class="sheet"><header><div><div class="print-company-logos">${(model.logos||[]).map(logo=>`<img src="${esc(logo.url)}" alt="${esc(logo.name)}">`).join('')}</div><small>${esc(model.companyName)}</small><h1>${esc(model.tourTitle)}</h1><h2>${esc(bus.name)} · Koltuk planı</h2></div><p>${Object.keys(bus.assignments).length} yolcu · ${bus.capacity} koltuk<br>${index+1} / ${chunks.length} sayfa</p></header>${bus.companyRule?`<p class="company-sides"><span>${esc(C.names[bus.companyRule.mode==='split'?bus.companyRule.left:bus.companyRule.mode]||'Serbest')} · Sol</span><span>${esc(C.names[bus.companyRule.mode==='split'?C.rightCompany(bus.companyRule):bus.companyRule.mode]||'Serbest')} · Sağ</span></p>`:''}<div class="front"><span class="captain">◉ KAPTAN</span><span>${index?'DEVAM SAYFASI':'ÖN KAPI'}</span></div><div class="cabin">${rows.map(r=>`<div class="row">${['left','right'].map((which,i)=>`${i?'<span class="aisle"></span>':''}<div class="side" style="grid-template-columns:repeat(${which==='left'?layout.leftPerRow:layout.rightPerRow},minmax(0,1fr))">${r.door&&r.doorSide===which?'<div class="door">ORTA KAPI</div>':(showRows&&r[which+'Row']?'<small class="row-label">'+(which==='left'?'Sol ':'Sağ ')+r[which+'Row']+'. sıra</small>':'')+r[which].map(seat).join('')}</div>`).join('')}</div>`).join('')}${index===chunks.length-1?`<div class="rear" style="grid-template-columns:repeat(${layout.rear.length||1},minmax(0,1fr))">${showRows&&layout.rear.length?'<small class="row-label">Arka sıra</small>':''}${layout.rear.map(seat).join('')}</div>`:''}</div><footer>${index===chunks.length-1?'Arka bölüm':'Koltuk planı sonraki sayfada devam eder'} · ${esc(bus.name)}</footer></section>`);
   });
 }
 return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(model.tourTitle)} — Otobüs planı</title><style>
 .row-label{grid-column:1/-1;font-size:7pt;line-height:1.2;color:#587068;text-align:center}.print-company-logos{display:flex;gap:12px;flex-wrap:wrap}.print-company-logos img{width:95px;height:34px;object-fit:contain}*{box-sizing:border-box}body{margin:0;background:#e9eeeb;color:#172d25;font-family:Arial,sans-serif}.toolbar{position:sticky;top:0;z-index:2;background:#173f34;color:#fff;padding:14px;display:flex;justify-content:center;align-items:center;gap:15px;flex-wrap:wrap}.toolbar button{padding:12px 22px;background:white;border:0;border-radius:8px;color:#174b36;font-weight:bold;cursor:pointer}.toolbar p{margin:0;font-size:13px}.sheet{width:210mm;min-height:297mm;padding:10mm;margin:20px auto;background:#fff;break-after:page}.sheet:last-child{break-after:auto}header{display:flex;justify-content:space-between;align-items:start;gap:10mm;border-bottom:1px solid #899e91;padding-bottom:4mm;margin-bottom:4mm}header small{font-size:9pt}h1{font-size:15pt;margin:2mm 0}h2{font-size:11pt;margin:2mm 0 0}header p{font-size:9pt;text-align:right;white-space:nowrap;line-height:1.5}.front{display:flex;justify-content:space-between;background:#eff4f0;padding:4mm;border:1px solid #899e91;border-radius:12mm 12mm 0 0;font-size:9pt}.cabin{border-left:1px solid #899e91;border-right:1px solid #899e91;padding:3mm;background:#fff}.row{display:grid;grid-template-columns:minmax(0,1fr) 12mm minmax(0,1fr);gap:1.5mm;margin-bottom:2mm;break-inside:avoid}.side{display:grid;gap:1.5mm;min-width:0}.captain{padding:3mm 6mm;border:1px solid #899e91;border-radius:5mm;background:white}.seat{border:1px solid #93a99b;border-radius:2mm;min-height:11mm;padding:1mm;font-size:9pt;line-height:1;text-align:center;background:#fafcf9;break-inside:avoid}.company-sides{display:flex;justify-content:space-between;font-size:8pt}.seat small{display:block;font-size:6pt;line-height:1.1;margin-top:.5mm;color:#4f695b}.seat b{font-size:9pt}.seat span{display:block;font-size:7pt;line-height:1.1;overflow-wrap:anywhere;margin-top:.5mm}.aisle{background:#eff4f0}.door{grid-column:1/-1;min-height:12mm;border:1px dashed #b7a783;display:grid;place-items:center;font-size:8pt;background:#fcf9f1}.rear{display:grid;gap:1.5mm;margin-top:3mm}footer{text-align:center;font-size:8pt;padding:3mm;border:1px solid #899e91;border-top:0;border-radius:0 0 7mm 7mm}@page{size:A4 portrait;margin:10mm}@media print{body{background:#fff}.toolbar{display:none}.sheet{width:100%;min-height:0;padding:0;margin:0}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}@media screen and (max-width:820px){.sheet{margin:12px 0}.toolbar{justify-content:flex-start}}
 .rows-shown .row{margin-bottom:1.5mm}.rows-shown .side{gap:1mm}.rows-shown .seat{min-height:10mm}.rows-shown .row-label{font-size:6.5pt;line-height:1}
 </style></head><body class="${showRows?'rows-shown':''}"><div class="toolbar"><button id="printBusPage" type="button">Yazdır / PDF kaydet</button><p>Ekrandaki planın çıktısıdır. Yazdırma penceresinden yazıcınızı veya PDF olarak kaydetmeyi seçin.</p></div>${pages.join('')}</body></html>`;
}
if(typeof module!=='undefined'&&module.exports)module.exports={buildPrintHtml};
root.printBusPlans=function(options){
 const origin=document.activeElement,dialog=document.createElement('dialog');dialog.className='bus-print-preview';dialog.setAttribute('aria-label','Otobüs çıktı ön izlemesi');
 dialog.innerHTML='<div class="bus-print-toolbar"><strong>Otobüs çıktı ön izlemesi</strong><label><input type="checkbox" data-row-print>Sıra bilgisi</label><button type="button" data-print disabled>Yazdır / PDF kaydet</button><button type="button" data-close>Ön izlemeyi kapat</button></div><iframe title="Otobüs koltuk planı çıktısı"></iframe>';
 document.body.append(dialog);
 const frame=dialog.querySelector('iframe'),button=dialog.querySelector('[data-print]');
 frame.onload=()=>{button.disabled=false;frame.contentDocument.querySelector('.toolbar')?.remove();};
 const rows=dialog.querySelector('[data-row-print]');rows.checked=options.showRows!==false;
 rows.onchange=()=>{options.showRows=rows.checked;options.onShowRows?.(rows.checked);frame.srcdoc=buildPrintHtml(options);};
 frame.srcdoc=buildPrintHtml(options);
 button.onclick=()=>{frame.contentWindow.focus();frame.contentWindow.print();};
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{dialog.remove();origin?.focus({preventScroll:true});},{once:true});
 dialog.showModal();
};
})(typeof window==='undefined'?globalThis:window);
