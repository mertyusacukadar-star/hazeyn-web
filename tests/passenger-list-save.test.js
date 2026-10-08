'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Registration=require('../public/passenger-registration');
const source=fs.readFileSync(require.resolve('../public/app.js'),'utf8');
const actual=source.slice(source.indexOf('    let passengerListSaving'),source.indexOf('    function passengerRowHtml'));
function fixture(){
 const fields={};const $=id=>fields[id]||=({value:'',textContent:'',disabled:false});
 for(const [,id] of actual.matchAll(/\$\('([^']+)'\)/g))$(id);
 $('listTourSelect').value=$('listTourId').value='tour';$('listTitle').value='Ana Liste';
 let rows=[{id:'p1',name:'Ayşe Örnek',relationship:'Kendisi',accounting:{currency:'USD',payments:[{id:'paid',amount:100}]}}],ids=0,clears=0,saves=0;
 const tbody={};Object.defineProperty(tbody,'innerHTML',{set:()=>{rows=[];}});$('passengerTable').querySelector=()=>tbody;
 const warnings=[];
 const env={$ ,IS_APP_MODE:true,state:{tours:[{id:'tour',title:'Örnek Tur'}],passengerLists:[{id:'other',tourId:'other-tour',passengers:[{id:'other-person',name:'Diğer Tur'}]}],tourBusPlans:{}},window:{TurizmPassengerRegistration:Registration,scrollTo(){}},clone:structuredClone,uid:()=>`list-${++ids}`,requirePermission:()=>true,readPassengers:()=>structuredClone(rows),airportCode:v=>v||'',currentActor:()=>({id:'owner'}),currentCompanyId:'hakikat',sharedBusRequest:async()=>({}),workspaceUI:{checkpoint(){}},busWorkspace:{reset(){}},renderPassengerAdmin(){},renderDashboard(){},toast:m=>warnings.push(m),sendNewPassengerWelcomeMessages:async()=>{},renderPassengerTourSelect(){},passengerRow:p=>rows.push(structuredClone(p)),ensurePassengerRows(){},refreshPassengerRelations(){},switchTab(){},clearPassengerForm:()=>clears++,saveData:async()=>{saves++;return true;}};
 vm.runInNewContext(actual,env);
 return {env,fields,warnings,rows:()=>rows,add:p=>rows.push(p),ids:()=>ids,clears:()=>clears,saves:()=>saves};
}
(async()=>{
 const f=fixture();await f.env.savePassengerList();const id=f.fields.listId.value;
 assert.equal(f.ids(),1);assert.equal(f.clears(),0);assert.equal(f.rows()[0].id,'p1');assert.equal(f.fields.passengerEditorHeading.textContent,'Yolcu Listesini Düzenle');
 f.add({id:'p2',name:'Mehmet Örnek',relationship:'Eşi',relativePassengerId:'p1',accounting:{payments:[]}});
 await f.env.savePassengerList();assert.equal(f.fields.listId.value,id);assert.equal(f.ids(),1);assert.equal(f.env.state.passengerLists.length,2);
 const saved=f.env.state.passengerLists.find(l=>l.id===id);assert.equal(saved.passengers.length,2);assert.equal(saved.passengers[1].relativePassengerId,'p1');assert.equal(saved.passengers[0].accounting.payments[0].amount,100);assert.equal(f.env.state.passengerLists.find(l=>l.id==='other').passengers[0].name,'Diğer Tur');
 f.rows()[0].name='Ayşe Düzenlendi';await f.env.savePassengerList();assert.equal(f.env.state.passengerLists.find(l=>l.id===id).passengers[0].name,'Ayşe Düzenlendi');assert.equal(f.env.state.passengerLists.length,2);
 const repeat=fixture();let release,calls=0;repeat.env.saveData=async()=>{calls++;await new Promise(r=>release=r);return true;};
 const pending=repeat.env.savePassengerList();await repeat.env.savePassengerList();assert.equal(calls,1);assert.equal(repeat.fields.savePassengerList.disabled,true);assert.equal(repeat.fields.savePassengerList.textContent,'Kaydediliyor…');release();await pending;assert.equal(repeat.fields.savePassengerList.disabled,false);assert.equal(repeat.ids(),1);
 const retry=fixture();let tries=0;retry.env.saveData=async()=>++tries>1;await retry.env.savePassengerList();const retryId=retry.fields.listId.value;await retry.env.savePassengerList();assert.equal(retry.fields.listId.value,retryId);assert.equal(retry.ids(),1);
 const canonical=fixture();canonical.env.saveData=async()=>{canonical.env.state.passengerLists[0].passengers[0].accounting.payments.push({id:'remote',amount:50});return true;};await canonical.env.savePassengerList();assert.equal(canonical.rows()[0].accounting.payments.length,2,'Editor must reload canonical saved accounting before the next edit');
 console.log('Actual passenger save: repeated append/update keeps one list and stable passenger/payment/relation IDs; double-click and retry keep one identity; editor reloads canonical response.');
})().catch(e=>{console.error(e);process.exitCode=1;});
