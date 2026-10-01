(function(){
 'use strict';
 const q=new URLSearchParams(location.search),app=q.get('desktop')==='1'||q.get('mobile')==='1';
 if(!app)return;
 const doc=document.documentElement;
 doc.classList.add('accounting-app','app-booting');
 const media=window.matchMedia('(prefers-color-scheme: dark)');
 let choice='system';try{choice=localStorage.getItem('turizmThemeV1')||'system';}catch(_){}
 if(!['system','light','dark'].includes(choice))choice='system';
 function apply(){doc.dataset.theme=choice==='system'?(media.matches?'dark':'light'):choice;document.querySelectorAll('[data-theme-choice]').forEach(s=>s.value=choice);}
 apply();media.addEventListener('change',apply);
 function control(){
  const label=document.createElement('label');label.className='workspace-theme-control';label.append('Görünüm ');
  const select=document.createElement('select');select.dataset.themeChoice='';select.setAttribute('aria-label','Görünüm teması');
  for(const [value,text] of [['system','Cihaza göre'],['light','Açık'],['dark','Koyu']]){const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}
  select.value=choice;select.onchange=()=>{choice=select.value;try{localStorage.setItem('turizmThemeV1',choice);}catch(_){}apply();};label.append(select);return label;
 }
 let watchdog=setTimeout(()=>{const box=document.getElementById('appBoot');if(box){box.querySelector('p').textContent='Bağlantı yavaş veya uygulama yüklenemedi.';box.querySelector('button').hidden=false;}},15000);
 window.TurizmTheme={install(){for(const host of [document.querySelector('.admin-topbar-actions'),document.querySelector('.workspace-login-shell .login-card')])if(host&&!host.querySelector('[data-theme-choice]'))host.prepend(control());},ready(){clearTimeout(watchdog);doc.classList.remove('app-booting');document.getElementById('appBoot')?.remove();}};
})();
