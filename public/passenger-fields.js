(function(root){
'use strict';
function isoDate(day,month,year){
  if(!/^\d{1,2}$/.test(String(day))||!/^\d{1,2}$/.test(String(month))||!/^\d{4}$/.test(String(year)))return '';
  const d=Number(day),m=Number(month),y=Number(year),date=new Date(Date.UTC(y,m-1,d));
  return y>=1900&&y<=2200&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`:'';
}
if(typeof module!=='undefined'&&module.exports){module.exports={isoDate};return;}
const editor=document.getElementById('passengerEditorCard');if(!editor)return;
const mobile=window.matchMedia('(max-width: 760px), (pointer: coarse)');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function commit(input,value){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
function openDialog(title,body,origin){
  const dialog=document.createElement('dialog');dialog.className='passenger-picker';dialog.setAttribute('aria-labelledby','passengerPickerTitle');
  dialog.innerHTML=`<div class="picker-heading"><h2 id="passengerPickerTitle">${esc(title)}</h2><button type="button" data-close aria-label="Kapat">×</button></div>${body}`;
  document.body.append(dialog);
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{dialog.remove();origin.focus({preventScroll:true});},{once:true});
  dialog.showModal();return dialog;
}
function datePicker(input){
  const [year='',month='',day='']=input.value.split('-');
  const title=input.getAttribute('aria-label')||input.closest('label')?.childNodes[0]?.textContent.trim()||'Tarih seçin';
  const months=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const dialog=openDialog(title,`<p>Gün, ay ve yılı seçip tarihi uygulayın.</p><form class="date-picker-form"><div class="date-picker-fields"><label>Gün<select name="day" required><option value="">Gün</option>${Array.from({length:31},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select></label><label>Ay<select name="month" required><option value="">Ay</option>${months.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}</select></label><label>Yıl<input name="year" type="text" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" placeholder="Örn: 1985" required></label></div><p class="picker-error" role="status"></p><div class="picker-actions"><button type="button" data-clear>Tarihi temizle</button><button type="submit" class="picker-primary">Tarihi uygula</button></div><button type="button" data-cancel>Vazgeç</button></form>`,input);
  const form=dialog.querySelector('form');form.elements.day.value=day?String(Number(day)):'';form.elements.month.value=month?String(Number(month)):'';form.elements.year.value=year;
  form.onsubmit=e=>{e.preventDefault();const value=isoDate(form.elements.day.value,form.elements.month.value,form.elements.year.value);if(!value){dialog.querySelector('.picker-error').textContent='Geçerli bir gün, ay ve yıl seçin (1900–2200).';return;}if((input.min&&value<input.min)||(input.max&&value>input.max)){dialog.querySelector('.picker-error').textContent='Bu tarih izin verilen aralığın dışında.';return;}commit(input,value);dialog.close();};
  dialog.querySelector('[data-clear]').onclick=()=>{commit(input,'');dialog.close();};dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
}
function enhanceDates(){
  editor.querySelectorAll('input[type="date"],input[data-mobile-date]').forEach(input=>{
    if(mobile.matches){input.dataset.mobileDate='true';input.type='text';input.readOnly=true;input.inputMode='none';input.placeholder='Tarih seçin';input.setAttribute('aria-haspopup','dialog');}
    else if(input.dataset.mobileDate){input.type='date';input.readOnly=false;input.removeAttribute('inputmode');input.removeAttribute('aria-haspopup');delete input.dataset.mobileDate;}
  });
}
editor.addEventListener('click',e=>{const input=e.target.closest('input[data-mobile-date]');if(input&&!input.disabled){e.preventDefault();datePicker(input);}});
editor.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('input[data-mobile-date]')){e.preventDefault();datePicker(e.target);}});
const fold=value=>value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
for(const id of ['listOriginAirport','listDestinationAirport']){
  const input=document.getElementById(id);if(!input)continue;
  const button=document.createElement('button');button.type='button';button.className='airport-picker-button';button.textContent='Havalimanı seç';button.setAttribute('aria-label',id==='listOriginAirport'?'Kalkış havalimanı seç':'Varış havalimanı seç');button.setAttribute('aria-haspopup','dialog');input.after(button);
  button.onclick=e=>{
    e.preventDefault();
    const dialog=openDialog(button.getAttribute('aria-label'),'<label class="airport-search-label">Kod veya şehir ara<input type="search" placeholder="Örn: SAW, İstanbul, Cidde" autocomplete="off"></label><div class="airport-results" aria-label="Havalimanları"></div>',button);
    const airports=[...document.querySelectorAll('#airportCodes option')].map(o=>({code:o.value,name:o.textContent}));
    const results=dialog.querySelector('.airport-results'),search=dialog.querySelector('input');
    const render=()=>{const q=fold(search.value);results.innerHTML=airports.filter(a=>fold(a.code+' '+a.name).includes(q)).map(a=>`<button type="button" data-airport="${esc(a.code)}"><b>${esc(a.code)}</b><span>${esc(a.name)}</span></button>`).join('')||'<p>Sonuç bulunamadı. Pencereyi kapatıp IATA kodunu elle yazabilirsiniz.</p>';};
    search.oninput=render;results.onclick=e=>{const choice=e.target.closest('[data-airport]');if(choice){commit(input,choice.dataset.airport);dialog.close();}};render();
  };
}
new MutationObserver(enhanceDates).observe(editor,{childList:true,subtree:true});mobile.addEventListener('change',enhanceDates);enhanceDates();
})(typeof window==='undefined'?globalThis:window);
