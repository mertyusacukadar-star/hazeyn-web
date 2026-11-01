// Nusuk randevu takibi: yolcu kaydındaki `nusuk` alanının sunucu kuralları.
// - E-posta/şifre yalnız manageNusuk yetkisi olan çalışana gönderilir.
// - Yetkisiz veya eski istemciler kaydederken Nusuk bilgisi kaybolmaz.
// - Vize sayfası ve vesikalık gizli depoda; erişim kısa süreli imzalı bağlantıyla.
const PRIVATE_BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || 'turizm-private';
const CREDENTIAL_KEYS = ['email', 'password'];
const PRIVATE_MIME = ['image/jpeg', 'image/webp', 'image/png'];
const SIGNED_URL_SECONDS = 600;

function cloneValue(value){
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function eachPassenger(state, visit){
  (Array.isArray(state && state.passengerLists) ? state.passengerLists : []).forEach(list => {
    (Array.isArray(list && list.passengers) ? list.passengers : []).forEach(passenger => {
      if(passenger && typeof passenger === 'object') visit(passenger, list);
    });
  });
}

function passengerIndex(state){
  const map = new Map();
  eachPassenger(state, (passenger, list) => map.set(`${String(list.id)}:${String(passenger.id)}`, passenger));
  return map;
}

function canManage(auth, hasUserPermission){
  if(!auth) return false;
  if(auth.kind !== 'desktop') return true;
  return hasUserPermission(auth.user, 'manageNusuk');
}

// İstemciye giden durumdan kimlik bilgilerini çıkarır; kayıtlı olduğu bilgisi kalır.
function redactForClient(state, auth, hasUserPermission){
  if(canManage(auth, hasUserPermission)) return state;
  eachPassenger(state, passenger => {
    const nusuk = passenger.nusuk;
    if(!nusuk || typeof nusuk !== 'object') return;
    const stored = CREDENTIAL_KEYS.filter(key => String(nusuk[key] || '') !== '');
    CREDENTIAL_KEYS.forEach(key => { delete nusuk[key]; });
    nusuk.credentialsHidden = true;
    nusuk.storedCredentials = stored;
  });
  return state;
}

// Kaydedilecek duruma Nusuk alanlarını önceki kayıttan geri koyar:
// yetkisiz kullanıcı hiçbir Nusuk bilgisini değiştiremez; alanı hiç bilmeyen
// istemci (eski sürüm, site yönetimi) mevcut bilgiyi silemez; gizlenmiş
// kimlik bilgisi gönderilmediği için silinmez.
function preserveOnSave(next, previous, auth, hasUserPermission){
  const allowed = canManage(auth, hasUserPermission);
  const old = passengerIndex(previous);
  eachPassenger(next, (passenger, list) => {
    const before = old.get(`${String(list.id)}:${String(passenger.id)}`);
    const previousNusuk = before && before.nusuk && typeof before.nusuk === 'object' ? before.nusuk : undefined;
    if(!allowed || !Object.prototype.hasOwnProperty.call(passenger, 'nusuk')){
      if(previousNusuk === undefined) delete passenger.nusuk;
      else passenger.nusuk = cloneValue(previousNusuk);
      return;
    }
    const nusuk = passenger.nusuk && typeof passenger.nusuk === 'object' ? passenger.nusuk : {};
    if(nusuk.credentialsHidden && previousNusuk){
      CREDENTIAL_KEYS.forEach(key => { if(nusuk[key] === undefined && previousNusuk[key] !== undefined) nusuk[key] = previousNusuk[key]; });
    }
    delete nusuk.credentialsHidden;
    delete nusuk.storedCredentials;
    passenger.nusuk = nusuk;
  });
  return next;
}

function nusukSnapshot(state){
  const result = {};
  passengerIndex(state).forEach((passenger, key) => { if(passenger.nusuk !== undefined) result[key] = passenger.nusuk; });
  return JSON.stringify(result);
}

function changed(next, previous){
  return nusukSnapshot(next) !== nusukSnapshot(previous);
}

const safeSegment = value => String(value || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 80);

function objectPath(companyId, body){
  const tourId = safeSegment(body.tourId), listId = safeSegment(body.listId), passengerId = safeSegment(body.passengerId);
  const kind = body.kind === 'photo' ? 'photo' : 'visa';
  if(!tourId || !listId || !passengerId) return '';
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${safeSegment(companyId)}/nusuk/${tourId}/${listId}/${passengerId}/${kind}-${stamp}.jpg`;
}

function ownsPath(companyId, value){
  const path = String(value || '');
  return path.startsWith(`${safeSegment(companyId)}/nusuk/`) && !path.includes('..') && /^[a-z0-9_\-/.]+$/i.test(path) && path.length < 300;
}

async function ensurePrivateBucket(client){
  const { data: buckets } = await client.storage.listBuckets();
  const exists = Array.isArray(buckets) && buckets.some(bucket => bucket.name === PRIVATE_BUCKET || bucket.id === PRIVATE_BUCKET);
  const options = { public: false, fileSizeLimit: 1024 * 1024 * 4, allowedMimeTypes: PRIVATE_MIME };
  if(!exists) await client.storage.createBucket(PRIVATE_BUCKET, options);
  else try { await client.storage.updateBucket(PRIVATE_BUCKET, options); } catch(error) {}
}

module.exports = {
  PRIVATE_BUCKET,
  SIGNED_URL_SECONDS,
  CREDENTIAL_KEYS,
  canManage,
  redactForClient,
  preserveOnSave,
  changed,
  objectPath,
  ownsPath,
  ensurePrivateBucket
};
