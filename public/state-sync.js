(function(root){
 'use strict';
 const copy=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 // PostgreSQL JSONB can return object keys in a different order.
 const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
 const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const keyed=(a,key)=>Array.isArray(a)&&a.every(v=>object(v)&&typeof key(v)==='string')&&new Set(a.map(key)).size===a.length;
 function merge(base,local,remote){
  const conflicts=[];
  function visit(b,l,r,path){
   if(equal(l,b))return copy(r);
   if(equal(r,b)||equal(l,r))return copy(l);
   // A seating plan is one unit: two editors must review competing layouts.
   if(path.length===2&&path[0]==='tourBusPlans'){conflicts.push(path.join('.'));return copy(l);}
   if(object(b)&&object(l)&&object(r)){
    return Object.fromEntries([...new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])].filter(k=>k!=='_meta').map(k=>[k,visit(b[k],l[k],r[k],[...path,k])]).filter(([,v])=>v!==undefined));
   }
   const key=path.length===1&&path[0]==='deletedTours'?v=>v.tour?.id:v=>v.id;
   if(keyed(b,key)&&keyed(l,key)&&keyed(r,key)){
    const bm=new Map(b.map(v=>[key(v),v])),lm=new Map(l.map(v=>[key(v),v])),rm=new Map(r.map(v=>[key(v),v]));
    const common=b.filter(v=>lm.has(key(v))&&rm.has(key(v))).map(key),inCommon=new Set(common);
    const lo=l.map(key).filter(id=>inCommon.has(id)),ro=r.map(key).filter(id=>inCommon.has(id));
    if(!equal(lo,common)&&!equal(ro,common)&&!equal(lo,ro))conflicts.push(path.join('.')+'.order');
    const order=!equal(lo,common)?l:r,ids=[...new Set([...order.map(key),...l.map(key),...r.map(key)])];
    return ids.map(id=>visit(bm.get(id),lm.get(id),rm.get(id),[...path,id])).filter(v=>v!==undefined);
   }
   conflicts.push(path.join('.'));return copy(l);
  }
  const state=visit(base,local,remote,[]);state._meta=copy(remote._meta||{});
  return {ok:conflicts.length===0,state,conflicts};
 }
 const sameData=(a,b)=>equal(Object.fromEntries(Object.entries(a).filter(([k])=>k!=='_meta')),Object.fromEntries(Object.entries(b).filter(([k])=>k!=='_meta')));
 const api={merge,equal,copy,sameData};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.TurizmStateSync=api;
})(typeof window==='undefined'?globalThis:window);
