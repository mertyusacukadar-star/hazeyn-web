'use strict';

const SITE_NAME = 'Hazeyn Turizm';
const DEFAULT_ORIGIN = 'https://www.hazeynturizm.com';

function text(value) {
  return value == null ? '' : String(value).trim();
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function escapeXml(value) {
  return String(value == null ? '' : value).replace(/[<>&"']/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  })[character]);
}

function stripHtml(value) {
  return text(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value, length = 158) {
  const clean = stripHtml(value);
  if (clean.length <= length) return clean;
  return `${clean.slice(0, Math.max(0, length - 1)).replace(/\s+\S*$/, '')}…`;
}

function slugify(value) {
  const map = { 'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c' };
  return text(value)
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (letter) => map[letter])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'program';
}

function safeUrl(value, fallback = '') {
  const candidate = text(value);
  if (!candidate) return fallback;
  if (/^(https?:\/\/|\/)/i.test(candidate) && !/[\u0000-\u001f]/.test(candidate)) return candidate;
  if (/^(assets\/|\.\/assets\/)/i.test(candidate)) return `/${candidate.replace(/^\.?\//, '')}`;
  return fallback;
}

function mapEmbedUrl(value) {
  const candidate = safeUrl(value);
  if (!candidate) return '';
  if (/google\.[^/]+\/maps\/embed/i.test(candidate) || /[?&]output=embed(?:&|$)/i.test(candidate)) return candidate;
  const coordinates = candidate.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (coordinates) return `https://www.google.com/maps?q=${coordinates[1]},${coordinates[2]}&z=17&output=embed`;
  return `https://www.google.com/maps?q=${encodeURIComponent('HAZEYN TURİZM Ümraniye')}&output=embed`;
}

function normalizeOrigin(origin) {
  const candidate = text(origin) || DEFAULT_ORIGIN;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return DEFAULT_ORIGIN;
    return `${url.protocol}//${url.host}`;
  } catch (_error) {
    return DEFAULT_ORIGIN;
  }
}

function absoluteUrl(value, origin) {
  const base = normalizeOrigin(origin);
  const candidate = safeUrl(value, '/og-hazeyn.jpg');
  try { return new URL(candidate, `${base}/`).href; } catch (_error) { return `${base}/og-hazeyn.jpg`; }
}

function list(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try { return list(JSON.parse(trimmed)); } catch (_error) { /* plain text fallback */ }
    }
    return trimmed.split(/\r?\n|\s*[;•]\s*/).map((item) => item.replace(/^[-–—✓✔]\s*/, '').trim()).filter(Boolean);
  }
  return [];
}

function firstNumber(value, pattern) {
  const match = text(value).match(pattern);
  return match ? Number(match[1]) : 0;
}

