(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.TurizmWorkspaceCollections = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function normalizeSearch(value) {
        return String(value ?? '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    }

    function localToday() {
        const now = new Date();
        return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // Construct local noon explicitly: parsing YYYY-MM-DD directly uses UTC and
    // can move a departure to the previous day in a negative UTC offset.
    function calendarDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
        if (!match) return null;
        const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
        const date = new Date(0);
        date.setHours(12, 0, 0, 0);
        date.setFullYear(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
    }

    function tourLifecycle(tour, today = localToday()) {
        const item = tour || {};
        if (item.status === 'draft') return 'draft';
        if (item.status === 'completed') return 'past';
        const departure = calendarDate(item.departureDate);
        if (!departure) return 'current';
        const reference = calendarDate(today) || calendarDate(localToday());
        const duration = Number(item.durationDays);
        if (Number.isFinite(duration) && duration > 0) {
            departure.setDate(departure.getDate() + Math.max(1, Math.ceil(duration)) - 1);
        }
        return departure < reference ? 'past' : 'current';
    }

    function filterTours(items, options = {}) {
        const { query = '', today = localToday() } = options || {};
        const requestedStatus = options?.status || 'current';
        const status = ['current', 'past', 'draft', 'all'].includes(requestedStatus) ? requestedStatus : 'current';
        const words = normalizeSearch(query).split(' ').filter(Boolean);
        const typeLabels = { umre: 'Umre', hac: 'Hac', yurtici: 'Yurt içi', legacy: 'Eski kayıtlar' };
        const rank = { current: 0, past: 1, draft: 2 };
        return (Array.isArray(items) ? items : []).map((item, index) => ({
            item,
            index,
            lifecycle: tourLifecycle(item, today),
            date: calendarDate(item?.departureDate)
        })).filter(({ item, lifecycle }) => {
            if (status !== 'all' && lifecycle !== status) return false;
            const searchable = normalizeSearch([item?.title, item?.type, typeLabels[item?.type], item?.departureDate].filter(Boolean).join(' '));
            return words.every(word => searchable.includes(word));
        }).sort((a, b) => {
            if (status === 'all' && a.lifecycle !== b.lifecycle) return rank[a.lifecycle] - rank[b.lifecycle];
            if (!a.date || !b.date) return a.date ? -1 : b.date ? 1 : a.index - b.index;
            const difference = a.date.getTime() - b.date.getTime();
            return (a.lifecycle === 'past' ? -difference : difference) || a.index - b.index;
        }).map(entry => entry.item);
    }

    function paginate(items, page = 1, size = 8) {
        const source = Array.isArray(items) ? items : [];
        const numericSize = Number(size);
        const pageSize = Number.isFinite(numericSize) && numericSize > 0 ? Math.max(1, Math.floor(numericSize)) : 8;
        const total = source.length;
        const pageCount = Math.max(1, Math.ceil(total / pageSize));
        const numericPage = Number(page);
        const selectedPage = Math.min(pageCount, Math.max(1, Number.isFinite(numericPage) ? Math.floor(numericPage) : 1));
        const offset = (selectedPage - 1) * pageSize;
        return {
            items: source.slice(offset, offset + pageSize),
            page: selectedPage,
            pageCount,
            total,
            start: total ? offset + 1 : 0,
            end: Math.min(offset + pageSize, total)
        };
    }

    return { normalizeSearch, tourLifecycle, filterTours, paginate };
});
