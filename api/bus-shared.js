'use strict';
const {TABLE,supabaseAdmin,companyRowId,companyDefaultData}=require('./_supabase');
const {authenticateDesktopRequest}=require('./_appAuth');
const R=require('./_sharedBuses');
const Companies=require('../public/company-config');
const STORE_ID='turizm-shared-bus-plans-v1';
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({ok:false,error:'Method not allowed'});
 try{
  const auth=await authenticateDesktopRequest(req);
  const company=req.query?.company,tourId=String(req.query?.tourId||'');
  if(!Companies.valid(company)||!tourId)return res.status(400).json({ok:false,error:'Firma ve program seçin.'});
  const ownAccess=auth?.user&&(auth.user.role==='owner'||(auth.user.companies?.includes(company)&&auth.user.permissions?.viewPassengers));
  if(!ownAccess||(req.method==='POST'&&!R.allowed(auth,true)))return res.status(403).json({ok:false,error:'Ortak otobüs planı için plana dahil firmalara ve yolcu kayıtlarına erişim yetkisi gerekir.'});
  const client=supabaseAdmin();
  const {data:row,error}=await client.from(TABLE).select('data,updated_at').eq('id',STORE_ID).maybeSingle();if(error)throw error;
  const store=row?.data||{plans:[]};
  const body=req.method==='POST'?(typeof req.body==='string'?JSON.parse(req.body):req.body||{}):{};
  const record=(store.plans||[]).find(p=>!p.archived&&p.sources.some(s=>s.company===company&&s.tourId===tourId));
  if(req.method==='GET'&&(!R.allowed(auth)||record&&!R.allowed(auth,false,record.sources.map(s=>s.company))))return res.status(200).json({ok:true,canCombine:false,restricted:Boolean(record),record:null,catalog:{},people:[]});
  if(req.method==='POST'){
   const target=body.action==='create'?null:(store.plans||[]).find(p=>p.id===body.id&&!p.archived);
   const required=[...(target?.sources||[]),...(Array.isArray(body.sources)?body.sources:[])].map(s=>s?.company);
   if(!R.allowed(auth,true,required))return res.status(403).json({ok:false,error:'Bu plandaki tüm firmalara ve yolcu düzenlemeye erişim yetkisi gerekir.'});
  }
  const companies=R.accessibleCompanies(auth);
  const responses=await Promise.all(companies.map(c=>client.from(TABLE).select('data').eq('id',companyRowId(c)).maybeSingle()));
  const states={};responses.forEach((r,i)=>{if(r.error)throw r.error;const c=companies[i];states[c]=r.data?.data||companyDefaultData(c);});
  if(req.method==='GET')return res.status(200).json(R.context(store,states,company,tourId));
  const result=R.mutate(store,states,body,String(auth.user.displayName||auth.user.username));
  const touched=result.record.sources.some(s=>s.company===company&&s.tourId===tourId);
  if(!touched)return res.status(400).json({ok:false,error:'Ortak plan seçili programla eşleşmiyor.'});
  const stamp=new Date(Math.max(Date.now(),Date.parse(row?.updated_at||0)+1||0)).toISOString();
  let write;
  if(row)write=await client.from(TABLE).update({data:result.store,updated_at:stamp}).eq('id',STORE_ID).eq('updated_at',row.updated_at).select('id');
  else write=await client.from(TABLE).insert({id:STORE_ID,data:result.store,updated_at:stamp}).select('id');
  if(write.error?.code==='23505'||(!write.error&&!write.data?.length))return res.status(409).json({ok:false,error:'Ortak plan aynı anda değişti. Ekrandaki düzeniniz korunuyor; güncel planı açın.'});
  if(write.error)throw write.error;
  return res.status(200).json({...R.context(result.store,states,company,tourId),savedId:result.record.id});
 }catch(e){console.error('shared bus:',e.message);return res.status(e.statusCode||503).json({ok:false,error:e.statusCode?e.message:'Ortak otobüs verisine ulaşılamadı. Yeniden deneyin.'});}
};
