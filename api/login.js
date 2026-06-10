const { checkAdmin } = require('./_supabase');

module.exports = async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ok:false});
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  req.headers['x-admin-password'] = body.password || req.headers['x-admin-password'];
  if(checkAdmin(req)) return res.status(200).json({ok:true});
  return res.status(401).json({ok:false, error:'Şifre hatalı.'});
};