function formatDate(value) {
  const raw = text(value);
  if (!raw) return 'Tarih yakında açıklanacak';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return raw;
  const date = new Date(`${raw}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? raw : new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function dateIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  return match ? match[0] : '';
}

function dateSlug(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return '';
  const months = ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran', 'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'];
  const month = months[Number(match[2]) - 1];
  return month ? `${Number(match[3])}-${month}-${match[1]}` : '';
}

function defaultTourSlug(source = {}) {
  const dated = dateSlug(source.departureDate || source.date);
  const type = text(source.type || 'umre').toLowerCase();
  if (dated && type === 'umre') return `${dated}-umre-programi`;
  return slugify([dated, source.title, type === 'umre' ? 'umre-programi' : ''].filter(Boolean).join('-'));
}

function hotelFromLegacy(hotels, city) {
  const lines = list(hotels);
  const cityPattern = city === 'mekke' ? /^mekke\s*:/i : /^medine\s*:/i;
  const match = lines.find((line) => cityPattern.test(line));
  return match ? match.replace(cityPattern, '').trim() : '';
}

function normalizeRoomPrices(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const aliases = {
    '1': ['1', 'single', 'tek', 'tekli'],
    '2': ['2', 'double', 'twin', 'ikili'],
    '3': ['3', 'triple', 'üçlü', 'uclu'],
    '4': ['4', 'quad', 'dörtlü', 'dortlu'],
    '5+': ['5+', '5', 'five', 'beşli', 'besli']
  };
  const result = {};
  Object.entries(aliases).forEach(([key, names]) => {
    const found = names.find((name) => text(source[name]));
    if (found) result[key] = text(source[found]);
  });
  return result;
}

function normalizeDepartureCities(value, fallback) {
  const raw = Array.isArray(value) ? value : list(value || fallback);
  const normalized = raw.map((city) => {
    const slug = slugify(city);
    if (slug.includes('istanbul')) return 'istanbul';
    if (slug.includes('konya')) return 'konya';
    return slug;
  }).filter(Boolean);
  return [...new Set(normalized.length ? normalized : ['istanbul'])];
}

function cityLabel(value) {
  if (value === 'istanbul') return 'İstanbul';
  if (value === 'konya') return 'Konya';
  return text(value).replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase('tr-TR'));
}

function capacityLabel(value) {
  const labels = {
    available: 'Kontenjan Müsait',
    limited: 'Sınırlı Kontenjan',
    full: 'Kontenjan Doldu',
    waitlist: 'Yedek Liste'
  };
  const normalized = text(value).toLowerCase();
  return labels[normalized] || text(value) || 'Bilgi alınız';
}

function normalizeTour(source = {}) {
  const title = text(source.title) || 'Umre Programı';
  const durationText = text(source.nights || source.duration || source.dayNight);
  const durationDays = Number(source.durationDays) || firstNumber(durationText, /(\d+)\s*g[üu]n/i);
  const durationNights = Number(source.durationNights) || firstNumber(durationText, /(\d+)\s*gece/i) || (durationDays > 0 ? Math.max(0, durationDays - 1) : 0);
  const mekkeHotelName = text(source.mekkeHotelName || source.mekkeHotel) || hotelFromLegacy(source.hotels, 'mekke');
  const medineHotelName = text(source.medineHotelName || source.medineHotel) || hotelFromLegacy(source.hotels, 'medine');
  const roomPrices = normalizeRoomPrices(source.roomPrices || source.prices);
  const image = safeUrl(source.image || source.coverImage, '/assets/hero.svg');
  const groupImages = [
    ...list(source.groupImages),
    ...list(source.galleryImages),
    ...list(source.hotelImages),
    ...list(source.hotelImages && source.hotelImages.mekke),
    ...list(source.hotelImages && source.hotelImages.medine),
    ...list(source.hotelMekkeImages),
    ...list(source.hotelMedineImages)
  ].map((item) => safeUrl(item)).filter(Boolean);
  const mekkeHotelImages = [
    ...list(source.hotelImages && source.hotelImages.mekke),
    ...list(source.mekkeHotelImages),
    ...list(source.hotelMekkeImages),
    ...list(source.mekkeImages),
    ...list(source.hotelMekkeImage)
  ].map((item) => safeUrl(item)).filter(Boolean);
  const medineHotelImages = [
    ...list(source.hotelImages && source.hotelImages.medine),
    ...list(source.medineHotelImages),
    ...list(source.hotelMedineImages),
    ...list(source.medineImages),
    ...list(source.hotelMedineImage)
  ].map((item) => safeUrl(item)).filter(Boolean);
  const includedServices = list(source.includedServices || source.included);
  const excludedServices = list(source.excludedServices || source.excluded);
  const visitProgram = text(source.visitProgram || source.visits);
  const program = text(source.program || source.description || source.cardText);
  const statusRaw = text(source.status).toLowerCase();
  const status = ['active', 'completed', 'draft'].includes(statusRaw) ? statusRaw : (source.active === false ? 'completed' : 'active');
  const departureDate = dateIso(source.departureDate || source.date) || text(source.departureDate || source.date);
  return {
    ...source,
    id: text(source.id),
    type: text(source.type || 'umre').toLowerCase(),
    title,
    slug: slugify(source.slug || defaultTourSlug({ ...source, title, departureDate })),
    status,
    tag: text(source.tag) || capacityLabel(source.capacity || source.capacityStatus || 'Güncel Program'),
    capacityStatus: capacityLabel(source.capacity || source.capacityStatus || source.tag),
    departureDate,
    departureCities: normalizeDepartureCities(source.departureCities, source.departureCity),
    durationDays,
    durationNights,
    durationLabel: durationDays ? `${durationDays} Gün${durationNights ? ` · ${durationNights} Gece` : ''}` : (durationText || 'Süre bilgisi yakında'),
    mekkeHotelName: mekkeHotelName || 'Program kapsamında açıklanacaktır',
    mekkeDistanceService: text(source.mekkeDistanceService || source.mekkeDistance || source.mekkeService) || 'Mesafe ve servis bilgisi için bizi arayın',
    medineHotelName: medineHotelName || 'Program kapsamında açıklanacaktır',
    medineDistanceService: text(source.medineDistanceService || source.medineDistance || source.medineService) || 'Mesafe ve servis bilgisi için bizi arayın',
    flightDetails: text(source.flightDetails || source.airline || source.flight) || 'Uçuş bilgisi program ekibimiz tarafından paylaşılacaktır',
    roomPrices,
    price: text(source.price) || text(roomPrices['4'] || roomPrices['3'] || roomPrices['2']) || 'Fiyat sorunuz',
    includedServices,
    excludedServices,
    visitProgram,
    program,
    image,
    detailBannerImage: safeUrl(source.detailBannerImage) || image,
    detailBannerKicker: text(source.detailBannerKicker) || capacityLabel(source.capacity || source.capacityStatus || source.tag),
    detailBannerTitle: text(source.detailBannerTitle) || title,
    detailBannerSubtitle: text(source.detailBannerSubtitle),
    detailBannerPosition: ['center', 'left', 'right', 'top', 'bottom'].includes(text(source.detailBannerPosition).toLowerCase()) ? text(source.detailBannerPosition).toLowerCase() : 'center',
    hotelImages: {
      mekke: [...new Set(mekkeHotelImages)],
      medine: [...new Set(medineHotelImages)]
    },
    groupImages: [...new Set([image, ...groupImages])],
    seoTitle: text(source.seoTitle) || `${title} | ${SITE_NAME}`,
    seoDescription: truncate(source.seoDescription || source.cardText || `${formatDate(departureDate)} tarihli ${title}. Otel, uçuş, ziyaret programı ve güncel oda fiyatlarını inceleyin.`)
  };
}

const requiredBlogs = [
  {
    id: 'seo-umre-evraklari', slug: 'umre-icin-gerekli-evraklar', category: 'Umre Rehberi', title: 'Umre için gerekli evraklar',
    summary: 'Umre başvurusu öncesinde hazırlanması gereken pasaport, kimlik ve diğer temel belgeler.',
    content: 'Umre yolculuğu için geçerlilik süresi yeterli bir pasaport, kimlik bilgileri ve acentanın talep ettiği güncel başvuru belgeleri hazırlanmalıdır. Pasaportun uçuş tarihinden itibaren en az altı ay geçerli olması önemlidir.\nBelge listesi dönemsel resmi uygulamalara göre değişebileceği için başvuru öncesinde Hazeyn Turizm ekibinden güncel liste alınmalıdır. Evraklar teslim edildiğinde vize ve uçuş süreci ekip tarafından takip edilir.'
  },
  {
    id: 'seo-2026-umre-fiyatlari', slug: '2026-umre-fiyatlari', category: 'Fiyat Rehberi', title: '2026 Umre fiyatları',
    summary: '2026 Umre fiyatlarını etkileyen tarih, otel, oda tipi ve uçuş seçeneklerini karşılaştırın.',
    content: '2026 Umre fiyatları program süresine, çıkış şehrine, havayoluna, Mekke ve Medine otellerine ve seçilen oda tipine göre değişir. İkili, üçlü ve dörtlü oda fiyatları aynı program içinde ayrı ayrı değerlendirilmelidir.\nGüncel program kartlarında başlangıç fiyatı gösterilir. Kesin fiyat, kontenjan ve oda tercihi doğrulandıktan sonra paylaşılır; böylece konaklama ve uçuş ayrıntıları açık biçimde görülebilir.'
  },
  {
    id: 'seo-ilk-umre-rehberi', slug: 'ilk-defa-umreye-gidecekler-icin-rehber', category: 'İlk Umre', title: 'İlk defa Umreye gidecekler için rehber',
    summary: 'İlk Umre yolculuğunuzda ibadet, hazırlık, konaklama ve grup düzeni için temel bilgiler.',
    content: 'İlk kez Umreye giden misafirlerin öncelikle program akışını, ihram hazırlığını ve grup buluşma düzenini öğrenmesi faydalıdır. Rahat yürüyüş ayakkabısı, kişisel ilaçlar ve kolay taşınan bir çanta yolculuk konforunu artırır.\nRehberin yönlendirmelerini takip etmek, otel kartını yanında taşımak ve önemli telefonları kaydetmek güvenli bir yolculuk sağlar. Hazeyn Turizm kafile ekibi ibadet ve ziyaret adımlarında misafirlere eşlik eder.'
  },
  {
    id: 'seo-umre-valizi', slug: 'umre-valizinde-neler-olmali', category: 'Hazırlık', title: 'Umre valizinde neler olmalı?',
    summary: 'Umre valizinizi gereksiz ağırlık oluşturmadan hazırlamak için pratik kontrol listesi.',
    content: 'Umre valizinde mevsime uygun rahat kıyafetler, ihram, terlik, kişisel bakım ürünleri, düzenli kullanılan ilaçlar ve küçük bir omuz çantası bulunmalıdır. Pasaport ve önemli belgeler el bagajında güvenli bir bölümde taşınmalıdır.\nValizde isim ve telefon bulunan bir etiket kullanmak, şarj cihazı ile uygun priz dönüştürücüsünü unutmamak faydalıdır. Kafile bilgilendirmesinde verilen özel liste de yolculuk öncesinde kontrol edilmelidir.'
  },
  {
    id: 'seo-ihrama-giris', slug: 'ihrama-nasil-girilir', category: 'İbadet Rehberi', title: 'İhrama nasıl girilir?',
    summary: 'Mikat, niyet, telbiye ve ihram hazırlığı hakkında anlaşılır bir başlangıç rehberi.',
    content: 'İhrama girmeden önce kişisel temizlik yapılır, uygun ihram kıyafeti hazırlanır ve mikat sınırını geçmeden Umre için niyet edilir. Niyetin ardından telbiye getirilir ve ihram yasaklarına dikkat edilmeye başlanır.\nUçuş rotasına göre ihrama giriş zamanı değişebilir. Bu nedenle kafile rehberinin uçuş öncesi ve uçuş sırasındaki yönlendirmeleri dikkatle takip edilmelidir.'
  },
  {
    id: 'seo-ravza-randevusu', slug: 'ravza-randevusu-nasil-alinir', category: 'Medine Rehberi', title: 'Ravza randevusu nasıl alınır?',
    summary: 'Ravza ziyareti için güncel randevu adımlarını ve kafile planlamasını öğrenin.',
    content: 'Ravza ziyareti için kullanılan resmi uygulama ve randevu kuralları dönemsel olarak güncellenebilir. Yolculuk öncesinde gerekli uygulamanın kurulması, pasaport bilgilerinin doğru girilmesi ve uygun saatlerin takip edilmesi gerekir.\nKafile programı ile bireysel randevu saatinin uyumlu olması önemlidir. Hazeyn Turizm rehberleri Medine programında güncel uygulamaya göre misafirleri bilgilendirir.'
  },
  {
    id: 'seo-umre-kac-gun', slug: 'umre-kac-gun-surer', category: 'Program Rehberi', title: 'Umre kaç gün sürer?',
    summary: 'Kısa ve uzun Umre programlarının gün/gece yapısını ve seçim ölçütlerini inceleyin.',
    content: 'Umre programları uçuş planına ve konaklama tercihine göre farklı sürelerde hazırlanabilir. Programlarda toplam gün ve gece sayısı ile Mekke ve Medine konaklama dağılımı açıkça belirtilmelidir.\nSüre seçerken izin günleri, yürüme temposu ve ziyaret programı birlikte değerlendirilmelidir. Güncel program sayfalarında her turun net gün/gece bilgisi yer alır.'
  },
  {
    id: 'seo-otel-secimi', slug: 'mekke-ve-medinede-otel-secimi', category: 'Konaklama', title: 'Mekke ve Medine’de otel seçimi',
    summary: 'Harem’e mesafe, servis, oda tipi ve konum açısından doğru oteli seçme rehberi.',
    content: 'Mekke ve Medine oteli seçerken yalnızca yıldız sayısına değil, Harem’e mesafeye, servis düzenine, oda yapısına ve yemek hizmetine de bakılmalıdır. Yürüme zorluğu yaşayan misafirler için mesafe ve servis bilgisi özellikle önemlidir.\nProgram sayfasındaki otel adı ve ulaşım açıklaması karşılaştırılmalı, özel ihtiyaçlar rezervasyon öncesinde acentaya bildirilmelidir.'
  },
  {
    id: 'seo-yaslilar-umre', slug: 'yaslilar-umreye-tek-basina-gidebilir-mi', category: 'Sağlık ve Konfor', title: 'Yaşlılar Umreye tek başına gidebilir mi?',
    summary: 'İleri yaştaki misafirler için refakat, sağlık, otel ve kafile desteği hakkında bilgiler.',
    content: 'Yaşlı misafirlerin tek başına Umreye katılımı sağlık durumu, hareket kabiliyeti ve program yoğunluğuna göre değerlendirilmelidir. Düzenli ilaçlar, doktor önerileri ve acil iletişim bilgileri yolculuk öncesinde hazırlanmalıdır.\nYakın otel, servis imkânı ve deneyimli kafile desteği yolculuğu kolaylaştırır. Rezervasyon öncesinde özel ihtiyaçların Hazeyn Turizm ekibiyle paylaşılması en uygun programın seçilmesine yardımcı olur.'
  }
].map((blog) => ({ ...blog, slug: slugify(blog.slug || blog.title), seoTitle: `${blog.title} | Hazeyn Turizm`, seoDescription: truncate(blog.summary) }));

function normalizeBlog(source = {}) {
  const title = text(source.title) || 'Umre Rehberi';
  return {
    ...source,
    id: text(source.id),
    category: text(source.category) || 'Umre Rehberi',
    title,
    slug: slugify(source.slug || title),
    summary: text(source.summary) || truncate(source.content, 180),
    content: text(source.content || source.summary),
    image: safeUrl(source.image),
    seoTitle: text(source.seoTitle) || `${title} | ${SITE_NAME}`,
    seoDescription: truncate(source.seoDescription || source.summary || source.content)
  };
}

function settingsOf(state) {
  const settings = state && state.settings && typeof state.settings === 'object' ? state.settings : {};
  return {
    phone: text(settings.phone) || '0216 280 0 777',
    whatsapp: text(settings.whatsapp || settings.phone2).replace(/\D/g, '') || '905330940683',
    instagram: text(settings.instagram).replace(/^@/, '') || 'hazeynturizm',
    address: text(settings.address) || 'Atatürk Mah. Gaffar Efendi Sk. Güder Han No:5, İç Kapı No:26, 34774 Ümraniye / İstanbul',
    email: text(settings.email) || 'info@hazeynturizm.com',
    searchConsoleVerification: text(settings.searchConsoleVerification || settings.googleSiteVerification),
    mapUrl: mapEmbedUrl(settings.googleMapsEmbedUrl || settings.mapsEmbedUrl),
    officeImages: list(settings.officeImages || settings.officePhotos).map((item) => safeUrl(item)).filter(Boolean)
    ,ga4MeasurementId: text(settings.ga4MeasurementId || settings.gaMeasurementId || settings.googleAnalyticsId)
    ,metaPixelId: text(settings.metaPixelId || settings.facebookPixelId)
    ,googleAdsId: text(settings.googleAdsId || settings.googleAdsConversionId)
    ,googleAdsWhatsappLabel: text(settings.googleAdsWhatsappLabel || settings.googleAdsWhatsAppLabel || settings.whatsappConversionLabel)
    ,googleAdsPhoneLabel: text(settings.googleAdsPhoneLabel || settings.phoneConversionLabel)
    ,googleAdsFormLabel: text(settings.googleAdsFormLabel || settings.formConversionLabel || settings.contactConversionLabel)
  };
}

function phoneHref(phone) {
  const normalized = text(phone).replace(/[^0-9+]/g, '');
  return normalized ? `tel:${normalized}` : 'tel:+902162800777';
}

function whatsappHref(settings, message) {
  return `https://wa.me/${encodeURIComponent(settings.whatsapp)}?text=${encodeURIComponent(message)}`;
}

function paragraphs(value) {
  const items = text(value).split(/\n\s*\n|\r?\n/).map((item) => item.trim()).filter(Boolean);
  return items.length ? items.map((item) => `<p>${escapeHtml(item)}</p>`).join('') : '<p>Detaylı bilgi için Hazeyn Turizm ile iletişime geçebilirsiniz.</p>';
}

function programParagraphs(value) {
  const items = text(value).split(/\n\s*\n|\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (!items.length) return '<p>Detaylı program akışı için Hazeyn Turizm ile iletişime geçebilirsiniz.</p>';
  return items.map((item) => {
    const day = item.match(/^(\d+)\.\s*Gün\s*[—–-]?\s*(.*)$/i);
    if (day) return `<h3 class="seo-program-day"><span>${escapeHtml(day[1])}</span>${escapeHtml(day[2] || `${day[1]}. Gün`)}</h3>`;
    const info = item.match(/^(Mekke Konaklama|Medine Konaklama|Program|Umre Sayısı|Not):\s*(.*)$/i);
    if (info) return `<p class="seo-program-note"><strong>${escapeHtml(info[1])}</strong><span>${escapeHtml(info[2])}</span></p>`;
    return `<p>${escapeHtml(item)}</p>`;
  }).join('');
}

function bulletList(items, emptyText) {
  const normalized = list(items);
  if (!normalized.length) return `<p class="seo-muted">${escapeHtml(emptyText)}</p>`;
  return `<ul class="seo-check-list">${normalized.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function header(settings) {
  const instagram = `https://www.instagram.com/${encodeURIComponent(settings.instagram)}/`;
  const phoneIcon = '<svg class="seo-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.7 15.7 0 0 0 6.6 6.6l2.2-2.2a1.5 1.5 0 0 1 1.6-.35c1.15.38 2.38.58 3.63.58a1.46 1.46 0 0 1 1.45 1.46v3.47a1.46 1.46 0 0 1-1.45 1.46A18.42 18.42 0 0 1 2.18 3.37 1.46 1.46 0 0 1 3.64 1.9H7.1a1.46 1.46 0 0 1 1.46 1.46c0 1.27.2 2.48.58 3.64.18.56.05 1.18-.36 1.59L6.6 10.8Z"/></svg>';
  const whatsappIcon = '<svg class="seo-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2a9.8 9.8 0 0 0-8.45 14.78L2 22l5.36-1.53A9.95 9.95 0 1 0 12.04 2Zm0 17.9a7.8 7.8 0 0 1-3.98-1.08l-.28-.17-3.18.91.94-3.1-.19-.3a7.82 7.82 0 1 1 6.69 3.74Zm4.3-5.85c-.24-.12-1.4-.69-1.61-.77-.22-.08-.38-.12-.54.12-.16.23-.61.77-.75.93-.14.16-.28.18-.51.06-.24-.12-1-.37-1.9-1.17a7.12 7.12 0 0 1-1.32-1.64c-.14-.24-.02-.36.1-.48.11-.1.24-.28.35-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.28-.73-1.75-.19-.46-.39-.4-.54-.4h-.46c-.16 0-.42.06-.63.3-.22.23-.84.81-.84 1.99 0 1.17.86 2.3.98 2.46.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.19 1.1.16 1.51.1.46-.07 1.4-.58 1.6-1.13.2-.55.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z"/></svg>';
  const instagramIcon = '<svg class="seo-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm-.18 2A3.12 3.12 0 0 0 4 7.12v9.76A3.12 3.12 0 0 0 7.12 20h9.76A3.12 3.12 0 0 0 20 16.88V7.12A3.12 3.12 0 0 0 16.88 4H7.12Zm10.13 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>';
  return `<header class="site-header seo-site-header" id="top">
    <nav class="nav container" aria-label="Ana menü">
      <a class="logo-wrap" href="/tr" aria-label="Hazeyn Turizm ana sayfa"><img src="/assets/logo.png" alt="Hazeyn Turizm" class="logo" width="210" height="60"></a>
      <button class="menu-toggle" id="menuToggle" type="button" aria-controls="mobileNavOverlay" aria-expanded="false" aria-label="Menüyü aç"><svg class="menu-icon menu-icon-bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h14M5 12h14M5 16.5h14"/></svg><svg class="menu-icon menu-icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg></button>
      <div class="nav-links" id="navLinks">
        <a href="/tr#umre">Umre Programları</a><a href="/umre-fiyatlari">Umre Fiyatları</a><a href="/tr#hac">Hac Programları</a><a href="/tr#yurtici">Yurt İçi Turlar</a><a href="/merak-edilenler">Yolculuk Rehberi</a><a href="/deneyimli-kadro">Deneyimli Kadro</a><a href="/umraniye-umre-turu">Ümraniye Ofisi</a>
      </div>
      <div class="nav-actions" id="navActions">
        <a class="btn btn-ghost phone-link" data-track="phone_call" href="${escapeHtml(phoneHref(settings.phone))}">${phoneIcon}<span>Hemen Ara</span></a>
        <a class="btn btn-gold whatsapp-link" data-track="whatsapp_click" href="${escapeHtml(whatsappHref(settings, 'Merhaba, Hazeyn Turizm web sitenizden ulaşıyorum. Güncel Umre programları hakkında bilgi almak istiyorum.'))}" target="_blank" rel="noopener">${whatsappIcon}<span>WhatsApp</span></a>
        <a class="btn btn-ghost instagram-link" href="${escapeHtml(instagram)}" target="_blank" rel="noopener">${instagramIcon}<span>Instagram</span></a>
      </div>
    </nav>
  </header>`;
}

function contactStrip(settings, message) {
  return `<section class="cta-strip" id="iletisim"><div class="container cta-grid">
    <div><span class="section-kicker">İletişim</span><h2>Program hakkında bilgi alın</h2><p>Otel, uçuş, kontenjan ve güncel fiyat ayrıntılarını ekibimizle netleştirin.</p></div>
    <div class="contact-cards">
      <a class="contact-card phone-link" data-track="phone_call" href="${escapeHtml(phoneHref(settings.phone))}"><b>Telefon</b><span>${escapeHtml(settings.phone)}</span></a>
      <a class="contact-card whatsapp-link" data-track="whatsapp_click" href="${escapeHtml(whatsappHref(settings, message))}" target="_blank" rel="noopener"><b>WhatsApp</b><span>Hemen yazın</span></a>
      <div class="contact-card"><b>Ofis</b><span>${escapeHtml(settings.address)}</span></div>
    </div>
  </div></section>`;
}

function footer(settings) {
  return `<footer class="footer"><div class="container footer-grid">
    <div><img src="/assets/logo.png" class="footer-logo" alt="Hazeyn Turizm" width="210" height="60"><p>Hac, Umre ve yurt içi turlarda güvenilir organizasyon.</p></div>
    <div><h4>Programlar</h4><a href="/tr#umre">Güncel Umre Programları</a><a href="/umre-fiyatlari">Umre Fiyatları</a><a href="/tr#hac">Hac Programları</a></div>
    <div><h4>Rehber</h4><a href="/merak-edilenler">Merak Edilenler</a><a href="/umraniye-umre-turu">Ümraniye Umre Turu</a><a href="/tr#yorumlar">Yolcu Yorumları</a></div>
    <div><h4>İletişim</h4><a href="${escapeHtml(phoneHref(settings.phone))}">${escapeHtml(settings.phone)}</a><a href="mailto:${escapeHtml(settings.email)}">${escapeHtml(settings.email)}</a><p>${escapeHtml(settings.address)}</p></div>
  </div><div class="container footer-bottom">© ${new Date().getFullYear()} Hazeyn Turizm. Tüm hakları saklıdır.</div></footer>`;
}

const PAGE_CSS = `<style>
  .seo-page{background:var(--bg)}.seo-page main{overflow:hidden}.seo-skip{position:fixed;left:12px;top:-60px;z-index:100;background:#fff;padding:10px 14px;border-radius:10px}.seo-skip:focus{top:12px}.seo-action-icon{width:17px;height:17px;flex:0 0 17px;fill:currentColor}.seo-site-header .whatsapp-link .seo-action-icon{color:#fff}.seo-site-header .phone-link .seo-action-icon,.seo-site-header .instagram-link .seo-action-icon{color:var(--gold2)}
  .seo-hero{position:relative;min-height:540px;display:flex;align-items:flex-end;color:#fff;background:#111;padding:150px 0 72px}.seo-hero-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.seo-hero-media.pos-left{object-position:left center}.seo-hero-media.pos-right{object-position:right center}.seo-hero-media.pos-top{object-position:center top}.seo-hero-media.pos-bottom{object-position:center bottom}.seo-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,8,.92),rgba(8,8,10,.58) 58%,rgba(8,8,10,.2))}.seo-hero-copy{position:relative;z-index:1;max-width:820px}.seo-hero h1{font-size:clamp(42px,6vw,76px);letter-spacing:-.05em;line-height:1.02;margin:0 0 18px}.seo-hero p{font-size:clamp(17px,2vw,23px);color:rgba(255,255,255,.84);max-width:720px;margin:0}.seo-hero-subtitle{margin-top:12px!important;font-size:16px!important;line-height:1.65;max-width:680px!important}.seo-breadcrumb{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;margin-bottom:18px;color:rgba(255,255,255,.75)}.seo-breadcrumb a{color:var(--gold2)}
  .seo-content{padding:64px 0}.seo-overview{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:-100px;position:relative;z-index:4}.seo-stat,.seo-card{background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:0 16px 40px rgba(30,20,8,.08)}.seo-stat{padding:21px}.seo-stat small{display:block;color:var(--muted);font-weight:800;margin-bottom:6px}.seo-stat strong{font-size:18px;display:block}.seo-section{padding:56px 0 0}.seo-section-head{margin-bottom:24px}.seo-section-head h2{font-size:clamp(30px,4vw,46px);letter-spacing:-.04em;line-height:1.06;margin:0}.seo-section-head p{color:var(--muted);max-width:720px}.seo-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.seo-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.seo-card{padding:26px}.seo-card h2,.seo-card h3{margin:0 0 12px}.seo-card p:last-child{margin-bottom:0}.seo-muted{color:var(--muted)}
  .seo-hotel-card{padding:0;overflow:hidden}.seo-hotel-card>div{padding:26px}.seo-hotel-card b{display:block;color:var(--gold);margin-top:12px}.seo-hotel-media{appearance:none;display:block;position:relative;width:100%;margin:0;padding:0;border:0;height:clamp(190px,19vw,235px);overflow:hidden;background:#eee;cursor:zoom-in;text-align:left}.seo-hotel-media img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .45s ease}.seo-hotel-media:hover img,.seo-hotel-media:focus-visible img{transform:scale(1.035)}.seo-hotel-media:focus-visible{outline:3px solid var(--gold);outline-offset:-3px}.seo-image-count{position:absolute;right:16px;bottom:14px;padding:7px 11px;border-radius:999px;background:rgba(12,12,14,.78);color:#fff;font-size:12px;font-weight:800;backdrop-filter:blur(8px)}.seo-image-zoom{position:absolute;left:16px;bottom:14px;display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.92);color:#191612;font-size:12px;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.16)}.seo-image-zoom:before{content:"↗";display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--gold);color:#fff}.seo-price-card{display:flex;flex-direction:column;gap:12px;min-height:190px}.seo-price-card strong{font-size:26px;margin-top:auto}.seo-price-card.featured{border-color:rgba(196,145,47,.55);background:linear-gradient(145deg,#fff,#fff8e7)}.seo-check-list{list-style:none;padding:0;margin:0;display:grid;gap:10px}.seo-check-list li{position:relative;padding-left:25px}.seo-check-list li:before{content:"✓";position:absolute;left:0;color:var(--gold);font-weight:900}.seo-check-list.excluded li:before{content:"–"}.seo-prose{font-size:17px;color:#38332d}.seo-prose p{margin:0 0 18px}.seo-detail-stack{display:grid;gap:20px}.seo-detail-panel{padding:clamp(24px,3.5vw,38px)}.seo-detail-panel-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding-bottom:20px;margin-bottom:22px;border-bottom:1px solid var(--line)}.seo-detail-panel-head h2{font-size:clamp(26px,3vw,36px);margin:4px 0 0}.seo-detail-panel-head span:last-child{color:var(--muted);font-size:13px;font-weight:800}.seo-detail-content-visible{max-width:1040px;line-height:1.82}.seo-detail-content-visible p:last-child{margin-bottom:0}.seo-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.seo-gallery-card{margin:0;border-radius:20px;overflow:hidden;background:#111;box-shadow:0 14px 34px rgba(35,25,12,.1)}.seo-gallery-button{appearance:none;display:block;position:relative;width:100%;aspect-ratio:4/3;padding:0;border:0;background:#111;cursor:zoom-in;overflow:hidden;text-align:left}.seo-gallery-button img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .45s ease,filter .45s ease}.seo-gallery-button:hover img,.seo-gallery-button:focus-visible img{transform:scale(1.035);filter:brightness(.88)}.seo-gallery-button:focus-visible{outline:3px solid var(--gold);outline-offset:-3px}.seo-gallery-label{position:absolute;inset:auto 0 0;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:44px 18px 16px;background:linear-gradient(transparent,rgba(0,0,0,.78));color:#fff}.seo-gallery-label b{font-size:15px}.seo-gallery-label span{font-size:12px;opacity:.82}.seo-lightbox{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;padding:34px;background:rgba(7,7,9,.92);backdrop-filter:blur(14px)}.seo-lightbox.open{display:flex}.seo-lightbox-figure{position:relative;width:min(1180px,92vw);height:min(82vh,780px);margin:0;display:flex;flex-direction:column;background:#0e0e10;border:1px solid rgba(255,255,255,.14);border-radius:24px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.52)}.seo-lightbox-image-wrap{min-height:0;flex:1;display:grid;place-items:center;background:#08080a}.seo-lightbox img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;user-select:none}.seo-lightbox figcaption{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:17px 22px;color:#fff;background:#141416}.seo-lightbox figcaption b{font-size:16px}.seo-lightbox figcaption span{font-size:13px;color:rgba(255,255,255,.65)}.seo-lightbox-close,.seo-lightbox-nav{appearance:none;position:absolute;z-index:2;display:grid;place-items:center;border:1px solid rgba(255,255,255,.28);background:rgba(16,16,18,.74);color:#fff;cursor:pointer;backdrop-filter:blur(10px)}.seo-lightbox-close{right:22px;top:22px;width:48px;height:48px;border-radius:50%;font-size:28px}.seo-lightbox-nav{top:50%;transform:translateY(-50%);width:52px;height:52px;border-radius:50%;font-size:30px}.seo-lightbox-prev{left:24px}.seo-lightbox-next{right:24px}.seo-lightbox-close:hover,.seo-lightbox-nav:hover{background:var(--gold)}.seo-lightbox-open{overflow:hidden}.seo-expired{display:flex;align-items:center;justify-content:space-between;gap:20px;background:#241d15;color:#fff;border-radius:22px;padding:24px 28px;margin:24px 0}.seo-expired strong{font-size:22px}.seo-expired p{margin:4px 0 0;color:rgba(255,255,255,.72)}
  .seo-program-card{padding:0;overflow:hidden;display:flex;flex-direction:column}.seo-program-card img{width:100%;height:210px;object-fit:cover}.seo-program-card-body{padding:24px;display:flex;flex-direction:column;gap:12px;flex:1}.seo-program-card h2,.seo-program-card h3{margin:0;font-size:25px}.seo-program-meta{display:flex;flex-wrap:wrap;gap:8px}.seo-pill{border:1px solid var(--line);background:var(--soft);border-radius:999px;padding:7px 11px;font-size:13px;font-weight:800}.seo-program-prices{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.seo-program-prices span{background:#f8f3e9;border-radius:12px;padding:10px}.seo-program-prices small{display:block;color:var(--muted)}.seo-program-prices b{display:block}.seo-program-card .btn{margin-top:auto}
  .seo-article{max-width:900px}.seo-article .seo-card{padding:clamp(26px,5vw,54px)}.seo-article h2{font-size:32px;margin-top:34px}.seo-article-cta{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:38px}.seo-local-intro{display:grid;grid-template-columns:1fr 1fr;gap:22px}.seo-map{border:0;width:100%;min-height:380px;border-radius:22px}.seo-review{padding:24px}.seo-stars{color:var(--gold);letter-spacing:2px}.seo-mobile-whatsapp{display:none}
  @media(max-width:1040px){.seo-overview{grid-template-columns:repeat(2,1fr)}.seo-grid-3,.seo-gallery{grid-template-columns:repeat(2,1fr)}.seo-site-header .nav-links.open,.seo-site-header .nav-actions.open{display:flex}.seo-site-header .nav-actions.open{flex-direction:column;align-items:stretch}.seo-site-header .nav-actions.open .btn{width:100%}}
  @media(max-width:720px){.seo-hero{min-height:480px;padding:122px 0 54px}.seo-hero h1{font-size:42px}.seo-content{padding:44px 0 86px}.seo-overview,.seo-grid-2,.seo-grid-3,.seo-gallery,.seo-local-intro,.seo-article-cta{grid-template-columns:1fr}.seo-overview{margin-top:-68px}.seo-stat{padding:17px}.seo-hotel-media{height:210px}.seo-detail-panel-head{align-items:flex-start;flex-direction:column}.seo-gallery-button{aspect-ratio:16/10}.seo-lightbox{padding:12px}.seo-lightbox-figure{width:100%;height:min(82vh,680px);border-radius:18px}.seo-lightbox-close{right:14px;top:14px;width:44px;height:44px}.seo-lightbox-nav{width:44px;height:44px}.seo-lightbox-prev{left:12px}.seo-lightbox-next{right:12px}.seo-lightbox figcaption{padding:14px 16px}.seo-expired{align-items:flex-start;flex-direction:column}.seo-program-prices{grid-template-columns:1fr}.seo-mobile-whatsapp{display:flex;position:fixed;right:16px;bottom:16px;z-index:30;width:54px;height:54px;border-radius:50%;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#fff;box-shadow:0 12px 28px rgba(80,51,4,.3);font-size:24px}.seo-site-header .nav{width:min(100% - 28px,1180px)}}
</style>`;

function basePage({ state, origin, title, description, canonicalPath, ogImage, content, schemas = [], pageType = 'page', pageTitle = '', pageId = '', pageSlug = '' }) {
  const siteOrigin = normalizeOrigin(origin);
  const settings = settingsOf(state);
  const canonical = new URL(canonicalPath || '/', `${siteOrigin}/`).href;
  const image = absoluteUrl(ogImage || '/og-hazeyn.jpg', siteOrigin);
  const verification = settings.searchConsoleVerification ? `<meta name="google-site-verification" content="${escapeHtml(settings.searchConsoleVerification)}">` : '';
  const jsonLd = schemas.map((schema) => `<script type="application/ld+json">${safeJson(schema)}</script>`).join('');
  const pageData = safeJson({
    pageType,
    canonical,
    id: pageType === 'program' ? text(pageId) : '',
    title: pageType === 'program' ? text(pageTitle) : '',
    programId: pageType === 'program' ? text(pageId) : '',
    programTitle: pageType === 'program' ? pageTitle : '',
    slug: pageType === 'program' ? slugify(pageSlug || pageTitle) : ''
  });
  const trackingSettings = safeJson({
    ga4MeasurementId: settings.ga4MeasurementId,
    metaPixelId: settings.metaPixelId,
    googleAdsId: settings.googleAdsId,
    googleAdsWhatsappLabel: settings.googleAdsWhatsappLabel,
    googleAdsPhoneLabel: settings.googleAdsPhoneLabel,
    googleAdsFormLabel: settings.googleAdsFormLabel
  });
  const generalMessage = pageTitle ? `Merhaba, Hazeyn Turizm web sitenizden ulaşıyorum. ${pageTitle} hakkında bilgi almak istiyorum.` : 'Merhaba, Hazeyn Turizm web sitenizden ulaşıyorum. Güncel Umre programları hakkında bilgi almak istiyorum.';
  return `<!doctype html>
<html lang="tr"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/">
  <title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">${verification}
  <link rel="canonical" href="${escapeHtml(canonical)}"><meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:locale" content="tr_TR"><meta property="og:type" content="website"><meta property="og:site_name" content="Hazeyn Turizm"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(image)}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icon.png"><link rel="apple-touch-icon" href="/assets/icon.png"><link rel="stylesheet" href="/style.css?v=20260813-program3">${jsonLd}
</head><body class="seo-page" data-page="${escapeHtml(pageType)}">
  <a class="seo-skip" href="#main-content">İçeriğe geç</a>${header(settings)}
  <main id="main-content">${content}${contactStrip(settings, generalMessage)}</main>${footer(settings)}
  <a class="seo-mobile-whatsapp whatsapp-link" data-track="whatsapp_click" href="${escapeHtml(whatsappHref(settings, generalMessage))}" target="_blank" rel="noopener" aria-label="WhatsApp'tan bilgi al">✦</a>
  <script>window.HAZEYN_PAGE_DATA=${pageData};window.HAZEYN_TRACKING_SETTINGS=${trackingSettings};(function(){var b=document.getElementById('menuToggle'),n=document.getElementById('navLinks'),a=document.getElementById('navActions');if(!b||!n||!a)return;var o=document.createElement('div');o.id='mobileNavOverlay';o.className='mobile-nav-overlay';o.setAttribute('aria-hidden','true');o.innerHTML='<div class="mobile-nav-shell"><nav class="mobile-nav-links">'+n.innerHTML+'</nav><div class="mobile-nav-actions">'+a.innerHTML+'</div></div>';document.body.appendChild(o);o.querySelectorAll('.mobile-nav-links a').forEach(function(l,i){l.style.setProperty('--menu-index',i)});function close(){o.classList.remove('open');o.setAttribute('aria-hidden','true');b.classList.remove('open');b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Menüyü aç');document.body.classList.remove('mobile-menu-open')}function open(){o.classList.add('open');o.setAttribute('aria-hidden','false');b.classList.add('open');b.setAttribute('aria-expanded','true');b.setAttribute('aria-label','Menüyü kapat');document.body.classList.add('mobile-menu-open')}b.addEventListener('click',function(){o.classList.contains('open')?close():open()});o.addEventListener('click',function(e){if(e.target.closest('a'))close()});document.addEventListener('keydown',function(e){if(e.key==='Escape')close()})})();(function(){var box=document.getElementById('seoLightbox');if(!box)return;document.body.appendChild(box);var raw=Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-src]')),items=[],seen={};raw.forEach(function(trigger){var src=trigger.getAttribute('data-lightbox-src');if(!src||seen[src])return;seen[src]=true;items.push({src:src,caption:trigger.getAttribute('data-lightbox-caption')||'Program görseli'})});var image=box.querySelector('img'),caption=box.querySelector('figcaption b'),counter=box.querySelector('figcaption span'),closeButton=box.querySelector('.seo-lightbox-close'),prev=box.querySelector('.seo-lightbox-prev'),next=box.querySelector('.seo-lightbox-next'),current=0,lastFocus=null;function draw(){var item=items[current];if(!item)return;image.src=item.src;image.alt=item.caption;caption.textContent=item.caption;counter.textContent=(current+1)+' / '+items.length;prev.hidden=next.hidden=items.length<2}function open(src){var found=items.findIndex(function(item){return item.src===src});current=found<0?0:found;lastFocus=document.activeElement;draw();box.classList.add('open');box.setAttribute('aria-hidden','false');document.body.classList.add('seo-lightbox-open');closeButton.focus()}function close(){box.classList.remove('open');box.setAttribute('aria-hidden','true');document.body.classList.remove('seo-lightbox-open');image.removeAttribute('src');if(lastFocus&&lastFocus.focus)lastFocus.focus()}function move(step){current=(current+step+items.length)%items.length;draw()}raw.forEach(function(trigger){trigger.addEventListener('click',function(){open(trigger.getAttribute('data-lightbox-src'))})});closeButton.addEventListener('click',close);prev.addEventListener('click',function(){move(-1)});next.addEventListener('click',function(){move(1)});box.addEventListener('click',function(event){if(event.target===box)close()});document.addEventListener('keydown',function(event){if(!box.classList.contains('open'))return;if(event.key==='Escape')close();if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)})})();</script><script src="/tracking.js?v=20260811-growth5" defer></script>
</body></html>`;
}

function organizationSchema(state, origin) {
  const settings = settingsOf(state);
  return {
    '@context': 'https://schema.org', '@type': 'TravelAgency', name: SITE_NAME, url: normalizeOrigin(origin),
    logo: absoluteUrl('/assets/logo.png', origin), telephone: settings.phone, email: settings.email,
    address: { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: 'Ümraniye', addressRegion: 'İstanbul', addressCountry: 'TR' },
    sameAs: [`https://www.instagram.com/${settings.instagram}/`]
  };
}

function breadcrumbSchema(origin, items) {
  const base = normalizeOrigin(origin);
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: new URL(item.path, `${base}/`).href })) };
}

