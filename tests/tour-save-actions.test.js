'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Sync=require('../public/state-sync'),Collections=require('../public/workspace-collections');
const Registration=require('../public/passenger-registration');
const source=fs.readFileSync(require.resolve('../public/app.js'),'utf8');
const slice=(from,to)=>source.slice(source.indexOf(from),source.indexOf(to,source.indexOf(from)));
const saveTourSource=slice('    async function saveTour(e)', '    function resetReviewForm');
const citiesSource=slice('    const TURKEY_PROVINCES = ', '    function normalizedTourStatus');
const persistSource=slice('    async function saveData(options = {})', '    async function saveLegacyData');
function fixture(){
 const fields={};const $=id=>fields[id]||=({value:'',disabled:false,dataset:{}});
 for(const [,id] of saveTourSource.matchAll(/\$\('([^']+)'\)/g))$(id);
 const button={textContent:'Kaydet',disabled:false};
 const form=$('tourForm');form.querySelectorAll=()=>[...Object.values(fields).filter(f=>f!==form),button];form.querySelector=()=>button;form.setAttribute=()=>{};form.removeAttribute=()=>{};
 $('tourTitle').value='Afyon test turu';$('tourType').value='umre';$('tourDepartureCities').value='Ankara';$('tourCurrency').value='TRY';$('tourPrice2').value='15000';
 let ids=0;const warnings=[];
 const env={$ ,state:{tours:[],settings:{},_meta:{serverRevision:'1'}},IS_APP_MODE:true,serverBase:{tours:[],settings:{},_meta:{serverRevision:'1'}},currentCompanyId:'afyon',clone:structuredClone,mergeDefaults:structuredClone,
  tempTourImage:'',tempTourDetailBannerImage:'',tempHotelMekkeImages:[],tempHotelMedineImages:[],tempTourGroupImages:[],requirePermission:()=>true,uid:()=>`new-${++ids}`,uniqueList:a=>[...new Set(a)],linesToList:()=>[],cleanRoomPrices:x=>x,uniqueTourSlug:x=>x,defaultTourSlug:()=> 'test',slugifyTR:s=>String(s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/\s+/g,'-'),positiveInteger:Number,normalizeTour:x=>x,seoTextsForTour:()=>({title:'',description:''}),toast:m=>warnings.push(m),renderTourAdmin(){},renderPassengerTourSelect(){},renderDashboard(){},
  resetTourForm:()=>{$('tourId').value='';$('tourTitle').value='';delete form._saveBase;},window:{TurizmStateSync:Sync,TurizmPassengerRegistration:Registration,dispatchEvent(){}},Event:class{},authorizedHeaders:h=>h,statePayloadForSave:structuredClone,cacheDataLocally:async()=>{},rememberServerBase:async s=>env.serverBase=structuredClone(s),fetchSaveBaseline:async()=>null,idbSet:async()=>{},companyCacheKey:()=>env.currentCompanyId
 };
 const context=vm.createContext(env);vm.runInContext(citiesSource+saveTourSource,context);
 return {env,fields,context,button,warnings,ids:()=>ids};
}
(async()=>{
 const f=fixture();let release,calls=0;
 f.env.saveData=async()=>{calls++;await new Promise(r=>release=r);return true;};
 const e={preventDefault(){}};
 const first=f.env.saveTour(e);await f.env.saveTour(e);assert.equal(calls,1);assert.equal(f.ids(),1);assert.equal(f.env.state.tours.length,1);assert.equal(f.button.disabled,true);assert.equal(f.button.textContent,'Kaydediliyor…');
 release();await first;assert.equal(f.button.disabled,false);assert.equal(f.fields.tourId.value,'');assert.equal(f.env.state.tours[0].priceCurrency,'TRY');assert.equal(f.env.state.tours[0].roomPrices['2'],'15000 TRY');
 await f.env.saveTour(e);assert.equal(calls,1,'Delayed second click after reset cannot create a blank tour');
 const retry=fixture();let tries=0;
 retry.env.saveData=async options=>{assert.equal(options.operationBase.tours.length,0);return ++tries>1;};
 await retry.env.saveTour(e);const id=retry.fields.tourId.value;assert(id);assert.equal(retry.button.disabled,false);
 await retry.env.saveTour(e);assert.equal(retry.ids(),1);assert.equal(retry.env.state.tours.length,1);assert.equal(retry.env.state.tours[0].id,id);
 const lost=fixture();let server=structuredClone(lost.env.serverBase),posts=0;
 lost.env.fetchRemoteData=async()=>structuredClone(server);
 lost.env.fetch=async(_,opts)=>{server=JSON.parse(opts.body);server._meta={serverRevision:String(++posts+1),pendingSync:false};if(posts===1)throw Error('Lost acknowledgement');return {ok:true,status:200,json:async()=>({revision:server._meta.serverRevision,state:server})};};
 vm.runInContext(persistSource,lost.context);
 await lost.env.saveTour(e);assert.equal(lost.env.state._meta.pendingSync,true);assert.equal(server.tours.length,1);
 await lost.env.saveTour(e);assert.equal(server.tours.length,1);assert.equal(lost.env.state._meta.pendingSync,false);assert.equal(lost.ids(),1);
 assert.equal(vm.runInContext('TURKEY_PROVINCES.length',f.context),81);
 assert.equal(f.env.departureCityLabel({departureCities:'Ankara, İstanbul, Konya'}),'Ankara / İstanbul / Konya çıkışlı');
 assert.equal(f.env.departureCityLabel({departureCities:'Eskişehir / Özel buluşma noktası'}),'Eskişehir / Özel buluşma noktası çıkışlı');
 assert.equal(f.env.normalizeDepartureCities('Ankara, ankara').length,1);
 assert.equal(Collections.tourLifecycle({status:'completed'}),'past');
 const idleSource=slice('    async function refreshIdleAdminData()', '    function safeFileName');let finish,dirty=false,renders=0;
 const idle={IS_APP_MODE:true,adminLoggedIn:true,currentCompanyId:'afyon',state:structuredClone(server),clone:structuredClone,mergeDefaults:structuredClone,saveData:{pending:0},saveTour:{pending:false},document:{hidden:false,querySelector:()=>null},workspaceUI:{hasChanges:()=>dirty},busWorkspace:{isDirty:()=>false},window:{TurizmStateSync:Sync},fetchRemoteData:async()=>new Promise(r=>finish=r),rememberServerBase:async()=>{},cacheDataLocally:async()=>{},renderAdmin:()=>renders++};
 vm.runInNewContext(idleSource,idle);
 const refresh=idle.refreshIdleAdminData();dirty=true;finish({...server,_meta:{serverRevision:'new'}});await refresh;assert.equal(renders,0,'Automatic refresh must not overwrite a form edited while the read was pending');
 dirty=false;const refresh2=idle.refreshIdleAdminData();finish({...server,_meta:{serverRevision:'new'}});await refresh2;assert.equal(renders,1);assert.equal(idle.state._meta.serverRevision,'new');
 console.log('Actual tour submit: double-click/Enter creates one tour; failed/lost acknowledgement retries reuse ID; 81 provinces/free text survive; idle sync protects open drafts.');
})().catch(e=>{console.error(e);process.exitCode=1;});
