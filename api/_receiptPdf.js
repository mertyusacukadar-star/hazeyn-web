const fs = require('fs');
const PDFDocument = require('pdfkit');

// Statik require.resolve çağrıları Vercel'in PDF işlevi paketine fontları ve
// firma logolarını da eklemesini sağlar.
const RECEIPT_ASSETS = {
  regularFont:require.resolve('../public/assets/fonts/Ubuntu-R.ttf'),
  boldFont:require.resolve('../public/assets/fonts/Ubuntu-B.ttf'),
  hazeynLogo:require.resolve('../public/assets/hazeyn-logo-receipt.png'),
  hakikatLogo:require.resolve('../public/assets/hakikat-logo.png')
};

const COMPANY = {
  hazeyn: {
    name: 'Hazeyn Turizm Seyahat Acentası',
    logo: 'hazeyn-logo-receipt.png',
    accent: '#b8892d'
  },
  hakikat: {
    name: 'Hakikat Turizm Seyahat Acentası',
    logo: 'hakikat-logo.png',
    accent: '#628c2c'
  }
};

function normalizeCompanyId(value){
  return String(value || '').trim().toLowerCase() === 'hakikat' ? 'hakikat' : 'hazeyn';
}

function parseMoneyAmount(value){
  let raw = String(value == null ? '' : value).trim().replace(/[^0-9,.-]/g, '');
  if(!raw) return NaN;
  const sign = raw.startsWith('-') ? -1 : 1;
  raw = raw.replace(/-/g, '');
  if(/^\d{1,3}(\.\d{3})+$/.test(raw)) raw = raw.replace(/\./g, '');
  else if(/^\d{1,3}(,\d{3})+$/.test(raw)) raw = raw.replace(/,/g, '');
  else if(raw.includes('.') && raw.includes(',')){
    const decimal = raw.lastIndexOf(',') > raw.lastIndexOf('.') ? ',' : '.';
    raw = raw.replace(decimal === ',' ? /\./g : /,/g, '').replace(decimal, '.');
  } else if(raw.includes(',')) raw = raw.replace(',', '.');
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount * sign : NaN;
}

function currencyFromText(value){
  const text = String(value || '').toUpperCase();
  if(text.includes('EUR') || text.includes('€')) return 'EUR';
  if(text.includes('USD') || text.includes('$')) return 'USD';
  return 'TRY';
}

function formatMoney(value, currency){
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat('tr-TR', {
      style:'currency', currency:currency || 'TRY',
      minimumFractionDigits:Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits:2
    }).format(amount);
  } catch(error){
    return `${amount.toLocaleString('tr-TR')} ${currency || 'TRY'}`;
  }
}

