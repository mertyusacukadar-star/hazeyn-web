const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const app = fs.readFileSync(require.resolve('../public/app.js'), 'utf8');
const admin = fs.readFileSync(require.resolve('../public/admin.html'), 'utf8');
const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');

const start = app.indexOf('    function calculateTourCostSummary');
const end = app.indexOf('    function setCostMoney', start);
assert(start >= 0 && end > start, 'Maliyet hesaplama fonksiyonu bulunamadı');

const sandbox = {
  contexts: [
    { snapshot: { currency: 'USD', agreedPrice: 1425, paid: 1000, balance: 425 } },
    { snapshot: { currency: 'USD', agreedPrice: 1275, paid: 1275, balance: 0 } },
    { snapshot: { currency: 'TRY', agreedPrice: 15000, paid: 5000, balance: 10000 } }
  ]
};
sandbox.tourContextsForCost = () => sandbox.contexts;
sandbox.passengerAccountSnapshot = context => context.snapshot;

vm.runInNewContext(`
  const TOUR_COST_FIELDS = ['mekkeHotelFood', 'medineHotelFood', 'devrekamil', 'flight', 'visa', 'bag', 'office', 'extra'];
  ${app.slice(start, end)}
  this.calculate = calculateTourCostSummary;
`, sandbox);

const summary = sandbox.calculate('tour-1', 'USD', {
  mekkeHotelFood: 300,
  medineHotelFood: 200,
  devrekamil: 50,
  flight: 600,
  visa: 100,
  bag: 25,
  office: 75,
  extra: 50
});

assert.strictEqual(summary.passengers, 3);
assert.strictEqual(summary.matchingPassengers, 2);
assert.strictEqual(summary.contract, 2700);
assert.strictEqual(summary.paid, 2275);
assert.strictEqual(summary.balance, 425);
assert.strictEqual(summary.expenses, 1400);
assert.strictEqual(summary.projectedProfit, 1300);
assert.strictEqual(summary.cashPosition, 875);
assert.strictEqual(summary.otherCurrencies.TRY.contract, 15000);

[
  'mekkeHotelFood', 'medineHotelFood', 'devrekamil', 'flight',
  'visa', 'bag', 'office', 'extra'
].forEach(field => assert(admin.includes(`data-cost-field="${field}"`), `${field} maliyet alanı eksik`));

assert(admin.includes('id="tab-costs"') && admin.includes('desktop-only'), 'Maliyet ekranı yalnızca uygulama modunda olmalı');
assert(styles.includes('.mobile-app .cost-hero'), 'Mobil maliyet görünümü eksik');
assert(app.includes('tourCosts: normalizeTourCosts(data.tourCosts)'), 'Maliyetler senkronize veri modelinde korunmalı');

console.log('tour-costs tests passed');
