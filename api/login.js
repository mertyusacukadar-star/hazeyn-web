const { checkAdmin, normalizeCompanyId } = require('./_supabase');

module.exports = async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ok:false});
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const companyId = normalizeCompanyId(body.company || req.headers['x-company-id']);
  req.headers['x-admin-password'] = body.password || req.headers['x-admin-password'];
  req.headers['x-company-id'] = companyId;
  if(checkAdmin(req, companyId)) return res.status(200).json({ok:true, company:companyId});
  return res.status(401).json({ok:false, error:'Şifre hatalı.'});
};
