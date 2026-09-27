(function (root) {
    'use strict';
    const LEGACY = '__unassigned__';
    const labels = { active: 'Aktif', completed: 'Tamamlandı', draft: 'Taslak' };
    const tabs = { overview: 'Tur özeti', passengers: 'Yolcular & odalar', accounting: 'Tahsilatlar', costs: 'Giderler & kâr', buses: 'Otobüs düzeni' };
    const permission = { overview: null, passengers: 'viewPassengers', accounting: 'viewAccounting', costs: 'viewCosts', buses: 'viewPassengers' };
    const normalize = value => String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    function buildTourCards(tours = [], lists = []) {
        const ids = new Set(tours.map(t => String(t.id)));
        const counts = new Map();
        for (const list of lists) {
            const id = ids.has(String(list.tourId)) ? String(list.tourId) : LEGACY;
            const count = counts.get(id) || { passengerCount: 0, listCount: 0 };
            count.passengerCount += (list.passengers || []).length;
            count.listCount++;
            counts.set(id, count);
        }
        const cards = tours.map(t => ({ id: String(t.id), title: t.title || 'İsimsiz tur', type: t.type || 'umre', status: t.status || 'active', departureDate: t.departureDate || '', durationDays:t.durationDays, passengerCount: 0, listCount: 0, ...counts.get(String(t.id)), legacy: false }));
        if (counts.has(LEGACY)) cards.push({ id: LEGACY, title: 'Tur atanmamış kayıtlar', type: 'legacy', status: 'active', departureDate: '', ...counts.get(LEGACY), legacy: true });
        return cards;
    }
    function filterTourCards(cards, query = '', filter = 'all') {
        const words = normalize(query).trim().split(/\s+/).filter(Boolean);
        return cards.filter(card => (filter === 'all' || card.status === filter) && words.every(word => normalize(`${card.title} ${card.type} ${card.departureDate}`).includes(word)));
    }
    function routeFor(id, tab = 'overview') { return `#work/tour/${encodeURIComponent(id)}/${Object.hasOwn(tabs, tab) ? tab : 'overview'}`; }
    function parseRoute(hash) {
        const match = /^#work\/tour\/([^/]+)\/(overview|passengers|accounting|costs|buses)$/.exec(hash || '');
        if (!match) return null;
        try { return { id: decodeURIComponent(match[1]), tab: match[2] }; } catch (_) { return null; }
    }
    const api = { buildTourCards, filterTourCards, routeFor, parseRoute };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.TurizmWorkspaceUI = api;
    if (typeof document === 'undefined') return;
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    const icon = name => `<svg class="workspace-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/>',people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2m1-16a3 3 0 0 1 0 6m2 4a6 6 0 0 1 3 6"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',plus:'<path d="M12 5v14M5 12h14"/>'})[name] || ''}</svg>`;
    const dateLabel = value => value ? new Date(value + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tarih belirtilmedi';

    api.create = function (hooks) {
        let modern = true;
        try { modern = localStorage.getItem('turizmWorkspaceAppearanceV1') !== 'classic'; } catch (_) {}
        let selectedId = '', view = 'home', company = '', currentModel, query = '', filter = 'current', homePage = 1, mounted = false;
        const baseline = new Map();
        const $ = id => document.getElementById(id);
        const body = document.body;
        const title = document.querySelector('.admin-topbar h1');
        const classicTitle = title?.textContent || 'Yönetici Paneli';
        const discardButtons = new Map();
        ['tab-costs', 'tab-accounting'].forEach(id => {
            const button = document.createElement('button'); button.type = 'button'; button.hidden = true;
            button.className = 'btn btn-outline dark workspace-draft-discard'; button.textContent = 'Kaydedilmeyen değişikliklerden vazgeç';
            button.onclick = async () => { if (await window.askWorkspaceConfirmation('Bu bölümdeki kaydedilmemiş değişikliklerden vazgeçilsin mi? Kayıtlı bilgiler değişmez.')) { hooks.discardPanel(id); checkpoint(id); } };
            $(id).prepend(button); discardButtons.set(id, button);
        });
        document.addEventListener('input', updateDraftButtons);
        document.addEventListener('change', updateDraftButtons);
        const home = document.createElement('section'); home.id = 'workspaceHome'; home.className = 'workspace-home'; home.hidden = true;
        home.innerHTML = `<div class="workspace-heading"><div><span class="workspace-kicker">TURİZM MUHASEBE</span><h2>Turlarınız, bir arada.</h2><p>Bir tur seçin; yolcular, tahsilatlar ve giderler aynı yerde.</p></div><button type="button" class="btn btn-gold" data-workspace-new>${icon('plus')} Yeni tur</button></div><div class="workspace-summary"></div><div class="workspace-toolbar"><label class="workspace-search">${icon('search')}<input type="search" placeholder="Tur adı veya tarih ara…" aria-label="Tur ara" autocomplete="off"></label><div class="workspace-filters" role="group" aria-label="Tur durumu">${Object.entries({current:'Güncel',past:'Geçmiş',draft:'Taslak',all:'Tümü'}).map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="${key==='all'}">${label}</button>`).join('')}</div></div><p class="workspace-results-count" aria-live="polite"></p><div class="workspace-tour-grid"></div><p class="workspace-rollback-note">Görünümü istediğiniz zaman değiştirebilirsiniz. Kayıtlarınız aynı kalır.</p>`;
        const header = document.createElement('section'); header.className = 'workspace-tour-header'; header.hidden = true;
        const detail = document.createElement('section'); detail.className = 'workspace-detail-summary'; detail.hidden = true;
        const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'workspace-toolbar-toggle btn btn-outline dark'; toggle.id = 'workspaceAppearanceToggle';
        const nav = document.createElement('button'); nav.type = 'button'; nav.className = 'workspace-nav-button'; nav.innerHTML = icon('grid') + '<span>Tur çalışma alanı</span>';
        document.querySelector('.admin-main').insertBefore(home, $('tab-dashboard'));
        home.after(header, detail);
        document.querySelector('.admin-topbar-actions').prepend(toggle);
        document.querySelector('.admin-sidebar .admin-tab').before(nav);
        nav.onclick = () => navigate('', 'home');
        home.querySelector('input').addEventListener('input', event => { query = event.target.value; homePage=1; drawCards(); });
        home.addEventListener('click', event => {
            const status = event.target.closest('[data-filter]');
            if (status) { filter = status.dataset.filter; homePage=1; drawCards(); }
            const open = event.target.closest('[data-workspace-open]');
            if (open) navigate(open.dataset.workspaceOpen, 'overview');
            if (event.target.closest('[data-workspace-new]') && canLeave()) { selectedId = ''; hooks.setTour(''); showLegacy('tours'); hooks.newTour(); checkpoint('tab-tours'); }
        });
        header.addEventListener('click', event => {
            if (event.target.closest('[data-workspace-back]')) navigate('', 'home');
            const tab = event.target.closest('[data-workspace-tab]'); if (tab) navigate(selectedId, tab.dataset.workspaceTab);
        });
        detail.addEventListener('click', event => {
            const tab = event.target.closest('[data-workspace-tab]'); if (tab) navigate(selectedId, tab.dataset.workspaceTab);
            if (event.target.closest('[data-workspace-edit]') && canLeave()) { const id = selectedId; selectedId = ''; hooks.setTour(''); showLegacy('tours'); hooks.editTour(id); checkpoint('tab-tours'); }
        });
        toggle.onclick = () => {
            if (hooks.hasExtraChanges?.()) { hooks.toast('Otobüs planını kaydedin veya Vazgeç ile geri alın.'); return; }
            // Appearance changes preserve the existing form DOM and never save business data.
            modern = !modern;
            if (!modern) { selectedId = ''; hooks.setTour(''); }
            try { localStorage.setItem('turizmWorkspaceAppearanceV1', modern ? 'modern' : 'classic'); } catch (_) {}
            body.classList.toggle('workspace-modern', modern);
            hooks.appearanceChanged(modern);
            if (title) title.textContent = modern ? 'Turizm Muhasebe' : classicTitle;
            updateDraftButtons();
            toggle.textContent = modern ? 'Klasik görünüme dön' : 'Yeni görünümü dene';
            nav.hidden = !modern;
            if (!modern) {
                home.hidden = header.hidden = detail.hidden = true;
                if (!document.querySelector('.admin-panel.active')) hooks.showPanel('dashboard', true);
                body.classList.remove('workspace-tour-open');
                history.replaceState({}, '', location.pathname + location.search);
            } else if (hasChanges()) {
                view = document.querySelector('.admin-panel.active')?.id.replace('tab-', '') || 'dashboard';
                paint();
            } else navigate(selectedId, selectedId ? 'overview' : 'home', true);
        };
        function fingerprint(panelId) {
            if (panelId === 'tab-buses') return '';
            const panel = $(({ 'tab-passengers': 'passengerEditorCard', 'tab-tours': 'tourForm', 'tab-costs': 'tourCostForm', 'tab-accounting': 'accountingSearchResults' })[panelId] || panelId);
            if (!panel) return '';
            const inputs = [...panel.querySelectorAll('input,textarea,select')];
            if (panelId === 'tab-costs' && $('costCurrency')) inputs.push($('costCurrency'));
            return JSON.stringify(inputs.filter(input => !input.matches('[type="search"], [data-mrz], [data-tc], #costTourSelect, #listTourSelect')).map(input => [input.id || input.className || input.name, input.type === 'checkbox' ? input.checked : input.value]));
        }
        function checkpoint(panelId) { if (panelId) baseline.set(panelId, fingerprint(panelId)); else ['tab-passengers','tab-tours','tab-costs','tab-accounting'].forEach(id => { if (!baseline.has(id)) baseline.set(id, fingerprint(id)); }); updateDraftButtons(); }
        function hasChanges(panelId) { if (hooks.hasExtraChanges?.(panelId)) return true; return [...baseline].some(([id, value]) => (!panelId || id === panelId) && fingerprint(id) !== value); }
        function updateDraftButtons() { discardButtons.forEach((button,id) => { button.hidden = !modern || !hasChanges(id); }); }
        function canLeave() { if (hooks.hasExtraChanges?.()) { hooks.toast('Otobüs planında kaydedilmemiş değişiklik var. Planı kaydedin veya Vazgeç düğmesini kullanın.'); return false; } if (!modern || !hasChanges()) return true; hooks.toast('Kaydedilmemiş değişiklik var. Açık formu kaydedin veya Temizle / Vazgeç düğmesini kullanın.'); return false; }
        function selectedCard() { return currentModel?.cards.find(card => card.id === selectedId); }
        function drawCards() {
            if (!currentModel) return;
            const filtered = window.TurizmWorkspaceCollections.filterTours(currentModel.cards,{query,status:filter});
            const page = window.TurizmWorkspaceCollections.paginate(filtered,homePage,6); homePage=page.page; const cards=page.items;
            home.querySelectorAll('[data-filter]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.filter===filter)); button.classList.toggle('active', button.dataset.filter===filter); });
            home.querySelector('.workspace-results-count').textContent = `${page.start}–${page.end} / ${page.total} tur · Geçmiş turlar silinmez, Geçmiş sekmesinden açılır.`;
            home.querySelector('.workspace-tour-grid').innerHTML = cards.length ? cards.map(card => `<article class="workspace-tour-card" data-status="${escape(card.status)}"><div class="workspace-tour-top"><span class="workspace-tour-type">${escape(({umre:'Umre',hac:'Hac',yurtici:'Yurt içi',legacy:'Eski kayıtlar'})[card.type] || 'Tur')}</span><span class="workspace-tour-status" data-status="${escape(card.status)}">${escape(labels[card.status] || card.status)}</span></div><h3>${escape(card.title)}</h3><p class="workspace-tour-date">${icon('calendar')}${escape(dateLabel(card.departureDate))}</p><div class="workspace-tour-metrics"><div><strong>${card.passengerCount}</strong><span>Yolcu</span></div><div><strong>${card.listCount}</strong><span>Kayıtlı liste</span></div></div><button type="button" class="workspace-tour-open" data-workspace-open="${escape(card.id)}" aria-label="${escape(card.title)} turunu aç">Turu aç ${icon('arrow')}</button></article>`).join('') : '<div class="workspace-empty"><h3>Tur bulunamadı</h3><p>Başka bir adla arayın veya tur durumu filtresini değiştirin.</p></div>';
            let pager=home.querySelector('.collection-pagination');
            if(!pager){pager=document.createElement('nav');pager.className='collection-pagination';pager.setAttribute('aria-label','Tur sayfaları');home.querySelector('.workspace-tour-grid').after(pager);}
            pager.innerHTML='<button type="button" data-home-prev>← Önceki</button><span>'+page.page+' / '+page.pageCount+'</span><button type="button" data-home-next>Sonraki →</button>';
            pager.querySelector('[data-home-prev]').disabled=page.page===1;pager.querySelector('[data-home-next]').disabled=page.page===page.pageCount;
            pager.querySelector('[data-home-prev]').onclick=()=>{homePage--;drawCards();};pager.querySelector('[data-home-next]').onclick=()=>{homePage++;drawCards();};
        }
        function paint() {
            if (!currentModel) return;
            body.classList.toggle('workspace-modern', modern);
            if (title) title.textContent = modern ? 'Turizm Muhasebe' : classicTitle;
            toggle.textContent = modern ? 'Klasik görünüme dön' : 'Yeni görünümü dene'; nav.hidden = !modern;
            if (!modern || !currentModel.loggedIn) { home.hidden=header.hidden=detail.hidden=true; return; }
            const card=selectedCard();
            home.hidden = view !== 'home';
            header.hidden = !card || !Object.hasOwn(tabs, view);
            detail.hidden = view !== 'overview' || !card;
            body.classList.toggle('workspace-tour-open', !header.hidden);
            nav.classList.toggle('active', view==='home' || !header.hidden);
            home.querySelector('[data-workspace-new]').hidden = !currentModel.permissions.manageTours;
            home.querySelector('.workspace-summary').innerHTML = `<article><span>Aktif turlar</span><strong>${currentModel.cards.filter(t=>t.status==='active'&&!t.legacy).length}</strong><small>Devam eden organizasyonlar</small></article><article><span>Toplam yolcu</span><strong>${currentModel.cards.reduce((n,t)=>n+t.passengerCount,0)}</strong><small>Kayıtlı listelerinizde</small></article><article><span>Kayıtlı listeler</span><strong>${currentModel.cards.reduce((n,t)=>n+t.listCount,0)}</strong><small>Tur bazında düzenli takip</small></article>`;
            drawCards();
            if (!card) return;
            const allowedTabs=Object.entries(tabs).filter(([key])=> (!permission[key] || currentModel.permissions[permission[key]]) && !(card.legacy&&['costs','buses'].includes(key)));
            header.innerHTML=`<button type="button" class="workspace-back" data-workspace-back>← Tüm turlar</button><div class="workspace-tour-heading"><div><span class="workspace-kicker">TUR ÇALIŞMA ALANI</span><h2>${escape(card.title)}</h2><p>${escape(dateLabel(card.departureDate))} · ${card.passengerCount} yolcu · ${escape(currentModel.companyName)}</p></div><span class="workspace-tour-status" data-status="${escape(card.status)}">${escape(labels[card.status])}</span></div><nav class="workspace-tour-tabs" aria-label="Seçili tur bölümleri">${allowedTabs.map(([key,label])=>`<button type="button" data-workspace-tab="${key}" class="${view===key?'active':''}" aria-current="${view===key?'page':'false'}">${label}</button>`).join('')}</nav>`;
            detail.innerHTML=`<div class="workspace-heading"><div><h3>Bu turda ne yapmak istersiniz?</h3><p>Her bölüm yalnızca seçtiğiniz tura ait kayıtları gösterir.</p></div>${!card.legacy&&currentModel.permissions.manageTours?'<button type="button" class="btn btn-outline dark" data-workspace-edit>Tur bilgilerini düzenle</button>':''}</div><div class="workspace-tour-grid">${allowedTabs.filter(([key])=>key!=='overview').map(([key,label])=>`<article class="workspace-tour-card"><span class="workspace-kicker">${escape(({passengers:'YOLCU YÖNETİMİ',accounting:'ÖDEME TAKİBİ',costs:'MALİYET KONTROLÜ',buses:'YOLCULUK PLANI'})[key])}</span><h3>${label}</h3><p>${escape(({passengers:`${card.passengerCount} yolcu, ${card.listCount} liste. Kayıtlar, odalar ve pasaport bilgileri.`,accounting:'Tahsilat alın, kalan bakiyeleri ve makbuzları görüntüleyin.',costs:'Otel, uçuş ve diğer giderleri takip edin; turun net kârını görün.',buses:'Otobüsleri ve koltukları düzenleyin; yolcuları birlikte yerleştirin.'})[key])}</p><button type="button" class="workspace-tour-open" data-workspace-tab="${key}">Bölümü aç ${icon('arrow')}</button></article>`).join('')}</div>`;
        }
        function navigate(id, tab, replace = false) {
            if (!canLeave()) return false;
            if (id === LEGACY && ['costs','buses'].includes(tab)) { hooks.toast('Maliyetler için kayıtlı bir tur seçin.'); return false; }
            if (id && !currentModel?.cards.some(card=>card.id===id)) { hooks.toast('Bu tur mevcut firma hesabında bulunamadı.'); return false; }
            if (permission[tab] && !currentModel?.permissions[permission[tab]]) return false;
            selectedId=id; view=tab; hooks.setTour(id);
            if (['home','overview'].includes(tab)) document.querySelectorAll('.admin-panel, .admin-tab').forEach(node=>node.classList.remove('active'));
            else { hooks.prepareTour(id,tab); hooks.showPanel(tab,true); checkpoint('tab-'+tab); }
            paint();
            const hash=id ? routeFor(id,tab) : '#work';
            history[replace?'replaceState':'pushState']({},'', location.pathname+location.search+hash);
            return true;
        }
        function showLegacy(tab) { view=tab; home.hidden=header.hidden=detail.hidden=true; body.classList.remove('workspace-tour-open'); hooks.showPanel(tab,true); paint(); }
        function panelChanged(tab) {
            if (!modern) return;
            view=tab;
            if (!Object.hasOwn(tabs,tab)) { selectedId=''; hooks.setTour(''); }
            paint();
            history.replaceState({},'',location.pathname+location.search+(selectedId?routeFor(selectedId,tab):'#work/section/'+tab));
        }
        function refresh() {
            currentModel=hooks.snapshot();
            if (company!==currentModel.companyId) { company=currentModel.companyId; homePage=1;query='';filter='current';home.querySelector('input').value=''; selectedId=''; view='home'; hooks.setTour(''); baseline.clear(); mounted=false; }
            if (!currentModel.loggedIn) { mounted=false; baseline.clear(); selectedId=''; hooks.setTour(''); paint(); return; }
            checkpoint();
            if (modern&&!mounted) { mounted=true; const route=parseRoute(location.hash); if (!route || !currentModel.cards.some(card=>card.id===route.id) || !navigate(route.id,route.tab,true)) navigate('','home',true); }
            else { if (selectedId&&!selectedCard()) navigate('','home',true); paint(); }
        }
        window.addEventListener('popstate',()=>{ if(!modern)return;const route=parseRoute(location.hash);if(!navigate(route?.id||'',route?.tab||'home',true))history.replaceState({},'',location.pathname+location.search+(selectedId?routeFor(selectedId,view):'#work')); });
        window.addEventListener('beforeunload',event=>{if(hooks.hasExtraChanges?.()||(modern&&hasChanges())){event.preventDefault();event.returnValue='';}});
        body.classList.toggle('workspace-modern',modern);
        return { refresh, checkpoint, canLeave, hasChanges, panelChanged, navigate, isModern:()=>modern, selectedId:()=>selectedId };
    };
})(typeof window==='undefined'?globalThis:window);
