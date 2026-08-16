const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const TABLE = process.env.SUPABASE_TABLE || 'hazeyn_data';
const ROW_ID = process.env.SUPABASE_ROW_ID || 'main';
const HAKIKAT_ROW_ID = process.env.SUPABASE_HAKIKAT_ROW_ID || 'hakikat';
const BUCKET = process.env.SUPABASE_BUCKET || 'hazeyn';
const CONFIGURED_ADMIN_PASSWORD = process.env.HAZEYN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const CONFIGURED_HAKIKAT_PASSWORD = process.env.HAKIKAT_ADMIN_PASSWORD || '';
// Geriye uyumluluk icin yalnizca sunucu tarafinda tutulur. Gercek sifre istemci
// paketine veya veri tabanindaki site ayarlarina yazilmaz.
const FALLBACK_ADMIN_PASSWORD_SHA256 = process.env.HAZEYN_ADMIN_PASSWORD_SHA256 || '4715441fb3d9f3ee5ce2f74cd2752f45e4fb0d5a381cd532e8cab562fd99d83a';

const PUBLIC_SETTING_KEYS = [
  'brand', 'phone', 'phone2', 'whatsapp', 'email', 'website', 'instagram', 'address',
  'heroTitle', 'heroSubtitle', 'heroMode', 'heroBanners',
  'staffBannerKicker', 'staffBannerTitle', 'staffBannerSubtitle', 'staffBannerImage',
  'blogBannerKicker', 'blogBannerTitle', 'blogBannerSubtitle', 'blogBannerImage',
  'searchConsoleVerification', 'googleSiteVerification',
  'googleMapsEmbedUrl', 'mapsEmbedUrl', 'mapUrl', 'officeImages', 'officePhotos',
  'ga4MeasurementId', 'googleAnalyticsId', 'gaMeasurementId',
  'metaPixelId', 'facebookPixelId',
  'googleAdsId', 'googleAdsConversionId',
  'googleAdsWhatsappLabel', 'whatsappConversionLabel',
  'googleAdsPhoneLabel', 'phoneConversionLabel',
  'googleAdsFormLabel', 'formConversionLabel', 'contactConversionLabel'
];

function secureEqual(left, right){
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

function normalizeCompanyId(value){
  return String(value || '').trim().toLowerCase() === 'hakikat' ? 'hakikat' : 'hazeyn';
}

function requestCompanyId(req){
  const queryValue = req && req.query && req.query.company;
  const headers = req && req.headers || {};
  return normalizeCompanyId(queryValue || headers['x-company-id']);
}

function companyRowId(companyId){
  return normalizeCompanyId(companyId) === 'hakikat' ? HAKIKAT_ROW_ID : ROW_ID;
}

function companyDefaultData(companyId){
  if(normalizeCompanyId(companyId) !== 'hakikat') return readDefaultData();
  return {
    _meta: { updatedAt: 0 },
    settings: {
      brand: 'Hakikat Turizm Seyahat Acentası',
      phone: '', phone2: '', whatsapp: '', email: '', website: '', instagram: '', address: '',
      heroTitle: 'Hakikat Turizm', heroSubtitle: '', heroBanners: [], officeImages: []
    },
    tours: [], reviews: [], gallery: [], staff: [], blogs: [], passengerLists: []
  };
}

function verifyAdminCredential(value, companyId = 'hazeyn'){
  const candidate = String(value || '');
  if(!candidate) return false;
  const configuredPassword = normalizeCompanyId(companyId) === 'hakikat' && CONFIGURED_HAKIKAT_PASSWORD
    ? CONFIGURED_HAKIKAT_PASSWORD
    : CONFIGURED_ADMIN_PASSWORD;
  if(configuredPassword) return secureEqual(candidate, configuredPassword);
  const digest = crypto.createHash('sha256').update(candidate, 'utf8').digest('hex');
  return secureEqual(digest, FALLBACK_ADMIN_PASSWORD_SHA256);
}

function requestCredential(req){
  const headers = req && req.headers || {};
  const headerPassword = headers['x-admin-password'];
  const auth = String(headers.authorization || '');
  const bearerPassword = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return headerPassword || bearerPassword || '';
}

function cloneJson(value, fallback){
  try { return JSON.parse(JSON.stringify(value)); }
  catch(e) { return fallback; }
}

function sanitizeAdminState(input){
  const state = cloneJson(input, {}) || {};
  delete state.adminPassword;
  if(state.settings && typeof state.settings === 'object'){
    delete state.settings.adminPassword;
    delete state.settings.password;
    delete state.settings.serviceRoleKey;
    delete state.settings.privateKey;
    delete state.settings.secret;
    delete state.settings.accessToken;
    delete state.settings.refreshToken;
  }
  return state;
}

function sanitizePublicState(input){
  const state = sanitizeAdminState(input);
  const settings = {};
  const sourceSettings = state.settings && typeof state.settings === 'object' ? state.settings : {};
  PUBLIC_SETTING_KEYS.forEach(key => {
    if(Object.prototype.hasOwnProperty.call(sourceSettings, key)) settings[key] = cloneJson(sourceSettings[key], sourceSettings[key]);
  });
  const publicItems = key => (Array.isArray(state[key]) ? state[key] : [])
    .filter(item => !(item && (item.status === 'draft' || item.published === false)))
    .map(item => cloneJson(item, {}));
  const payload = {
    _meta: { updatedAt: Number(state._meta && state._meta.updatedAt || 0) },
    settings,
    tours: publicItems('tours'),
    reviews: publicItems('reviews'),
    gallery: publicItems('gallery'),
    staff: publicItems('staff'),
    blogs: publicItems('blogs')
  };
  if(Array.isArray(state.banners)) payload.banners = publicItems('banners');
  return payload;
}

function requiredEnv(name){
  const value = process.env[name];
  if(!value) throw new Error(`${name} ortam değişkeni eksik.`);
  return value;
}

function supabaseAdmin(){
  const url = requiredEnv('SUPABASE_URL');
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function supabaseAnon(){
  const url = requiredEnv('SUPABASE_URL');
  const anonKey = requiredEnv('SUPABASE_ANON_KEY');
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

function checkAdmin(req, companyId = requestCompanyId(req)){
  return verifyAdminCredential(requestCredential(req), companyId);
}

function readDefaultData(){
  const file = path.join(process.cwd(), 'data', 'db.json');
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch(e){ return {settings:{}, tours:[], reviews:[], gallery:[], staff:[], blogs:[], passengerLists:[]}; }
}

async function ensureBucket(client){
  const { data: buckets } = await client.storage.listBuckets();
  const exists = Array.isArray(buckets) && buckets.some(b => b.name === BUCKET || b.id === BUCKET);
  if(!exists){
    await client.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 50,
      allowedMimeTypes: ['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml']
    });
  } else {
    // Görseller sitede direkt görünsün diye bucket public tutulur.
    try { await client.storage.updateBucket(BUCKET, { public: true, fileSizeLimit: 1024 * 1024 * 50 }); } catch(e) {}
  }
}

module.exports = {
  TABLE, ROW_ID, HAKIKAT_ROW_ID, BUCKET,
  supabaseAdmin, supabaseAnon,
  checkAdmin, verifyAdminCredential,
  normalizeCompanyId, requestCompanyId, companyRowId, companyDefaultData,
  sanitizeAdminState, sanitizePublicState,
  readDefaultData, ensureBucket
};
