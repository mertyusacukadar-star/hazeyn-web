const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const TABLE = process.env.SUPABASE_TABLE || 'hazeyn_data';
const ROW_ID = process.env.SUPABASE_ROW_ID || 'main';
const BUCKET = process.env.SUPABASE_BUCKET || 'hazeyn';
const ADMIN_PASSWORD = process.env.HAZEYN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const PUBLIC_SETTING_KEYS = ['brand','phone','phone2','whatsapp','email','website','instagram','address','heroTitle','heroSubtitle','heroMode','heroBanners','staffBannerKicker','staffBannerTitle','staffBannerSubtitle','staffBannerImage','blogBannerKicker','blogBannerTitle','blogBannerSubtitle','blogBannerImage','searchConsoleVerification','googleMapsEmbedUrl','officeImages','ga4MeasurementId','metaPixelId','googleAdsId','googleAdsWhatsappLabel','googleAdsPhoneLabel','googleAdsFormLabel'];

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

function checkAdmin(req){
  const headerPassword = req.headers['x-admin-password'];
  const auth = req.headers.authorization || '';
  const bearerPassword = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const candidate = Buffer.from(String(headerPassword || bearerPassword || ''), 'utf8');
  const configured = Buffer.from(String(ADMIN_PASSWORD || ''), 'utf8');
  return candidate.length > 0 && candidate.length === configured.length && crypto.timingSafeEqual(candidate, configured);
}

function sanitizeAdminState(input){
  const state = JSON.parse(JSON.stringify(input || {}));
  delete state.adminPassword;
  if(state.settings){ delete state.settings.adminPassword; delete state.settings.password; }
  return state;
}

function sanitizePublicState(input){
  const state = sanitizeAdminState(input);
  const settings = {};
  PUBLIC_SETTING_KEYS.forEach(key => { if(Object.prototype.hasOwnProperty.call(state.settings || {}, key)) settings[key] = state.settings[key]; });
  const items = key => (Array.isArray(state[key]) ? state[key] : []).filter(item => !(item && (item.status === 'draft' || item.published === false)));
  return {_meta:{updatedAt:Number(state._meta && state._meta.updatedAt || 0)}, settings, tours:items('tours'), reviews:items('reviews'), gallery:items('gallery'), staff:items('staff'), blogs:items('blogs')};
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

module.exports = { TABLE, ROW_ID, BUCKET, supabaseAdmin, supabaseAnon, checkAdmin, sanitizeAdminState, sanitizePublicState, readDefaultData, ensureBucket };
