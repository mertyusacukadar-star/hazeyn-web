const path = require('path');
const { BUCKET, supabaseAdmin, checkAdmin, ensureBucket } = require('./_supabase');

function cleanFileName(name){
  const ext = path.extname(String(name || '')).toLowerCase() || '.jpg';
  const base = path.basename(String(name || 'image'), ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 60) || 'image';
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
}

module.exports = async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ok:false, error:'Method not allowed'});
  if(!checkAdmin(req)) return res.status(401).json({ok:false, error:'Admin şifresi hatalı.'});

  try{
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const folder = String(body.folder || 'uploads').replace(/[^a-z0-9-_\/]/gi, '').replace(/^\/+/, '').slice(0, 80) || 'uploads';
    const filename = cleanFileName(body.filename || 'image.jpg');
    const objectPath = `${folder}/${filename}`;

    const client = supabaseAdmin();
    await ensureBucket(client);
    const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(objectPath);
    if(error) throw error;
    return res.status(200).json({ok:true, bucket: BUCKET, path: objectPath, token: data.token, signedUrl: data.signedUrl});
  } catch(err){
    console.error(err);
    return res.status(500).json({ok:false, error:'Yükleme bağlantısı oluşturulamadı.'});
  }
};
