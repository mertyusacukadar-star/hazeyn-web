const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { sanitizePublicState, separateTourCollections, adminStateForClient } = require('../api/_supabase');
const { filterStateByPermissions } = require('../api/_appAuth');

const publicState = sanitizePublicState({
  settings: { brand: 'Hazeyn' },
  tours: [{ id: 'accounting-tour', status: 'active' }],
  siteTours: [
    { id: 'published-site-tour', status: 'active' },
    { id: 'draft-site-tour', status: 'draft' }
  ]
});

assert.deepEqual(publicState.tours.map(item => item.id), ['published-site-tour']);
assert.equal(Object.prototype.hasOwnProperty.call(publicState, 'siteTours'), false);

const legacyState = { tours: [{ id: 'legacy-tour' }], passengerLists: [{ id: 'list-1' }] };
const desktopSave = separateTourCollections(
  { tours: [{ id: 'desktop-tour' }], passengerLists: [{ id: 'list-2' }] },
  legacyState,
  'desktop'
);
assert.deepEqual(desktopSave.siteTours, legacyState.tours, 'legacy desktop save must seed and preserve site tours');
assert.deepEqual(desktopSave.accountingTours, [{ id: 'desktop-tour' }]);
assert.deepEqual(desktopSave.tours, desktopSave.accountingTours);

const siteSave = separateTourCollections(
  { tours: [{ id: 'site-tour' }] },
  legacyState,
  'password'
);
assert.deepEqual(siteSave.siteTours, [{ id: 'site-tour' }], 'legacy web admin save must update site tours');
assert.deepEqual(siteSave.accountingTours, legacyState.tours, 'web admin must preserve accounting tours');
assert.deepEqual(siteSave.tours, siteSave.accountingTours);

const separatedState = {
  tours: [{ id: 'accounting-compatibility-tour' }],
  siteTours: [{ id: 'site-tour' }],
  accountingTours: [{ id: 'accounting-tour' }]
};
assert.deepEqual(adminStateForClient(separatedState, 'password').tours, separatedState.siteTours);
assert.deepEqual(adminStateForClient(separatedState, 'desktop').tours, separatedState.accountingTours);

for (const role of ['owner', 'employee']) {
  const previous = {
    tours: [{ id: 'accounting-tour' }],
    siteTours: [{ id: 'published-site-tour' }]
  };
  const requested = {
    tours: [{ id: 'changed-accounting-tour' }],
    siteTours: [{ id: 'desktop-must-not-change-this' }]
  };
  const filtered = filterStateByPermissions(requested, previous, {
    kind: 'desktop',
    user: { role, permissions: { manageTours: true } }
  });
  assert.deepEqual(filtered.siteTours, previous.siteTours, `desktop ${role} must preserve site tours`);
}

const repoRoot = path.join(__dirname, '..');
const vercelConfig = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
for (const source of ['/tr', '/tr/']) {
  assert.ok(vercelConfig.rewrites.some(route => route.source === source && route.destination === '/api/site-page?route=home'), 'Turkish home alias must use the public renderer');
}
assert.ok(vercelConfig.rewrites.some(route => route.source === '/:slug([a-z0-9-]+)' && route.destination === '/api/site-page?route=program&slug=:slug'), 'program detail rewrite must use the public renderer');
assert.ok(fs.existsSync(path.join(repoRoot, 'api', 'seo.js')), 'SEO program handler must exist');
const publicVercelConfig = JSON.parse(fs.readFileSync(path.join(repoRoot, 'public', 'vercel.json'), 'utf8'));
assert.ok(publicVercelConfig.rewrites.some(route => route.source.includes(':slug') && route.destination.includes('/api/site-page?route=program')), 'public-root deployment must open the complete program page');

const appSource = fs.readFileSync(path.join(repoRoot, 'public', 'app.js'), 'utf8');
assert.match(appSource, /renderTourGroup\('umre', 'umreTours'\);/, 'all current Umrah programs must be displayed, not only the first four');
assert.match(appSource, /const IS_SITE_ADMIN = page === 'admin' && !IS_APP_MODE/);
assert.match(appSource, /\['passengers', 'accounting', 'costs', 'users'\]/);
assert.match(appSource, /\['reviews', 'gallery', 'staff', 'blog', 'settings'\]/);
assert.match(appSource, /href="\/\$\{encodeURIComponent\(slug\)\}"/);
assert.match(appSource, /!IS_APP_MODE && window.hazeynSiteDesign/);
assert.doesNotMatch(appSource, /const programLink = e\.target\.closest\('\[data-program-link\]'\)/);
assert.ok(fs.existsSync(path.join(repoRoot, 'public', 'program.html')), 'standalone program page must exist');
assert.ok(fs.existsSync(path.join(repoRoot, 'public', 'program-page.js')), 'standalone program page script must exist');
assert.ok(fs.existsSync(path.join(repoRoot, 'public', 'umre-fiyatlari.html')), 'standalone prices page must exist');
assert.ok(fs.existsSync(path.join(repoRoot, 'public', 'umre-fiyatlari.js')), 'standalone prices page script must exist');
const pricesSource = fs.readFileSync(path.join(repoRoot, 'public', 'umre-fiyatlari.js'), 'utf8');
assert.match(pricesSource, /status\(tour\)!=='active'/);
assert.match(pricesSource, /departure>=today/);
const publicHome = fs.readFileSync(path.join(repoRoot, 'public', 'index.html'), 'utf8');
assert.match(publicHome, /href="\/umre-fiyatlari"/);

console.log('site/accounting separation tests passed');
