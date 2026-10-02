(function(){
 'use strict';
 if(!/[?&](desktop|mobile)=1/.test(location.search))return;
 const fold=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
 for(const id of ['listTourSelect','costTourSelect']){
  const select=document.getElementById(id);if(!select)continue;
  const wrap=document.createElement('div');wrap.className='tour-picker';select.after(wrap);select.classList.add('tour-search-native');
  const input=document.createElement('input');input.type='search';input.placeholder='Tur adı veya tarih yazıp seçin';input.setAttribute('role','combobox');input.setAttribute('aria-label',id==='costTourSelect'?'Maliyet için tur ara ve seç':'Yolcu listesi için tur ara ve seç');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.autocomplete='off';
  const popup=document.createElement('div');popup.className='tour-picker-options';popup.id=id+'-options';popup.setAttribute('role','listbox');popup.setAttribute('aria-label','Tur arama sonuçları');popup.hidden=true;input.setAttribute('aria-controls',popup.id);wrap.append(input,popup);
  let matches=[],index=-1;
  const selectedText=()=>select.selectedOptions[0]?.textContent||'Tur seçin';
  function close(){popup.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');input.value=selectedText();}
  function refresh(){input.disabled=select.disabled;if(popup.hidden)input.value=selectedText();else if(select.disabled)close();else render();}
  function mark(){[...popup.children].forEach((el,i)=>el.classList.toggle('is-current',i===index));const item=popup.children[index];if(item){input.setAttribute('aria-activedescendant',item.id);item.scrollIntoView({block:'nearest'});}}
  function choose(option){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));close();input.focus({preventScroll:true});}
  function render(){
   input.removeAttribute('aria-activedescendant');
   const terms=fold(input.value).trim().split(/\s+/).filter(Boolean);
   matches=[...select.options].filter(o=>{const date=o.dataset.searchDate||'';const text=fold(o.textContent+' '+date+' '+date.split('-').reverse().join('.'));return !o.disabled&&terms.every(t=>text.includes(t));});
   popup.replaceChildren();matches.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(o.value===select.value));b.tabIndex=-1;b.id=popup.id+'-'+i;b.textContent=o.textContent;b.onpointerdown=e=>e.preventDefault();b.onclick=()=>choose(o);popup.append(b);});
   if(!matches.length){const empty=document.createElement('p');empty.textContent='Bu aramada tur bulunamadı.';popup.append(empty);}
   index=matches.length?0:-1;
  }
  function open(){if(select.disabled)return;input.value='';popup.hidden=false;input.setAttribute('aria-expanded','true');render();}
  input.onfocus=open;input.onclick=()=>{if(popup.hidden)open();};input.oninput=()=>{popup.hidden=false;input.setAttribute('aria-expanded','true');render();};input.onblur=close;
  input.onkeydown=e=>{if(e.key==='Escape'){close();e.preventDefault();return;}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(popup.hidden)open();else if(matches.length)index=(index+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;mark();}else if(e.key==='Enter'&&!popup.hidden){e.preventDefault();if(matches[index])choose(matches[index]);}};
  new MutationObserver(refresh).observe(select,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});refresh();
 }
})();
