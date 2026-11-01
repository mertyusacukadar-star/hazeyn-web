const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const N=require('../public/nusuk-tracking'),Server=require('../api/_nusuk'),Auth=require('../api/_appAuth'),ExcelJS=require('../public/vendor/exceljs.min.js');

// Yaş ve 5 yaş sınırı
assert.equal(N.ageOn('2021-11-20','2026-11-19'),4);assert.equal(N.ageOn('2021-11-20','2026-11-20'),5);assert.equal(N.ageOn('',''),null);

// Sentetik aile: baba (Kendisi), anne (Eşi), kız 3 yaş (Kızı → babaya bağlı), oğul 4 yaş (Oğlu → anneye bağlı), 6 yaş çocuk, eşleşmeyen çocuk
const p=(id,name,extra={})=>({id,name,gender:'',birthDate:'1980-01-01',passportNo:'',...extra});
const list={id:'l1',tourId:'t1',passengers:[
 p('dad','Ahmet Örnek',{gender:'Erkek',relationship:'Kendisi',passportNo:'U11111111',nusuk:{booked:true,date:'2026-11-22',time:'10:00',visaNo:'6000000001'}}),
 p('mom','Ayşe Örnek',{gender:'Kadın',relationship:'Eşi',relativePassengerId:'dad',passportNo:'U22222222'}),
 p('girl','Elif Örnek',{relationship:'Kızı',relativePassengerId:'dad',birthDate:'2023-05-01'}),
 p('boy','Ali Örnek',{relationship:'Oğlu',relativePassengerId:'mom',birthDate:'2022-01-01'}),
 p('big','Zeynep Örnek',{gender:'Kadın',relationship:'Kızı',relativePassengerId:'dad',birthDate:'2020-01-01'}),
 p('lone','Can Yalnız',{gender:'Erkek',birthDate:'2024-02-02'})
]};
const tour={id:'t1',title:'Kasım Umre',departureDate:'2026-11-20',type:'umre'};
const rows=N.tourRows([list,{id:'other',tourId:'x',passengers:[p('o','Başka Tur')]}],tour);
assert.deepEqual(rows.adults.map(r=>r.passengerId).sort(),['big','dad','mom'],'6 yaş randevu alır; başka turun yolcusu yok');
assert.deepEqual(rows.children.map(r=>r.passengerId).sort(),['boy','girl','lone']);
const kid=id=>rows.children.find(r=>r.passengerId===id);
assert.equal(kid('girl').role,'mother');assert.equal(kid('girl').escort.id,'mom','kız çocuk babaya bağlı olsa da annesiyle girer');
assert.equal(kid('boy').role,'father');assert.equal(kid('boy').escort.id,'dad','erkek çocuk anneye bağlı olsa da babasıyla girer');
assert.equal(kid('lone').escort,null,'bağlı ebeveyn yoksa uyarı');
const s=N.summarize(rows);assert.deepEqual([s.total,s.booked,s.pending,s.noVisa,s.children],[3,1,2,2,3]);
assert.deepEqual(N.filterRows(rows.adults,{filter:'pending'}).map(r=>r.passengerId).sort(),['big','mom']);
assert.deepEqual(N.filterRows(rows.adults,{query:'u2222'}).map(r=>r.passengerId),['mom'],'pasaport no ile arama');
assert.deepEqual(N.filterRows(rows.adults,{query:'ayse'}).map(r=>r.passengerId),['mom'],'Türkçe harf duyarsız arama');

// Vize sayfası metni (gerçek düzenle aynı konumlar, sentetik değerler)
const items=[
 {str:'Visa No.',x:192,y:103},{str:'6012345678',x:344,y:105},{str:'Date of Issue',x:192,y:127},{str:'01/10/2026',x:345,y:129},
 {str:'Passport No.',x:192,y:205},{str:'U12345678',x:345,y:207},{str:'Name',x:34,y:293},{str:'AHMET',x:255,y:295},{str:'ÖRNEK',x:290,y:295},
 {str:'Birth Date',x:34,y:341},{str:'01/01/1980',x:265,y:343},{str:'Visa No.',x:128,y:462},{str:'6012345678',x:259,y:477},
 {str:'V<SAUORNEK<<AHMET'.padEnd(44,'<'),x:149,y:635},{str:'U12345678<9TUR8001017M2701015'.padEnd(42,'<')+'02',x:149,y:648}
];
let parsed=N.parseVisaItems(items);
assert.equal(parsed.visaNo,'6012345678');assert.equal(parsed.passportNo,'U12345678');assert.equal(parsed.birthDate,'1980-01-01');assert.equal(parsed.name,'AHMET ORNEK');
parsed=N.parseVisaItems(items.filter(i=>!['Passport No.','U12345678','Name','AHMET','ÖRNEK'].includes(i.str)));
assert.equal(parsed.passportNo,'U12345678','MRZ yedeği');assert.equal(parsed.name,'AHMET ORNEK','MRZ isim yedeği');

