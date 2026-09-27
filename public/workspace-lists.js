(function () {
    'use strict';
    const memories = new Map();
    const api = window.TurizmWorkspaceCollections;
    function clear(target) {
        if (!target) return;
        (target._collectionControls || []).forEach(el => el.remove());
        target._collectionDraw = target._collectionReveal = null;
        target._collectionControls = [];
    }
    function enhance(target, records, options = {}) {
        clear(target);
        if (!target || !document.body.classList.contains('workspace-modern')) return;
        const key = options.key || target.id;
        const state = (!options.reset && memories.get(key)) || { query: '', status: options.tours ? 'current' : 'all', page: 1 };
        memories.set(key, state);
        target.parentElement.querySelectorAll(`[data-collection-for="${CSS.escape(key)}"]`).forEach(el => el.remove());
        const controls = document.createElement('div'); controls.className = 'collection-controls'; controls.dataset.collectionFor = key;
        const search = document.createElement('input'); search.type = 'search'; search.placeholder = options.placeholder || 'Ad veya tarih ara'; search.setAttribute('aria-label', options.label || search.placeholder); search.value = state.query;
        controls.append(search);
        let filter;
        if (options.tours) {
            filter = document.createElement('select'); filter.setAttribute('aria-label', 'Gösterilecek turlar');
            [['current','Güncel turlar'],['past','Geçmiş turlar'],['draft','Taslaklar'],['all','Tüm turlar']].forEach(([value,label]) => filter.add(new Option(label,value)));
            filter.value = state.status; controls.append(filter);
        }
        const foot = document.createElement('nav'); foot.className = 'collection-pagination'; foot.dataset.collectionFor = key; foot.setAttribute('aria-label', options.label || 'Liste sayfaları');
        const prev = document.createElement('button'), next = document.createElement('button'), count = document.createElement('span');
        prev.type = next.type = 'button'; prev.textContent = '← Önceki'; next.textContent = 'Sonraki →'; count.setAttribute('aria-live','polite'); foot.append(count,prev,next);
        target.before(controls); target.after(foot);
        const empty = document.createElement('p'); empty.className = 'collection-empty'; empty.dataset.collectionFor = key; empty.textContent = 'Bu filtrede kayıt yok. Aramayı veya tur filtresini değiştirin.'; target.after(empty);
        function draw() {
            const modern = document.body.classList.contains('workspace-modern');
            controls.hidden = !modern || options.search === false;
            foot.hidden = !modern;
            if (!modern) { records.forEach(record => record.node.hidden = false); empty.hidden = true; return; }
            const filtered = options.tours ? api.filterTours(records,{query:state.query,status:state.status}) : records.filter(record => api.normalizeSearch(record.search || record.title).includes(api.normalizeSearch(state.query)));
            const page = api.paginate(filtered,state.page,options.size || 6); state.page = page.page;
            const visible = new Set(page.items); records.forEach(record => record.node.hidden = !visible.has(record));
            // Reorder existing nodes only; input values and event handlers are preserved.
            if (options.tours) filtered.forEach(record => target.append(record.node));
            count.textContent = `${page.start}–${page.end} / ${page.total} kayıt · ${page.page}/${page.pageCount}`;
            prev.disabled = page.page === 1; next.disabled = page.page === page.pageCount; empty.hidden = page.total > 0;
        }
        search.oninput = () => { state.query = search.value; state.page = 1; draw(); };
        if (filter) filter.onchange = () => { state.status = filter.value; state.page = 1; draw(); };
        prev.onclick = () => { state.page--; draw(); }; next.onclick = () => { state.page++; draw(); };
        target._collectionControls = [controls,foot,empty];
        target._collectionReveal = node => {
            state.query = ''; search.value = ''; state.status = 'all';
            if (filter) filter.value = 'all';
            const ordered = options.tours ? api.filterTours(records,{status:'all'}) : records;
            state.page = Math.floor(ordered.findIndex(record => record.node === node) / (options.size || 6)) + 1;
            draw();
        };
        draw();
        target._collectionDraw = draw;
    }
    window.TurizmWorkspaceLists = { enhance, clear, reveal: (target,node) => target?._collectionReveal?.(node), reset: () => memories.clear(), refresh: () => document.querySelectorAll('[id],.program-debtor-rows').forEach(el => el._collectionDraw?.()) };
})();
