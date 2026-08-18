const crypto = require('crypto');
const {
  TABLE,
  supabaseAdmin,
  checkAdmin,
  verifyAdminCredential,
  normalizeCompanyId
} = require('./_supabase');

const USERS_ROW_ID = process.env.DESKTOP_USERS_ROW_ID || 'desktop-users-v1';
const SESSION_HOURS = Math.max(1, Math.min(24, Number(process.env.DESKTOP_SESSION_HOURS || 12)));
const PERMISSION_KEYS = [
  'viewDashboard', 'viewTours', 'manageTours',
  'viewPassengers', 'managePassengers', 'deletePassengerLists', 'exportPassengerLists',
  'viewAccounting', 'managePrices', 'recordPayments', 'voidPayments', 'printReceipts',
  'viewCosts', 'manageCosts', 'exportBackup'
];

function secureEqual(left, right){
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

function signingSecret(){
  const value = process.env.DESKTOP_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if(!value) throw new Error('Masaüstü oturum anahtarı yapılandırılmamış.');
  return value;
}

function normalizeUsername(value){
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 40);
}

function normalizeCompanies(value){
  const requested = Array.isArray(value) ? value : [];
  return [...new Set(requested.map(normalizeCompanyId))].filter(id => id === 'hazeyn' || id === 'hakikat');
}

function normalizePermissions(value){
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  return Object.fromEntries(PERMISSION_KEYS.map(key => [key, source ? source[key] === true : true]));
}

function hasUserPermission(user, permission){
  if(!permission || (user && user.role === 'owner')) return true;
  return normalizePermissions(user && user.permissions)[permission] === true;
}

function permissionError(permission){
  const labels = {
    manageTours:'Tur ekleme, düzenleme veya arşivleme',
    managePassengers:'Yolcu listesi ekleme veya düzenleme',
    deletePassengerLists:'Yolcu listesi silme',
    managePrices:'Yolcu fiyatı değiştirme',
    recordPayments:'Ödeme kaydetme',
    voidPayments:'Ödeme iptal etme',
    manageCosts:'Tur gideri değiştirme'
  };
  const error = new Error(`${labels[permission] || 'Bu işlem'} yetkin yok.`);
  error.statusCode = 403;
  return error;
}

function comparable(value){
  return JSON.stringify(value === undefined ? null : value);
}

function passengerStructure(lists){
  return (Array.isArray(lists) ? lists : []).map(list => {
    const { passengers, createdBy, ...listFields } = list || {};
    return {
      ...listFields,
      passengers:(Array.isArray(passengers) ? passengers : []).map(passenger => {
        const { accounting, createdBy:passengerCreatedBy, ...passengerFields } = passenger || {};
        return passengerFields;
      })
    };
  });
}

function passengerMap(lists){
  const result = new Map();
  (Array.isArray(lists) ? lists : []).forEach(list => {
    (Array.isArray(list && list.passengers) ? list.passengers : []).forEach(passenger => {
      result.set(`${String(list.id)}:${String(passenger.id)}`, passenger || {});
    });
  });
  return result;
}

function paymentCore(payment){
  const { receivedBy, voidedBy, voidedAt, createdAt, voided, ...core } = payment || {};
  return core;
}

