'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const helpers = require('../public/workspace-collections');
const { normalizeSearch, tourLifecycle, filterTours, paginate } = helpers;
const today = '2026-09-27';

function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.values(value).forEach(deepFreeze);
        Object.freeze(value);
    }
    return value;
}

assert.equal(normalizeSearch('  İSTANBUL  ÇIĞ ŞEVVAL  '), 'istanbul cig sevval');
assert.equal(normalizeSearch('Iğdır / İstanbul'), 'igdir / istanbul');
assert.equal(normalizeSearch(null), '');
assert.equal(normalizeSearch(2026), '2026');

const lifecycleCases = [
    [{ departureDate: '2026-09-27' }, 'current'],
    [{ departureDate: '2026-09-26' }, 'past'],
    [{ departureDate: '2026-09-28' }, 'current'],
    [{ departureDate: '2026-09-25', durationDays: 3 }, 'current'],
    [{ departureDate: '2026-09-25', durationDays: 2 }, 'past'],
    [{ departureDate: '2026-09-27', durationDays: 1 }, 'current'],
    [{ departureDate: '2026-09-25', durationDays: '3' }, 'current'],
    [{ departureDate: '2026-09-25', durationDays: 0 }, 'past'],
    [{ departureDate: '2026-09-25', durationDays: -10 }, 'past'],
    [{ departureDate: '2026-09-25', durationDays: Infinity }, 'past'],
    [{ departureDate: '2026-09-25', durationDays: 'unknown' }, 'past'],
    [{ departureDate: '2028-09-27', status: 'completed' }, 'past'],
    [{ departureDate: '2025-01-01', status: 'draft' }, 'draft'],
    [{ departureDate: '', status: 'completed' }, 'past'],
    [{ departureDate: '', status: 'draft' }, 'draft'],
    [{ departureDate: 'invalid', status: 'active' }, 'current'],
    [{ departureDate: '2026-02-30' }, 'current'],
    [{ id: '__unassigned__', legacy: true }, 'current'],
    [{}, 'current']
];
for (const [tour, expected] of lifecycleCases) {
    const before = JSON.stringify(tour);
    assert.equal(tourLifecycle(deepFreeze(tour), today), expected, `Lifecycle for ${before}`);
    assert.equal(JSON.stringify(tour), before);
}
assert.equal(tourLifecycle({ departureDate: '2024-02-28', durationDays: 2 }, '2024-02-29'), 'current');
assert.equal(tourLifecycle({ departureDate: '2024-02-28', durationDays: 2 }, '2024-03-01'), 'past');
assert.equal(tourLifecycle({ departureDate: '2026-12-30', durationDays: 3 }, '2027-01-01'), 'current');
assert.equal(tourLifecycle({ departureDate: '2026-12-30', durationDays: 3 }, '2027-01-02'), 'past');

const tours = deepFreeze(Array.from({ length: 35 }, (_, index) => ({
    id: `tour-${index}`,
    title: index < 2 ? 'Aynı İsim' : `İstanbul Şevval ${index}`,
    type: index % 2 ? 'umre' : 'yurtici',
    status: 'active',
    departureDate: `2026-10-${String(1 + index % 28).padStart(2, '0')}`,
    durationDays: 3,
    passengers: [{ id: `passenger-${index}`, accounting: { currency: 'USD', payments: [{ id: `payment-${index}`, amount: 100 + index, unknownMetadata: { keep: true } }] } }],
    unknownMetadata: { nested: [false, null, 0, ''] }
})));
const originalBytes = JSON.stringify(tours);
const current = filterTours(tours, { today });
assert.equal(current.length, 35);
assert.equal(new Set(current.map(item => item.id)).size, 35);
assert.deepEqual(filterTours(tours, { query: 'AYNI ISIM', today }).map(item => item.id), ['tour-0', 'tour-1']);
assert.equal(filterTours(tours, { query: 'istanbul sevval', today }).length, 33);
assert.equal(filterTours(tours, { query: 'yurt ici', today }).length, 18);
assert.equal(filterTours(tours, { query: '2026-10-01', today }).length, 2);
assert.equal(filterTours(tours, { query: 'bulunmayan', today }).length, 0);
assert(current[0] === tours[0], 'Filtered collections retain original object identity');

