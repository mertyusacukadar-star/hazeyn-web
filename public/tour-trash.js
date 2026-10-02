(function(root){
 'use strict';
 const clone=value=>JSON.parse(JSON.stringify(value));
 function inspect(state,id){
  const tour=(state.tours||[]).find(t=>String(t.id)===String(id));
  if(!tour)throw Error('Tur bulunamadı.');
  const lists=(state.passengerLists||[]).filter(l=>String(l.tourId)===String(id));
  const passengers=lists.flatMap(l=>l.passengers||[]);
  return {tour,lists,passengers:passengers.length,payments:passengers.reduce((n,p)=>n+(p.accounting?.payments||[]).length,0),costs:state.tourCosts?.[id],bus:state.tourBusPlans?.[id]};
 }
 function remove(state,id,actor){
  const info=inspect(state,id),next=clone(state);
  next.deletedTours||=[];
  if(next.deletedTours.some(x=>String(x.tour.id)===String(id)))throw Error('Aynı tur kurtarma kutusunda zaten var.');
  next.deletedTours.unshift({...clone(info),deletedAt:new Date().toISOString(),deletedBy:actor});
  next.tours=next.tours.filter(t=>String(t.id)!==String(id));
  next.accountingTours=clone(next.tours);
  next.passengerLists=(next.passengerLists||[]).filter(l=>String(l.tourId)!==String(id));
  if(next.tourCosts)delete next.tourCosts[id];
  if(next.tourBusPlans)delete next.tourBusPlans[id];
  return next;
 }
 function restore(state,id){
  const next=clone(state),item=(next.deletedTours||[]).find(x=>String(x.tour.id)===String(id));
  if(!item)throw Error('Silinen tur bulunamadı.');
  if(next.tours.some(t=>String(t.id)===String(id))||(item.lists||[]).some(l=>(next.passengerLists||[]).some(a=>String(a.id)===String(l.id))))throw Error('Aynı kimlikte kayıt var; mevcut kaydı ezmemek için geri yükleme durduruldu.');
  next.tours.push(item.tour);next.accountingTours=clone(next.tours);
  next.passengerLists=[...(next.passengerLists||[]),...(item.lists||[])];
  if(item.costs){next.tourCosts||={};next.tourCosts[id]=item.costs;}
  if(item.bus){next.tourBusPlans||={};next.tourBusPlans[id]=item.bus;}
  next.deletedTours=next.deletedTours.filter(x=>String(x.tour.id)!==String(id));
  return next;
 }
 function purge(state,id){
  if(!(state.deletedTours||[]).some(x=>String(x.tour.id)===String(id)))throw Error('Silinen tur bulunamadı.');
  const next=clone(state);
  next.deletedTours=next.deletedTours.filter(x=>String(x.tour.id)!==String(id));
  return next;
 }
 const api={inspect,remove,restore,purge};root.TurizmTourTrash=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
