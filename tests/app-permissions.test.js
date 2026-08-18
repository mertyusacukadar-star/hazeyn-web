const assert = require('assert');
const fs = require('fs');

const app = fs.readFileSync(require.resolve('../public/app.js'), 'utf8');
const admin = fs.readFileSync(require.resolve('../public/admin.html'), 'utf8');
const backend = fs.readFileSync(require.resolve('../api/_appAuth.js'), 'utf8');

const permissions = [
  'viewDashboard', 'viewTours', 'manageTours',
  'viewPassengers', 'managePassengers', 'deletePassengerLists', 'exportPassengerLists',
  'viewAccounting', 'managePrices', 'recordPayments', 'voidPayments', 'printReceipts',
  'viewCosts', 'manageCosts', 'exportBackup'
];

permissions.forEach(permission => {
  assert(admin.includes(`data-app-permission="${permission}"`), `${permission} kullanıcı ayarı eksik`);
  assert(app.includes(`'${permission}'`) || app.includes(`${permission}:`), `${permission} istemci kontrolü eksik`);
  assert(backend.includes(`'${permission}'`) || backend.includes(`${permission}:`), `${permission} sunucu kontrolü eksik`);
});

assert(admin.includes('data-permission="viewCosts"'), 'Maliyet görünürlük yetkisi menüye bağlı değil');
assert(admin.includes('data-manage-permission="manageCosts"'), 'Maliyet düzenleme yetkisi forma bağlı değil');
assert(app.includes("requirePermission('recordPayments')"), 'Ödeme kaydetme işlem koruması eksik');
assert(app.includes("requirePermission('voidPayments')"), 'Ödeme iptal işlem koruması eksik');
assert(app.includes("requirePermission('printReceipts')"), 'Makbuz işlem koruması eksik');
assert(backend.includes('assertStateChangeAllowed'), 'Sunucu tarafı işlem yetkisi eksik');

console.log('app-permissions tests passed');
