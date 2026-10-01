(function(root){
'use strict';
const config={
 hazeyn:Object.freeze({id:'hazeyn',name:'Hazeyn Turizm',shortName:'Hazeyn',city:'İstanbul',receiptPrefix:'HZ',logo:'assets/logo.png',loginLogo:'assets/logo.png',receiptLogo:'assets/hazeyn-logo-receipt.png',publicUrl:'index.html',accent:'#c4912f'}),
 hakikat:Object.freeze({id:'hakikat',name:'Hakikat Turizm',shortName:'Hakikat',city:'Konya',receiptPrefix:'HK',logo:'assets/hakikat-logo-white.png',loginLogo:'assets/hakikat-logo.png',receiptLogo:'assets/hakikat-logo.png',publicUrl:'',accent:'#628c2c'}),
 afyon:Object.freeze({id:'afyon',name:'Afyon Hakikat',shortName:'Afyon Hakikat',city:'Afyon',receiptPrefix:'AFH',logo:'assets/hakikat-logo-white.png',loginLogo:'assets/hakikat-logo.png',receiptLogo:'assets/hakikat-logo.png',publicUrl:'',accent:'#397c73'})
};
const defaults={...config};
const ids=Object.keys(config);
function apply(items){
 for(const key of Object.keys(config))delete config[key];Object.assign(config,defaults);
 for(const item of items||[])if(item&&(/^(hazeyn|hakikat|afyon|c_[a-f0-9]{24})$/).test(item.id))config[item.id]=Object.freeze({...defaults[item.id],...item,publicUrl:defaults[item.id]?.publicUrl||''});
 ids.splice(0,ids.length,...Object.keys(config));
}
const clean=value=>String(value||'').trim().toLowerCase();
const valid=value=>ids.includes(value);
const normalize=value=>valid(clean(value))?clean(value):'hazeyn';
// Permissions must never turn an unknown company into access to Hazeyn.
const permitted=values=>[...new Set((Array.isArray(values)?values:[]).map(clean).filter(valid))];
const api=Object.freeze({config,ids,valid,normalize,permitted,apply});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TurizmCompanies=api;
if(typeof window!=='undefined'&&/[?&](desktop|mobile)=1/.test(location.search)){try{apply(JSON.parse(localStorage.getItem('turizmCompanyDirectoryV1')||'[]'));}catch(_){}}
})(typeof window==='undefined'?globalThis:window);
