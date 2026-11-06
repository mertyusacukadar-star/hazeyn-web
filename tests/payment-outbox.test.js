'use strict';
// Kesilen makbuz kuyruğu: sunucu kaydı ekrana gelse ya da eski taslak bırakılsa bile makbuz kaybolmaz.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../public/app.js'),'utf8');
const actual=source.slice(source.indexOf('    const paymentOutboxKey'),source.indexOf('    async function saveData('));
assert(actual.includes('function flushPaymentOutbox'));
const store=new Map();
const env={IS_APP_MODE:true,state:null,clone:structuredClone,companyCacheKey:()=>'hakikat',idbGet:async k=>structuredClone(store.get(k)),idbSet:async(k,v)=>{store.set(k,structuredClone(v));},
 hasPermission:()=>true,renderAccounting(){},accountingSearchQuery:'',toast(){},saves:0,saveData:async()=>{env.saves++;return true;}};
vm.runInNewContext(actual+'\nObject.assign(globalThis,{queuePaymentOps,paymentOpStatus,paymentOpsMissingFrom,reapplyPaymentOutbox,prunePaymentOutbox,flushPaymentOutbox,readPaymentOutbox});',env);
const same=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
const pay=(id,extra={})=>({id,receiptNo:'R-'+id,amount:100,...extra});
const data=payments=>({passengerLists:[{id:'L',passengers:[{id:'p',name:'Ayşe Örnek',accounting:{agreedPrice:1000,currency:'USD',priceSource:'room',payments}}]}],_meta:{}});
(async()=>{
 // Kesildi ama kaydedilemedi; sonra ekran sunucu kaydıyla yenilendi: makbuz geri eklenir.
 await env.queuePaymentOps([{kind:'add',listId:'L',passengerId:'p',payment:pay('a'),currency:'USD',agreedPrice:1000}]);
 env.state=data([pay('old')]);
 assert.equal(await env.reapplyPaymentOutbox(),true);
 same(env.state.passengerLists[0].passengers[0].accounting.payments.map(x=>x.id),['old','a']);
 // İkinci kez eklenmez; kuyruk tekrar eden işlemi almaz.
 await env.queuePaymentOps([{kind:'add',listId:'L',passengerId:'p',payment:pay('a')}]);
 assert.equal((await env.readPaymentOutbox()).length,1);
 // Sunucu onaylayınca kuyruktan düşer.
 await env.prunePaymentOutbox();
 assert.equal((await env.readPaymentOutbox()).length,0);

 // Bırakılan taslaktaki makbuz ve iptal sunucuda yoksa kuyruğa alınır; sunucuda olanlar alınmaz.
 const draft=data([pay('old',{voided:true,voidedAt:'2026-11-06'}),pay('b'),pay('c')]);
 const remote=data([pay('old'),pay('c')]);
 const ops=env.paymentOpsMissingFrom(draft,remote);
 same(ops.map(op=>op.kind+':'+op.payment.id),['void:old','add:b']);
 await env.queuePaymentOps(ops);
 env.state=remote;env.saves=0;
 await env.flushPaymentOutbox();
 const payments=env.state.passengerLists[0].passengers[0].accounting.payments;
 same(payments.map(x=>x.id),['old','c','b']);assert.equal(payments[0].voided,true);
 assert.equal(env.saves,1);

 // Silinmiş yolcunun makbuzu başka yolcuya eklenmez, kuyrukta bekler; yetkisi olmayan cihaz göndermez.
 store.clear();
 await env.queuePaymentOps([{kind:'add',listId:'L',passengerId:'gone',payment:pay('z')}]);
 env.state=data([]);env.saves=0;
 await env.flushPaymentOutbox();
 assert.equal(env.saves,0);assert.equal(env.state.passengerLists[0].passengers[0].accounting.payments.length,0);
 assert.equal((await env.readPaymentOutbox()).length,1);
 env.hasPermission=()=>false;store.clear();
 await env.queuePaymentOps([{kind:'add',listId:'L',passengerId:'p',payment:pay('y')}]);
 await env.flushPaymentOutbox();assert.equal(env.saves,0);

 console.log('Payment outbox: unsaved receipts survive server refreshes and dropped drafts, are sent once, pruned after confirmation and never attached to missing passengers.');
})().catch(error=>{console.error(error);process.exit(1);});
