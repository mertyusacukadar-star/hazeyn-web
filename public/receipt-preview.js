(function(){
 'use strict';
 let active=null,onBack=null;
 // Register before the workspace router so Back dismisses the preview first.
 window.addEventListener('popstate',event=>{if(onBack){event.stopImmediatePropagation();onBack();}},true);
 window.showReceiptPreview=function(html){
  if(active)return false;
  const origin=document.activeElement,dialog=document.createElement('dialog');
  dialog.className='receipt-preview';dialog.setAttribute('aria-label','Makbuz önizlemesi');
  dialog.innerHTML='<header><strong>Makbuz önizlemesi</strong><button type="button" data-close>← Muhasebeye dön</button><button type="button" data-print disabled>Yazdır / PDF kaydet</button></header><iframe title="Tahsilat makbuzu"></iframe>';
  const frame=dialog.querySelector('iframe'),print=dialog.querySelector('[data-print]'),close=dialog.querySelector('[data-close]');
  const marker='receipt-'+Date.now(),previousOverflow=document.body.style.overflow;
  const previewStyle='<style>@media screen and (max-width:700px){.receipt{width:calc(100% - 24px);min-height:0;margin:12px;padding:16px}.head{flex-direction:column;align-items:flex-start;gap:12px;padding-bottom:20px}.head img{max-width:100%}.title{text-align:left}.title h1{font-size:22px}.receipt-no{gap:8px;margin:20px 0}.box,.detail{padding:12px;overflow-wrap:anywhere}.box b{font-size:14px}.amount{padding:16px;gap:12px;flex-wrap:wrap}.amount strong{font-size:25px}.signatures{gap:20px;margin-top:32px}}@media screen and (max-width:400px){.details{grid-template-columns:1fr}.detail:nth-child(odd){border-right:0}.detail:nth-last-child(2){border-bottom:1px solid #d6cdbd}}</style>';
  let historyPushed=false;
  frame.onload=()=>{if(!historyPushed){history.pushState({...history.state,receiptPreview:marker},'',location.href);historyPushed=true;}print.disabled=false;};frame.srcdoc=html.replace('</head>',previewStyle+'</head>');
  function finish(){
   onBack=null;active=null;document.body.style.overflow=previousOverflow;
   if(dialog.open)dialog.close();dialog.remove();if(origin?.isConnected)origin.focus({preventScroll:true});
  }
  function dismiss(){if(history.state?.receiptPreview===marker)history.back();else finish();}
  close.onclick=dismiss;dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  print.onclick=()=>{frame.contentWindow.focus();frame.contentWindow.print();};
  document.body.append(dialog);document.body.style.overflow='hidden';active=dialog;
  onBack=finish;
  dialog.showModal();close.focus();return true;
 };
})();
