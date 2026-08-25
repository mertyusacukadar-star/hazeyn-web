const crypto = require('crypto');
const {
  TABLE, BUCKET, supabaseAdmin, normalizeCompanyId, companyRowId, companyDefaultData
} = require('./_supabase');
const { authenticateDesktopRequest, hasUserPermission } = require('./_appAuth');
const { createReceiptPdf } = require('./_receiptPdf');

const COMPANY_NUMBER = '903323514351';
const RECEIPT_BUCKET = process.env.SUPABASE_RECEIPT_BUCKET || `${BUCKET}-receipts`;

function requestBody(req){
  if(typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body || {};
}

function cleanCompanyEnv(companyId, name){
  const prefix = normalizeCompanyId(companyId) === 'hakikat' ? 'HAKIKAT' : 'HAZEYN';
  return String(process.env[`${prefix}_${name}`] || process.env[name] || '').trim();
}

function whatsappConfig(companyId){
  return {
    accessToken:cleanCompanyEnv(companyId, 'WHATSAPP_ACCESS_TOKEN'),
    phoneNumberId:cleanCompanyEnv(companyId, 'WHATSAPP_PHONE_NUMBER_ID'),
    graphVersion:cleanCompanyEnv(companyId, 'WHATSAPP_GRAPH_VERSION') || 'v23.0',
    welcomeTemplate:cleanCompanyEnv(companyId, 'WHATSAPP_WELCOME_TEMPLATE_NAME') || 'yolcu_kaydi_olusturuldu',
    receiptTemplate:cleanCompanyEnv(companyId, 'WHATSAPP_RECEIPT_TEMPLATE_NAME') || 'odeme_makbuzu_pdf',
    language:cleanCompanyEnv(companyId, 'WHATSAPP_TEMPLATE_LANGUAGE') || 'tr',
    senderNumber:cleanCompanyEnv(companyId, 'WHATSAPP_BUSINESS_NUMBER') || COMPANY_NUMBER
  };
}

function publicStatus(companyId){
  const config = whatsappConfig(companyId);
  const missing = [];
  if(!config.accessToken) missing.push('WhatsApp erişim anahtarı');
  if(!config.phoneNumberId) missing.push('telefon numarası kimliği');
  return {
    ok:true,
    connected:missing.length === 0,
    senderNumber:`+${config.senderNumber}`,
    welcomeTemplate:config.welcomeTemplate,
    receiptTemplate:config.receiptTemplate,
    missing
  };
}

function normalizeRecipient(value){
  let digits = String(value || '').replace(/\D/g, '');
  if(digits.startsWith('00')) digits = digits.slice(2);
  if(digits.startsWith('0') && digits.length === 11) digits = `90${digits.slice(1)}`;
  else if(digits.length === 10 && digits.startsWith('5')) digits = `90${digits}`;
  if(!/^\d{10,15}$/.test(digits)) return '';
  return digits;
}

async function authorize(req, companyId, permission){
  const auth = await authenticateDesktopRequest(req);
  if(!auth) return { error:{ status:401, message:'Oturum geçersiz veya süresi dolmuş.' } };
  if(auth.user.role !== 'owner' && !auth.user.companies.includes(companyId)){
    return { error:{ status:403, message:'Bu firma hesabına erişim yetkin yok.' } };
  }
  if(!hasUserPermission(auth.user, permission)){
    return { error:{ status:403, message:permission === 'sendReceiptWhatsApp' ? 'WhatsApp makbuzu gönderme yetkin yok.' : 'WhatsApp kayıt mesajı gönderme yetkin yok.' } };
  }
  return { auth };
}

async function readCompanyState(companyId){
  const client = supabaseAdmin();
  const { data, error } = await client.from(TABLE).select('data').eq('id', companyRowId(companyId)).maybeSingle();
  if(error) throw error;
  return { client, state:data && data.data ? data.data : companyDefaultData(companyId) };
}

function findContext(state, body){
  const list = (Array.isArray(state.passengerLists) ? state.passengerLists : []).find(item => String(item.id) === String(body.listId || ''));
  const passenger = list && (Array.isArray(list.passengers) ? list.passengers : []).find(item => String(item.id) === String(body.passengerId || ''));
  const tour = list && (Array.isArray(state.tours) ? state.tours : []).find(item => String(item.id) === String(list.tourId || '')) || null;
  const payments = passenger && passenger.accounting && Array.isArray(passenger.accounting.payments) ? passenger.accounting.payments : [];
  const payment = body.paymentId ? payments.find(item => String(item.id) === String(body.paymentId)) : null;
  return { list, passenger, tour, payment };
}

async function ensureReceiptBucket(client){
  const { data:buckets, error:listError } = await client.storage.listBuckets();
  if(listError) throw listError;
  const exists = Array.isArray(buckets) && buckets.some(bucket => bucket.id === RECEIPT_BUCKET || bucket.name === RECEIPT_BUCKET);
  if(!exists){
    const { error } = await client.storage.createBucket(RECEIPT_BUCKET, {
      public:false,
      fileSizeLimit:5 * 1024 * 1024,
      allowedMimeTypes:['application/pdf']
    });
    if(error) throw error;
  }
}

function safeReceiptName(value){
  return String(value || 'makbuz').replace(/[^a-z0-9-_]/gi, '-').replace(/-+/g, '-').slice(0, 80) || 'makbuz';
}

async function uploadReceiptPdf(client, companyId, payment, pdfBuffer){
  await ensureReceiptBucket(client);
  const receiptName = safeReceiptName(payment.receiptNo);
  const objectPath = `${companyId}/${new Date().toISOString().slice(0, 10)}/${receiptName}-${crypto.randomBytes(8).toString('hex')}.pdf`;
  const { error:uploadError } = await client.storage.from(RECEIPT_BUCKET).upload(objectPath, pdfBuffer, {
    contentType:'application/pdf',
    cacheControl:'900',
    upsert:false
  });
  if(uploadError) throw uploadError;
  const { data:signed, error:signedError } = await client.storage.from(RECEIPT_BUCKET).createSignedUrl(objectPath, 60 * 30, { download:`${receiptName}.pdf` });
  if(signedError || !signed || !signed.signedUrl) throw signedError || new Error('Makbuz bağlantısı oluşturulamadı.');
  return { url:signed.signedUrl, filename:`${receiptName}.pdf` };
}

async function sendTemplate(config, recipient, templateName, components){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`https://graph.facebook.com/${encodeURIComponent(config.graphVersion)}/${encodeURIComponent(config.phoneNumberId)}/messages`, {
      method:'POST',
      signal:controller.signal,
      headers:{
        Authorization:`Bearer ${config.accessToken}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        messaging_product:'whatsapp',
        recipient_type:'individual',
        to:recipient,
        type:'template',
        template:{
          name:templateName,
          language:{ code:config.language },
          ...(components && components.length ? { components } : {})
        }
      })
    });
    const result = await response.json().catch(() => ({}));
    if(!response.ok){
      const detail = String(result && result.error && (result.error.error_user_msg || result.error.message) || '').slice(0, 260);
      const error = new Error(detail || 'WhatsApp mesajı Meta tarafından kabul edilmedi.');
      error.statusCode = 502;
      throw error;
    }
    return { messageId:String(result && result.messages && result.messages[0] && result.messages[0].id || '') };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  const action = String(req.query && req.query.action || 'status');
  const companyId = normalizeCompanyId(req.headers && req.headers['x-company-id'] || req.query && req.query.company);
  const permission = action === 'status' ? null : (action === 'receipt' ? 'sendReceiptWhatsApp' : 'sendWelcomeWhatsApp');
  const authorization = await authorize(req, companyId, permission);
  if(authorization.error) return res.status(authorization.error.status).json({ ok:false, error:authorization.error.message });

  if(req.method === 'GET' && action === 'status') return res.status(200).json(publicStatus(companyId));
  if(req.method !== 'POST' || !['welcome','receipt'].includes(action)) return res.status(405).json({ ok:false, error:'Desteklenmeyen WhatsApp işlemi.' });

  try {
    const status = publicStatus(companyId);
    if(!status.connected) return res.status(503).json({ ok:false, configured:false, error:`Kurumsal WhatsApp bağlantısı tamamlanmadı: ${status.missing.join(', ')} eksik.` });
    const body = requestBody(req);
    const { client, state } = await readCompanyState(companyId);
    const context = findContext(state, body);
    if(!context.list || !context.passenger) return res.status(404).json({ ok:false, error:'Yolcu kaydı bulunamadı.' });
    const recipient = normalizeRecipient(context.passenger.phone);
    if(!recipient) return res.status(400).json({ ok:false, error:'Yolcunun geçerli bir WhatsApp telefon numarası yok.' });
    const config = whatsappConfig(companyId);

    if(action === 'welcome'){
      const sent = await sendTemplate(config, recipient, config.welcomeTemplate, []);
      return res.status(200).json({ ok:true, sent:true, type:'welcome', messageId:sent.messageId, recipient });
    }

    if(!context.payment || context.payment.voided) return res.status(404).json({ ok:false, error:'Geçerli ödeme makbuzu bulunamadı.' });
    const pdfBuffer = await createReceiptPdf({ companyId, state, ...context });
    const document = await uploadReceiptPdf(client, companyId, context.payment, pdfBuffer);
    const sent = await sendTemplate(config, recipient, config.receiptTemplate, [{
      type:'header',
      parameters:[{ type:'document', document:{ link:document.url, filename:document.filename } }]
    }]);
    return res.status(200).json({ ok:true, sent:true, type:'receipt', messageId:sent.messageId, recipient, receiptNo:context.payment.receiptNo });
  } catch(error){
    console.error('WhatsApp işlemi başarısız:', error);
    const status = Number(error && error.statusCode) || (/geçerli|bulunamadı/i.test(String(error && error.message || '')) ? 400 : 500);
    return res.status(status).json({ ok:false, error:error && error.message || 'WhatsApp işlemi tamamlanamadı.' });
  }
};