const mixed = deepFreeze([
    { id: 'missing', title: 'Tarihsiz' },
    { id: 'far', departureDate: '2026-12-01' },
    { id: 'old', departureDate: '2026-02-01' },
    { id: 'near', departureDate: '2026-09-28' },
    { id: 'recent', departureDate: '2026-09-25' },
    { id: 'ongoing', departureDate: '2026-09-24', durationDays: 10 },
    { id: 'draft', departureDate: '2026-09-29', status: 'draft' },
    { id: 'done-no-date', status: 'completed' }
]);
const idList = items => items.map(item => item.id);
assert.deepEqual(idList(filterTours(mixed, { today })), ['ongoing', 'near', 'far', 'missing']);
assert.deepEqual(idList(filterTours(mixed, { today, status: 'past' })), ['recent', 'old', 'done-no-date']);
assert.deepEqual(idList(filterTours(mixed, { today, status: 'draft' })), ['draft']);
assert.deepEqual(idList(filterTours(mixed, { today, status: 'all' })), ['ongoing', 'near', 'far', 'missing', 'recent', 'old', 'done-no-date', 'draft']);
assert.deepEqual(filterTours(mixed, { today, query: 'tarihsiz', status: 'past' }), []);

const first = paginate(current);
assert.deepEqual({ ...first, items: first.items.length }, { items: 8, page: 1, pageCount: 5, total: 35, start: 1, end: 8 });
const last = paginate(current, 999);
assert.deepEqual({ ...last, items: last.items.length }, { items: 3, page: 5, pageCount: 5, total: 35, start: 33, end: 35 });
assert.deepEqual(paginate(current, -8).items, first.items);
assert.equal(paginate(current, 2.8).page, 2);
assert.equal(paginate(current, '2').page, 2);
assert.equal(paginate(current, NaN).page, 1);
assert.equal(paginate(current, 1, 0).items.length, 8);
assert.equal(paginate(current, 1, Infinity).items.length, 8);
assert.equal(paginate(current, 1, 4.9).items.length, 4);
assert.deepEqual(paginate([], 5), { items: [], page: 1, pageCount: 1, total: 0, start: 0, end: 0 });
assert.notStrictEqual(first.items, current);
assert.strictEqual(first.items[0], current[0]);
const visited = Array.from({ length: 5 }, (_, page) => paginate(current, page + 1).items).flat();
assert.deepEqual(visited, current, 'Pagination must neither duplicate nor omit records');
assert.equal(paginate(filterTours(tours, { today, query: 'AYNI ISIM' }), 5).page, 1, 'A narrowed search clamps a stale page');
assert.equal(JSON.stringify(tours), originalBytes, 'Filtering and pagination preserve all saved nested data byte for byte');

// Verify browser loading without CommonJS, plus calendar boundaries in a timezone
// that exposes UTC date-only parsing mistakes and a daylight-saving transition.
const browser = {};
vm.runInNewContext(fs.readFileSync(require.resolve('../public/workspace-collections'), 'utf8'), browser);
assert.equal(typeof browser.TurizmWorkspaceCollections.filterTours, 'function');
const modulePath = require.resolve('../public/workspace-collections');
const timezoneScript = `const h=require(${JSON.stringify(modulePath)}); const a=require('node:assert/strict'); a.equal(h.tourLifecycle({departureDate:'2026-09-27'},'2026-09-27'),'current'); a.equal(h.tourLifecycle({departureDate:'2026-03-07',durationDays:3},'2026-03-09'),'current'); a.equal(h.tourLifecycle({departureDate:'2026-03-07',durationDays:3},'2026-03-10'),'past');`;
execFileSync(process.execPath, ['-e', timezoneScript], { env: { ...process.env, TZ: 'America/Los_Angeles' }, stdio: 'pipe' });

console.log('workspace-collections lifecycle, Turkish search, pagination and immutable-data tests passed');
