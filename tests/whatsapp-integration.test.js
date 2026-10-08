const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');
const { createReceiptPdf } = require('../api/_receiptPdf');

const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
const admin = fs.readFileSync(path.join(__dirname, '..', 'public', 'admin.html'), 'utf8');
const api = fs.readFileSync(path.join(__dirname, '..', 'api', 'whatsapp.js'), 'utf8');
const auth = fs.readFileSync(path.join(__dirname, '..', 'api', '_appAuth.js'), 'utf8');

assert(app.includes('sendNewPassengerWelcomeMessages(item, existing)'), 'Yeni yolcu kaydı WhatsApp mesajına bağlanmamış');
assert(app.includes("sendWhatsAppReceipt(context.list.id, context.passenger.id, payment.id)"), 'Ödeme sonrası PDF makbuz gönderimi eksik');
assert(app.includes('data-send-receipt-whatsapp'), 'Manuel WhatsApp PDF tekrar gönderme butonu eksik');
assert(admin.includes('+90 332 351 43 51'), 'Kurumsal WhatsApp numarası uygulamada görünmüyor');
assert(auth.includes("'sendWelcomeWhatsApp'"), 'Kayıt mesajı çalışan yetkisi eksik');
assert(auth.includes("'sendReceiptWhatsApp'"), 'Makbuz gönderme çalışan yetkisi eksik');
assert(api.includes('graph.facebook.com'), 'Meta Cloud API bağlantısı eksik');
assert(api.includes("type:'document'"), 'PDF belge şablonu eksik');
assert(api.includes('public:false'), 'Makbuzlar özel depolama alanında tutulmalı');
assert(!app.includes('WHATSAPP_ACCESS_TOKEN'), 'WhatsApp erişim anahtarı istemciye yazılmamalı');

(async () => {
  // Slow post-save messages must stay on the original company/session even if
  // the editor switches accounts while the status request is still pending.
  let releaseStatus;
  const requests=[],notices=[];
  const env={IS_APP_MODE:true,hasPermission:()=>true,currentCompanyId:'hakikat',whatsappIntegrationStatus:null,authorizedHeaders:()=>({Authorization:'Bearer synthetic-original-session'}),toast:m=>notices.push(m),fetch:async(url,options)=>{
    requests.push({url,headers:options.headers,body:options.body});
    if(url.includes('action=status'))await new Promise(r=>releaseStatus=r);
    return {ok:true,json:async()=>url.includes('action=status')?{connected:true}:{ok:true}};
  }};
  const apiFunction=app.slice(app.indexOf('    async function whatsappApi('),app.indexOf('    async function loadWhatsAppIntegrationStatus('));
  const welcomeFunction=app.slice(app.indexOf('    async function sendNewPassengerWelcomeMessages('),app.indexOf('    async function sendWhatsAppReceipt('));
  vm.runInNewContext(apiFunction+welcomeFunction,env);
  const messages=env.sendNewPassengerWelcomeMessages({id:'list-qa',passengers:[{id:'new-qa',phone:'synthetic-phone'},{id:'old-qa',phone:'synthetic-phone'}]},{passengers:[{id:'old-qa'}]});
  env.currentCompanyId='afyon';releaseStatus();await messages;
  assert.equal(requests.length,2);assert(requests.every(r=>r.url.includes('company=hakikat')));assert(requests.every(r=>r.headers.Authorization==='Bearer synthetic-original-session'));
  assert.equal(JSON.parse(requests[1].body).passengerId,'new-qa');assert.equal(notices.length,0,'Background status from the original company cannot notify the newly opened company');
  const payment = {
    id:'pay_test', receiptNo:'HK-20260825-TEST', amount:200, paidAt:'2026-08-25',
    method:'Nakit', note:'Kapora', receivedBy:{ name:'Baş Yönetici' }
  };
  const passenger = {
    id:'p_test', name:'Mert Yuşa Çukadar', phone:'0532 000 00 00', roomPeople:'4',
    createdBy:{ name:'Baş Yönetici' },
    accounting:{ agreedPrice:1450, currency:'USD', priceSource:'custom', payments:[payment] }
  };
  const pdf = await createReceiptPdf({
    companyId:'hakikat',
    state:{ settings:{ brand:'Hakikat Turizm', phone:'0332 351 4 351', address:'Konya' } },
    list:{ id:'l_test', title:'13 Ağustos Umre', date:'2026-08-13', passengers:[passenger] },
    passenger,
    tour:{ id:'t_test', title:'13 Ağustos Umre', departureDate:'2026-08-13', roomPrices:{ 4:'1450 USD' } },
    payment
  });
  assert(Buffer.isBuffer(pdf), 'Makbuz PDF çıktısı Buffer değil');
  assert(pdf.subarray(0, 4).toString() === '%PDF', 'Makbuz geçerli bir PDF değil');
  assert(pdf.length > 20000, 'Makbuz PDF içeriği beklenenden küçük');
  console.log('whatsapp-integration tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
