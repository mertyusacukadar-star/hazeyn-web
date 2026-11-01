'use strict';
// Firmalar arası ortak Nusuk: gerçek /api/data işleyicisi, bellekte veritabanı, sentetik yolcular.
const assert=require('node:assert/strict'),DB=require('./memory-db');
process.env.DESKTOP_SESSION_SECRET='nusuk-shared-test-secret';
process.env.ADMIN_PASSWORD='synthetic-owner-pass';
const S=require('../api/_supabase');
const p=(id,name,gender,extra={})=>({id,name,gender,birthDate:'1980-01-01',passportNo:'',...extra});
const state=(tourId,title,date,listId,passengers,extraTours=[])=>({accountingTours:[{id:tourId,title,departureDate:date,type:'umre'},...extraTours],tours:[{id:tourId,title,departureDate:date,type:'umre'},...extraTours],passengerLists:[{id:listId,tourId,title:'Liste',passengers}],_meta:{updatedAt:1}});
const db=DB({
 main:{id:'main',updated_at:'2026-11-01T00:00:00.000Z',data:state('hz1','Hazeyn Kasım Umre','2026-11-20','hzl',[p('h1','Ahmet Örnek','Erkek',{nusuk:{email:'a@ornek.test',password:'gizli1'}}),p('h2','Ayşe Örnek','Kadın')],[{id:'hzk',title:'Kültür',type:'yurtici'}])},
 hakikat:{id:'hakikat',updated_at:'2026-11-01T00:00:00.000Z',data:state('hk1','Hakikat Kasım Umre','2026-11-20','hkl',[p('k1','Mehmet Deneme','Erkek')])},
 afyon:{id:'afyon',updated_at:'2026-11-01T00:00:00.000Z',data:state('af1','Afyon Kasım Umre','2026-11-21','afl',[p('a1','Fatma Test','Kadın'),p('a2','Ali Test','Erkek')])}
});
require.cache[require.resolve('../api/_supabase')].exports={...S,supabaseAdmin:()=>db};
delete require.cache[require.resolve('../api/_recovery')];
const A=require('../api/_appAuth'),handler=require('../api/data'),NS=require('../api/_nusukShared');

async function call(token,company,tourId,body){
 let status=200,result;
 await handler({method:body?'POST':'GET',query:{action:'nusuk-shared',company,tourId},headers:{authorization:'Bearer '+token},body},{setHeader(){},status(v){status=v;return this;},json(v){result=v;}});
 return {status,result};
}
const passenger=(row,list,id)=>db.rows[row].data.passengerLists.find(l=>l.id===list).passengers.find(x=>x.id===id);

