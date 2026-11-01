const Recovery = require('./_recovery');
const {validateBusPlans} = require('./_busPlans');
const path = require('path');
const {
  TABLE, BUCKET,
  supabaseAdmin,
  requestCompanyId, companyRowId, companyDefaultData,
  sanitizeAdminState, sanitizePublicState, separateTourCollections, adminStateForClient,
  ensureBucket
} = require('./_supabase');
const { authorizeDataRequest, authenticateDesktopRequest, applyDesktopAudit, filterStateByPermissions, assertStateChangeAllowed, hasUserPermission } = require('./_appAuth');
const Nusuk = require('./_nusuk');
const NusukShared = require('./_nusukShared');
const Companies = require('../public/company-config');

// Firmalar arası ortak Nusuk (ayrı Vercel fonksiyonu açmamak için /api/data içinde).
async function handleNusukShared(req, res){
  const auth = await authenticateDesktopRequest(req);
  if(!auth) return res.status(401).json({ok:false, error:'Oturumun sona ermiş. Tekrar giriş yapın.'});
  const company = String(req.query?.company || ''), tourId = String(req.query?.tourId || '');
  if(!Companies.valid(company) || !tourId) return res.status(400).json({ok:false, error:'Firma ve program seçin.'});
  const user = auth.user;
  if(!(user.role === 'owner' || (user.companies.includes(company) && hasUserPermission(user, 'viewPassengers')))) return res.status(403).json({ok:false, error:'Bu firmanın yolcularını görme yetkin yok.'});
  const client = supabaseAdmin();
  const row = await Recovery.read(client, NusukShared.STORE_ID);
  const store = row?.data || {groups:[]};
  const body = req.method === 'POST' ? requestBody(req) : {};
  const record = NusukShared.activeRecord(store, company, tourId);
  if(req.method === 'GET' && (!NusukShared.allowed(auth) || (record && !NusukShared.allowed(auth, false, record.sources.map(s => s.company)))))
    return res.status(200).json({ok:true, canCombine:false, restricted:Boolean(record), record:null, lists:[], catalog:{}});
  if(req.method === 'POST'){
    const target = body.action === 'create' ? null : (store.groups || []).find(g => g.id === body.id && !g.archived);
    const required = [...(target?.sources || []), ...(Array.isArray(body.sources) ? body.sources : [])].map(s => s?.company);
    if(!NusukShared.allowed(auth, true, required)) return res.status(403).json({ok:false, error:'Ortak Nusuk için dahil tüm firmalara erişim ve Nusuk yetkisi gerekir.'});
    if(target && !target.sources.some(s => s.company === company && s.tourId === tourId)) return res.status(400).json({ok:false, error:'Ortak Nusuk seçili programla eşleşmiyor.'});
  }
  const companies = NusukShared.accessibleCompanies(auth);
  const readStates = async () => {
    const rows = await Promise.all(companies.map(c => client.from(TABLE).select('data').eq('id', companyRowId(c)).maybeSingle()));
    const states = {};
    rows.forEach((r, i) => { if(r.error) throw r.error; states[companies[i]] = r.data?.data || companyDefaultData(companies[i]); });
    return states;
  };
  if(req.method === 'GET') return res.status(200).json(NusukShared.context(store, await readStates(), company, tourId, auth, hasUserPermission));
  if(body.action === 'save'){
    const target = (store.groups || []).find(g => g.id === body.id && !g.archived);
    if(!target) return res.status(404).json({ok:false, error:'Ortak Nusuk bulunamadı.'});
    await NusukShared.saveChanges(client, target, body.changes);
    return res.status(200).json(NusukShared.context(store, await readStates(), company, tourId, auth, hasUserPermission));
  }
  const states = await readStates();
  const result = NusukShared.mutate(store, states, body, String(user.displayName || user.username));
  if(!result.record.sources.some(s => s.company === company && s.tourId === tourId)) return res.status(400).json({ok:false, error:'Ortak Nusuk seçili programla eşleşmiyor.'});
  await Recovery.write(client, NusukShared.STORE_ID, row, result.store, 'before-nusuk-group');
  return res.status(200).json(NusukShared.context(result.store, states, company, tourId, auth, hasUserPermission));
}

function requestBody(req){
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
}