function isTourExpired(tour) {
  if (tour.status === 'completed') return true;
  if (tour.status === 'draft') return false;
  const iso = dateIso(tour.departureDate);
  if (!iso) return false;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return iso < todayIso;
}

function roomPriceCards(tour) {
  const labels = { '1': 'Tek Kişilik Oda', '2': '2 Kişilik Oda', '3': '3 Kişilik Oda', '4': '4 Kişilik Oda', '5+': '5+ Kişilik Oda' };
  const entries = Object.entries(tour.roomPrices).filter(([, price]) => text(price));
  if (!entries.length) return `<article class="seo-card seo-price-card featured"><span class="section-kicker">Başlangıç fiyatı</span><h3>Güncel fiyat</h3><strong>${escapeHtml(tour.price)}</strong><p class="seo-muted">Kontenjan ve oda tipine göre teyit edilir.</p></article>`;
  return entries.map(([key, price]) => `<article class="seo-card seo-price-card${key === '2' ? ' featured' : ''}"><span class="section-kicker">Oda seçeneği</span><h3>${escapeHtml(labels[key] || `${key} Kişilik Oda`)}</h3><strong>${escapeHtml(price)}</strong><p class="seo-muted">Kişi başı program fiyatı</p></article>`).join('');
}

function renderProgramPage(state, tourInput, origin) {
  const tour = normalizeTour(tourInput);
  const settings = settingsOf(state);
  const canonicalPath = `/${tour.slug}`;
  const pageUrl = new URL(canonicalPath, `${normalizeOrigin(origin)}/`).href;
  const expired = isTourExpired(tour);
  const cities = tour.departureCities.map(cityLabel).join(' / ');
  const message = `Merhaba, Hazeyn Turizm web sitenizden ulaşıyorum. ${tour.title} hakkında bilgi almak istiyorum.`;
  const offers = Object.entries(tour.roomPrices).map(([room, price]) => ({ '@type': 'Offer', name: `${room} kişilik oda`, price: text(price).replace(/\D/g, '') || undefined, priceCurrency: /TL|₺/i.test(price) ? 'TRY' : 'USD', description: price, availability: expired || /full|dolu/i.test(tour.capacityStatus) ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', url: pageUrl }));
  const schemaImages = [...new Set([tour.detailBannerImage, tour.image, ...(tour.hotelImages.mekke || []), ...(tour.hotelImages.medine || []), ...tour.groupImages].filter(Boolean))];
  const schemas = [organizationSchema(state, origin), breadcrumbSchema(origin, [{ name: 'Ana Sayfa', path: '/tr' }, { name: 'Umre Programları', path: '/tr#umre' }, { name: tour.title, path: canonicalPath }]), {
    '@context': 'https://schema.org', '@type': 'TouristTrip', name: tour.title, description: tour.seoDescription, image: schemaImages.map((image) => absoluteUrl(image, origin)), touristType: 'Umre yolcusu', itinerary: tour.visitProgram || tour.program,
    provider: { '@type': 'TravelAgency', name: SITE_NAME, url: normalizeOrigin(origin) }, offers, url: pageUrl, startDate: dateIso(tour.departureDate) || undefined
  }];
  const expiredPanel = expired ? `<div class="seo-expired"><div><strong>Bu program sona ermiştir.</strong><p>Sayfa arşiv ve bilgilendirme amacıyla yayında kalmaktadır.</p></div><a class="btn btn-gold" href="/tr#umre">Güncel Umre Programlarımızı Görüntüle</a></div>` : '';
  const mekkeImages = (tour.hotelImages.mekke || []).filter(Boolean);
  const medineImages = (tour.hotelImages.medine || []).filter(Boolean);
  const hotelImageSet = new Set([...mekkeImages, ...medineImages]);
  const groupOnlyImages = tour.groupImages.filter((image) => image && image !== tour.image && image !== tour.detailBannerImage && !hotelImageSet.has(image));
  const visualCandidates = [
    ...mekkeImages.map((image, index) => ({ image, label: index ? `Mekke oteli · ${index + 1}` : 'Mekke oteli' })),
    ...medineImages.map((image, index) => ({ image, label: index ? `Medine oteli · ${index + 1}` : 'Medine oteli' })),
    ...groupOnlyImages.map((image, index) => ({ image, label: index ? `Kafileden kareler · ${index + 1}` : 'Kafileden kareler' }))
  ];
  const visualSeen = new Set();
  const visualItems = visualCandidates.filter((item) => item.image && !visualSeen.has(item.image) && visualSeen.add(item.image));
  const gallery = visualItems.map((item) => `<figure class="seo-gallery-card"><button type="button" class="seo-gallery-button" data-lightbox-src="${escapeHtml(item.image)}" data-lightbox-caption="${escapeHtml(item.label)}" aria-label="${escapeHtml(`${item.label} görselini büyüt`)}"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(`${tour.title} ${item.label.toLocaleLowerCase('tr-TR')} görseli`)}" loading="lazy" decoding="async" draggable="false"><span class="seo-gallery-label"><b>${escapeHtml(item.label)}</b><span>Büyüt</span></span></button></figure>`).join('');
  const hotelImage = (images, alt, label) => images && images.length ? `<button type="button" class="seo-hotel-media" data-lightbox-src="${escapeHtml(images[0])}" data-lightbox-caption="${escapeHtml(label)}" aria-label="${escapeHtml(`${label} görselini büyüt`)}"><img src="${escapeHtml(images[0])}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" draggable="false"><span class="seo-image-zoom">Görseli büyüt</span>${images.length > 1 ? `<span class="seo-image-count">${images.length} görsel</span>` : ''}</button>` : '';
  const bannerMeta = `${formatDate(tour.departureDate)} · ${tour.durationLabel} · ${cities} çıkışlı`;
  const content = `<section class="seo-hero"><img class="seo-hero-media pos-${escapeHtml(tour.detailBannerPosition)}" src="${escapeHtml(tour.detailBannerImage)}" alt="${escapeHtml(`${tour.detailBannerTitle} program banner görseli`)}" fetchpriority="high"><div class="container seo-hero-copy">
    <div class="seo-breadcrumb"><a href="/tr">Ana Sayfa</a><span>/</span><a href="/tr#umre">Umre Programları</a><span>/</span><span>${escapeHtml(tour.title)}</span></div><span class="eyebrow">${escapeHtml(tour.detailBannerKicker || tour.capacityStatus)}</span><h1>${escapeHtml(tour.detailBannerTitle)}</h1><p>${escapeHtml(bannerMeta)}</p>${tour.detailBannerSubtitle ? `<p class="seo-hero-subtitle">${escapeHtml(tour.detailBannerSubtitle)}</p>` : ''}
  </div></section><div class="container seo-content">
    <section class="seo-overview" aria-label="Program özeti"><article class="seo-stat"><small>Kalkış tarihi</small><strong>${escapeHtml(formatDate(tour.departureDate))}</strong></article><article class="seo-stat"><small>Program süresi</small><strong>${escapeHtml(tour.durationLabel)}</strong></article><article class="seo-stat"><small>Çıkış noktası</small><strong>${escapeHtml(cities)}</strong></article><article class="seo-stat"><small>Başlangıç fiyatı</small><strong>${escapeHtml(tour.price)}</strong></article></section>
    ${expiredPanel}
    <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Konaklama ve ulaşım</span><h2>Mekke ve Medine otelleri</h2><p>Konaklama bilgilerini inceleyin; yüklenen otel görsellerini büyütmek için fotoğrafa tıklayın.</p></div><div class="seo-grid-2"><article class="seo-card seo-hotel-card">${hotelImage(mekkeImages, `${tour.mekkeHotelName} Mekke oteli`, `${tour.mekkeHotelName} · Mekke`)}<div><span class="section-kicker">Mekke</span><h3>${escapeHtml(tour.mekkeHotelName)}</h3><b>Harem’e mesafe / servis</b><p>${escapeHtml(tour.mekkeDistanceService)}</p></div></article><article class="seo-card seo-hotel-card">${hotelImage(medineImages, `${tour.medineHotelName} Medine oteli`, `${tour.medineHotelName} · Medine`)}<div><span class="section-kicker">Medine</span><h3>${escapeHtml(tour.medineHotelName)}</h3><b>Mescid-i Nebevî’ye mesafe / servis</b><p>${escapeHtml(tour.medineDistanceService)}</p></div></article></div><article class="seo-card" style="margin-top:20px"><span class="section-kicker">Uçuş</span><h3>Havayolu ve uçuş bilgileri</h3><p>${escapeHtml(tour.flightDetails)}</p></article></section>
    <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Oda tipine göre</span><h2>Program fiyatları</h2><p>Fiyatlar kişi başıdır; müsaitlik ve kontenjan rezervasyon sırasında teyit edilir.</p></div><div class="seo-grid-3">${roomPriceCards(tour)}</div><p style="margin-top:20px"><a class="btn btn-gold whatsapp-link" data-track="whatsapp_click" href="${escapeHtml(whatsappHref(settings, message))}" target="_blank" rel="noopener">WhatsApp’tan Bilgi Al</a></p></section>
    <section class="seo-section"><div class="seo-grid-2"><article class="seo-card"><span class="section-kicker">Fiyata dahil</span><h2>Dahil hizmetler</h2>${bulletList(tour.includedServices, 'Dahil hizmetler rezervasyon öncesinde program ekibimiz tarafından paylaşılır.')}</article><article class="seo-card"><span class="section-kicker">Ek hizmetler</span><h2>Dahil olmayanlar</h2>${bulletList(tour.excludedServices, 'Dahil olmayan hizmetler rezervasyon öncesinde program ekibimiz tarafından paylaşılır.').replace('seo-check-list', 'seo-check-list excluded')}</article></div></section>
    <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Program akışı</span><h2>Yolculuk planı ve ziyaretler</h2><p>Tüm program ayrıntıları aşağıda açık biçimde yer alır; ayrıca bir alana basmanız gerekmez.</p></div><div class="seo-detail-stack"><article class="seo-card seo-prose seo-detail-panel"><header class="seo-detail-panel-head"><span><span class="section-kicker">Ziyaretler</span><h2>Ziyaret programı</h2></span><span>Rehber eşliğinde</span></header><div class="seo-detail-content-visible">${paragraphs(tour.visitProgram || 'Mekke ve Medine ziyaretleri kafile rehberi eşliğinde programlanır.')}</div></article><article class="seo-card seo-prose seo-detail-panel"><header class="seo-detail-panel-head"><span><span class="section-kicker">Gün gün akış</span><h2>Program ayrıntıları</h2></span><span>${escapeHtml(tour.durationLabel)}</span></header><div class="seo-detail-content-visible seo-program-flow">${programParagraphs(tour.program)}</div></article></div></section>
    ${gallery ? `<section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Görseller</span><h2>Programdan kareler</h2><p>Otel ve kafile görsellerini tam boy görüntülemek için seçin.</p></div><div class="seo-gallery seo-gallery-count-${Math.min(3, visualItems.length)}">${gallery}</div></section>` : ''}
  </div>${gallery ? `<div class="seo-lightbox" id="seoLightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Program görsel galerisi"><button type="button" class="seo-lightbox-close" aria-label="Galeriyi kapat">×</button><button type="button" class="seo-lightbox-nav seo-lightbox-prev" aria-label="Önceki görsel">‹</button><figure class="seo-lightbox-figure"><div class="seo-lightbox-image-wrap"><img src="" alt="" draggable="false"></div><figcaption><b></b><span></span></figcaption></figure><button type="button" class="seo-lightbox-nav seo-lightbox-next" aria-label="Sonraki görsel">›</button></div>` : ''}`;
  return basePage({ state, origin, title: tour.seoTitle, description: tour.seoDescription, canonicalPath, ogImage: tour.detailBannerImage, content, schemas, pageType: 'program', pageTitle: tour.title, pageId: tour.id, pageSlug: tour.slug });
}

function activeUmreTours(state) {
  return (Array.isArray(state && state.tours) ? state.tours : []).map(normalizeTour).filter((tour) => tour.type === 'umre' && tour.status === 'active' && !isTourExpired(tour)).sort((a, b) => text(a.departureDate).localeCompare(text(b.departureDate)));
}

function programCard(tour, headingLevel = 2) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const cities = tour.departureCities.map(cityLabel).join(' / ');
  const price = (key) => escapeHtml(tour.roomPrices[key] || 'Bilgi alınız');
  return `<article class="seo-card seo-program-card" data-program-id="${escapeHtml(tour.id)}" data-program-title="${escapeHtml(tour.title)}" data-program-slug="${escapeHtml(tour.slug)}"><img src="${escapeHtml(tour.image)}" alt="${escapeHtml(`${tour.title} program görseli`)}" loading="lazy" decoding="async"><div class="seo-program-card-body"><span class="section-kicker">${escapeHtml(tour.capacityStatus)}</span><${Heading}>${escapeHtml(tour.title)}</${Heading}><div class="seo-program-meta"><span class="seo-pill">${escapeHtml(formatDate(tour.departureDate))}</span><span class="seo-pill">${escapeHtml(tour.durationLabel)}</span><span class="seo-pill">${escapeHtml(cities)} çıkışlı</span></div><div class="seo-program-prices"><span><small>İkili oda</small><b>${price('2')}</b></span><span><small>Üçlü oda</small><b>${price('3')}</b></span><span><small>Dörtlü oda</small><b>${price('4')}</b></span></div><a class="btn btn-gold" data-program-link data-track="program_click" data-program-id="${escapeHtml(tour.id)}" data-program-title="${escapeHtml(tour.title)}" data-program-slug="${escapeHtml(tour.slug)}" href="/${escapeHtml(tour.slug)}">Programı İncele</a></div></article>`;
}

function renderPricesPage(state, origin) {
  const tours = activeUmreTours(state);
  const title = '2026 Umre Fiyatları ve Güncel Programlar | Hazeyn Turizm';
  const description = 'İstanbul ve Konya çıkışlı güncel Umre programlarını; ikili, üçlü ve dörtlü oda fiyatlarını premium kartlarla karşılaştırın.';
  const cards = tours.length ? tours.map((tour) => programCard(tour)).join('') : '<article class="seo-card"><h2>Yeni programlarımız hazırlanıyor</h2><p>Güncel tarih ve fiyat bilgisi için WhatsApp üzerinden bize ulaşabilirsiniz.</p></article>';
  const schemas = [organizationSchema(state, origin), breadcrumbSchema(origin, [{ name: 'Ana Sayfa', path: '/tr' }, { name: 'Umre Fiyatları', path: '/umre-fiyatlari' }]), { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Güncel Umre Programları', itemListElement: tours.map((tour, index) => ({ '@type': 'ListItem', position: index + 1, url: new URL(`/${tour.slug}`, `${normalizeOrigin(origin)}/`).href, name: tour.title })) }];
  const content = `<section class="seo-hero"><img class="seo-hero-media" src="/assets/hero.svg" alt="Mekke ve Medine Umre programları"><div class="container seo-hero-copy"><div class="seo-breadcrumb"><a href="/tr">Ana Sayfa</a><span>/</span><span>Umre Fiyatları</span></div><span class="eyebrow">Güncel programlar</span><h1>2026 Umre Fiyatları</h1><p>Tarih, süre, çıkış noktası ve oda tipine göre aktif programlarımızı karşılaştırın.</p></div></section><div class="container seo-content"><section class="seo-section" style="padding-top:0"><div class="seo-section-head"><span class="section-kicker">Karşılaştırmalı fiyatlar</span><h2>Size uygun Umre programını seçin</h2><p>Gösterilen tutarlar oda tipine göre kişi başı program fiyatıdır. Güncel kontenjan rezervasyon sırasında teyit edilir.</p></div><div class="seo-grid-3">${cards}</div></section></div>`;
  return basePage({ state, origin, title, description, canonicalPath: '/umre-fiyatlari', ogImage: tours[0] ? tours[0].image : '/og-hazeyn.jpg', content, schemas, pageType: 'prices', pageTitle: '2026 Umre Fiyatları' });
}

function renderArticlePage(state, blogInput, origin) {
  const blog = normalizeBlog(blogInput);
  const canonicalPath = `/rehber/${blog.slug}`;
  const settings = settingsOf(state);
  const message = `Merhaba, Hazeyn Turizm web sitenizde “${blog.title}” yazısını okudum. Umre programları hakkında bilgi almak istiyorum.`;
  const schemas = [organizationSchema(state, origin), breadcrumbSchema(origin, [{ name: 'Ana Sayfa', path: '/tr' }, { name: 'Merak Edilenler', path: '/merak-edilenler' }, { name: blog.title, path: canonicalPath }]), { '@context': 'https://schema.org', '@type': 'Article', headline: blog.title, description: blog.seoDescription, image: absoluteUrl(blog.image || '/og-hazeyn.jpg', origin), mainEntityOfPage: new URL(canonicalPath, `${normalizeOrigin(origin)}/`).href, author: { '@type': 'Organization', name: SITE_NAME }, publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: absoluteUrl('/assets/logo.png', origin) } } }];
  const content = `<section class="seo-hero"><img class="seo-hero-media" src="${escapeHtml(blog.image || '/assets/hero.svg')}" alt="${escapeHtml(blog.title)}"><div class="container seo-hero-copy"><div class="seo-breadcrumb"><a href="/tr">Ana Sayfa</a><span>/</span><a href="/merak-edilenler">Merak Edilenler</a><span>/</span><span>${escapeHtml(blog.title)}</span></div><span class="eyebrow">${escapeHtml(blog.category)}</span><h1>${escapeHtml(blog.title)}</h1><p>${escapeHtml(blog.summary)}</p></div></section><div class="container seo-content seo-article"><article class="seo-card seo-prose"><span class="section-kicker">Hazeyn Umre Rehberi</span><h2>Bilmeniz gerekenler</h2>${paragraphs(blog.content)}<div class="seo-article-cta"><a class="btn btn-gold" data-track="program_click" href="/tr#umre">Güncel Umre Programlarını İncele</a><a class="btn btn-outline dark whatsapp-link" data-track="whatsapp_click" href="${escapeHtml(whatsappHref(settings, message))}" target="_blank" rel="noopener">WhatsApp’tan Bilgi Al</a></div></article></div>`;
  return basePage({ state, origin, title: blog.seoTitle, description: blog.seoDescription, canonicalPath, ogImage: blog.image || '/og-hazeyn.jpg', content, schemas, pageType: 'article', pageTitle: blog.title });
}

function renderLocalPage(state, origin) {
  const settings = settingsOf(state);
  const tours = activeUmreTours(state).filter((tour) => tour.departureCities.includes('istanbul'));
  const reviews = (Array.isArray(state && state.reviews) ? state.reviews : []).slice(0, 6);
  const title = 'Ümraniye Umre Turu ve İstanbul Çıkışlı Programlar | Hazeyn Turizm';
  const description = 'Hazeyn Turizm Ümraniye ofisi, İstanbul çıkışlı güncel Umre programları, telefon, WhatsApp, yolcu yorumları ve ofis bilgileri.';
  const mapUrl = settings.mapUrl || 'https://www.google.com/maps?q=41.024651,29.09212&z=17&output=embed';
  const photos = settings.officeImages.map((image, index) => `<figure><img src="${escapeHtml(image)}" alt="Hazeyn Turizm Ümraniye ofisi ${index + 1}" loading="lazy" decoding="async"></figure>`).join('');
  const tourCards = tours.length ? tours.map((tour) => programCard(tour, 3)).join('') : '<article class="seo-card"><h3>İstanbul çıkışlı yeni programlarımız hazırlanıyor</h3><p>Güncel kalkış tarihleri için ekibimize ulaşın.</p></article>';
  const reviewCards = reviews.length ? reviews.map((review) => `<article class="seo-card seo-review"><div class="seo-stars" aria-label="${Number(review.stars) || 5} yıldız">${'★'.repeat(Math.min(5, Math.max(1, Number(review.stars) || 5)))}</div><p>“${escapeHtml(review.text)}”</p><b>${escapeHtml(review.name)}</b><small class="seo-muted">Yolcu yorumu</small></article>`).join('') : '<article class="seo-card"><p>Misafir yorumları yakında eklenecek.</p></article>';
  const schemas = [organizationSchema(state, origin), breadcrumbSchema(origin, [{ name: 'Ana Sayfa', path: '/tr' }, { name: 'Ümraniye Umre Turu', path: '/umraniye-umre-turu' }]), { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Hazeyn Turizm Ümraniye Ofisi', image: settings.officeImages.map((image) => absoluteUrl(image, origin)), url: new URL('/umraniye-umre-turu', `${normalizeOrigin(origin)}/`).href, telephone: settings.phone, address: { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: 'Ümraniye', addressRegion: 'İstanbul', addressCountry: 'TR' } }];
  const content = `<section class="seo-hero"><img class="seo-hero-media" src="/assets/hero.svg" alt="Hazeyn Turizm Ümraniye Umre ofisi"><div class="container seo-hero-copy"><div class="seo-breadcrumb"><a href="/tr">Ana Sayfa</a><span>/</span><span>Ümraniye Umre Turu</span></div><span class="eyebrow">İstanbul · Ümraniye</span><h1>Ümraniye Umre Turu</h1><p>İstanbul çıkışlı Umre programlarında ofisten yolculuk sonuna kadar yanınızdayız.</p></div></section><div class="container seo-content">
    <section class="seo-local-intro"><article class="seo-card"><span class="section-kicker">Hazeyn Turizm Ümraniye Ofisi</span><h2>Yüz yüze bilgi ve kayıt</h2><p>${escapeHtml(settings.address)}</p><p><b>Telefon:</b> <a href="${escapeHtml(phoneHref(settings.phone))}">${escapeHtml(settings.phone)}</a></p><p>Otel, uçuş, oda fiyatı, vize ve evrak süreçlerini ofisimizde birlikte planlayabilirsiniz.</p></article><iframe class="seo-map" src="${escapeHtml(mapUrl)}" title="Hazeyn Turizm Ümraniye ofisi haritası" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></section>
    ${photos ? `<section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Ofisimiz</span><h2>Hazeyn Turizm Ümraniye</h2></div><div class="seo-gallery">${photos}</div></section>` : ''}
    <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">İstanbul çıkışlı</span><h2>Güncel Umre programları</h2></div><div class="seo-grid-3">${tourCards}</div></section>
    <section class="seo-section"><div class="seo-section-head"><span class="section-kicker">Misafirlerimizin deneyimleri</span><h2>Yolcu yorumları</h2></div><div class="seo-grid-3">${reviewCards}</div></section>
  </div>`;
  return basePage({ state, origin, title, description, canonicalPath: '/umraniye-umre-turu', ogImage: settings.officeImages[0] || '/og-hazeyn.jpg', content, schemas, pageType: 'local', pageTitle: 'Ümraniye Umre Turu' });
}

function mergedBlogs(state) {
  const existing = (Array.isArray(state && state.blogs) ? state.blogs : []).map(normalizeBlog);
  const known = new Set(existing.map((blog) => blog.slug));
  return [...existing, ...requiredBlogs.filter((blog) => !known.has(blog.slug)).map(normalizeBlog)];
}

function renderSitemap(state, origin) {
  const base = normalizeOrigin(origin);
  const updatedValue = state && state._meta && state._meta.updatedAt;
  const updatedDate = updatedValue ? new Date(Number(updatedValue) || updatedValue) : new Date();
  const lastmod = Number.isNaN(updatedDate.getTime()) ? new Date().toISOString().slice(0, 10) : updatedDate.toISOString().slice(0, 10);
  const routes = [
    { path: '/', priority: '1.0', frequency: 'weekly' },
    { path: '/umre-fiyatlari', priority: '0.9', frequency: 'daily' },
    { path: '/umraniye-umre-turu', priority: '0.8', frequency: 'weekly' },
    { path: '/merak-edilenler', priority: '0.8', frequency: 'weekly' },
    { path: '/deneyimli-kadro', priority: '0.6', frequency: 'monthly' },
    ...(Array.isArray(state && state.tours) ? state.tours : []).map(normalizeTour).filter((tour) => tour.status !== 'draft').map((tour) => ({ path: `/${tour.slug}`, priority: isTourExpired(tour) ? '0.5' : '0.9', frequency: isTourExpired(tour) ? 'yearly' : 'weekly' })),
    ...mergedBlogs(state).map((blog) => ({ path: `/rehber/${blog.slug}`, priority: '0.7', frequency: 'monthly' }))
  ];
  const unique = [...new Map(routes.map((route) => [route.path, route])).values()];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((route) => `  <url><loc>${escapeXml(new URL(route.path, `${base}/`).href)}</loc><lastmod>${lastmod}</lastmod><changefreq>${route.frequency}</changefreq><priority>${route.priority}</priority></url>`).join('\n')}\n</urlset>`;
}

function renderRobots(origin) {
  const base = normalizeOrigin(origin);
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`;
}

module.exports = {
  slugify,
  normalizeTour,
  normalizeBlog,
  requiredBlogs,
  renderProgramPage,
  renderPricesPage,
  renderArticlePage,
  renderLocalPage,
  renderSitemap,
  renderRobots
};