function cloneValue(value){
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function filterStateByPermissions(nextState, previousState, auth){
  if(!auth || auth.kind !== 'desktop' || !auth.user || auth.user.role === 'owner') return nextState;
  const user = auth.user;
  const next = nextState && typeof nextState === 'object' ? nextState : {};
  const previous = previousState && typeof previousState === 'object' ? previousState : {};
  const restore = key => {
    if(previous[key] === undefined) delete next[key];
    else next[key] = cloneValue(previous[key]);
  };
  ['settings', 'reviews', 'gallery', 'staff', 'blogs', 'banners'].forEach(restore);
  if(!hasUserPermission(user, 'manageTours')) restore('tours');
  if(!hasUserPermission(user, 'manageCosts')) restore('tourCosts');

  if(!hasUserPermission(user, 'managePassengers')){
    const nextLists = new Map((Array.isArray(next.passengerLists) ? next.passengerLists : []).map(list => [String(list.id), list]));
    const mayDeleteLists = hasUserPermission(user, 'deletePassengerLists');
    next.passengerLists = (Array.isArray(previous.passengerLists) ? previous.passengerLists : [])
      .filter(list => !mayDeleteLists || nextLists.has(String(list.id)))
      .map(list => {
        const restoredList = cloneValue(list);
        const candidateList = nextLists.get(String(list.id));
        const candidatePassengers = new Map((Array.isArray(candidateList && candidateList.passengers) ? candidateList.passengers : []).map(passenger => [String(passenger.id), passenger]));
        (restoredList.passengers || []).forEach(passenger => {
          const candidate = candidatePassengers.get(String(passenger.id));
          if(candidate && candidate.accounting) passenger.accounting = cloneValue(candidate.accounting);
        });
        return restoredList;
      });
  }
  return next;
}

function assertStateChangeAllowed(nextState, previousState, auth){
  if(!auth || auth.kind !== 'desktop' || !auth.user || auth.user.role === 'owner') return;
  const user = auth.user;
  const next = nextState && typeof nextState === 'object' ? nextState : {};
  const previous = previousState && typeof previousState === 'object' ? previousState : {};
  const requirePermission = permission => { if(!hasUserPermission(user, permission)) throw permissionError(permission); };

  if(comparable(next.tours || []) !== comparable(previous.tours || [])) requirePermission('manageTours');
  if(comparable(next.tourCosts || {}) !== comparable(previous.tourCosts || {})) requirePermission('manageCosts');
  if(comparable(passengerStructure(next.passengerLists)) !== comparable(passengerStructure(previous.passengerLists))) {
    const nextIds = new Set((next.passengerLists || []).map(list => String(list.id)));
    const previousIds = new Set((previous.passengerLists || []).map(list => String(list.id)));
    const deletedList = [...previousIds].some(id => !nextIds.has(id));
    requirePermission(deletedList ? 'deletePassengerLists' : 'managePassengers');
  }

  const oldPassengers = passengerMap(previous.passengerLists);
  const newPassengers = passengerMap(next.passengerLists);
  oldPassengers.forEach((oldPassenger, key) => {
    const newPassenger = newPassengers.get(key);
    if(!newPassenger) return;
    const oldAccounting = oldPassenger.accounting || {};
    const newAccounting = newPassenger.accounting || {};
    const oldPrice = { agreedPrice:oldAccounting.agreedPrice, currency:oldAccounting.currency, priceSource:oldAccounting.priceSource };
    const newPrice = { agreedPrice:newAccounting.agreedPrice, currency:newAccounting.currency, priceSource:newAccounting.priceSource };
    const roomChanged = String(oldPassenger.roomPeople || oldPassenger.room || '') !== String(newPassenger.roomPeople || newPassenger.room || '');
    if(comparable(oldPrice) !== comparable(newPrice) && !(roomChanged && newAccounting.priceSource === 'room')) requirePermission('managePrices');

    const oldPayments = new Map((Array.isArray(oldAccounting.payments) ? oldAccounting.payments : []).map(payment => [String(payment.id), payment]));
    const newPayments = new Map((Array.isArray(newAccounting.payments) ? newAccounting.payments : []).map(payment => [String(payment.id), payment]));
    newPayments.forEach((payment, paymentId) => {
      const oldPayment = oldPayments.get(paymentId);
      if(!oldPayment) { requirePermission('recordPayments'); return; }
      if(comparable(paymentCore(payment)) !== comparable(paymentCore(oldPayment))) requirePermission('recordPayments');
      if(Boolean(payment.voided) !== Boolean(oldPayment.voided)) requirePermission('voidPayments');
    });
    oldPayments.forEach((_payment, paymentId) => { if(!newPayments.has(paymentId)) requirePermission('voidPayments'); });
  });
  newPassengers.forEach((newPassenger, key) => {
    if(oldPassengers.has(key)) return;
    const payments = newPassenger && newPassenger.accounting && Array.isArray(newPassenger.accounting.payments) ? newPassenger.accounting.payments : [];
    if(payments.length) requirePermission('recordPayments');
  });

  ['settings', 'reviews', 'gallery', 'staff', 'blogs', 'banners'].forEach(key => {
    if(comparable(next[key]) !== comparable(previous[key])) throw permissionError('manageSiteContent');
  });
}

function hashPassword(password, salt = crypto.randomBytes(18).toString('hex')){
  const hash = crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, user){
  if(!user || !user.passwordSalt || !user.passwordHash) return false;
  const candidate = hashPassword(password, user.passwordSalt).hash;
  return secureEqual(candidate, user.passwordHash);
}

function tokenPart(value){
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function issueToken(user){
  const payload = {
    v: 1,
    sub: String(user.id),
    username: String(user.username),
    name: String(user.displayName || user.username),
    role: user.role === 'owner' ? 'owner' : 'employee',
    companies: user.role === 'owner' ? ['hazeyn', 'hakikat'] : normalizeCompanies(user.companies),
    ver: String(user.authVersion || '1'),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_HOURS * 60 * 60
  };
  const encoded = tokenPart(payload);
  const signature = crypto.createHmac('sha256', signingSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function decodeToken(token){
  try {
    const [encoded, suppliedSignature] = String(token || '').split('.');
    if(!encoded || !suppliedSignature) return null;
    const expectedSignature = crypto.createHmac('sha256', signingSecret()).update(encoded).digest('base64url');
    if(!secureEqual(suppliedSignature, expectedSignature)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if(payload.v !== 1 || Number(payload.exp || 0) <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch(error){
    return null;
  }
}

function requestToken(req){
  const headers = req && req.headers || {};
  const auth = String(headers.authorization || '');
  if(auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return String(headers['x-desktop-token'] || '');
}

async function readUsers(){
  const client = supabaseAdmin();
  const { data, error } = await client.from(TABLE).select('data').eq('id', USERS_ROW_ID).maybeSingle();
  if(error) throw error;
  const source = data && data.data && typeof data.data === 'object' ? data.data : {};
  return {
    users: Array.isArray(source.users) ? source.users : [],
    updatedAt: Number(source.updatedAt || 0)
  };
}

async function writeUsers(value){
  const payload = {
    users: Array.isArray(value.users) ? value.users : [],
    updatedAt: Date.now()
  };
  const client = supabaseAdmin();
  const { error } = await client.from(TABLE).upsert({
    id: USERS_ROW_ID,
    data: payload,
    updated_at: new Date().toISOString()
  }, {onConflict:'id'});
  if(error) throw error;
  return payload;
}

function publicUser(user){
  return {
    id: String(user.id),
    username: String(user.username),
    displayName: String(user.displayName || user.username),
    role: user.role === 'owner' ? 'owner' : 'employee',
    companies: user.role === 'owner' ? ['hazeyn', 'hakikat'] : normalizeCompanies(user.companies),
    permissions: user.role === 'owner' ? normalizePermissions(null) : normalizePermissions(user.permissions),
    active: user.active !== false,
    createdAt: String(user.createdAt || ''),
    updatedAt: String(user.updatedAt || '')
  };
}

function ownerUser(){
  return {
    id: 'owner',
    username: 'admin',
    displayName: 'Baş Yönetici',
    role: 'owner',
    companies: ['hazeyn', 'hakikat'],
    permissions: normalizePermissions(null),
    active: true,
    authVersion: 'owner-v1'
  };
}

async function login(username, password){
  const normalized = normalizeUsername(username || 'admin');
  if((normalized === 'admin' || normalized === 'yonetici') && verifyAdminCredential(password, 'hazeyn')){
    const user = ownerUser();
    return { token: issueToken(user), user: publicUser(user) };
  }
  const store = await readUsers();
  const user = store.users.find(item => normalizeUsername(item.username) === normalized);
  if(!user || user.active === false || !verifyPassword(password, user)) return null;
  return { token: issueToken(user), user: publicUser(user) };
}

async function authenticateDesktopRequest(req){
  const payload = decodeToken(requestToken(req));
  if(!payload) return null;
  if(payload.role === 'owner') return { token: payload, user: publicUser(ownerUser()) };
  const store = await readUsers();
  const current = store.users.find(user => String(user.id) === String(payload.sub));
  if(!current || current.active === false || String(current.authVersion || '1') !== String(payload.ver || '1')) return null;
  return { token: payload, user: publicUser(current) };
}

async function authorizeDataRequest(req, companyId){
  const desktop = await authenticateDesktopRequest(req);
  if(desktop){
    const company = normalizeCompanyId(companyId);
    if(desktop.user.role !== 'owner' && !desktop.user.companies.includes(company)) return null;
    return { kind:'desktop', user:desktop.user };
  }
  if(checkAdmin(req, companyId)) return { kind:'legacy', user:null };
  return null;
}

function auditActor(auth){
  if(!auth || auth.kind !== 'desktop' || !auth.user) return null;
  return {
    id: String(auth.user.id),
    username: String(auth.user.username),
    name: String(auth.user.displayName || auth.user.username)
  };
}

function actorLabel(actor){
  return actor ? { id:actor.id, username:actor.username, name:actor.name } : null;
}

function applyDesktopAudit(nextState, previousState, auth){
  const actor = auditActor(auth);
  if(!actor || !nextState || typeof nextState !== 'object') return nextState;
  const previousLists = new Map((Array.isArray(previousState && previousState.passengerLists) ? previousState.passengerLists : []).map(list => [String(list.id), list]));
  const now = new Date().toISOString();
  (Array.isArray(nextState.passengerLists) ? nextState.passengerLists : []).forEach(list => {
    const oldList = previousLists.get(String(list.id));
    if(oldList && oldList.createdBy) list.createdBy = oldList.createdBy;
    else if(!oldList) list.createdBy = actorLabel(actor);
    const oldPassengers = new Map((Array.isArray(oldList && oldList.passengers) ? oldList.passengers : []).map(passenger => [String(passenger.id), passenger]));
    (Array.isArray(list.passengers) ? list.passengers : []).forEach(passenger => {
      const oldPassenger = oldPassengers.get(String(passenger.id));
      if(oldPassenger && oldPassenger.createdBy) passenger.createdBy = oldPassenger.createdBy;
      else if(!oldPassenger) passenger.createdBy = actorLabel(actor);
      const oldPayments = new Map((Array.isArray(oldPassenger && oldPassenger.accounting && oldPassenger.accounting.payments) ? oldPassenger.accounting.payments : []).map(payment => [String(payment.id), payment]));
      const accounting = passenger.accounting && typeof passenger.accounting === 'object' ? passenger.accounting : null;
      (accounting && Array.isArray(accounting.payments) ? accounting.payments : []).forEach(payment => {
        const oldPayment = oldPayments.get(String(payment.id));
        if(oldPayment && oldPayment.receivedBy) payment.receivedBy = oldPayment.receivedBy;
        else if(!oldPayment){
          payment.receivedBy = actorLabel(actor);
          payment.createdAt = payment.createdAt || now;
        }
        if(oldPayment && oldPayment.voided !== true && payment.voided === true){
          payment.voidedBy = actorLabel(actor);
          payment.voidedAt = payment.voidedAt || now;
        } else if(oldPayment && oldPayment.voidedBy){
          payment.voidedBy = oldPayment.voidedBy;
        }
      });
    });
  });
  return nextState;
}

async function saveEmployee(input){
  const store = await readUsers();
  const id = String(input && input.id || '').trim();
  const username = normalizeUsername(input && input.username);
  const displayName = String(input && input.displayName || '').trim().slice(0, 80);
  const companies = normalizeCompanies(input && input.companies);
  const permissions = normalizePermissions(input && input.permissions);
  const password = String(input && input.password || '');
  if(username.length < 3) throw new Error('Kullanıcı adı en az 3 karakter olmalı.');
  if(!displayName) throw new Error('Çalışanın adını yaz.');
  if(!companies.length) throw new Error('En az bir firma yetkisi seç.');
  if(!['viewDashboard', 'viewTours', 'viewPassengers', 'viewAccounting', 'viewCosts'].some(key => permissions[key])) throw new Error('En az bir bölüm görme yetkisi seç.');
  const duplicate = store.users.find(user => normalizeUsername(user.username) === username && String(user.id) !== id);
  if(duplicate) throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
  const existingIndex = store.users.findIndex(user => String(user.id) === id);
  const existing = existingIndex >= 0 ? store.users[existingIndex] : null;
  if(!existing && password.length < 6) throw new Error('Yeni kullanıcı şifresi en az 6 karakter olmalı.');
  if(existing && password && password.length < 6) throw new Error('Yeni şifre en az 6 karakter olmalı.');
  const now = new Date().toISOString();
  const user = {
    ...(existing || {}),
    id: existing ? String(existing.id) : `usr_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`,
    username,
    displayName,
    role: 'employee',
    companies,
    permissions,
    active: input.active !== false,
    createdAt: existing && existing.createdAt || now,
    updatedAt: now,
    authVersion: String(Date.now())
  };
  if(password){
    const credential = hashPassword(password);
    user.passwordSalt = credential.salt;
    user.passwordHash = credential.hash;
  }
  if(existingIndex >= 0) store.users[existingIndex] = user;
  else store.users.push(user);
  await writeUsers(store);
  return publicUser(user);
}

async function deleteEmployee(id){
  const store = await readUsers();
  const next = store.users.filter(user => String(user.id) !== String(id || ''));
  if(next.length === store.users.length) throw new Error('Kullanıcı bulunamadı.');
  store.users = next;
  await writeUsers(store);
}

module.exports = {
  USERS_ROW_ID,
  login,
  readUsers,
  publicUser,
  authenticateDesktopRequest,
  authorizeDataRequest,
  applyDesktopAudit,
  PERMISSION_KEYS,
  normalizePermissions,
  hasUserPermission,
  filterStateByPermissions,
  assertStateChangeAllowed,
  saveEmployee,
  deleteEmployee
};
