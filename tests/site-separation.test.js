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
assert.ok(vercelConfig.rewrites.some(route => route.destination.includes('route=program')), 'program detail rewrite must be deployed');
assert.ok(fs.existsSync(path.join(repoRoot, 'api', 'seo.js')), 'SEO program handler must exist');
const publicVercelConfig = JSON.parse(fs.readFileSync(path.join(repoRoot, 'public', 'vercel.json'), 'utf8'));
assert.ok(publicVercelConfig.rewrites.some(route => route.source.includes(':slug') && route.destination.includes('/program.html')), 'public-root deployment must open the standalone program page');

const appSource = fs.readFileSync(path.join(repoRoot, 'public', 'app.js'), 'utf8');
assert.match(appSource, /const IS_SITE_ADMIN = page === 'admin' && !IS_APP_MODE/);
assert.match(appSource, /\['passengers', 'accounting', 'costs', 'users'\]/);
assert.match(appSource, /\['reviews', 'gallery', 'staff', 'blog', 'settings'\]/);
assert.match(appSource, /href="\/program\.html\?slug=\$\{encodeURIComponent\(slug\)\}"/);
assert.doesNotMatch(appSource, /const programLink = e\.target\.closest\('\[data-program-link\]'\)/);
assert.ok(fs.existsSync(path.join(repoRoot, 'public', 'program.html')), 'standalone program page must exist');
assert.ok(fs.existsSync(path.join(repoRoot, 'public', 'program-page.js')), 'standalone program page script must exist');

console.log('site/accounting separation tests passed');
