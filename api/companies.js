'use strict';
const {supabaseAdmin}=require('./_supabase'),D=require('./_companies'),C=require('../public/company-config'),R=require('./_recovery');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 try{
  const client=supabaseAdmin(),row=await D.load(client);
  if(req.method==='GET')return res.status(200).json({ok:true,companies:C.ids.map(id=>C.config[id]),revision:row?.updated_at||''});
  const auth=await require('./_appAuth').authenticateDesktopRequest(req);
  if(auth?.user?.role!=='owner')return res.status(403).json({ok:false,error:'Firma yönetimi yalnız baş yöneticiye açıktır.'});
  if(req.method!=='POST')return res.status(405).json({ok:false});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};R.expected(row,body.revision);
  if(body.action==='delete'){
   const id=String(body.companyId||''),company=C.config[id];
   if(!company)R.fail('Firma bulunamadı.',404);
   if(!/^c_[a-f0-9]{24}$/.test(id))R.fail('Ana firma hesapları silinemez.',400);
   if(body.confirmation!==company.name)R.fail('Firma silme onayı gerekiyor.',400);
   const shared=await R.read(client,'turizm-shared-bus-plans-v1');
   if((shared?.data?.plans||[]).some(p=>!p.archived&&p.sources?.some(s=>s.company===id)))R.fail('Bu firma aktif bir ortak otobüs planına bağlı. Önce ortak plan bağlantısını kaldırın.',409);
   const companies=C.ids.filter(c=>c!==id).map(c=>C.config[c]);
   const revision=await R.write(client,D.ID,row,{companies},'before-company-delete');C.apply(companies);
   return res.status(200).json({ok:true,companies,revision,deleted:id});
  }
  const company=D.validate(body.company||{},C.config[body.company?.id]);
  const companies=C.ids.map(id=>C.config[id]).filter(x=>x.id!==company.id);companies.push(company);
  const revision=await R.write(client,D.ID,row,{companies},'before-company-change');C.apply(companies);
  return res.status(200).json({ok:true,companies,revision});
 }catch(e){return res.status(e.statusCode||503).json({ok:false,error:e.statusCode?e.message:'Firma listesi kaydedilemedi. Mevcut kayıtlar korunuyor.'});}
};
