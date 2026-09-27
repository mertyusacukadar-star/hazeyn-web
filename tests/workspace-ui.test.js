'use strict';

const assert = require('node:assert/strict');
const {
  buildTourCards,
  filterTourCards,
  routeFor,
  parseRoute
} = require('../public/workspace-ui');

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

// These fixtures deliberately retain unknown fields and nested payment records:
// choosing a different workspace must never rewrite saved business data.
const tours = deepFreeze([
  { id: 'tour-a', title: 'Şevval Umresi', type: 'umre', status: 'active', departureDate: '2027-03-12', customMetadata: { revision: 7 } },
  { id: 'tour-b', title: 'Şevval Umresi', type: 'umre', status: 'completed', departureDate: '2025-03-12' },
  { id: 'tour-c', title: 'İstanbul Çığ Gezisi', type: 'yurtici', status: 'draft', departureDate: '2028-01-10' },
  { id: 'tour/ özel#4', title: 'Yeni Hac Programı', type: 'hac', status: 'active', departureDate: '2028-04-20' }
]);

const lists = deepFreeze([
  {
    id: 'list-a1', tourId: 'tour-a', title: 'Birinci kafile',
    unknownMetadata: { importedFrom: 'older-desktop', nested: [null, 0, false, ''] },
    passengers: [
      { id: 'person-a', name: 'AYŞE ÖRNEK', tc: '10000000146', accounting: { agreedPrice: 1450, currency: 'USD', priceSource: 'custom', payments: [{ id: 'payment-a', amount: 125, voided: false, receiptNumber: 'TEST-001', legacyField: { keep: true } }] } },
      { id: 'person-b', name: 'İKİNCİ ÖRNEK', passportNo: 'SYNTHETIC', accounting: { agreedPrice: 20000, currency: 'TRY', payments: [{ id: 'payment-b', amount: 1000, voided: true, voidReason: 'Test kaydı' }] }, extraDocumentData: { source: 'camera' } }
    ]
  },
  { id: 'list-a2', tourId: 'tour-a', passengers: [{ id: 'person-c', name: 'ÜÇÜNCÜ ÖRNEK' }] },
  { id: 'list-b', tourId: 'tour-b', passengers: [{ id: 'person-d', name: 'DÖRDÜNCÜ ÖRNEK' }] },
  { id: 'list-empty', tourId: 'tour-c', passengers: [] },
  { id: 'orphan-deleted', tourId: 'deleted-tour', passengers: [{ id: 'person-e', name: 'ESKİ KAYIT' }] },
  { id: 'orphan-unassigned', title: 'Tursuz liste', passengers: [{ id: 'person-f', name: 'TURSUZ KAYIT' }] },
  { id: 'orphan-empty', tourId: '', passengers: [] }
]);
const savedBytes = JSON.stringify({ tours, lists });

const cards = buildTourCards(tours, lists);
const byId = new Map(cards.map(card => [card.id, card]));
assert.equal(cards.length, 5, 'All tours and a separate unassigned group must remain visible');
assert.equal(byId.size, cards.length, 'Same-name tours must never be merged');
assert.equal(byId.get('tour-a').title, 'Şevval Umresi');
assert.equal(byId.get('tour-a').passengerCount, 3);
assert.equal(byId.get('tour-a').listCount, 2);
assert.equal(byId.get('tour-b').passengerCount, 1);
assert.equal(byId.get('tour-b').listCount, 1);
assert.equal(byId.get('tour-c').passengerCount, 0);
assert.equal(byId.get('tour-c').listCount, 1);
assert.equal(byId.get('tour/ özel#4').passengerCount, 0, 'Tours without a list remain selectable');
assert.equal(byId.get('tour/ özel#4').listCount, 0);
assert.equal(byId.get('__unassigned__').legacy, true);
assert.equal(byId.get('__unassigned__').passengerCount, 2);
assert.equal(byId.get('__unassigned__').listCount, 3, 'Orphaned and unassigned lists remain accessible');
assert.equal(byId.get('tour-a').type, 'umre');
assert.equal(byId.get('tour-a').status, 'active');
assert.equal(byId.get('tour-a').departureDate, '2027-03-12');
assert.deepEqual(buildTourCards([], []), []);
assert.equal(buildTourCards(tours, []).length, tours.length, 'No phantom legacy group without orphan lists');

const cardsBytes = JSON.stringify(cards);
deepFreeze(cards);
const ids = items => items.map(item => item.id).sort();
assert.deepEqual(ids(filterTourCards(cards, '', 'all')), ids(cards));
assert.deepEqual(ids(filterTourCards(cards, '  SEVVAL  ', 'all')), ['tour-a', 'tour-b']);
assert.deepEqual(ids(filterTourCards(cards, 'şEVVAL', 'completed')), ['tour-b']);
assert.deepEqual(ids(filterTourCards(cards, 'sevval', 'active')), ['tour-a']);
assert.deepEqual(ids(filterTourCards(cards, 'istanbul cig', 'draft')), ['tour-c']);
assert.deepEqual(ids(filterTourCards(cards, 'İSTANBUL ÇIĞ', 'all')), ['tour-c']);
assert.deepEqual(ids(filterTourCards(cards, 'sevval', 'draft')), []);
assert.deepEqual(ids(filterTourCards(cards, 'bulunmayan program', 'all')), []);
assert.deepEqual(ids(filterTourCards(cards, '', 'completed')), ['tour-b']);
assert.deepEqual(ids(filterTourCards(cards, '', 'draft')), ['tour-c']);
assert.equal(JSON.stringify(cards), cardsBytes, 'Searching and filtering must not sort or mutate original cards');

for (const id of ['tour-a', 'tour/ özel#4', '__unassigned__']) {
  for (const tab of ['overview', 'passengers', 'accounting', 'costs']) {
    const route = routeFor(id, tab);
    assert.equal(route, `#work/tour/${encodeURIComponent(id)}/${tab}`);
    assert.deepEqual(parseRoute(route), { id, tab });
  }
}
for (const invalidRoute of [
  '', '#', '#work', '#work/tour', '#work/tour//overview',
  '#work/tour/tour-a', '#work/tour/tour-a/delete',
  '#work/tour/tour-a/overview/extra', '#work/tour/%E0%A4%A/overview',
  '#other/tour/tour-a/overview'
]) {
  assert.equal(parseRoute(invalidRoute), null, `Malformed route must not select a tour: ${invalidRoute}`);
}

assert.equal(JSON.stringify({ tours, lists }), savedBytes,
  'Navigation helpers must preserve every saved byte, including payments, identity fields and unknown metadata');

console.log('workspace-ui tour separation, Turkish search, routing and saved-data preservation tests passed');