// Nusuk vize sayfası/vesikalık: gizli depoya imzalı yükleme, kısa süreli görüntüleme
// ve silme. Yollar daima istek yapılan firmanın klasörüyle sınırlıdır.
async function handleNusukFiles(req, res, action, companyId, authorization){
  const body = requestBody(req);
  const manage = Nusuk.canManage(authorization, hasUserPermission);
  const view = authorization.kind !== 'desktop' || hasUserPermission(authorization.user, 'viewPassengers');
  if(action === 'nusuk-view' ? !view : !manage) return res.status(403).json({ok:false, error:'Nusuk vize dosyaları için yetkin yok.'});
  const client = supabaseAdmin();
  if(action === 'nusuk-upload'){
    const objectPath = Nusuk.objectPath(companyId, body);
    if(!objectPath) return res.status(400).json({ok:false, error:'Yolcu bilgisi eksik.'});
    await Nusuk.ensurePrivateBucket(client);
    const { data, error } = await client.storage.from(Nusuk.PRIVATE_BUCKET).createSignedUploadUrl(objectPath);
    if(error) throw error;
    return res.status(200).json({ok:true, bucket:Nusuk.PRIVATE_BUCKET, path:objectPath, token:data.token});
  }
  const paths = [...new Set((Array.isArray(body.paths) ? body.paths : []).map(String))].slice(0, 200);
  if(!paths.length || !paths.every(item => Nusuk.ownsPath(companyId, item))) return res.status(400).json({ok:false, error:'Geçersiz dosya yolu.'});
  if(action === 'nusuk-remove'){
    const { error } = await client.storage.from(Nusuk.PRIVATE_BUCKET).remove(paths);
    if(error) throw error;
    return res.status(200).json({ok:true});
  }
  const { data, error } = await client.storage.from(Nusuk.PRIVATE_BUCKET).createSignedUrls(paths, Nusuk.SIGNED_URL_SECONDS);
  if(error) throw error;
  const urls = Object.fromEntries((data || []).filter(item => item && item.signedUrl && !item.error).map(item => [item.path, item.signedUrl]));
  return res.status(200).json({ok:true, urls, expiresIn:Nusuk.SIGNED_URL_SECONDS});
}

