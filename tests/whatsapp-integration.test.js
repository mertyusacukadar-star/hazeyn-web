const assert = require('assert');
const fs = require('fs');
const path = require('path');
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
