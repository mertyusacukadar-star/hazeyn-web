(function(root) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value+'T12:00:00')) : '';
  function card(source) {
    const t = root.hazeynSiteDesign ? root.hazeynSiteDesign(source) : source;
    const slug = String(t.slug || '').replace(/[^a-z0-9-]/g,'');
    const prices = Object.values(t.roomPrices || {}).map(p => Number(String(p).replace(/USD|\$/gi,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').trim())).filter(p => p > 0);
    const price = prices.length ? Math.min(...prices)+' USD' : (t.price || 'Fiyat sorunuz');
    const hotel = [t.mekkeHotelName ? 'Mekke: '+t.mekkeHotelName : '',t.medineHotelName ? 'Medine: '+t.medineHotelName : ''].filter(Boolean).join('\n') || t.hotels || '';
    const image = /^(https?:\/\/|\/|assets\/)/.test(t.image || '') ? t.image : '/assets/hotel.svg';
    const duration = t.durationDays ? t.durationDays+' Gün' : t.nights || '';
    const cities = (Array.isArray(t.departureCities) && t.departureCities.length ? t.departureCities : ['istanbul']).map(city => ({istanbul:'İstanbul',konya:'Konya'}[String(city).toLowerCase()] || city));
    return `<article class="tour-card site-tour-card" data-program-id="${escape(t.id)}" data-program-title="${escape(t.title)}" data-program-slug="${escape(slug)}">
      <div class="tour-img"><img src="${escape(image)}" alt="${escape(t.title)}" width="600" height="400" loading="lazy" decoding="async"><span class="tour-tag">${escape(t.tag || 'Umre Programı')}</span></div>
      <div class="tour-body"><h3>${escape(t.title)}</h3><div class="tour-meta">${date(t.departureDate) ? `<span>📅 ${date(t.departureDate)}</span>` : ''}<span>◷ ${escape(duration)}</span><span>✈ ${escape(cities.join(' / '))} çıkışlı</span></div>
      ${t.summary ? `<p class="tour-description">${escape(t.summary)}</p>` : ''}<div class="tour-hotels">${escape(hotel)}</div>
      <div class="tour-bottom"><span class="price tour-price-block"><small>Başlangıç fiyatı</small><strong>Kişi başı ${escape(price)}</strong></span><a class="small-btn" data-program-link data-track="program_click" data-program-id="${escape(t.id)}" data-program-title="${escape(t.title)}" data-program-slug="${escape(slug)}" href="/${escape(slug)}" aria-label="${escape(t.title)} programını incele">Programı İncele <span aria-hidden="true">→</span></a></div></div>
    </article>`;
  }
  root.hazeynTourCard = card;
  if(typeof module !== 'undefined') module.exports = card;
})(typeof window === 'undefined' ? {hazeynSiteDesign:require('./umre-visuals').tour} : window);
