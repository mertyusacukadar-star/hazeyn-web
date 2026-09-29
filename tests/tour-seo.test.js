const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const metadata=require('../public/tour-seo');
const root=path.join(__dirname,'..');
const meta=metadata({slug:'test-umre',title:'Örnek Umre',durationDays:20,roomPrices:{2:'1550 USD',3:'1500 USD',4:'1450 USD'}});
assert.equal(meta.url,'https://www.hazeynturizm.com/test-umre');
assert.match(meta.description,/1450 USD/);
assert.equal(meta.schema['@graph'][1].offers.length,3);
assert.ok(!JSON.stringify(meta.schema).includes('aggregateRating'));
assert.equal(metadata({slug:'unknown',title:'Tarih bekleniyor',roomPrices:{2:'Sorunuz'}}).schema['@graph'][1].offers.length,0);
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));
const files=fs.readdirSync(path.join(root,'public/programlar'));
assert.equal(files.length,8);
for(const file of files){
  const html=fs.readFileSync(path.join(root,'public/programlar',file),'utf8');
  assert.doesNotMatch(html,/Program yükleniyor/);
  assert.match(html,/rel="canonical"/);
  assert.match(html,/Oda fiyatları ve konaklama/);
  const schema=JSON.parse(html.match(/id="tourStructuredData" type="application\/ld\+json">([^<]+)/)[1]);
  assert.equal(schema['@graph'][1]['@type'],'TouristTrip');
  assert.equal(schema['@graph'][1].offers.length,3);
  assert.ok(config.rewrites.some(r=>r.source==='/'+file.replace('.html','')&&r.destination==='/programlar/'+file));
}
console.log('8 crawlable tour pages, canonical URLs, valid JSON-LD, room prices and no fabricated ratings passed');
