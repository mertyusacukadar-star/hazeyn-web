const { TABLE, ROW_ID, supabaseAdmin, checkAdmin, readDefaultData } = require('./_supabase');

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');

  if(req.method === 'GET'){
    try{
      const client = supabaseAdmin();
      const { data, error } = await client.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle();
      if(error) throw error;
      return res.status(200).json(data && data.data ? data.data : readDefaultData());
    } catch(err){
      console.error(err);
      return res.status(200).json(readDefaultData());
    }
  }

  if(req.method === 'POST'){
    if(!checkAdmin(req)) return res.status(401).json({ok:false, error:'Admin şifresi hatalı.'});
    try{
      const client = supabaseAdmin();
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const dataToSave = body.data || body;
      const { error } = await client.from(TABLE).upsert({id: ROW_ID, data: dataToSave, updated_at: new Date().toISOString()}, {onConflict:'id'});
      if(error) throw error;
      return res.status(200).json({ok:true});
    } catch(err){
      console.error(err);
      return res.status(500).json({ok:false, error:'Veri kaydı yapılamadı.'});
    }
  }

  return res.status(405).json({ok:false, error:'Method not allowed'});
};
