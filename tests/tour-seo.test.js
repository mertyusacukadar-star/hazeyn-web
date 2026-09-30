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
assert.equal(files.length,9);
for(const file of files){
  const html=fs.readFileSync(path.join(root,'public/programlar',file),'utf8');
  assert.doesNotMatch(html,/Program yükleniyor/);
  assert.match(html,/rel="canonical"/);
  assert.match(html,/Bir bakışta program ve fiyatlar/);
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([^<]+)/g)].map(m=>JSON.parse(m[1]));
  const trip=schemas.find(s=>s['@type']==='TouristTrip');
  assert.ok(trip);
  if(!file.startsWith('13-agustos')) assert.equal(trip.offers.length,3);
  else assert.match(html,/Bu program sona ermiştir/);
  assert.ok(config.rewrites.some(r=>r.source==='/:slug([a-z0-9-]+)'&&r.destination==='/api/site-page?route=program&slug=:slug'));
}
console.log('8 complete current tours + one archive, canonical URLs, valid JSON-LD, room prices and no fabricated ratings passed');
