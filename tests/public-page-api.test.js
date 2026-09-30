const assert=require('node:assert/strict');
const snapshot=require('../public/api/_public-snapshot.json');
const backendPath=require.resolve('../public/api/_supabase');
const backend=require(backendPath);
let state=JSON.parse(JSON.stringify(snapshot)),reads=0,fail=false;
// No database/network calls: exercise the handler with a controlled public store.
require.cache[backendPath].exports={...backend,supabaseAdmin:()=>({from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>{reads++;return fail?{error:Error('offline')}:{data:{data:state}};}})})})})};
const handler=require('../public/api/site-page');
require.cache[backendPath].exports=backend;
async function request(route,slug,method='GET'){
  const result={status:0,headers:{},body:''};
  const response={setHeader:(key,value)=>result.headers[key]=value,status(code){result.status=code;return this;},send(body){result.body=body;return this;}};
  await handler({method,query:{route,slug}},response);
  return result;
}
(async()=>{
  state.siteTours=[{...state.tours.find(t=>t.slug==='19-ekim-2026-umresi'),title:'Canlı fiyat testi',summary:'Yeni canlı açıklama',roomPrices:{2:'1790 USD',3:'1740 USD',4:'1690 USD'},legacySlugs:['eski-canli-test']}];
  state.tours=[{title:'ACCOUNTING_SECRET_SENTINEL'}];
  state.passengerLists=[{name:'PASSENGER_SECRET_SENTINEL'}];
  state.settings.adminPassword='AUTH_SECRET_SENTINEL';
  const home=await request('home');
  assert.equal(home.status,200);assert.match(home.body,/Yeni canlı açıklama/);assert.match(home.body,/1690 USD/);
  assert.doesNotMatch(home.body,/ACCOUNTING_SECRET_SENTINEL|PASSENGER_SECRET_SENTINEL|AUTH_SECRET_SENTINEL/);
  state.siteTours[0].roomPrices[4]='1590 USD';
  const changed=await request('home');assert.match(changed.body,/1590 USD/);assert.doesNotMatch(changed.body,/Kişi başı 1690 USD/);
  const tour=await request('program','19-ekim-2026-umresi');assert.equal(tour.status,200);assert.match(tour.body,/1590 USD/);
  const alias=await request('program','eski-canli-test');assert.equal(alias.status,301);assert.equal(alias.headers.Location,'/19-ekim-2026-umresi');
  state.siteTours[0].status='completed';
  const archived=await request('program','19-ekim-2026-umresi');assert.equal(archived.status,200);assert.match(archived.body,/Bu program sona ermiştir/);
  assert.doesNotMatch((await request('sitemap')).body,/19-ekim-2026-umresi/);
  state.siteTours[0].status='draft';
  const draft=await request('program','19-ekim-2026-umresi');assert.equal(draft.status,404);assert.equal(draft.headers['X-Robots-Tag'],'noindex');
  const before=reads;assert.equal((await request('home',undefined,'POST')).status,405);assert.equal(reads,before);
  fail=true;
  const fallback=await request('program','19-ekim-2026-umresi');assert.equal(fallback.status,200);assert.equal(fallback.headers['X-Hazeyn-Content'],'published-fallback');assert.match(fallback.body,/1550 USD/);
  console.log('Public handler reads saved site updates, strips private data, preserves legacy/archive routes, rejects writes and survives store failures');
})().catch(error=>{console.error(error);process.exitCode=1;});
