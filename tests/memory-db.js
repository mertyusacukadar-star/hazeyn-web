'use strict';
// Faithful subset of PostgREST used by recovery and the write paths. No credentials.
module.exports=function memoryDB(initial={}){
 const rows=structuredClone(initial),writes=[],reads=[];
 const db={rows,writes,reads,failSnapshot:false,conflict:false,from(){
  let filters=[],operation='read',value,range=null,sort=null,projection='*';
  const query={select(s){projection=s;return this;},eq(k,v){filters.push([k,v]);return this;},like(k,v){filters.push([k,v,'like']);return this;},order(k,o){sort=[k,o];return this;},range(a,b){range=[a,b];return this;},update(v){operation='update';value=v;return this;},insert(v){operation='insert';value=v;return this;},upsert(v){operation='upsert';value=v;return this;},
   async maybeSingle(){
    reads.push({projection,filters:structuredClone(filters)});
    if(db.failRead)return {error:{code:'connection-error'}};
    const row=Object.values(rows).find(matches)||null;
    return {data:row&&projection==='updated_at'?{updated_at:row.updated_at}:structuredClone(row)};
   },
   then(ok,bad){return Promise.resolve().then(()=>{
    if(operation==='read'){
     reads.push({projection,filters:structuredClone(filters)});
     let out=Object.values(rows).filter(matches);if(sort)out.sort((a,b)=>String(a[sort[0]]).localeCompare(String(b[sort[0]]))*(sort[1]?.ascending===false?-1:1));if(range)out=out.slice(range[0],range[1]+1);
     return {data:structuredClone(out).map(r=>projection.includes('data->reason')?{id:r.id,updated_at:r.updated_at,reason:r.data.reason,revision:r.data.revision}:r)};
    }
    const id=value.id||filters.find(f=>f[0]==='id')?.[1];writes.push(id);
    if(db.failSnapshot&&id.startsWith('recovery-v1:'))return {error:{code:'disk-full'}};
    if((operation==='insert'&&rows[id])||db.conflict&&operation==='insert'&&!id.startsWith('recovery-v1:'))return {error:{code:'23505'}};
    if(operation==='update'&&(db.conflict||!rows[id]||!matches(rows[id])))return {data:[]};
    rows[id]={...rows[id],...structuredClone(value),id};return {data:[{id}]};
   }).then(ok,bad);}
  };
  function matches(row){return filters.every(([k,v,op])=>{const parts=k.split('->>'),actual=parts.length===2?row[parts[0]]?.[parts[1]]:row[k];return op==='like'?String(actual).startsWith(v.slice(0,-1)):actual===v;});}
  return query;
 }};return db;
};
