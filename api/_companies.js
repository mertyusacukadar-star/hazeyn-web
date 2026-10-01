'use strict';
const crypto=require('crypto');
const C=require('../public/company-config');
const ID='turizm-company-directory-v1';
async function load(client){
 const R=require('./_recovery');const row=await R.read(client,ID);C.apply(row?.data?.companies||[]);return row;
}
function validate(input,existing){
 const R=require('./_recovery');const name=String(input.name||'').trim(),city=String(input.city||'').trim();
 if(name.length<2||name.length>70)R.fail('Firma adı 2–70 karakter olmalı.',400);
 let id=input.id;if(id&&!C.valid(id))R.fail('Firma bulunamadı.',400);if(!id)id='c_'+crypto.randomBytes(12).toString('hex');
 if(!input.id&&!input.logo)R.fail('Yeni firma için PNG veya JPEG logo yükleyin.',400);
 if(C.ids.some(c=>c!==id&&C.config[c].name.toLocaleLowerCase('tr-TR')===name.toLocaleLowerCase('tr-TR')))R.fail('Bu isimde bir firma zaten var.',409);
 let logo=input.logo||existing?.logo||'assets/logo.png';
 if(input.logo){
  if(typeof logo!=='string'||logo.length>400000||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(logo))R.fail('En fazla 290 KB PNG veya JPEG logo yükleyin.',400);
  const bytes=Buffer.from(logo.split(',')[1],'base64');
  if(!(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes[0]===255&&bytes[1]===216&&bytes[2]===255))R.fail('Logo geçerli bir PNG veya JPEG olmalı.',400);
 }
 return {...existing,id,name,shortName:name,city:city.slice(0,60),receiptPrefix:existing?.receiptPrefix||('F'+id.slice(-6).toUpperCase()),logo,loginLogo:input.logo||existing?.loginLogo||logo,receiptLogo:input.logo||existing?.receiptLogo||logo,accent:existing?.accent||'#397c73',publicUrl:existing?.publicUrl||''};
}
module.exports={ID,load,validate};