function formatDate(value){
  const text = String(value || '').trim();
  if(!text) return '—';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T12:00:00` : text;
  const date = new Date(iso);
  if(Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString('tr-TR');
}

function actorName(value, fallback = 'Eski kayıt'){
  if(!value) return fallback;
  if(typeof value === 'string') return value || fallback;
  return String(value.name || value.displayName || value.username || fallback);
}

function accountSnapshot(tour, passenger){
  const roomPeople = String(passenger && (passenger.roomPeople || passenger.room) || '');
  const rawPrice = tour && tour.roomPrices && tour.roomPrices[roomPeople] || tour && tour.price || '';
  const fallbackAmount = parseMoneyAmount(rawPrice);
  const accounting = passenger && passenger.accounting && typeof passenger.accounting === 'object' ? passenger.accounting : {};
  const agreed = Number(accounting.agreedPrice);
  const hasAgreed = accounting.agreedPrice !== '' && accounting.agreedPrice != null && Number.isFinite(agreed) && agreed >= 0;
  const currency = ['USD','EUR','TRY'].includes(accounting.currency) ? accounting.currency : currencyFromText(rawPrice);
  const payments = Array.isArray(accounting.payments) ? accounting.payments : [];
  const paid = payments.filter(item => item && item.voided !== true).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const agreedPrice = hasAgreed ? agreed : (Number.isFinite(fallbackAmount) ? fallbackAmount : 0);
  return { agreedPrice, paid, balance:agreedPrice - paid, currency };
}

function fitText(doc, value, x, y, width, options = {}){
  const text = String(value == null || value === '' ? '—' : value);
  let size = Number(options.size || 12);
  const minSize = Number(options.minSize || 8);
  doc.font(options.bold ? 'ReceiptBold' : 'ReceiptRegular');
  while(size > minSize && doc.widthOfString(text, { size }) > width) size -= 0.5;
  doc.fontSize(size).fillColor(options.color || '#17130d').text(text, x, y, {
    width,
    height:options.height,
    align:options.align || 'left',
    ellipsis:true,
    lineBreak:options.lineBreak !== false
  });
}

function detailCell(doc, label, value, x, y, width, height){
  doc.rect(x, y, width, height).strokeColor('#c8bda9').lineWidth(0.7).stroke();
  doc.font('ReceiptBold').fontSize(7.6).fillColor('#756342').text(String(label || '').toLocaleUpperCase('tr-TR'), x + 11, y + 10, { width:width - 22 });
  fitText(doc, value, x + 11, y + 28, width - 22, { size:11.5, minSize:8.5, bold:true, height:height - 34 });
}

function createReceiptPdf(input){
  const companyId = normalizeCompanyId(input && input.companyId);
  const company = COMPANY[companyId];
  const state = input && input.state || {};
  const list = input && input.list || {};
  const passenger = input && input.passenger || {};
  const tour = input && input.tour || {};
  const payment = input && input.payment || {};
  const snapshot = accountSnapshot(tour, passenger);
  const settings = state.settings && typeof state.settings === 'object' ? state.settings : {};
  const roomPeople = passenger.roomPeople || passenger.room || '';
  const programDate = tour.departureDate || list.date || '';
  const regularFont = RECEIPT_ASSETS.regularFont;
  const boldFont = RECEIPT_ASSETS.boldFont;
  const logoPath = companyId === 'hakikat' ? RECEIPT_ASSETS.hakikatLogo : RECEIPT_ASSETS.hazeynLogo;

  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size:'A4', margin:0, info:{
      Title:`${payment.receiptNo || 'Makbuz'} Tahsilat Makbuzu`,
      Author:settings.brand || company.name,
      Subject:'Tahsilat Makbuzu'
    }});
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.registerFont('ReceiptRegular', regularFont);
    doc.registerFont('ReceiptBold', boldFont);
    doc.font('ReceiptRegular');

    const pageW = doc.page.width;
    const outerX = 28;
    const outerY = 24;
    const outerW = pageW - outerX * 2;
    const contentX = 52;
    const contentW = pageW - contentX * 2;
    doc.rect(outerX, outerY, outerW, 790).lineWidth(1.3).strokeColor('#1b1812').stroke();

    if(fs.existsSync(logoPath)){
      const logoWidth = companyId === 'hakikat' ? 172 : 155;
      doc.image(logoPath, contentX, 48, { fit:[logoWidth, 62], align:'left', valign:'center' });
    }
    doc.font('ReceiptBold').fontSize(20).fillColor('#111').text('TAHSİLAT MAKBUZU', 300, 58, { width:pageW - 352, align:'right' });
    doc.font('ReceiptBold').fontSize(10.5).fillColor('#756342').text('PAYMENT RECEIPT', 300, 84, { width:pageW - 352, align:'right' });
    doc.moveTo(contentX, 128).lineTo(pageW - contentX, 128).lineWidth(2).strokeColor(company.accent).stroke();

    const gap = 22;
    const half = (contentW - gap) / 2;
    detailCell(doc, 'Makbuz No', payment.receiptNo || '—', contentX, 153, half, 62);
    detailCell(doc, 'Ödeme Tarihi', formatDate(payment.paidAt), contentX + half + gap, 153, half, 62);

    const rowY = [242, 298, 354, 410];
    detailCell(doc, 'Yolcu', passenger.name || '—', contentX, rowY[0], contentW / 2, 56);
    detailCell(doc, 'Program', tour.title || list.title || '—', contentX + contentW / 2, rowY[0], contentW / 2, 56);
    detailCell(doc, 'Program Tarihi', formatDate(programDate), contentX, rowY[1], contentW / 2, 56);
    detailCell(doc, 'Oda Tipi', roomPeople ? `${roomPeople} Kişilik Oda` : '—', contentX + contentW / 2, rowY[1], contentW / 2, 56);
    detailCell(doc, 'Ödeme Yöntemi', payment.method || '—', contentX, rowY[2], contentW / 2, 56);
    detailCell(doc, 'Kalan Bakiye', formatMoney(snapshot.balance, snapshot.currency), contentX + contentW / 2, rowY[2], contentW / 2, 56);
    detailCell(doc, 'Kaydı Yapan', actorName(passenger.createdBy || list.createdBy), contentX, rowY[3], contentW / 2, 56);
    detailCell(doc, 'Tahsilatı Alan', actorName(payment.receivedBy), contentX + contentW / 2, rowY[3], contentW / 2, 56);

    doc.rect(contentX, 491, contentW, 68).fillAndStroke('#fff9ec', company.accent);
    doc.font('ReceiptBold').fontSize(12).fillColor('#17130d').text('Tahsil Edilen Tutar', contentX + 20, 517, { width:220 });
    fitText(doc, formatMoney(payment.amount, snapshot.currency), contentX + 260, 507, contentW - 280, { size:23, minSize:15, bold:true, align:'right', height:36 });

    doc.font('ReceiptBold').fontSize(10.5).fillColor('#17130d').text('Açıklama:', contentX, 587);
    doc.font('ReceiptRegular').fontSize(10.5).text(payment.note || 'Program ödemesi', contentX + 58, 587, { width:contentW - 58, height:34, ellipsis:true });
    doc.moveTo(contentX, 625).lineTo(pageW - contentX, 625).strokeColor('#c8bda9').lineWidth(0.7).stroke();

    const signatureY = 685;
    doc.moveTo(contentX, signatureY).lineTo(contentX + 190, signatureY).strokeColor('#222').stroke();
    doc.moveTo(pageW - contentX - 190, signatureY).lineTo(pageW - contentX, signatureY).strokeColor('#222').stroke();
    doc.font('ReceiptBold').fontSize(10).fillColor('#17130d').text('Ödeyen / Yolcu İmzası', contentX, signatureY + 9, { width:190, align:'center' });
    doc.text('Kaşe / Yetkili İmza', pageW - contentX - 190, signatureY + 9, { width:190, align:'center' });

    const contact = [settings.brand || company.name, settings.phone, settings.address].filter(Boolean).join(' • ');
    doc.moveTo(contentX, 755).lineTo(pageW - contentX, 755).strokeColor('#d8d0c3').stroke();
    doc.font('ReceiptRegular').fontSize(7.5).fillColor('#756342').text(contact || company.name, contentX, 764, { width:contentW, align:'center', height:32, ellipsis:true });

    if(payment.voided){
      doc.save().rotate(-12, { origin:[pageW / 2, 420] }).font('ReceiptBold').fontSize(50).fillColor('#b40000').opacity(0.72).text('İPTAL', 165, 395, { width:270, align:'center' }).restore();
    }
    doc.end();
  });
}

module.exports = {
  createReceiptPdf,
  formatMoney,
  accountSnapshot
};
