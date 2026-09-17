const assert = require('node:assert/strict');
const camera = require('../public/mrz-camera');
const rules = require('../public/document-reader');

(async()=>{
const {parse} = await import('../public/vendor/mrz/lib/index.js');

const passport = [
  'P<TURERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<',
  'L898902C36TUR7408122F1204159ZE184226B<<<<<10'
];
const identity = [
  'I<TURD23145890<1233<<<<<<<<<<<',
  '7408122F1204159TUR<<<<<<<<<<<2',
  'ERIKSSON<<ANNA<MARIA<<<<<<<<<<'
];
const now = new Date('2026-09-17T00:00:00Z');
const visual = 'Republic of Turkiye\nDate of issue / Verilis tarihi\n15 OCT/EKI 2002\nDate of expiry\n15 APR 2012';
const p = camera.parseText(`Header\n${passport.join('\n')}`,parse,'10000000146',now,visual);
assert.equal(p.source,'camera');
assert.equal(p.documentType,'passport');
assert.equal(p.name,'ANNA MARIA ERIKSSON');
assert.equal(p.tc,'10000000146');
assert.equal(p.birthDate,'1974-08-12');
assert.equal(p.passportNo,'L898902C3');
assert.equal(p.passportEnd,'2012-04-15');
assert.equal(p.passportStart,'2002-10-15');
assert.equal(p.identityNo,undefined);
assert.match(p.warning,/elle girilen/);
assert.equal(rules.normalize(p).source,'camera');
const prior={id:'old',tc:'10000000146',name:'',phone:'555',accounting:{payments:[{id:'paid'}]}};
assert.equal(rules.match([prior],p),prior);
const merged=rules.merge(prior,rules.normalize(p));
assert.equal(merged.name,'ANNA MARIA ERIKSSON');
assert.equal(merged.passportNo,'L898902C3');
assert.equal(merged.passportStart,'2002-10-15');
assert.equal(merged.documentVerification,'mrz-checked');
assert.deepEqual(merged.accounting,prior.accounting);
const id=camera.parseText(identity.join('\n'),parse,'',now);
assert.equal(id.documentType,'identity');
assert.equal(id.passportNo,undefined);
assert.equal(id.identityEnd,'2012-04-15');
const noisyName = 'P<TURERIKSSON<<ANNA<MARIA<<<<<<<<K<KK<K<<<<<\n' + passport[1];
assert.equal(camera.parseText(noisyName,parse,'',now).name,'ANNA MARIA ERIKSSON');
assert.equal(camera.extractIssueDate('VERİLİŞ TARİHİ / DATE OF ISSUE 03.09.2021','2031-09-03','1990-01-01',now),'2021-09-03');
assert.equal(camera.extractIssueDate('DOB 01.01.1990 ISSUE 03.09.2021 EXPIRY 03.09.2031','2031-09-03','1990-01-01',now),'2021-09-03');
assert.throws(()=>camera.parseText(passport.join('\n').slice(0,-1)+'9',parse,'',now),/kontrol rakamları/);
assert.throws(()=>camera.parseText(passport.join('\n'),parse,'10000000147',now),/T.C./);
assert.throws(()=>camera.parseText('blurry text',parse,'',now),/tam okunamadı/);
assert.throws(()=>camera.mrzDate('991332','birth',now),/geçersiz tarih/);
console.log('camera MRZ passport and identity matching tests passed');
})().catch(error=>{ console.error(error); process.exitCode=1; });
