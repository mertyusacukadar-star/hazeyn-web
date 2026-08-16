const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync(require.resolve('../public/app.js'), 'utf8');
const rulesStart = source.indexOf('    function parseLocalDate');
const rulesEnd = source.indexOf('    function getListFlightDate', rulesStart);
assert(rulesStart >= 0 && rulesEnd > rulesStart, 'Uçuş yaş kuralları bulunamadı');

const sandbox = {};
vm.runInNewContext(`${source.slice(rulesStart, rulesEnd)}\nthis.classify = passengerFlightAgeGroup;`, sandbox);

const flightDate = '2026-08-13';
assert.strictEqual(sandbox.classify('2024-08-14', flightDate), 'infant', '2 yaşından küçük yolcu bebek olmalı');
assert.strictEqual(sandbox.classify('2024-08-13', flightDate), 'child', '2 yaşını dolduran yolcu çocuk olmalı');
assert.strictEqual(sandbox.classify('2015-08-14', flightDate), 'child', '11 yaşından küçük yolcu çocuk olmalı');
assert.strictEqual(sandbox.classify('2015-08-13', flightDate), 'adult', '11 yaşını dolduran yolcu çocuk olmamalı');

assert(source.includes("const child = IS_DESKTOP_APP && isPassengerChild(passenger.birthDate, flightDate);"), 'Çocuk etiketi yalnız masaüstü uygulamaya uygulanmalı');
assert(source.includes("child ? 'ÇOCUK'"), 'Excel çocuk etiketi eksik');
assert(source.includes("argb: 'FFDDEBF7'"), 'Excel çocuk rengi eksik');

console.log('flight-age tests passed');
