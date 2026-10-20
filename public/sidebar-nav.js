(function(){
'use strict';
// Collapsible desktop sidebar; the choice is remembered on this device only.
const KEY='turizmSidebarCollapsedV1';
function stored(){try{return localStorage.getItem(KEY)==='true';}catch(_){return false;}}
function remember(value){try{localStorage.setItem(KEY,String(value));}catch(_){}}
function init(){
 const sidebar=document.querySelector('.admin-sidebar');
 if(!sidebar||sidebar.querySelector('.sidebar-toggle'))return;
 const button=document.createElement('button');
 button.type='button';button.className='sidebar-toggle';
 const apply=collapsed=>{
  document.body.classList.toggle('sidebar-collapsed',collapsed);
  const label=collapsed?'Menüyü genişlet':'Menüyü daralt';
  button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-expanded',String(!collapsed));
 };
 button.addEventListener('click',()=>{const next=!document.body.classList.contains('sidebar-collapsed');apply(next);remember(next);});
 // Collapsed items show only icons, so their names appear as tooltips.
 sidebar.addEventListener('mouseover',e=>{const item=e.target.closest('.admin-tab,.admin-view,.admin-logout,.workspace-nav-button');if(item)item.title=document.body.classList.contains('sidebar-collapsed')?item.textContent.trim():'';});
 sidebar.prepend(button);apply(stored());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
