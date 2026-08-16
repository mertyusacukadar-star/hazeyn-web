const path = require('path');
const {
  TABLE, BUCKET,
  supabaseAdmin,
  requestCompanyId, companyRowId, companyDefaultData,
  sanitizeAdminState, sanitizePublicState,
  ensureBucket
} = require('./_supabase');
const { authorizeDataRequest, applyDesktopAudit } = require('./_appAuth');

function cleanFileName(name){
  const ext = path.extname(String(name || '')).toLowerCase() || '.jpg';
  const base = path.basename(String(name || 'image'), ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 60) || 'image';
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
}

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  const action = String(req.query && req.query.action || '');
  const requestedCompanyId = requestCompanyId(req);

  if(req.method === 'GET'){
    const wantsAdmin = String(req.query && req.query.scope || '') === 'admin';
    const companyId = wantsAdmin ? requestedCompanyId : 'hazeyn';
    let authorization = wantsAdmin ? await authorizeDataRequest(req, companyId) : null;
    if(wantsAdmin && !authorization) return res.status(401).json({ok:false, error:'Yetkisiz.'});
    if(action === 'upload-config'){
      authorization = authorization || await authorizeDataRequest(req, requestedCompanyId);
      if(!authorization) return res.status(401).json({ok:false, error:'Yetkisiz.'});
      return res.status(200).json({
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        bucket: BUCKET
      });
    }
    try{
      const client = supabaseAdmin();
      const { data, error } = await client.from(TABLE).select('data').eq('id', companyRowId(companyId)).maybeSingle();
      if(error) throw error;
      const rawState = data && data.data ? data.data : companyDefaultData(companyId);
      res.setHeader('X-Turizm-Company', companyId);
      return res.status(200).json(wantsAdmin ? sanitizeAdminState(rawState) : sanitizePublicState(rawState));
    } catch(err){
      console.error(err);
      res.setHeader('Retry-After', '30');
      return res.status(503).json({ok:false, error:'Merkezi veriye geçici olarak ulaşılamadı.'});
    }
  }

  if(req.method === 'POST'){
    const companyId = requestedCompanyId;
    const authorization = await authorizeDataRequest(req, companyId);
    if(!authorization) return res.status(401).json({ok:false, error:'Bu firma hesabı için yetkin yok veya oturumun sona ermiş.'});
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
      if(authorization.kind === 'desktop'){
        const { data: existing, error: readError } = await client.from(TABLE).select('data').eq('id', companyRowId(companyId)).maybeSingle();
        if(readError) throw readError;
        dataToSave = applyDesktopAudit(dataToSave, existing && existing.data ? existing.data : companyDefaultData(companyId), authorization);
      }
      const { error } = await client.from(TABLE).upsert({id: companyRowId(companyId), data: dataToSave, updated_at: new Date().toISOString()}, {onConflict:'id'});
      if(error) throw error;
      res.setHeader('X-Turizm-Company', companyId);
      return res.status(200).json({ok:true, company:companyId});
    } catch(err){
      console.error(err);
      return res.status(500).json({ok:false, error:'Veri kaydı yapılamadı.'});
    }
  }

  return res.status(405).json({ok:false, error:'Method not allowed'});
};
