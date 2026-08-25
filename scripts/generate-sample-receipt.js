const fs = require('fs');
const path = require('path');
const { createReceiptPdf } = require('../api/_receiptPdf');

async function main(){
  const payment = {
    id:'pay_ornek', receiptNo:'HK-20260825-ORNEK', amount:200, paidAt:'2026-08-25',
    method:'Havale / EFT', note:'Kapora ödemesi', receivedBy:{ name:'Baş Yönetici' }
  };
  const passenger = {
    id:'p_ornek', name:'Mert Yuşa Çukadar', phone:'0532 000 00 00', roomPeople:'4',
    createdBy:{ name:'Baş Yönetici' },
    accounting:{ agreedPrice:1450, currency:'USD', priceSource:'custom', payments:[payment] }
  };
  const buffer = await createReceiptPdf({
    companyId:'hakikat',
    state:{ settings:{ brand:'Hakikat Turizm Seyahat Acentası', phone:'0332 351 4 351', address:'Konya' } },
    list:{ id:'l_ornek', title:'13 Ağustos Umre', date:'2026-08-13', passengers:[passenger] },
    passenger,
    tour:{ id:'t_ornek', title:'13 Ağustos Umre', departureDate:'2026-08-13', roomPrices:{ 4:'1450 USD' } },
    payment
  });
  const output = path.join(process.cwd(), 'output', 'pdf', 'ornek-whatsapp-makbuzu.pdf');
  fs.mkdirSync(path.dirname(output), { recursive:true });
  fs.writeFileSync(output, buffer);
  process.stdout.write(output);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
