(function () {
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const slugify = value => String(value || '').replace(/[çÇğĞıIİöÖşŞüÜ]/g, char => ({ ç:'c',Ç:'c',ğ:'g',Ğ:'g',ı:'i',I:'i',İ:'i',ö:'o',Ö:'o',ş:'s',Ş:'s',ü:'u',Ü:'u' }[char])).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const safeUrl = (value, fallback = '') => {
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    if (/^(https?:\/\/|\/|assets\/|data:image\/)/i.test(raw)) return raw;
    return fallback;
  };
  const list = value => Array.isArray(value) ? value.filter(Boolean) : String(value || '').split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
  const formatDate = value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
    if (!match) return String(value || 'Tarih bilgisi yakında');
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  };
  const hotelFromLegacy = (value, city) => {
    const line = String(value || '').split(/\r?\n/).find(item => slugify(item).startsWith(slugify(city)));
    return line ? line.replace(/^[^:]+:\s*/, '').trim() : '';
  };
  const normalizeImages = value => list(value).map(item => typeof item === 'string' ? item : item && (item.url || item.image)).map(item => safeUrl(item)).filter(Boolean);
  const normalizeTour = source => {
    const title = String(source.title || 'Umre Programı').trim();
    const durationDays = Number(source.durationDays || source.dayCount || source.days || 0);
    const durationNights = Number(source.durationNights || source.nightCount || 0);
    const legacyDuration = String(source.nights || source.duration || '').trim();
    const roomPrices = source.roomPrices && typeof source.roomPrices === 'object' ? source.roomPrices : (source.prices || {});
    const image = safeUrl(source.image || source.coverImage, '/assets/hero.svg');
    const mekkeImages = normalizeImages(source.hotelImages && source.hotelImages.mekke).concat(normalizeImages(source.mekkeHotelImages || source.hotelMekkeImages || source.mekkeImages));
    const medineImages = normalizeImages(source.hotelImages && source.hotelImages.medine).concat(normalizeImages(source.medineHotelImages || source.hotelMedineImages || source.medineImages));
    const groupImages = normalizeImages(source.groupImages || source.galleryImages).filter(item => item !== image);
    return {
      ...source, title, slug: slugify(source.slug || title), image,
      banner: safeUrl(source.detailBannerImage, image),
      bannerTitle: String(source.detailBannerTitle || title), bannerKicker: String(source.detailBannerKicker || source.tag || 'Güncel Program'), bannerSubtitle: String(source.detailBannerSubtitle || ''),
      duration: durationDays ? `${durationDays} Gün${durationNights ? ` / ${durationNights} Gece` : ''}` : (legacyDuration || 'Süre bilgisi yakında'),
      departure: formatDate(source.departureDate),
      cities: (Array.isArray(source.departureCities) ? source.departureCities : [source.departureCity || 'İstanbul']).map(city => slugify(city) === 'konya' ? 'Konya' : 'İstanbul').filter((city, index, values) => values.indexOf(city) === index).join(' / '),
      mekkeHotel: String(source.mekkeHotelName || source.mekkeHotel || hotelFromLegacy(source.hotels, 'Mekke') || 'Program kapsamında açıklanacaktır'),
      medineHotel: String(source.medineHotelName || source.medineHotel || hotelFromLegacy(source.hotels, 'Medine') || 'Program kapsamında açıklanacaktır'),
      mekkeDistance: String(source.mekkeDistanceService || source.mekkeDistance || 'Mesafe ve servis bilgisi için bizi arayın'),
      medineDistance: String(source.medineDistanceService || source.medineDistance || 'Mesafe ve servis bilgisi için bizi arayın'),
      flight: String(source.flightDetails || source.airline || source.flight || 'Uçuş bilgisi program ekibimiz tarafından paylaşılacaktır'),
      roomPrices, price: String(source.price || roomPrices['4'] || roomPrices['3'] || roomPrices['2'] || 'Fiyat sorunuz'),
      included: list(source.includedServices || source.included), excluded: list(source.excludedServices || source.excluded),
      visits: String(source.visitProgram || source.visits || 'Mekke ve Medine ziyaretleri kafile rehberi eşliğinde programlanır.'),
      program: String(source.program || source.description || source.cardText || 'Program ayrıntıları yakında paylaşılacaktır.'),
      mekkeImages: [...new Set(mekkeImages)], medineImages: [...new Set(medineImages)], groupImages: [...new Set(groupImages)]
    };
  };
  const paragraphs = value => String(value || '').split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => `<p>${escapeHtml(line)}</p>`).join('');
  const bullets = (items, fallback, excluded = false) => `<ul class="seo-check-list${excluded ? ' excluded' : ''}">${(items.length ? items : [fallback]).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const roomCards = tour => {
    const labels = { '1':'Tek Kişilik Oda', '2':'2 Kişilik Oda', '3':'3 Kişilik Oda', '4':'4 Kişilik Oda', '5+':'5+ Kişilik Oda' };
    const entries = Object.entries(tour.roomPrices || {}).filter(([, price]) => String(price || '').trim());
    if (!entries.length) return `<article class="seo-card seo-price-card featured"><span class="section-kicker">Başlangıç fiyatı</span><h3>Güncel fiyat</h3><strong>${escapeHtml(tour.price)}</strong><p class="seo-muted">Kontenjan ve oda tipine göre teyit edilir.</p></article>`;
    return entries.map(([key, price]) => `<article class="seo-card seo-price-card${key === '2' ? ' featured' : ''}"><span class="section-kicker">Oda seçeneği</span><h3>${escapeHtml(labels[key] || `${key} Kişilik Oda`)}</h3><strong>${escapeHtml(price)}</strong><p class="seo-muted">Kişi başı program fiyatı</p></article>`).join('');
  };
  const hotelCard = (city, name, distance, images) => `<article class="seo-card seo-hotel-card">${images[0] ? `<div class="seo-hotel-media"><img src="${escapeHtml(images[0])}" alt="${escapeHtml(name)}" loading="lazy" /></div>` : ''}<div><span class="section-kicker">${city}</span><h3>${escapeHtml(name)}</h3><b>Mesafe / servis</b><p>${escapeHtml(distance)}</p></div></article>`;
  const gallery = tour => {
    const images = [...new Set([...tour.mekkeImages, ...tour.medineImages, ...tour.groupImages])];
    if (!images.length) return '';
    return `<section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Görseller</span><h2>Programdan kareler</h2></div><div class="seo-gallery">${images.map((image, index) => `<figure class="seo-gallery-card"><div class="seo-gallery-button"><img src="${escapeHtml(image)}" alt="${escapeHtml(`${tour.title} görseli ${index + 1}`)}" loading="lazy" /></div></figure>`).join('')}</div></section>`;
  };
  const whatsappHref = (number, title) => `https://wa.me/${String(number || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Merhaba, ${title} programı hakkında bilgi almak istiyorum.`)}`;

  function applySettings(settings, tour) {
    const phone = String(settings.phone || '0216 280 0 777');
    const whatsapp = String(settings.whatsapp || settings.phone2 || '905330940683');
    const instagram = String(settings.instagram || 'hazeynturizm').replace('@', '');
    $('programPhone').href = `tel:${phone.replace(/[^\d+]/g, '')}`;
    $('programWhatsapp').href = whatsappHref(whatsapp, tour.title);
    $('programInstagram').href = `https://www.instagram.com/${encodeURIComponent(instagram)}/`;
    $('footerPhone').href = `tel:${phone.replace(/[^\d+]/g, '')}`; $('footerPhone').textContent = phone;
    $('footerEmail').href = `mailto:${settings.email || 'info@hazeynturizm.com'}`; $('footerEmail').textContent = settings.email || 'info@hazeynturizm.com';
    $('footerAddress').textContent = settings.address || 'Ümraniye / İstanbul';
    $('programYear').textContent = new Date().getFullYear();
  }

  function render(tour, settings) {
    const whatsapp = whatsappHref(settings.whatsapp || settings.phone2 || '905330940683', tour.title);
    document.title = `${tour.title} | Hazeyn Turizm`;
    document.querySelector('meta[name="description"]').content = `${tour.departure} tarihli ${tour.title}. Otel, uçuş, oda fiyatları ve program ayrıntıları.`;
    $('main-content').innerHTML = `<section class="seo-hero"><img class="seo-hero-media" src="${escapeHtml(tour.banner)}" alt="${escapeHtml(tour.bannerTitle)}" /><div class="container seo-hero-copy"><div class="seo-breadcrumb"><a href="/index.html">Ana Sayfa</a><span>/</span><a href="/index.html#umre">Umre Programları</a><span>/</span><span>${escapeHtml(tour.title)}</span></div><span class="eyebrow">${escapeHtml(tour.bannerKicker)}</span><h1>${escapeHtml(tour.bannerTitle)}</h1><p>${escapeHtml(`${tour.departure} · ${tour.duration} · ${tour.cities} çıkışlı`)}</p>${tour.bannerSubtitle ? `<p class="seo-hero-subtitle">${escapeHtml(tour.bannerSubtitle)}</p>` : ''}</div></section><div class="container seo-content">
      <section class="seo-overview" aria-label="Program özeti"><article class="seo-stat"><small>Kalkış tarihi</small><strong>${escapeHtml(tour.departure)}</strong></article><article class="seo-stat"><small>Program süresi</small><strong>${escapeHtml(tour.duration)}</strong></article><article class="seo-stat"><small>Çıkış noktası</small><strong>${escapeHtml(tour.cities)}</strong></article><article class="seo-stat"><small>Başlangıç fiyatı</small><strong>${escapeHtml(tour.price)}</strong></article></section>
      <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Konaklama ve ulaşım</span><h2>Mekke ve Medine otelleri</h2></div><div class="seo-grid-2">${hotelCard('Mekke', tour.mekkeHotel, tour.mekkeDistance, tour.mekkeImages)}${hotelCard('Medine', tour.medineHotel, tour.medineDistance, tour.medineImages)}</div><article class="seo-card" style="margin-top:20px"><span class="section-kicker">Uçuş</span><h3>Havayolu ve uçuş bilgileri</h3><p>${escapeHtml(tour.flight)}</p></article></section>
      <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Oda tipine göre</span><h2>Program fiyatları</h2><p>Fiyatlar kişi başıdır; müsaitlik ve kontenjan rezervasyon sırasında teyit edilir.</p></div><div class="seo-grid-3">${roomCards(tour)}</div><p style="margin-top:20px"><a class="btn btn-gold whatsapp-link" href="${escapeHtml(whatsapp)}" target="_blank" rel="noopener">WhatsApp’tan Bilgi Al</a></p></section>
      <section class="seo-section"><div class="seo-grid-2"><article class="seo-card"><span class="section-kicker">Fiyata dahil</span><h2>Dahil hizmetler</h2>${bullets(tour.included, 'Dahil hizmetler rezervasyon öncesinde paylaşılır.')}</article><article class="seo-card"><span class="section-kicker">Ek hizmetler</span><h2>Dahil olmayanlar</h2>${bullets(tour.excluded, 'Dahil olmayan hizmetler rezervasyon öncesinde paylaşılır.', true)}</article></div></section>
      <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Program akışı</span><h2>Yolculuk planı ve ziyaretler</h2></div><div class="seo-detail-stack"><article class="seo-card seo-prose seo-detail-panel"><header class="seo-detail-panel-head"><span><span class="section-kicker">Ziyaretler</span><h2>Ziyaret programı</h2></span><span>Rehber eşliğinde</span></header><div class="seo-detail-content-visible">${paragraphs(tour.visits)}</div></article><article class="seo-card seo-prose seo-detail-panel"><header class="seo-detail-panel-head"><span><span class="section-kicker">Gün gün akış</span><h2>Program ayrıntıları</h2></span><span>${escapeHtml(tour.duration)}</span></header><div class="seo-detail-content-visible seo-program-flow">${paragraphs(tour.program)}</div></article></div></section>
      ${gallery(tour)}</div><section class="cta-strip" id="iletisim"><div class="container cta-grid"><div><span class="section-kicker">İletişim</span><h2>Program hakkında bilgi alın</h2><p>Otel, uçuş, kontenjan ve güncel fiyat ayrıntılarını ekibimizle netleştirin.</p></div><div class="contact-cards"><a class="contact-card phone-link" href="tel:${escapeHtml(String(settings.phone || '').replace(/[^\d+]/g, ''))}"><b>Telefon</b><span>${escapeHtml(settings.phone || '')}</span></a><a class="contact-card whatsapp-link" href="${escapeHtml(whatsapp)}" target="_blank" rel="noopener"><b>WhatsApp</b><span>Hemen yazın</span></a><div class="contact-card"><b>Ofis</b><span>${escapeHtml(settings.address || 'Ümraniye / İstanbul')}</span></div></div></div></section>`;
  }

  function setupMenu() {
    const button = $('menuToggle'), links = $('navLinks'), actions = $('navActions');
    if (!button || !links || !actions) return;
    const overlay = document.createElement('div'); overlay.id = 'mobileNavOverlay'; overlay.className = 'mobile-nav-overlay'; overlay.setAttribute('aria-hidden', 'true'); overlay.innerHTML = `<div class="mobile-nav-shell"><nav class="mobile-nav-links">${links.innerHTML}</nav><div class="mobile-nav-actions">${actions.innerHTML}</div></div>`; document.body.appendChild(overlay);
    button.addEventListener('click', () => { const open = !overlay.classList.contains('open'); overlay.classList.toggle('open', open); overlay.setAttribute('aria-hidden', open ? 'false' : 'true'); button.classList.toggle('open', open); button.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.classList.toggle('mobile-menu-open', open); });
  }

  async function init() {
    try {
      const slug = slugify(new URLSearchParams(location.search).get('slug') || location.pathname.split('/').filter(Boolean).pop());
      const response = await fetch(`/api/data?program=${encodeURIComponent(slug)}&ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Program verisi alınamadı.');
      const state = await response.json();
      const tour = (Array.isArray(state.tours) ? state.tours : []).map(normalizeTour).find(item => item.slug === slug && String(item.status || 'active') !== 'draft');
      if (!tour) throw new Error('Bu program bulunamadı veya yayından kaldırıldı.');
      const settings = state.settings || {};
      applySettings(settings, tour); render(tour, settings); setupMenu();
    } catch (error) {
      $('main-content').innerHTML = `<section class="seo-hero"><div class="container seo-hero-copy"><span class="eyebrow">HAZEYN TURİZM</span><h1>Program bulunamadı</h1><p>${escapeHtml(error.message || 'Program yüklenemedi.')}</p><p style="margin-top:24px"><a class="btn btn-gold" href="/index.html#umre">Güncel programlara dön</a></p></div></section>`;
      $('programYear').textContent = new Date().getFullYear(); setupMenu();
    }
  }
  init();
})();
