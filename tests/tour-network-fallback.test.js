const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/program-page.js', 'utf8');
async function run(fetch) {
  const main = { innerHTML: 'Published tour prices' };
  const robots = { content: 'index,follow' };
  const snapshot = { remove() { this.removed = true; } };
  const year = {};
  const context = { fetch, URLSearchParams, location: { search: '', pathname: '/test-tour' },
    document: {
      getElementById(id) { return { 'main-content': main, tourStructuredData: snapshot, programYear: year }[id]; },
      querySelector(selector) { return selector === 'meta[name="robots"]' ? robots : null; }
    }
  };
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return { main, robots, snapshot };
}
(async () => {
  for (const fetch of [async () => { throw new Error('Network blocked'); }, async () => ({ok:false}), async () => ({ok:true,json:async()=>({})})]) {
    const result = await run(fetch);
    assert.equal(result.main.innerHTML, 'Published tour prices');
    assert.equal(result.robots.content, 'index,follow');
    assert.ok(!result.snapshot.removed);
  }
  const missing = await run(async () => ({ok:true,json:async()=>({tours:[]})}));
  assert.equal(missing.robots.content, 'noindex,follow');
  assert.match(missing.main.innerHTML, /Program bulunamadı/);
  assert.match(fs.readFileSync('public/robots.txt','utf8'), /Allow: \/api\/data/);
  console.log('Transient API failures preserve published HTML; confirmed missing tours remain noindex.');
})().catch(error => { console.error(error); process.exitCode=1; });
