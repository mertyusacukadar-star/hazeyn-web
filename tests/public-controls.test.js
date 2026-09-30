const assert=require('node:assert/strict');
const fs=require('node:fs');
const render=require('../public/api/_site-pages.cjs');
const state=require('../public/api/_public-snapshot.json');
for(const html of [render.template('index.html',state),render.template('merak-edilenler.html',state),render.template('deneyimli-kadro.html',state),render.local(state),render.prices(state)]) {
  const actions=html.match(/<div class="nav-actions" id="navActions">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(actions,'Every public header has the shared action block');
  assert.equal((actions.match(/class="seo-action-icon"/g)||[]).length,3);
  assert.match(actions,/<span>Hemen Ara<\/span>/);
  assert.match(actions,/<span>WhatsApp<\/span>/);
  assert.match(actions,/<span>Instagram<\/span>/);
}
const html=render.pages.renderProgramPage(render.prepared(state),state.tours.find(t=>t.slug==='6-kasim-2026-umresi'),render.origin);
for(const name of ['close','prev','next']) assert.match(html,new RegExp(`class="seo-lightbox-(?:nav seo-lightbox-)?${name}"[^>]*><svg`));
assert.match(html,/aria-label="WhatsApp'tan bilgi al"><svg/);
const css=fs.readFileSync('public/public-polish.css','utf8');
assert.match(css,/\.site-tour-card\.tour-card \.tour-bottom\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
assert.match(css,/\.seo-lightbox-image-wrap img\{[^}]*width:100%;height:100%[^}]*object-fit:contain/);
assert.match(css,/grid-template-rows:minmax\(0,1fr\) auto/);
assert.match(css,/\.seo-lightbox-nav\{top:auto;bottom:max\(14px,env\(safe-area-inset-bottom\)\);transform:none/);
assert.match(css,/\.seo-lightbox-close,\.seo-lightbox-nav\)[^{]*\{display:flex;align-items:center;justify-content:center/);
console.log('Shared public social icons, non-overlapping card footer and bounded full-poster viewer controls passed');
