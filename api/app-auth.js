const {
  login,
  readUsers,
  publicUser,
  authenticateDesktopRequest,
  saveEmployee,
  deleteEmployee
} = require('./_appAuth');

function requestBody(req){
  if(typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body || {};
}

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  const action = String(req.query && req.query.action || '');
  try {
    if(req.method === 'POST' && action === 'login'){
      const body = requestBody(req);
      const result = await login(body.username, body.password);
      if(!result) return res.status(401).json({ok:false, error:'Kullanıcı adı veya şifre hatalı.'});
      return res.status(200).json({ok:true, ...result});
    }

    const auth = await authenticateDesktopRequest(req);
    if(!auth) return res.status(401).json({ok:false, error:'Oturum geçersiz veya süresi dolmuş.'});

    if(req.method === 'GET' && action === 'me'){
      return res.status(200).json({ok:true, user:auth.user});
    }

    if(auth.user.role !== 'owner') return res.status(403).json({ok:false, error:'Bu işlem yalnızca baş yöneticiye açıktır.'});

    if(req.method === 'GET' && action === 'users'){
      const store = await readUsers();
      return res.status(200).json({ok:true, users:store.users.map(publicUser)});
    }

    if(req.method === 'POST' && action === 'save-user'){
      const body = requestBody(req);
      const user = await saveEmployee(body.user || body);
      return res.status(200).json({ok:true, user});
    }

    if(req.method === 'POST' && action === 'delete-user'){
      const body = requestBody(req);
      await deleteEmployee(body.id);
      return res.status(200).json({ok:true});
    }

    return res.status(405).json({ok:false, error:'Desteklenmeyen işlem.'});
  } catch(error){
    console.error('Masaüstü kullanıcı işlemi hatası:', error);
    const status = /en az|zaten|bulunamadı|yaz/i.test(String(error && error.message || '')) ? 400 : 500;
    return res.status(status).json({ok:false, error:error.message || 'Kullanıcı işlemi tamamlanamadı.'});
  }
};
