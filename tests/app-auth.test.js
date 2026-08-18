const assert = require('assert');

const rows = new Map();
const supabaseStub = {
  from(){
    return {
      select(){
        return {
          eq(_column, id){
            return { maybeSingle: async () => ({data:rows.has(id) ? {data:rows.get(id)} : null, error:null}) };
          }
        };
      },
      async upsert(record){ rows.set(record.id, record.data); return {error:null}; }
    };
  }
};

const supabasePath = require.resolve('../api/_supabase');
require.cache[supabasePath] = {
  id:supabasePath,
  filename:supabasePath,
  loaded:true,
  exports:{
    TABLE:'test_data',
    supabaseAdmin:() => supabaseStub,
    checkAdmin:req => req && req.headers && req.headers['x-admin-password'] === 'legacy',
    verifyAdminCredential:value => value === 'adminpass',
    normalizeCompanyId:value => String(value || '').toLowerCase() === 'hakikat' ? 'hakikat' : 'hazeyn'
  }
};

process.env.DESKTOP_SESSION_SECRET = 'test-only-session-secret';
const auth = require('../api/_appAuth');

(async () => {
  const ownerLogin = await auth.login('admin', 'adminpass');
  assert(ownerLogin && ownerLogin.user.role === 'owner');

  const employee = await auth.saveEmployee({
    displayName:'Ayşe Çalışan',
    username:'ayse',
    password:'workerpass',
    companies:['hakikat'],
    permissions:{viewAccounting:true, recordPayments:true, printReceipts:false},
    active:true
  });
  const employeeLogin = await auth.login('ayse', 'workerpass');
  assert(employeeLogin);
  assert.deepStrictEqual(employeeLogin.user.companies, ['hakikat']);
  assert.strictEqual(employeeLogin.user.permissions.viewAccounting, true);
  assert.strictEqual(employeeLogin.user.permissions.recordPayments, true);
  assert.strictEqual(employeeLogin.user.permissions.manageCosts, false);

  const request = {headers:{authorization:`Bearer ${employeeLogin.token}`}};
  assert(await auth.authorizeDataRequest(request, 'hakikat'));
  assert.strictEqual(await auth.authorizeDataRequest(request, 'hazeyn'), null);
  assert(await auth.authorizeDataRequest({headers:{'x-admin-password':'legacy'}}, 'hazeyn'));

  const authorization = await auth.authorizeDataRequest(request, 'hakikat');
  const next = {passengerLists:[{id:'l1',passengers:[{id:'p1',accounting:{payments:[{id:'pay1',amount:200}]}}]}]};
  auth.applyDesktopAudit(next, {passengerLists:[]}, authorization);
  assert.strictEqual(next.passengerLists[0].createdBy.name, 'Ayşe Çalışan');
  assert.strictEqual(next.passengerLists[0].passengers[0].createdBy.name, 'Ayşe Çalışan');
  assert.strictEqual(next.passengerLists[0].passengers[0].accounting.payments[0].receivedBy.name, 'Ayşe Çalışan');

  const permissionAuth = await auth.authorizeDataRequest(request, 'hakikat');
  assert.throws(() => auth.assertStateChangeAllowed({tours:[{id:'t1'}]}, {tours:[]}, permissionAuth), /yetkin yok/);
  assert.throws(() => auth.assertStateChangeAllowed({tourCosts:{t1:{flight:100}}}, {tourCosts:{}}, permissionAuth), /yetkin yok/);
  const filteredState = auth.filterStateByPermissions({tours:[{id:'changed'}], tourCosts:{t1:{flight:100}}, settings:{brand:'changed'}}, {tours:[{id:'safe'}], tourCosts:{}, settings:{brand:'safe'}}, permissionAuth);
  assert.deepStrictEqual(filteredState.tours, [{id:'safe'}]);
  assert.deepStrictEqual(filteredState.tourCosts, {});
  assert.deepStrictEqual(filteredState.settings, {brand:'safe'});
  const previousPaymentState = {passengerLists:[{id:'l1', passengers:[{id:'p1', accounting:{agreedPrice:1000, currency:'USD', priceSource:'room', payments:[]}}]}]};
  const nextPaymentState = JSON.parse(JSON.stringify(previousPaymentState));
  nextPaymentState.passengerLists[0].passengers[0].accounting.payments.push({id:'pay2', amount:100, paidAt:'2026-08-18', method:'Nakit'});
  assert.doesNotThrow(() => auth.assertStateChangeAllowed(nextPaymentState, previousPaymentState, permissionAuth));

  const previous = JSON.parse(JSON.stringify(next));
  next.passengerLists[0].passengers[0].accounting.payments[0].receivedBy = {name:'Sahte Kullanıcı'};
  auth.applyDesktopAudit(next, previous, authorization);
  assert.strictEqual(next.passengerLists[0].passengers[0].accounting.payments[0].receivedBy.name, 'Ayşe Çalışan');

  console.log('app-auth tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
