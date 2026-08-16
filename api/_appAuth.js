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
  const password = String(input && input.password || '');
  if(username.length < 3) throw new Error('Kullanıcı adı en az 3 karakter olmalı.');
  if(!displayName) throw new Error('Çalışanın adını yaz.');
  if(!companies.length) throw new Error('En az bir firma yetkisi seç.');
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
  saveEmployee,
  deleteEmployee
};
