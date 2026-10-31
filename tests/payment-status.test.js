const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const S=require('../public/payment-status'),ExcelJS=require('../public/vendor/exceljs.min.js');
const pay=(amount,paidAt,extra={})=>({amount,paidAt,...extra});
const raw=[
 {programId:'umre',programTitle:'Ekim Umre',programDate:'2026-11-10',listId:'l1',passengerId:'a',name:'Ayşe Örnek',phone:'0500',roomPeople:'2',currency:'USD',agreedPrice:1500,paid:1500,payments:[pay(500,'2026-09-01'),pay(1000,'2026-10-02')]},
 {programId:'umre',programTitle:'Ekim Umre',programDate:'2026-11-10',listId:'l1',passengerId:'b',name:'Mehmet Kısmi',currency:'USD',agreedPrice:1500,paid:400,payments:[pay(400,'2026-09-15'),pay(999,'2026-10-20',{voided:true})]},
 {programId:'umre',programTitle:'Ekim Umre',programDate:'2026-11-10',listId:'l1',passengerId:'c',name:'Zeynep Borçlu',currency:'USD',agreedPrice:1500,paid:0,payments:[]},
 {programId:'umre',programTitle:'Ekim Umre',programDate:'2026-11-10',listId:'l1',passengerId:'d',name:'Ücretsiz Kayıt',currency:'USD',agreedPrice:0,paid:0,payments:[]},
 {programId:'kultur',programTitle:'Kapadokya',programDate:'2026-12-01',listId:'l2',passengerId:'e',name:'Ali Fazla',currency:'TRY',agreedPrice:10000,paid:12000,payments:[pay(12000,'2026-10-05')]}
];
const rows=raw.map(S.makeRow);
assert.deepEqual(rows.map(r=>r.status),['paid','partial','unpaid','unpaid','paid']);
assert.equal(rows[0].lastPaymentAt,'2026-10-02');assert.equal(rows[0].paymentCount,2);
assert.equal(rows[1].lastPaymentAt,'2026-09-15','iptal edilen ödeme son ödeme sayılmaz');assert.equal(rows[1].paymentCount,1);
assert.equal(rows[3].noPrice,true);assert.equal(rows[4].balance,-2000);
assert.equal(S.classify({agreedPrice:100,paid:99.999}),'paid');assert.equal(S.classify({agreedPrice:100,paid:0.001}),'unpaid');

const programs=S.programs(rows);
assert.deepEqual(programs.map(p=>p.id),['kultur','umre'],'en yeni tarihli program önce');
assert.deepEqual(programs[1].counts,{paid:1,partial:1,unpaid:2});assert.equal(programs[1].totals.balance.USD,1100+1500);
const summary=S.summarize(rows);assert.equal(summary.count,5);assert.equal(summary.totals.paid.TRY,12000);

assert.deepEqual(S.filter(rows,{programId:'umre',status:'unpaid'}).map(r=>r.passengerId),['d','c'],'Türkçe alfabe sırası: Ü, Z öncesinde');
assert.deepEqual(S.filter(rows,{query:'kisMI'}).map(r=>r.passengerId),['b'],'Türkçe harf ve büyük/küçük harf duyarsız arama');
assert.deepEqual(S.filter(rows,{status:'paid'}).map(r=>r.programId),['kultur','umre']);
assert.match(S.fileName('Ekim Umre',new Date(2026,9,31)),/^odeme-durumu-ekim-umre-2026-10-31\.xlsx$/);

(async()=>{
 const workbook=S.buildWorkbook(ExcelJS,rows,{companyName:'Örnek Turizm',generatedAt:new Date(2026,9,31,10,0)});
 assert.deepEqual(workbook.worksheets.map(s=>s.name),['Özet','Tüm Yolcular','Tamamını Ödeyenler','Kısmi Ödeyenler','Hiç Ödemeyenler']);
 const unpaid=workbook.getWorksheet('Hiç Ödemeyenler');
 assert.equal(unpaid.getRow(4).getCell(4).value,'PROGRAM','çok programlı raporda program sütunu var');
 assert.deepEqual([unpaid.getRow(5).getCell(2).value,unpaid.getRow(6).getCell(2).value].sort(),['Zeynep Borçlu','Ücretsiz Kayıt'].sort());
 const free=[5,6].map(n=>unpaid.getRow(n)).find(r=>r.getCell(2).value==='Ücretsiz Kayıt');assert.equal(free.getCell(13).value,'Ücret girilmemiş');
 const partial=workbook.getWorksheet('Kısmi Ödeyenler').getRow(5);assert.equal(partial.getCell(2).value,'Mehmet Kısmi');assert.equal(partial.getCell(9).value,400);assert.equal(partial.getCell(10).value,1100);
 const overview=workbook.getWorksheet('Özet');assert.equal(overview.getRow(5).getCell(1).value,'Kapadokya');assert.equal(overview.getRow(6).getCell(6).value,2);
 const single=S.buildWorkbook(ExcelJS,rows.filter(r=>r.programId==='umre'),{companyName:'Örnek Turizm',programTitle:'Ekim Umre'});
 const paidSheet=single.getWorksheet('Tamamını Ödeyenler');
 assert.equal(paidSheet.getRow(4).getCell(4).value,'ODA','tek programda program sütunu yok');
 assert.equal(paidSheet.getRow(5).getCell(2).value,'Ayşe Örnek');assert.equal(paidSheet.getRow(5).getCell(6).value,1500);
 const buffer=await single.xlsx.writeBuffer();assert.ok(buffer.byteLength>4000);
 const reread=new ExcelJS.Workbook();await reread.xlsx.load(buffer);assert.equal(reread.worksheets.length,5);

 const html=fs.readFileSync(path.join(__dirname,'../public/admin.html'),'utf8'),app=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8');
 assert.match(html,/id="paymentStatusSection"/);assert.match(html,/payment-status\.js\?v=/);assert.match(html,/payment-status\.css\?v=/);
 assert.ok(html.indexOf('payment-status.js')<html.indexOf('src="app.js'),'modül app.js öncesinde yüklenir');
 assert.match(app,/getRows: \(\) => state && hasPermission\('viewAccounting'\)/,'veri yüklenmeden panel çizilmez');assert.match(app,/if \(state\) paymentStatusPanel\.refresh\(\)/);
 assert.match(app,/canExport: \(\) => hasPermission\('viewAccounting'\) && hasPermission\('exportPassengerLists'\)/);
 assert.match(app,/workspacePassengerContexts\(\)\.map\(context => \{\s*const snapshot = passengerAccountSnapshot\(context\)/,'firma/tur kapsamı ve aynı bakiye hesabı kullanılır');
 const sw=fs.readFileSync(path.join(__dirname,'../public/service-worker.js'),'utf8');assert.match(sw,/\/payment-status\.js\?v=/);
 console.log('payment-status tests passed');
})().catch(error=>{console.error(error);process.exit(1);});
