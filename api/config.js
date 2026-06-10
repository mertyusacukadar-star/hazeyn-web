const { BUCKET } = require('./_supabase');

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    bucket: BUCKET
  });
};
