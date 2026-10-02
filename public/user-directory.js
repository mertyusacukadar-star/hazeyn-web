(function(){
 'use strict';
 const panel=document.getElementById('tab-users'),form=document.getElementById('desktopUserForm'),list=document.getElementById('desktopUserList');
 if(!panel||!form||!list||!/[?&](desktop|mobile)=1/.test(location.search))return;
 const toolbar=document.createElement('div');toolbar.className='user-directory-toolbar';
 toolbar.innerHTML='<div><span class="section-kicker">PERSONEL VE FİRMALAR</span><h2>Kullanıcılar & Yetkiler</h2></div><div class="user-directory-actions"><button type="button" class="btn btn-gold" data-new-user>+ Yeni çalışan</button><span id="companyManagerAction"></span></div>';
 panel.prepend(toolbar);const card=list.closest('.admin-card');card.classList.add('user-directory-card');
 const tools=document.createElement('div');tools.className='user-directory-tools';tools.innerHTML='<label>Kullanıcı ara<input type="search" aria-label="Kayıtlı kullanıcı ara" placeholder="Ad veya kullanıcı adı yazın"></label><label>Durum<select aria-label="Kullanıcı durumu"><option value="all">Tümü</option><option value="active">Aktif</option><option value="inactive">Pasif</option></select></label><span data-user-count aria-live="polite"></span><div><button type="button" data-user-prev>← Önceki</button><span data-user-page></span><button type="button" data-user-next>Sonraki →</button></div>';
 list.before(tools);let page=0;
 const fold=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
 function refresh(){
  const query=fold(tools.querySelector('input').value),status=tools.querySelector('select').value,cards=[...list.querySelectorAll('[data-desktop-user-id]')];
  const matches=cards.filter(c=>(status==='all'||c.classList.contains('inactive')===(status==='inactive'))&&fold(c.querySelector('b')?.textContent+' '+c.querySelector('small')?.textContent).includes(query));
  page=Math.max(0,Math.min(page,Math.ceil(matches.length/8)-1));const shown=new Set(matches.slice(page*8,(page+1)*8));cards.forEach(c=>c.hidden=!shown.has(c));
  tools.querySelector('[data-user-count]').textContent=matches.length+' çalışan';tools.querySelector('[data-user-page]').textContent=(page+1)+' / '+Math.max(1,Math.ceil(matches.length/8));tools.querySelector('[data-user-prev]').disabled=page===0;tools.querySelector('[data-user-next]').disabled=(page+1)*8>=matches.length;
 }
 function openEditor(open){const wasOpen=panel.classList.contains('user-editor-open');panel.classList.toggle('user-editor-open',open);form.setAttribute('aria-label',document.getElementById('desktopUserId').value?'Çalışan yetkilerini düzenle':'Yeni çalışan');form.querySelector('h2').textContent=document.getElementById('desktopUserId').value?'Çalışanı düzenle':'Yeni çalışan';if(open)form.scrollIntoView({block:'start',behavior:'smooth'});else if(wasOpen&&panel.getClientRects().length)toolbar.scrollIntoView({block:'start',behavior:'smooth'});}
 toolbar.querySelector('[data-new-user]').onclick=()=>{document.getElementById('desktopUserReset').click();openEditor(true);document.getElementById('desktopUserDisplayName').focus();};
 tools.querySelector('input').oninput=()=>{page=0;refresh();};tools.querySelector('select').onchange=()=>{page=0;refresh();};tools.querySelector('[data-user-prev]').onclick=()=>{page--;refresh();};tools.querySelector('[data-user-next]').onclick=()=>{page++;refresh();};
 window.TurizmUserDirectory={refresh,openEditor};refresh();
})();