function cleanFileName(name){
  const ext = path.extname(String(name || '')).toLowerCase() || '.jpg';
  const base = path.basename(String(name || 'image'), ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 60) || 'image';
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
}

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  const action = String(req.query && req.query.action || '');
  if(action === 'nusuk-shared'){
    try { return await handleNusukShared(req, res); }
    catch(err){
      console.error('nusuk shared:', err && err.message);
      return res.status(Number(err && err.statusCode) || 503).json({ok:false, error:err && err.statusCode ? err.message : 'Ortak Nusuk verisine ulaşılamadı. Yeniden deneyin.'});
    }
  }
  const timings=[],authContext={directoryLoaded:false};
  const mark=(name,start)=>{timings.push(name+';dur='+Math.max(0,Date.now()-start));res.setHeader('Server-Timing',timings.join(', '));};
  if(req.query?.scope==='admin'||req.method==='POST'||action==='upload-config'){
    const start=Date.now();
    try{await require('./_companies').load(supabaseAdmin());authContext.directoryLoaded=true;mark('directory',start);}
    catch(_){return res.status(503).json({ok:false,error:'Firma listesi yuklenemedi.'});}
  }
  const requestedCompanyId = requestCompanyId(req);
  const explicitCompany=req.query?.company||req.headers?.['x-company-id'];
  if(explicitCompany&&(req.query?.scope==='admin'||req.method==='POST')&&!require('../public/company-config').valid(String(explicitCompany)))return res.status(400).json({ok:false,error:'Firma bulunamadı. Firma listesini yenileyin.'});

  if(req.method === 'GET'){
    const wantsAdmin = String(req.query && req.query.scope || '') === 'admin';
    const companyId = wantsAdmin ? requestedCompanyId : 'hazeyn';
    const authStart=Date.now();
    let authorization = wantsAdmin ? await authorizeDataRequest(req, companyId, authContext) : null;
    if(wantsAdmin)mark('auth',authStart);
    if(wantsAdmin && !authorization) return res.status(401).json({ok:false, error:'Yetkisiz.'});
    if(action === 'upload-config'){
      authorization = authorization || await authorizeDataRequest(req, requestedCompanyId, authContext);
      if(!authorization) return res.status(401).json({ok:false, error:'Yetkisiz.'});
      return res.status(200).json({
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        bucket: BUCKET
      });
    }
    try{
      const client = supabaseAdmin();
      const readStart=Date.now();
      const { data, error } = await client.from(TABLE).select('data,updated_at').eq('id', companyRowId(companyId)).maybeSingle();
      mark('read',readStart);
      if(error) throw error;
      const rawState = data && data.data ? data.data : companyDefaultData(companyId);
      if(wantsAdmin && action === 'baseline'){
        const revision = String(req.query.revision || '');
        if(!revision || revision.length > 40) return res.status(400).json({ok:false,error:'Geçerli kayıt sürümü gerekli.'});
        let baseline = data?.updated_at === revision ? rawState : null;
        if(!baseline){
          const result = await client.from(TABLE).select('data').like('id',Recovery.prefix(companyRowId(companyId))+'%').eq('data->>revision',revision).range(0,0);
          if(result.error) throw result.error;
          const point = result.data?.[0]?.data;
          if(point?.source === companyRowId(companyId) && point.sha256 === Recovery.digest(point.state)) baseline = point.state;
        }
        if(!baseline) return res.status(404).json({ok:false,error:'Bu sürümün karşılaştırma kopyası bulunamadı.'});
        const payload = Nusuk.redactForClient(adminStateForClient(baseline,authorization.kind), authorization, hasUserPermission);
        payload._meta = {...payload._meta,serverRevision:revision};
        return res.status(200).json(payload);
      }
      res.setHeader('X-Turizm-Company', companyId);
      const payload = wantsAdmin ? Nusuk.redactForClient(adminStateForClient(rawState, authorization.kind), authorization, hasUserPermission) : sanitizePublicState(rawState);
      if(wantsAdmin) payload._meta = {...payload._meta, serverRevision:data?.updated_at||''};
      return res.status(200).json(payload);
    } catch(err){
      console.error(err);
      res.setHeader('Retry-After', '30');
      return res.status(503).json({ok:false, error:'Merkezi veriye geçici olarak ulaşılamadı.'});
    }
  }

  if(req.method === 'POST'){
    const companyId = requestedCompanyId;
    const authStart=Date.now();
    const authorization = await authorizeDataRequest(req, companyId, authContext);
    mark('auth',authStart);
    if(!authorization) return res.status(401).json({ok:false, error:'Bu firma hesabı için yetkin yok veya oturumun sona ermiş.'});
    if(['nusuk-upload', 'nusuk-view', 'nusuk-remove'].includes(action)){
      try { return await handleNusukFiles(req, res, action, companyId, authorization); }
      catch(err){
        console.error(err);
        return res.status(500).json({ok:false, error:'Vize dosyası işlemi yapılamadı.'});
      }
    }
    if(action === 'signed-upload'){
      try{
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const requestedFolder = String(body.folder || 'uploads').replace(/[^a-z0-9-_\/]/gi, '').replace(/^\/+/, '').slice(0, 70) || 'uploads';
        const folder = `${companyId}/${requestedFolder}`;
        const filename = cleanFileName(body.filename || 'image.jpg');
        const objectPath = `${folder}/${filename}`;
        const client = supabaseAdmin();
        await ensureBucket(client);
        const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(objectPath);
        if(error) throw error;
        return res.status(200).json({ok:true, bucket:BUCKET, path:objectPath, token:data.token, signedUrl:data.signedUrl});
      } catch(err){
        console.error(err);
        return res.status(500).json({ok:false, error:'Yükleme bağlantısı oluşturulamadı.'});
      }
    }
    try{
      const client = supabaseAdmin();
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      let dataToSave = sanitizeAdminState(body.data || body);
      const readStart=Date.now();
      const { data: existing, error: readError } = await client.from(TABLE).select('data,updated_at').eq('id', companyRowId(companyId)).maybeSingle();
      mark('read',readStart);
      if(readError) throw readError;
      const previousState = existing && existing.data ? existing.data : companyDefaultData(companyId);
      if(authorization.kind === 'desktop') Recovery.expected(existing,dataToSave._meta?.serverRevision);
      if(dataToSave._meta) delete dataToSave._meta.serverRevision;
      dataToSave = separateTourCollections(dataToSave, previousState, authorization.kind);
      if(authorization.kind === 'desktop') dataToSave = filterStateByPermissions(dataToSave, previousState, authorization);
      dataToSave = Nusuk.preserveOnSave(dataToSave, previousState, authorization, hasUserPermission);
      if(authorization.kind === 'desktop'){
        assertStateChangeAllowed(dataToSave, previousState, authorization);
        dataToSave = applyDesktopAudit(dataToSave, previousState, authorization);
      }
      validateBusPlans(dataToSave);
      if(authorization.kind === 'desktop'){
        const remaining = new Set((dataToSave.accountingTours||[]).map(t=>String(t.id)));
        const removed = (previousState.accountingTours||previousState.tours||[]).filter(t=>!remaining.has(String(t.id)));
        if(removed.length){
          const shared=await Recovery.read(client,'turizm-shared-bus-plans-v1');
          if((shared?.data?.plans||[]).some(p=>!p.archived&&p.sources.some(x=>x.company===companyId&&removed.some(t=>String(t.id)===x.tourId)))) Recovery.fail('Bu tur ortak otobüs planında. Önce Otobüs düzeni bölümünden ortak plan bağlantısını kaldırın.');
        }
      }
      const saveStart=Date.now();
      const revision = await Recovery.write(client,companyRowId(companyId),existing,dataToSave);
      mark('persist',saveStart);
      res.setHeader('X-Turizm-Company', companyId);
      const state = Nusuk.redactForClient(adminStateForClient(dataToSave,authorization.kind), authorization, hasUserPermission);
      state._meta = {...state._meta,serverRevision:revision,pendingSync:false};
      return res.status(200).json({ok:true, company:companyId, revision, state});
    } catch(err){
      console.error(err);
      return res.status(Number(err && err.statusCode) || 500).json({ok:false, error:err && err.statusCode ? err.message : 'Veri kaydı yapılamadı.'});
    }
  }

  return res.status(405).json({ok:false, error:'Method not allowed'});
};