// Eşleştirme: pasaport önce, sonra ad-soyad; belirsizlikte atanmaz
const cands=rows.adults.concat(rows.children);
assert.equal(N.matchPassenger({passportNo:'U22222222',name:'X Y'},cands).row.passengerId,'mom');
assert.equal(N.matchPassenger({passportNo:'',name:'AHMET ORNEK'},cands).by,'name');
assert.equal(N.matchPassenger({passportNo:'',name:'ORNEK'},cands).row,null,'tek kelime yetmez');
const twins=[{key:'a',passenger:{id:'a',name:'Mehmet Kaya',birthDate:'1990-01-01'},nusuk:{}},{key:'b',passenger:{id:'b',name:'Mehmet Kaya',birthDate:'1991-01-01'},nusuk:{}}];
assert.equal(N.matchPassenger({name:'MEHMET KAYA'},twins).by,'ambiguous');assert.equal(N.matchPassenger({name:'MEHMET KAYA',birthDate:'1991-01-01'},twins).row.key,'b');

(async()=>{
 // Excel: şifre sütunları yalnız yetkili çıktısında
 const withCreds=N.buildWorkbook(ExcelJS,{...rows,adults:rows.adults.map(r=>r.passengerId==='dad'?{...r,nusuk:{...r.nusuk,email:'a@b.c',password:'gizli'}}:r)},{companyName:'Örnek',tourTitle:'Kasım Umre',includeCredentials:true});
 assert.deepEqual(withCreds.worksheets.map(w=>w.name),['Tüm Yolcular','Randevu Alınanlar','Randevu Alınmayanlar','5 Yaş ve Altı']);
 assert.equal(withCreds.getWorksheet('Tüm Yolcular').getRow(3).getCell(8).value,'NUSUK ŞİFRE');
 const plain=N.buildWorkbook(ExcelJS,rows,{companyName:'Örnek',tourTitle:'Kasım Umre'});
 assert.ok(!plain.getWorksheet('Tüm Yolcular').getRow(3).values.includes('NUSUK ŞİFRE'));
 assert.equal(plain.getWorksheet('Randevu Alınanlar').getRow(4).getCell(2).value,'Ahmet Örnek');
 assert.match(String(plain.getWorksheet('5 Yaş ve Altı').getRow(4).getCell(5).value),/^(Annesi|Babası): |Eşleşen ebeveyn yok/);
 const buf=await plain.xlsx.writeBuffer();const back=new ExcelJS.Workbook();await back.xlsx.load(buf);assert.equal(back.worksheets.length,4);

 // Sunucu: yetkisiz çalışana şifre gitmez, kayıtta korunur, değiştirilemez
 const state=()=>({passengerLists:[{id:'l1',passengers:[{id:'dad',name:'Ahmet',nusuk:{email:'a@b.c',password:'gizli',booked:false,visaPage:'hazeyn/nusuk/t1/l1/dad/visa-1.jpg'}}]}]});
 const owner={kind:'desktop',user:{role:'owner'}},clerk={kind:'desktop',user:{role:'employee',permissions:{viewPassengers:true,managePassengers:true}}},nusukClerk={kind:'desktop',user:{role:'employee',permissions:{viewPassengers:true,manageNusuk:true}}};
 const has=Auth.hasUserPermission;
 const red=Server.redactForClient(state(),clerk,has).passengerLists[0].passengers[0].nusuk;
 assert.equal(red.password,undefined);assert.equal(red.email,undefined);assert.deepEqual(red.storedCredentials,['email','password']);
 assert.equal(Server.redactForClient(state(),owner,has).passengerLists[0].passengers[0].nusuk.password,'gizli');
 assert.equal(Server.redactForClient(state(),nusukClerk,has).passengerLists[0].passengers[0].nusuk.password,'gizli');
 // Yetkisiz kullanıcının gizlenmiş durumu geri kaydetmesi şifreyi silmez; yaptığı Nusuk değişikliği uygulanmaz
 const fromClerk=Server.redactForClient(state(),clerk,has);fromClerk.passengerLists[0].passengers[0].nusuk.booked=true;
 const savedClerk=Server.preserveOnSave(fromClerk,state(),clerk,has).passengerLists[0].passengers[0].nusuk;
 assert.equal(savedClerk.password,'gizli');assert.equal(savedClerk.booked,false);assert.equal(savedClerk.credentialsHidden,undefined);
 // Nusuk alanını hiç bilmeyen eski istemci bilgiyi silemez
 const oldClient={passengerLists:[{id:'l1',passengers:[{id:'dad',name:'Ahmet'}]}]};
 assert.equal(Server.preserveOnSave(oldClient,state(),owner,has).passengerLists[0].passengers[0].nusuk.visaPage,'hazeyn/nusuk/t1/l1/dad/visa-1.jpg');
 // Yetkili değişiklik uygulanır; değişiklik izin kontrolüne takılır
 const edit=state();edit.passengerLists[0].passengers[0].nusuk.booked=true;
 assert.equal(Server.preserveOnSave(edit,state(),nusukClerk,has).passengerLists[0].passengers[0].nusuk.booked,true);
 assert.ok(Server.changed(edit,state()));
 assert.throws(()=>Auth.assertStateChangeAllowed(edit,state(),clerk),/Nusuk/);
 assert.doesNotThrow(()=>Auth.assertStateChangeAllowed(edit,state(),nusukClerk),'yolcu yönetme yetkisi olmadan Nusuk düzenlenebilir');
 const filtered=Auth.filterStateByPermissions(JSON.parse(JSON.stringify(edit)),state(),nusukClerk);
 assert.equal(filtered.passengerLists[0].passengers[0].nusuk.booked,true,'yolcu listesi geri yüklenirken Nusuk değişikliği korunur');
 // Yeni çalışanlara hassas yetki varsayılan olarak verilmez
 assert.equal(Auth.normalizePermissions(null).manageNusuk,false);assert.equal(Auth.normalizePermissions({manageNusuk:true}).manageNusuk,true);
 // Dosya yolları firmaya bağlı
 const pathOk=Server.objectPath('hazeyn',{tourId:'t1',listId:'l1',passengerId:'dad',kind:'photo'});
 assert.match(pathOk,/^hazeyn\/nusuk\/t1\/l1\/dad\/photo-\d+-[a-z0-9]+\.jpg$/);
 assert.equal(Server.objectPath('hazeyn',{tourId:'',listId:'l1',passengerId:'dad'}),'');
 assert.ok(Server.ownsPath('hazeyn',pathOk));assert.ok(!Server.ownsPath('hakikat',pathOk),'başka firmanın dosyası açılamaz');assert.ok(!Server.ownsPath('hazeyn','hazeyn/nusuk/../../x.jpg'));

 // İstemci bağlantıları
 const app=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8'),html=fs.readFileSync(path.join(__dirname,'../public/admin.html'),'utf8'),data=fs.readFileSync(path.join(__dirname,'../api/data.js'),'utf8');
 assert.match(app,/tr\._nusuk = p\.nusuk \? clone\(p\.nusuk\) : null/);assert.match(app,/\.\.\.\(tr\._nusuk \? \{ nusuk: clone\(tr\._nusuk\) \} : \{\}\)/,'yolcu düzenleyicisi Nusuk alanını silmez');
 assert.match(app,/OPT_IN_APP_PERMISSIONS = \['manageRecovery', 'manageNusuk'\]/);
 assert.match(html,/data-tab="nusuk"/);assert.match(html,/id="nusukPanel"/);assert.match(html,/data-app-permission="manageNusuk"/);
 assert.ok(html.indexOf('nusuk-tracking.js')<html.indexOf('src="app.js'));
 assert.equal((data.match(/Nusuk\.redactForClient\(/g)||[]).length,3,'GET, baseline ve kayıt yanıtı şifreyi gizler');
 assert.match(data,/Nusuk\.preserveOnSave\(dataToSave, previousState, authorization, hasUserPermission\)/);
 const W=require('../public/workspace-ui');assert.deepEqual(W.parseRoute('#work/tour/t1/nusuk'),{id:'t1',tab:'nusuk'});
 console.log('nusuk tests passed');
})().catch(error=>{console.error(error);process.exit(1);});