(async()=>{
 const owner=(await A.login('admin','synthetic-owner-pass')).token;
 // Bağlantı yokken: birleştirilebilir, katalogda yalnız Umre/Hac programları
 let r=await call(owner,'hazeyn','hz1');
 assert.equal(r.status,200);assert.equal(r.result.canCombine,true);assert.equal(r.result.record,null);
 assert.deepEqual(Object.keys(r.result.catalog).sort(),['afyon','hakikat','hazeyn']);assert.deepEqual(r.result.catalog.hazeyn.map(t=>t.id),['hz1'],'yurt içi tur listelenmez');

 // Hazeyn + Afyon birleştir
 r=await call(owner,'hazeyn','hz1',{action:'create',sources:[{company:'hazeyn',tourId:'hz1'},{company:'afyon',tourId:'af1'}]});
 assert.equal(r.status,200,JSON.stringify(r.result));
 const rec=r.result.record;assert.deepEqual(rec.sources.map(s=>s.company),['hazeyn','afyon']);
 assert.deepEqual(r.result.lists.map(l=>`${l.company}:${l.passengers.length}`),['hazeyn:2','afyon:2']);
 assert.equal(r.result.lists[0].passengers[0].nusuk.password,'gizli1','sahip şifreyi görür');
 // Aynı program ikinci bir birleştirmeye giremez
 r=await call(owner,'hakikat','hk1',{action:'create',sources:[{company:'hakikat',tourId:'hk1'},{company:'afyon',tourId:'af1'}]});assert.equal(r.status,409);
 // Afyon tarafından açıldığında da aynı ortak kayıt görünür
 r=await call(owner,'afyon','af1');assert.equal(r.result.record.id,rec.id);

 // Ortak görünümden kayıt: her yolcu kendi firmasına yazılır, başka alanlar değişmez
 const before=JSON.stringify(db.rows.hakikat.data);
 r=await call(owner,'hazeyn','hz1',{action:'save',id:rec.id,changes:[{company:'afyon',listId:'afl',passengerId:'a1',patch:{date:'2026-11-23',time:'09:00',booked:true,name:'Değiştirilemez'}},{company:'hazeyn',listId:'hzl',passengerId:'h2',patch:{date:'2026-11-23',time:'09:00'}}]});
 assert.equal(r.status,200,JSON.stringify(r.result));
 assert.deepEqual(passenger('afyon','afl','a1').nusuk,{date:'2026-11-23',time:'09:00',booked:true});assert.equal(passenger('afyon','afl','a1').name,'Fatma Test','yalnız Nusuk alanları yazılır');
 assert.equal(passenger('main','hzl','h2').nusuk.time,'09:00');assert.equal(passenger('main','hzl','h1').nusuk.password,'gizli1');
 assert.equal(JSON.stringify(db.rows.hakikat.data),before,'birleştirmede olmayan firma değişmez');
 assert.ok(Object.keys(db.rows).some(k=>k.startsWith('recovery-v1:')),'yazmadan önce kurtarma kopyası alınır');
 // Başka firmanın vize dosyası ve birleştirmede olmayan yolcu reddedilir
 r=await call(owner,'hazeyn','hz1',{action:'save',id:rec.id,changes:[{company:'afyon',listId:'afl',passengerId:'a2',patch:{visaPage:'hazeyn/nusuk/hz1/hzl/h1/visa-1.jpg'}}]});assert.equal(r.status,400);
 r=await call(owner,'hazeyn','hz1',{action:'save',id:rec.id,changes:[{company:'hakikat',listId:'hkl',passengerId:'k1',patch:{date:'2026-11-23'}}]});assert.equal(r.status,400);
 r=await call(owner,'hazeyn','hz1',{action:'save',id:rec.id,changes:[{company:'afyon',listId:'afl',passengerId:'yok',patch:{date:'2026-11-23'}}]});assert.equal(r.status,409);

 // Çalışanlar: tek firmalı kısıtlı; Nusuk yetkisi olmayan görür ama şifreyi göremez ve kaydedemez
 const employee=async(username,companies,permissions)=>{await A.saveEmployee({username,displayName:username,password:'synthetic-pass',companies,permissions});return (await A.login(username,'synthetic-pass')).token;};
 const single=await employee('tekfirma',['hazeyn'],{viewPassengers:true,manageNusuk:true});
 r=await call(single,'hazeyn','hz1');assert.equal(r.result.restricted,true);assert.equal(r.result.record,null);assert.deepEqual(r.result.lists,[]);
 const viewer=await employee('gorur',['hazeyn','afyon','hakikat'],{viewPassengers:true});
 r=await call(viewer,'hazeyn','hz1');assert.equal(r.result.canCombine,false);assert.equal(r.result.record.id,rec.id);
 const h1=r.result.lists[0].passengers.find(x=>x.id==='h1').nusuk;assert.equal(h1.password,undefined);assert.equal(h1.credentialsHidden,true);
 r=await call(viewer,'hazeyn','hz1',{action:'save',id:rec.id,changes:[{company:'afyon',listId:'afl',passengerId:'a2',patch:{date:'2026-11-24'}}]});assert.equal(r.status,403);
 const manager=await employee('nusukcu',['hazeyn','afyon','hakikat'],{viewPassengers:true,manageNusuk:true});

 // Firma ekle, sonra bağlantıyı kaldır (yolcu bilgileri kalır)
 r=await call(manager,'hazeyn','hz1',{action:'extend',id:rec.id,revision:rec.revision,sources:[...rec.sources.map(s=>({company:s.company,tourId:s.tourId})),{company:'hakikat',tourId:'hk1'}]});
 assert.equal(r.status,200,JSON.stringify(r.result));assert.equal(r.result.record.sources.length,3);
 r=await call(manager,'hazeyn','hz1',{action:'archive',id:rec.id,revision:r.result.record.revision});
 assert.equal(r.status,200);assert.equal(r.result.record,null);assert.equal(passenger('afyon','afl','a1').nusuk.booked,true,'bağlantı kaldırılınca bilgiler kendi firmasında kalır');
 // Oturumsuz istek
 r=await call('yok','hazeyn','hz1');assert.equal(r.status,401);
 assert.ok(NS.allowed({user:{role:'owner'}},true));
 console.log('nusuk shared tests passed');
})().catch(error=>{console.error(error);process.exit(1);});
