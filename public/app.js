(function () {
    const DEFAULT_DATA = {
        _meta: { updatedAt: 0 },
        settings: {
            brand: 'HÂZEYN Turizm Seyahat Acentası',
            phone: '0216 280 0 777',
            phone2: '0533 094 0683',
            whatsapp: '905330940683',
            email: 'info@hazeynturizm.com',
            website: 'https://www.hazeynturizm.com/tr/',
            instagram: 'hazeynturizm',
            address: 'Atatürk Mah. Gaffar Efendi Sk. Güder Han No:5, İç Kapı No:26, 34774 Ümraniye / İstanbul',
            heroTitle: 'Kutsal Yolculuğunuzda Güvenilir Rehberiniz',
            heroSubtitle: 'Hac, Umre ve yurt içi turlarında profesyonel organizasyon.',
            heroMode: 'slider',
            staffBannerKicker: 'HAZEYN TURİZM',
            staffBannerTitle: 'Deneyimli Kadro',
            staffBannerSubtitle: 'Hocalarımız, kafile sorumlularımız ve şirket çalışanlarımızı bu sayfadan tanıtabilirsiniz.',
            staffBannerImage: 'assets/hero.svg',
            blogBannerKicker: 'UMRE VE HAC REHBERİ',
            blogBannerTitle: 'Merak Edilenler',
            blogBannerSubtitle: 'İhram yasakları, vize işlemleri, hazırlık listesi ve yolculuk öncesi bilgilendirmeleri buradan yayınlayabilirsiniz.',
            blogBannerImage: 'assets/hero.svg',
            heroBanners: [
                { id: 'hb1', image: 'assets/gallery-medine.jpeg', title: 'Umre Pasaportla Değil, Niyetle Başlar', subtitle: 'Hazeyn Turizm ile manevi yolculuğunuzu güvenle planlayın.', textColor: '#ffffff', textPosition: 'left' },
                { id: 'hb2', image: 'assets/gallery-kuba.jpeg', title: 'Umre Yolculuğunuz Hazeyn ile Başlasın', subtitle: "Mekke ve Medine'de konforlu konaklama, rehberlik ve güvenli organizasyon.", textColor: '#ffffff', textPosition: 'left' }
            ],
            searchConsoleVerification: '',
            googleMapsEmbedUrl: 'https://www.google.com/maps?q=41.024651,29.09212&z=17&output=embed',
            officeImages: [],
            ga4MeasurementId: '',
            metaPixelId: '',
            googleAdsId: '',
            googleAdsWhatsappLabel: '',
            googleAdsPhoneLabel: '',
            googleAdsFormLabel: ''
        },
        tours: [
            { id: 't1', type: 'umre', title: 'Şevval Umresi', tag: 'Kesin Kalkışlı', departureDate: '2026-05-14', image: 'assets/hotel.svg', roomPrices: { '1': '1.650 USD', '2': '1.450 USD', '3': '1.350 USD', '4': '1.250 USD', '5+': '1.150 USD' }, nights: '11 Gece Mekke / 3 Gece Medine', hotels: 'Mekke: Voco Hotel\nMedine: Emaar Royal', airline: 'Türk Hava Yolları', price: '1.250 USD', program: '1. Gün: İstanbul çıkış ve Medineye varış.\n2-3. Gün: Medine ziyaretleri.\n4. Gün: Mekkeye geçiş ve umre ibadeti.\nSon Gün: Dönüş hazırlığı ve İstanbul uçuşu.' },
            { id: 't2', type: 'umre', title: 'Ramazan Umresi', tag: 'Yoğun Talep', departureDate: '2026-03-01', image: 'assets/hotel.svg', roomPrices: { '1': '2.050 USD', '2': '1.850 USD', '3': '1.750 USD', '4': '1.650 USD' }, nights: '14 Gece Mekke / 3 Gece Medine', hotels: 'Mekke: Swissotel Al Maqam\nMedine: Anwar Al Madinah', airline: 'Türk Hava Yolları', price: '1.650 USD', program: 'Ramazan ayına özel program. Sahur ve iftar düzeni, rehber eşliğinde ziyaretler ve grup takibi dahildir.' },
            { id: 't3', type: 'hac', title: '2026 Hac Programı', tag: 'Ön Kayıt', departureDate: '2026-05-25', image: 'assets/hero.svg', roomPrices: { '1': '9.950 USD', '2': '8.950 USD', '3': '8.650 USD', '4': '8.350 USD' }, nights: '40 Gün', hotels: 'Mekke: Swissotel Al Maqam\nMedine: Anwar Al Madinah', airline: 'Türk Hava Yolları', price: '8.950 USD', program: 'Hac ibadetleri, rehberlik, ulaşım, konaklama ve grup takibi program detaylarına göre planlanır.' },
            { id: 't4', type: 'yurtici', title: 'GAP Turu', tag: 'Kültür & Tarih', departureDate: '2026-06-08', image: 'assets/yurtici.svg', roomPrices: { '2': '15.000 TL', '3': '15.000 TL', '4': '15.000 TL' }, nights: '2 Gece 3 Gün', hotels: 'Şanlıurfa / Mardin otel konaklaması', airline: 'Otobüs veya uçaklı seçenek', price: '15.000 TL', program: 'Halfeti, Şanlıurfa, Mardin, Diyarbakır ve Gaziantep rotasına göre kültür turu programı.' },
            { id: 't5', type: 'yurtici', title: 'Karadeniz Turu', tag: 'Doğa', image: 'assets/yurtici.svg', nights: '5 Gece 6 Gün', hotels: 'Bölge otellerinde konaklama', airline: 'Otobüslü program', price: 'Fiyat Sorunuz', program: 'Yaylalar, doğa gezileri ve yöresel duraklardan oluşan örnek Karadeniz programı.' }
        ],
        reviews: [
            { id: 'r1', name: 'Ahmet Yılmaz', text: 'Harika bir umre deneyimi yaşadık. Her şey çok güzel organize edilmişti.', stars: 5 },
            { id: 'r2', name: 'Zeynep Kaya', text: 'Rehberimiz çok ilgiliydi. Otel ve ulaşım hizmetlerinden memnun kaldık.', stars: 5 },
            { id: 'r3', name: 'Mehmet Demir', text: 'Ailemle birlikte huzurlu ve güvenli bir yolculuk yaptık.', stars: 5 },
            { id: 'r4', name: 'Fatma Aydın', text: 'Her şey mükemmeldi. Tekrar tercih edeceğimiz bir acenta.', stars: 5 }
        ],
        gallery: [
            { id: 'g1', title: 'Medine Ziyareti', image: 'assets/gallery-medine.jpeg' },
            { id: 'g2', title: 'Kuba Mescidi', image: 'assets/gallery-kuba.jpeg' }
        ],
        staff: [
            { id: 's1', name: 'Emrullah Kesken', role: 'Umre Rehberi', image: 'assets/icon.png', bio: 'Hac ve umre organizasyonlarında misafirlere ibadet, ziyaret ve grup takibi konularında rehberlik eder.' },
            { id: 's2', name: 'Ahmet İkinci', role: 'Kafile Sorumlusu', image: 'assets/icon.png', bio: 'Program akışı, otel yerleşimi ve yolculuk sürecinde misafir memnuniyetine odaklanır.' },
            { id: 's3', name: 'Barış Ay', role: 'Şirket Yetkilisi', image: 'assets/icon.png', bio: 'Tur planlaması, operasyon ve iletişim süreçlerinde profesyonel destek sağlar.' }
        ],
        blogs: [
            { id: 'b1', category: 'Umre Rehberi', title: 'İhram Yasakları Nelerdir?', summary: 'Umreye gitmeden önce bilinmesi gereken temel ihram kuralları.', content: 'İhrama giren kişinin dikkat etmesi gereken bazı kurallar vardır. Koku sürmemek, saç ve tırnak kesmemek, avlanmamak, dikişli kıyafet giymemek gibi konular rehber eşliğinde detaylı anlatılır.' },
            { id: 'b2', category: 'Vize İşlemleri', title: 'Umre Vize İşlemleri Nasıl Yapılır?', summary: 'Pasaport, evrak ve vize süreci hakkında kısa bilgilendirme.', content: 'Umre vize işlemleri için pasaport bilgileri ve gerekli evraklar alınır. Başvuru süreci acenta tarafından takip edilir ve misafire gerekli bilgilendirme yapılır.' },
            { id: 'b3', category: 'Hazırlık', title: 'Umreye Giderken Neler Alınmalı?', summary: 'Yolculuk öncesi çanta hazırlığı ve gerekli eşyalar.', content: 'İhram, rahat terlik, kişisel ilaçlar, küçük çanta, şarj cihazı, pasaport ve gerekli evraklar yolculuk öncesinde hazır edilmelidir.' }
        ],
        passengerLists: []
    };

    const SEO_DEFAULT_BLOGS = [
        { id: 'seo-evraklar', slug: 'umre-icin-gerekli-evraklar', category: 'Umre Rehberi', title: 'Umre için gerekli evraklar', summary: 'Pasaport, fotoğraf, kimlik ve başvuru sürecinde gereken temel belgeler.', content: 'Umre yolculuğu için geçerli pasaport, kimlik bilgileri, biyometrik fotoğraf ve güncel başvuru koşullarına göre istenen belgeler hazırlanmalıdır. Evrak listenizi program tarihinden önce acentamızla kontrol ederek eksikleri tamamlayabilirsiniz.' },
        { id: 'seo-2026-fiyatlari', slug: '2026-umre-fiyatlari', category: 'Umre Fiyatları', title: '2026 Umre fiyatları', summary: 'Oda tipi, tarih, uçuş ve otel seçiminin 2026 Umre fiyatlarına etkisi.', content: '2026 Umre fiyatları; program süresi, uçuş şehri, havayolu, Mekke ve Medine otelleri ile oda tipine göre değişir. Güncel ikili, üçlü ve dörtlü oda fiyatlarını aktif program sayfalarımızdan karşılaştırabilirsiniz.' },
        { id: 'seo-ilk-umre', slug: 'ilk-defa-umreye-gidecekler-icin-rehber', category: 'Umre Rehberi', title: 'İlk defa Umreye gidecekler için rehber', summary: 'İlk Umre yolculuğunuz öncesinde bilmeniz gereken temel adımlar.', content: 'İlk kez Umreye gidecek misafirlerimiz evrak, valiz, ihram, ibadet ve ziyaret hazırlıklarını yolculuktan önce planlamalıdır. Rehberlerimiz program boyunca havalimanından konaklamaya kadar kafileye eşlik eder.' },
        { id: 'seo-valiz', slug: 'umre-valizinde-neler-olmali', category: 'Hazırlık', title: 'Umre valizinde neler olmalı?', summary: 'Rahat ve düzenli bir yolculuk için pratik Umre valizi listesi.', content: 'Umre valizinde mevsime uygun rahat kıyafet, terlik, kişisel ilaçlar, küçük ibadet çantası, şarj cihazı ve gerekli evraklar bulunmalıdır. Sıvı ve bagaj kurallarını uçuş öncesinde kontrol etmeyi unutmayın.' },
        { id: 'seo-ihram', slug: 'ihrama-nasil-girilir', category: 'Umre Rehberi', title: 'İhrama nasıl girilir?', summary: 'Niyet, telbiye ve ihrama giriş sürecinin kısa anlatımı.', content: 'İhrama girmeden önce kişisel hazırlıklar tamamlanır, uygun kıyafet giyilir ve mikat sınırından önce niyet edilerek telbiye getirilir. Kafile rehberiniz zamanlama ve uygulama adımlarını yolculuk sırasında ayrıntılı olarak anlatır.' },
        { id: 'seo-ravza', slug: 'ravza-randevusu-nasil-alinir', category: 'Medine Rehberi', title: 'Ravza randevusu nasıl alınır?', summary: 'Ravza ziyareti için güncel randevu ve hazırlık adımları.', content: 'Ravza ziyareti için Suudi Arabistan tarafından kullanılan resmî uygulamadaki güncel randevu adımları takip edilir. Kurallar zaman içinde değişebildiği için hareket öncesinde kafile sorumlusunun bilgilendirmesini esas alın.' },
        { id: 'seo-sure', slug: 'umre-kac-gun-surer', category: 'Umre Rehberi', title: 'Umre kaç gün sürer?', summary: 'Farklı Umre program süreleri ve konaklama dağılımları.', content: 'Umre programları uçuş ve konaklama planına göre farklı gün ve gece seçenekleriyle hazırlanır. Mekke ve Medine konaklama dağılımını, ziyaret günlerini ve dönüş tarihini program detay sayfasında görebilirsiniz.' },
        { id: 'seo-otel', slug: 'mekke-ve-medinede-otel-secimi', category: 'Konaklama', title: 'Mekke ve Medine’de otel seçimi', summary: 'Harem mesafesi, servis ve oda özelliklerine göre otel seçimi.', content: 'Otel seçiminde Harem ve Mescid-i Nebevî mesafesi, servis imkânı, oda tipi ve program bütçesi birlikte değerlendirilmelidir. Her aktif programın otel adı ve mesafe bilgileri kendi detay sayfasında sunulur.' },
        { id: 'seo-yaslilar', slug: 'yaslilar-umreye-tek-basina-gidebilir-mi', category: 'Umre Rehberi', title: 'Yaşlılar Umreye tek başına gidebilir mi?', summary: 'İleri yaştaki misafirler için refakat, sağlık ve program seçimi önerileri.', content: 'İleri yaştaki misafirlerin sağlık durumu, hareket kabiliyeti ve ihtiyaç duyduğu destek program seçerken dikkate alınmalıdır. Uygun otel mesafesi ve kafile desteği için yolculuk öncesinde acentamızla görüşebilirsiniz.' }
    ];

    const page = document.body.dataset.page;
    const $ = (id) => document.getElementById(id);
    const IS_DESKTOP_APP = page === 'admin' && new URLSearchParams(location.search).get('desktop') === '1';
    if (IS_DESKTOP_APP) document.body.classList.add('desktop-app');
    const COMPANY_CONFIG = {
        hazeyn: {
            id: 'hazeyn', name: 'Hazeyn Turizm', shortName: 'Hazeyn', receiptPrefix: 'HZ',
            logo: 'assets/logo.png', loginLogo: 'assets/hazeyn-logo-receipt.png', receiptLogo: 'assets/hazeyn-logo-receipt.png', publicUrl: 'index.html', accent: '#c4912f'
        },
        hakikat: {
            id: 'hakikat', name: 'Hakikat Turizm', shortName: 'Hakikat', receiptPrefix: 'HK',
            logo: 'assets/hakikat-logo-white.png', loginLogo: 'assets/hakikat-logo.png', receiptLogo: 'assets/hakikat-logo.png', publicUrl: '', accent: '#628c2c'
        }
    };

    function normalizeCompanyId(value) {
        return String(value || '').trim().toLowerCase() === 'hakikat' ? 'hakikat' : 'hazeyn';
    }

    const requestedCompany = new URLSearchParams(location.search).get('company');
    let currentCompanyId = page === 'public'
        ? 'hazeyn'
        : normalizeCompanyId(requestedCompany || localStorage.getItem('turizmLastCompany'));
    let state = null;
    let adminLoggedIn = false;
    let tempTourImage = '';
    let tempTourDetailBannerImage = '';
    let tempHotelMekkeImages = [];
    let tempHotelMedineImages = [];
    let tempTourGroupImages = [];
    let dragPassengerInfo = null;
    let dragHeroBannerInfo = null;
    let tempGalleryImage = '';
    let tempStaffImage = '';
    let tempBlogImage = '';
    let tempHeroBannerImage = '';
    let tempStaffBannerImage = '';
    let tempBlogBannerImage = '';
    let heroSlideIndex = 0;
    let heroTimer = null;
    let currentGalleryIndex = 0;
    let revealObserver = null;
    let publicRefreshInFlight = false;
    let accountingSearchQuery = '';
    let currentAppUser = null;
    let desktopUsers = [];
    const surnameSortedLists = new Set();

    function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
    function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    function currentCompany() {
        return COMPANY_CONFIG[currentCompanyId] || COMPANY_CONFIG.hazeyn;
    }

    function desktopToken() {
        return IS_DESKTOP_APP ? String(sessionStorage.getItem('turizmDesktopToken') || '') : '';
    }

    function isAppOwner() {
        return Boolean(IS_DESKTOP_APP && currentAppUser && currentAppUser.role === 'owner');
    }

    function allowedCompanyIds() {
        if (!IS_DESKTOP_APP || isAppOwner()) return ['hazeyn', 'hakikat'];
        return Array.isArray(currentAppUser?.companies) ? currentAppUser.companies.map(normalizeCompanyId) : [];
    }

    function canAccessCompany(companyId) {
        return allowedCompanyIds().includes(normalizeCompanyId(companyId));
    }

    function currentActor() {
        if (!IS_DESKTOP_APP || !currentAppUser) return null;
        return { id: String(currentAppUser.id), username: String(currentAppUser.username), name: String(currentAppUser.displayName || currentAppUser.username) };
    }

    function actorName(value, fallback = '—') {
        if (!value) return fallback;
        if (typeof value === 'string') return value || fallback;
        return String(value.name || value.displayName || value.username || fallback);
    }

    function authorizedHeaders(extra = {}) {
        const headers = { ...extra, 'x-company-id': currentCompanyId };
        const token = desktopToken();
        if (IS_DESKTOP_APP && token) {
            headers.Authorization = `Bearer ${token}`;
            headers['x-app-mode'] = 'desktop';
        } else {
            const password = getAdminPassword();
            if (password) headers['x-admin-password'] = password;
        }
        return headers;
    }

    function hasAdminCredential() {
        return Boolean(IS_DESKTOP_APP ? desktopToken() : getAdminPassword());
    }

    function defaultDataForCompany() {
        const data = clone(DEFAULT_DATA);
        if (currentCompanyId !== 'hakikat') return data;
        data.settings = {
            ...data.settings,
            brand: 'Hakikat Turizm Seyahat Acentası',
            phone: '', phone2: '', whatsapp: '', email: '', website: '', instagram: '', address: '',
            heroTitle: 'Hakikat Turizm', heroSubtitle: '', heroMode: 'single', heroBanners: [], officeImages: [],
            staffBannerKicker: 'HAKİKAT TURİZM', staffBannerTitle: 'Deneyimli Kadro', staffBannerSubtitle: '', staffBannerImage: '',
            blogBannerKicker: 'HAKİKAT TURİZM', blogBannerTitle: 'Merak Edilenler', blogBannerSubtitle: '', blogBannerImage: ''
        };
        data.tours = [];
        data.reviews = [];
        data.gallery = [];
        data.staff = [];
        data.blogs = [];
        data.passengerLists = [];
        return data;
    }

    function companyCacheKey() {
        return currentCompanyId === 'hazeyn' ? 'hazeynData' : `turizmData:${currentCompanyId}`;
    }

    function companyLogoUrl() {
        const company = currentCompany();
        return new URL(IS_DESKTOP_APP ? (company.receiptLogo || company.logo) : company.logo, location.href).href;
    }

    function adminPasswordKey(companyId = currentCompanyId) {
        return `turizmAdminPassword:${normalizeCompanyId(companyId)}`;
    }

    function updateCompanyBranding() {
        if (page !== 'admin') return;
        const company = currentCompany();
        document.body.dataset.company = company.id;
        document.title = `${company.name} • Turizm Muhasebe`;
        document.querySelectorAll('[data-company-name]').forEach(el => { el.textContent = company.name; });
        document.querySelectorAll('[data-company-short-name]').forEach(el => { el.textContent = company.shortName; });
        document.querySelectorAll('[data-company-logo]').forEach(el => {
            const context = el.dataset.companyLogo;
            el.src = context === 'login' ? company.loginLogo : company.logo;
            el.alt = company.name;
        });
        document.querySelectorAll('[data-company-choice]').forEach(button => {
            const selected = button.dataset.companyChoice === company.id;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        if ($('companySwitcher') && $('companySwitcher').value !== company.id) $('companySwitcher').value = company.id;
        if ($('companySwitcher')) {
            Array.from($('companySwitcher').options).forEach(option => {
                const unavailable = IS_DESKTOP_APP && adminLoggedIn && !canAccessCompany(option.value);
                option.hidden = unavailable;
                option.disabled = unavailable;
            });
        }
        if ($('companyAccountNote')) $('companyAccountNote').textContent = IS_DESKTOP_APP
            ? 'Baş yönetici veya sana verilen çalışan hesabıyla giriş yap.'
            : `${company.name} kayıtları diğer firmadan tamamen ayrı tutulur.`;
        if (IS_DESKTOP_APP && $('loginHeading')) $('loginHeading').textContent = `${company.name} Girişi`;
        if (IS_DESKTOP_APP && $('loginKicker')) $('loginKicker').textContent = 'GİRİŞ YAPILACAK FİRMAYI SEÇ';
        if (IS_DESKTOP_APP && $('signedUserName')) $('signedUserName').textContent = currentAppUser?.displayName || '—';
        document.querySelectorAll('.desktop-owner-only').forEach(element => { element.hidden = !isAppOwner(); element.style.display = isAppOwner() ? '' : 'none'; });
        document.querySelectorAll('[data-company-public-link]').forEach(publicLink => {
            publicLink.hidden = !company.publicUrl;
            publicLink.href = company.publicUrl || '#';
        });
    }

    function slugifyTR(value) {
        const map = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u' };
        return String(value || '').replace(/[çÇğĞıIİöÖşŞüÜ]/g, ch => map[ch] || ch).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
    }

    function dateSlug(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
        if (!match) return '';
        const months = ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran', 'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'];
        const month = months[Number(match[2]) - 1];
        return month ? `${Number(match[3])}-${month}-${match[1]}` : '';
    }

    function defaultTourSlug(t) {
        const dated = dateSlug(t && t.departureDate);
        const type = String(t && t.type || 'umre');
        if (dated && type === 'umre') return `${dated}-umre-programi`;
        return slugifyTR([dated, t && t.title, type === 'umre' ? 'umre-programi' : ''].filter(Boolean).join('-')) || 'program';
    }

    function uniqueTourSlug(value, currentId) {
        const base = slugifyTR(value) || 'umre-programi';
        const used = new Set((state?.tours || []).filter(t => t.id !== currentId).map(t => slugifyTR(t.slug || defaultTourSlug(t))).filter(Boolean));
        if (!used.has(base)) return base;
        let suffix = 2;
        while (used.has(`${base}-${suffix}`)) suffix += 1;
        return `${base}-${suffix}`;
    }

    function normalizeDepartureCities(value) {
        const raw = Array.isArray(value) ? value : String(value || '').split(/[,/;+]/);
        const result = [];
        raw.forEach(item => {
            const key = slugifyTR(item);
            if ((key.includes('istanbul') || key === 'ist') && !result.includes('istanbul')) result.push('istanbul');
            if ((key.includes('konya') || key === 'kny') && !result.includes('konya')) result.push('konya');
        });
        return result.length ? ['istanbul', 'konya'].filter(city => result.includes(city)) : ['istanbul'];
    }

    function departureCityLabel(t) {
        const cities = normalizeDepartureCities(t && (t.departureCities || t.departureCity));
        const labels = cities.map(city => city === 'konya' ? 'Konya' : 'İstanbul');
        return `${labels.join(' / ')} çıkışlı`;
    }

    function normalizedTourStatus(t) {
        const raw = String(t && t.status || '').toLowerCase();
        if (raw === 'upcoming') return 'active';
        if (['active', 'completed', 'draft'].includes(raw)) return raw;
        const departure = parseLocalDate(t && t.departureDate);
        if (!departure) return 'active';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return departure < today ? 'completed' : 'active';
    }

    function positiveInteger(value) {
        if (value === null || value === undefined || String(value).trim() === '') return '';
        const n = Number(value);
        return Number.isFinite(n) && n >= 0 ? Math.round(n) : '';
    }

    function durationLabel(t) {
        const days = positiveInteger(t && (t.durationDays ?? t.dayCount ?? t.days));
        const nights = positiveInteger(t && (t.durationNights ?? t.nightCount));
        if (days !== '') return nights !== '' ? `${days} Gün / ${nights} Gece` : `${days} Gün`;
        return String(t && t.nights || '').trim();
    }

    function legacyHotelName(text, city) {
        const line = String(text || '').split(/\n+/).find(item => slugifyTR(item).startsWith(slugifyTR(city)));
        return line ? line.replace(/^[^:]+:\s*/, '').trim() : '';
    }

    function textBlock(value) {
        if (Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean).join('\n');
        return String(value || '').trim();
    }

    function normalizeTour(t, seenSlugs) {
        const source = t || {};
        let slug = slugifyTR(source.slug || defaultTourSlug(source));
        if (seenSlugs) {
            const base = slug || 'umre-programi';
            let suffix = 2;
            slug = base;
            while (seenSlugs.has(slug)) slug = `${base}-${suffix++}`;
            seenSlugs.add(slug);
        }
        return {
            ...source,
            slug,
            status: normalizedTourStatus(source),
            departureCities: normalizeDepartureCities(source.departureCities || source.departureCity),
            durationDays: positiveInteger(source.durationDays ?? source.dayCount ?? source.days),
            durationNights: positiveInteger(source.durationNights ?? source.nightCount),
            mekkeHotelName: String(source.mekkeHotelName || legacyHotelName(source.hotels, 'Mekke')).trim(),
            mekkeDistanceService: String(source.mekkeDistanceService || '').trim(),
            medineHotelName: String(source.medineHotelName || legacyHotelName(source.hotels, 'Medine')).trim(),
            medineDistanceService: String(source.medineDistanceService || '').trim(),
            flightDetails: String(source.flightDetails || '').trim(),
            includedServices: textBlock(source.includedServices),
            excludedServices: textBlock(source.excludedServices),
            visitProgram: textBlock(source.visitProgram),
            capacity: String(source.capacity || '').trim(),
            capacityStatus: ['available', 'limited', 'full', 'waitlist'].includes(source.capacityStatus) ? source.capacityStatus : 'available',
            groupImages: normalizeImageArray(source.groupImages),
            detailBannerImage: String(source.detailBannerImage || '').trim(),
            detailBannerKicker: String(source.detailBannerKicker || '').trim(),
            detailBannerTitle: String(source.detailBannerTitle || '').trim(),
            detailBannerSubtitle: String(source.detailBannerSubtitle || '').trim(),
            detailBannerPosition: ['center', 'left', 'right', 'top', 'bottom'].includes(source.detailBannerPosition) ? source.detailBannerPosition : 'center',
            seoTitle: String(source.seoTitle || '').trim(),
            seoDescription: String(source.seoDescription || '').trim()
        };
    }

    function normalizeTours(items) {
        const seen = new Set();
        return (Array.isArray(items) ? items : []).map(t => normalizeTour(t, seen));
    }

    function normalizeBlog(b) {
        const source = b || {};
        return { ...source, slug: slugifyTR(source.slug || source.title || source.id) };
    }

    function mergeSeoDefaultBlogs(items) {
        const list = (Array.isArray(items) ? items : []).map(normalizeBlog);
        const keys = new Set(list.flatMap(b => [slugifyTR(b.slug), slugifyTR(b.title)]).filter(Boolean));
        SEO_DEFAULT_BLOGS.forEach(item => {
            const normalized = normalizeBlog(item);
            if (keys.has(normalized.slug) || keys.has(slugifyTR(normalized.title))) return;
            list.push(normalized);
            keys.add(normalized.slug);
            keys.add(slugifyTR(normalized.title));
        });
        return list;
    }

    function syncTourSlugField(force) {
        const input = $('tourSlug');
        if (!input || (!force && input.dataset.manual === '1')) return;
        input.value = defaultTourSlug({ type: $('tourType')?.value, title: $('tourTitle')?.value, departureDate: $('tourDepartureDate')?.value });
    }

    function openHazeynDb() {
        return new Promise((resolve) => {
            if (!('indexedDB' in window)) return resolve(null);
            const req = indexedDB.open('hazeynTurizmDb', 1);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    }

    async function idbGet(key) {
        const db = await openHazeynDb();
        if (!db) return null;
        return new Promise((resolve) => {
            const tx = db.transaction('kv', 'readonly');
            const req = tx.objectStore('kv').get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
            tx.oncomplete = () => db.close();
        });
    }

    async function idbSet(key, value) {
        const db = await openHazeynDb();
        if (!db) return false;
        return new Promise((resolve) => {
            const tx = db.transaction('kv', 'readwrite');
            tx.objectStore('kv').put(value, key);
            tx.oncomplete = () => { db.close(); resolve(true); };
            tx.onerror = () => { db.close(); resolve(false); };
        });
    }

    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>'"]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[s]));
    }

    function stars(n) {
        return '★★★★★'.slice(0, Number(n) || 5);
    }

    function normalizePhone(phone) {
        return String(phone || '').replace(/[^0-9+]/g, '');
    }

    function airportCode(value) {
        return String(value || '').toLocaleUpperCase('tr-TR').replace(/[^A-Z]/g, '').slice(0, 3);
    }

    function firstLine(text) {
        return String(text || '').split('\n')[0];
    }

    function formatDateTR(value) {
        if (!value) return '';
        const d = new Date(String(value) + 'T12:00:00');
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatDateDMY(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
        return match ? `${match[3]}.${match[2]}.${match[1]}` : text;
    }

    function todayIso() {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 10);
    }

    function stableTextHash(value) {
        let hash = 2166136261;
        const text = String(value || '');
        for (let i = 0; i < text.length; i += 1) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    function stablePassengerId(listId, passenger, index) {
        if (passenger && passenger.id) return String(passenger.id);
        const identity = [listId, passenger?.tc, passenger?.passportNo, passenger?.name, passenger?.birthDate, index].join('|');
        return `p_${stableTextHash(identity)}`;
    }

    function normalizePayment(payment) {
        const source = payment || {};
        const amount = Number(source.amount);
        return {
            ...source,
            id: String(source.id || uid('pay_')),
            receiptNo: String(source.receiptNo || createReceiptNumber()),
            amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
            paidAt: String(source.paidAt || todayIso()),
            method: String(source.method || 'Nakit'),
            note: String(source.note || ''),
            voided: source.voided === true,
            createdAt: String(source.createdAt || new Date().toISOString())
        };
    }

    function normalizePassengerLists(items) {
        return (Array.isArray(items) ? items : []).map(list => {
            const source = list || {};
            const listId = String(source.id || uid('l'));
            const passengers = (Array.isArray(source.passengers) ? source.passengers : []).map((passenger, index) => {
                const accounting = passenger?.accounting || {};
                const agreedPrice = Number(accounting.agreedPrice);
                return {
                    ...(passenger || {}),
                    id: stablePassengerId(listId, passenger, index),
                    accounting: {
                        agreedPrice: Number.isFinite(agreedPrice) && agreedPrice >= 0 ? agreedPrice : '',
                        currency: ['USD', 'EUR', 'TRY'].includes(accounting.currency) ? accounting.currency : '',
                        priceSource: accounting.priceSource === 'custom' || (!accounting.priceSource && accounting.agreedPrice !== '' && accounting.agreedPrice !== undefined) ? 'custom' : 'room',
                        payments: (Array.isArray(accounting.payments) ? accounting.payments : []).map(normalizePayment)
                    }
                };
            });
            return { ...source, id: listId, passengers };
        });
    }

    /* PASAPORT KONTROLÜ: uçuş tarihinde en az 6 ay geçerlilik */
    function parseLocalDate(value) {
        if (!value) return null;
        const d = new Date(String(value) + 'T12:00:00');
        return Number.isNaN(d.getTime()) ? null : d;
    }

    function addCalendarMonths(date, months) {
        const d = new Date(date.getTime());
        const originalDay = d.getDate();
        d.setDate(1);
        d.setMonth(d.getMonth() + months);
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(originalDay, lastDay));
        return d;
    }

    function isPassportExpiring(endDate, flightDate) {
        const end = parseLocalDate(endDate);
        const flight = parseLocalDate(flightDate);
        if (!end || !flight) return false;
        return end < addCalendarMonths(flight, 6);
    }

    function isPassengerInfant(birthDate, flightDate) {
        const birth = parseLocalDate(birthDate);
        const flight = parseLocalDate(flightDate);
        if (!birth || !flight || birth > flight) return false;
        const secondBirthday = new Date(birth.getTime());
        secondBirthday.setFullYear(secondBirthday.getFullYear() + 2);
        return flight < secondBirthday;
    }

    function getListFlightDate(list) {
        const tour = state && state.tours ? state.tours.find(t => t.id === list.tourId) : null;
        return (tour && tour.departureDate) || list.date || '';
    }

    function passportStatus(passenger, flightDate) {
        if (!passenger.passportEnd) return { level: 'missing', label: 'Bitiş tarihi eksik' };
        if (!flightDate) return { level: 'missing', label: 'Uçuş tarihi eksik' };
        if (isPassportExpiring(passenger.passportEnd, flightDate)) return { level: 'danger', label: '6 ay kuralını karşılamıyor' };
        return { level: 'ok', label: 'Uygun' };
    }

    /* ODA RENGİ KONTROLÜ */
    function getRoomColorClass(roomTitle) {
        if (!roomTitle) return '';
        if (roomTitle.includes('2 Kişilik')) return 'room-color-2';
        if (roomTitle.includes('3 Kişilik')) return 'room-color-3';
        if (roomTitle.includes('4 Kişilik')) return 'room-color-4';
        return '';
    }

    function getRoomPrices(t) {
        const rp = (t && t.roomPrices) || {};
        return {
            '1': rp['1'] || rp.one || '',
            '2': rp['2'] || rp.two || '',
            '3': rp['3'] || rp.three || '',
            '4': rp['4'] || rp.four || '',
            '5+': rp['5+'] || rp.fivePlus || rp.five || ''
        };
    }

    function cleanRoomPrices(prices) {
        const p = prices || {};
        const result = {};
        ['1', '2', '3', '4', '5+'].forEach(k => {
            const value = String(p[k] || '').trim();
            if (value) result[k] = value;
        });
        return result;
    }

    function roomPriceEntries(t) {
        const prices = getRoomPrices(t);
        return ['1', '2', '3', '4', '5+'].map(k => ({ key: k, label: k + ' Kişilik Oda', value: String(prices[k] || '').trim() })).filter(x => x.value);
    }

    function formatPerPersonPrice(value) {
        const clean = String(value || '').trim();
        if (!clean) return 'Fiyat Sorunuz';
        if (/fiyat\s*sorunuz/i.test(clean)) return 'Fiyat Sorunuz';
        return /^kişi\s*başı/i.test(clean) ? clean : 'Kişi Başı ' + clean;
    }

    function previewRoomEntry(t) {
        const entries = roomPriceEntries(t);
        return entries.find(e => e.key === '2') || entries.find(e => e.key === '3') || entries[0] || null;
    }

    function pricePreview(t) {
        const preferred = previewRoomEntry(t);
        if (preferred) return formatPerPersonPrice(preferred.value);
        return formatPerPersonPrice(t.price || '');
    }

    function startingPriceValue(t) {
        const priced = roomPriceEntries(t).map(entry => ({ ...entry, amount: Number(String(entry.value).replace(/[^0-9]/g, '')) })).filter(entry => Number.isFinite(entry.amount) && entry.amount > 0).sort((a, b) => a.amount - b.amount);
        return priced[0]?.value || String(t && t.price || '').trim() || 'Fiyat Sorunuz';
    }

    function seoTextsForTour(source) {
        const t = normalizeTour(source || {});
        const date = formatDateTR(t.departureDate);
        const days = t.durationDays ? `${t.durationDays} Günlük` : '';
        const titleBase = [date, days, t.type === 'umre' ? 'Umre Programı' : t.title].filter(Boolean).join(' ');
        const cities = departureCityLabel(t).replace(/ çıkışlı$/i, '');
        const hotels = [t.mekkeHotelName, t.medineHotelName].filter(Boolean).join(' ve ');
        return {
            title: `${titleBase || t.title} | ${currentCompany().name}`.slice(0, 70),
            description: `${date ? `${date} tarihli ` : ''}${t.durationDays ? `${t.durationDays} günlük ` : ''}${cities ? `${cities} çıkışlı ` : ''}Umre programı${hotels ? `; ${hotels} konaklamaları` : ''}, uçuş, oda fiyatları ve ziyaret ayrıntıları.`.replace(/\s+/g, ' ').slice(0, 180)
        };
    }

    function fillTourSeo(force = true) {
        const draft = normalizeTour({
            type: $('tourType').value,
            title: $('tourTitle').value.trim(),
            departureDate: $('tourDepartureDate').value,
            departureCities: normalizeDepartureCities($('tourDepartureCities').value),
            durationDays: positiveInteger($('tourDurationDays').value),
            mekkeHotelName: $('tourMekkeHotelName').value.trim(),
            medineHotelName: $('tourMedineHotelName').value.trim()
        });
        const seo = seoTextsForTour(draft);
        if (force || !$('tourSeoTitle').value.trim()) $('tourSeoTitle').value = seo.title;
        if (force || !$('tourSeoDescription').value.trim()) $('tourSeoDescription').value = seo.description;
    }

    function capacityLabel(t) {
        const labels = { available: 'Müsait', limited: 'Sınırlı Kontenjan', full: 'Kontenjan Dolu', waitlist: 'Yedek Liste' };
        return String(t && t.capacity || '').trim() || labels[t && t.capacityStatus] || '';
    }

    function priceTableHtml(t) {
        const entries = roomPriceEntries(t);
        if (entries.length) {
            return `<div class="price-list"><h3>Oda Tipine Göre Kişi Başı Fiyatlar</h3>${entries.map(e => `<div><span>${escapeHtml(e.label)}</span><b>${escapeHtml(formatPerPersonPrice(e.value))}</b></div>`).join('')}</div>`;
        }
        return `<p><b>Fiyat:</b> ${escapeHtml(formatPerPersonPrice(t.price || ''))}</p>`;
    }

    function tourWhatsappMessage(t) {
        const date = formatDateTR(t.departureDate);
        const parts = [t.title];
        if (date) parts.push(date + ' kalkışlı');
        parts.push('program için bilgi almak istiyorum.');
        return 'Merhaba, ' + parts.filter(Boolean).join(' ');
    }

    function tourWhatsappHref(t) {
        return 'https://wa.me/' + normalizePhone(state.settings.whatsapp) + '?text=' + encodeURIComponent(tourWhatsappMessage(t));
    }

    function toast(msg) {
        const el = $('toast');
        if (!el) { alert(msg); return; }
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('show'), 2300);
    }

    function getAdminPassword() {
        return sessionStorage.getItem(adminPasswordKey()) || sessionStorage.getItem('turizmAdminPassword') || sessionStorage.getItem('hazeynAdminPassword') || '';
    }

    async function validateAdminPassword(password) {
        if (location.protocol !== 'file:') {
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-company-id': currentCompanyId },
                    body: JSON.stringify({ password, company: currentCompanyId })
                });
                if (res.ok) {
                    sessionStorage.setItem(adminPasswordKey(), password);
                    sessionStorage.setItem('turizmAdminPassword', password);
                    return true;
                }
                if (res.status !== 404 && res.status !== 405) return false;
            } catch (e) {
                console.warn('Sunucu şifre kontrolü yapılamadı, yerel kontrol deneniyor.', e);
            }
        }
        // Yonetici sifresi yalnizca sunucudaki ortam degiskeni / sunucu dogrulamasi
        // ile kontrol edilir; site verisi veya istemci paketi icinde tutulmaz.
        return false;
    }

    function storeDesktopSession(result) {
        currentAppUser = result && result.user ? result.user : null;
        if (result && result.token) sessionStorage.setItem('turizmDesktopToken', result.token);
        if (currentAppUser) sessionStorage.setItem('turizmDesktopUser', JSON.stringify(currentAppUser));
    }

    function clearDesktopSession() {
        currentAppUser = null;
        desktopUsers = [];
        sessionStorage.removeItem('turizmDesktopToken');
        sessionStorage.removeItem('turizmDesktopUser');
    }

    async function validateDesktopLogin(username, password) {
        try {
            const res = await fetch('/api/app-auth?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: String(username || 'admin').trim() || 'admin', password })
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok || !result.token || !result.user) return { ok: false, error: result.error || 'Kullanıcı adı veya şifre hatalı.' };
            storeDesktopSession(result);
            const allowed = allowedCompanyIds();
            if (!allowed.includes(currentCompanyId)) {
                clearDesktopSession();
                return { ok: false, error: `Bu kullanıcı ${currentCompany().name} hesabına yetkili değil. Giriş ekranından yetkili olduğu firmayı seçsin.` };
            }
            localStorage.setItem('turizmLastCompany', currentCompanyId);
            return { ok: true };
        } catch (error) {
            return { ok: false, error: 'Giriş sistemiyle bağlantı kurulamadı.' };
        }
    }

    async function restoreDesktopSession() {
        if (!IS_DESKTOP_APP || !desktopToken()) return false;
        try {
            const res = await fetch('/api/app-auth?action=me', { cache: 'no-store', headers: authorizedHeaders() });
            const result = await res.json().catch(() => ({}));
            if (!res.ok || !result.user) throw new Error(result.error || 'Oturum geçersiz.');
            currentAppUser = result.user;
            sessionStorage.setItem('turizmDesktopUser', JSON.stringify(currentAppUser));
            const allowed = allowedCompanyIds();
            if (!allowed.includes(currentCompanyId)) currentCompanyId = allowed[0] || 'hazeyn';
            return true;
        } catch (error) {
            clearDesktopSession();
            return false;
        }
    }

    async function desktopApi(action, options = {}) {
        const method = options.method || 'GET';
        const request = {
            method,
            cache: 'no-store',
            headers: authorizedHeaders(method === 'POST' ? { 'Content-Type': 'application/json' } : {})
        };
        if (method === 'POST') request.body = JSON.stringify(options.body || {});
        const res = await fetch(`/api/app-auth?action=${encodeURIComponent(action)}`, request);
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || 'İşlem tamamlanamadı.');
        return result;
    }

    async function getUploadConfig() {
        if (getUploadConfig.cache) return getUploadConfig.cache;
        if (location.protocol === 'file:') return null;
        try {
            const res = await fetch(`/api/data?action=upload-config&company=${encodeURIComponent(currentCompanyId)}`, {
                cache: 'no-store',
                headers: authorizedHeaders()
            });
            if (!res.ok) return null;
            const cfg = await res.json();
            if (cfg && cfg.url && cfg.anonKey && cfg.bucket) {
                getUploadConfig.cache = cfg;
                return cfg;
            }
        } catch (e) {
            console.warn('Supabase ayarları alınamadı.', e);
        }
        return null;
    }

    async function uploadImageToSupabase(file, folder) {
        if (!hasAdminCredential()) return null;

        const prepared = await prepareImageBlob(file);
        const originalName = file.name || 'image.jpg';
        const uploadName = prepared.type === 'image/webp'
            ? originalName.replace(/\.[^.]+$/, '') + '.webp'
            : originalName;

        if (location.protocol !== 'file:') {
            try {
                const direct = await fetch('/api/media-upload', {
                    method: 'POST',
                    headers: {
                        ...authorizedHeaders(),
                        'Content-Type': prepared.type || 'image/jpeg',
                        'x-file-name': uploadName,
                        'x-upload-folder': folder || 'uploads'
                    },
                    body: prepared
                });
                if (direct.ok) {
                    const result = await direct.json();
                    if (result && result.url) return result.url;
                }
                if (direct.status !== 404 && direct.status !== 405) {
                    const error = await direct.json().catch(() => ({}));
                    throw new Error(error.error || 'Görsel yüklenemedi.');
                }
            } catch (error) {
                console.warn('Site görsel yüklemesi kullanılamadı, diğer yöntem deneniyor.', error);
            }
        }

        const cfg = await getUploadConfig();
        if (!cfg || !window.supabase) return null;

        const signed = await fetch(`/api/data?action=signed-upload&company=${encodeURIComponent(currentCompanyId)}`, {
            method: 'POST',
            headers: authorizedHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ filename: uploadName, type: prepared.type, size: prepared.size, folder: folder || 'uploads' })
        });
        if (!signed.ok) throw new Error('Yükleme izni alınamadı. Admin şifreni tekrar gir.');

        const info = await signed.json();
        const client = window.supabase.createClient(cfg.url, cfg.anonKey);

        const { error } = await client.storage.from(info.bucket || cfg.bucket).uploadToSignedUrl(info.path, info.token, prepared, { contentType: prepared.type || 'image/jpeg' });
        if (error) throw error;

        const pub = client.storage.from(info.bucket || cfg.bucket).getPublicUrl(info.path);
        return pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : null;
    }

    function prepareImageBlob(file) {
        const imageType = String(file && file.type || '').toLowerCase();
        const convertible = imageType === 'image/jpeg' || imageType === 'image/png';
        if (!file || !convertible || file.size <= 350 * 1024) {
            return Promise.resolve(file);
        }
        return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                const maxSide = 1920;
                const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
                const width = Math.max(1, Math.round(image.naturalWidth * scale));
                const height = Math.max(1, Math.round(image.naturalHeight * scale));
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, width, height);
                URL.revokeObjectURL(objectUrl);
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Görsel hazırlanamadı.')), 'image/webp', 0.84);
            };
            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Görsel okunamadı.'));
            };
            image.src = objectUrl;
        });
    }

    function fileToDataUrl(file) {
        if (!file || !String(file.type || '').startsWith('image/') || file.size <= 350 * 1024) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Görsel okunamadı.'));
                reader.readAsDataURL(file);
            });
        }
        return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                const maxSide = 1800;
                const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
                const width = Math.max(1, Math.round(image.naturalWidth * scale));
                const height = Math.max(1, Math.round(image.naturalHeight * scale));
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, width, height);
                URL.revokeObjectURL(objectUrl);
                resolve(canvas.toDataURL('image/webp', 0.84));
            };
            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Görsel okunamadı.'));
            };
            image.src = objectUrl;
        });
    }

    function parseJson(raw) {
        try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    }

    function dataScore(data) {
        if (!data) return -1;
        const defaults = defaultDataForCompany();
        let score = Number(data._meta && data._meta.updatedAt ? data._meta.updatedAt : 0);
        if (Array.isArray(data.passengerLists) && data.passengerLists.length) score += 500000000000;
        if (Array.isArray(data.tours) && JSON.stringify(data.tours) !== JSON.stringify(defaults.tours)) score += 400000000000;
        if (Array.isArray(data.reviews) && JSON.stringify(data.reviews) !== JSON.stringify(defaults.reviews)) score += 200000000000;
        if (Array.isArray(data.gallery) && JSON.stringify(data.gallery) !== JSON.stringify(defaults.gallery)) score += 100000000000;
        if (Array.isArray(data.staff) && data.staff.length) score += 50000000000;
        if (Array.isArray(data.blogs) && data.blogs.length) score += 25000000000;
        return score;
    }

    function chooseBestData(items) {
        const valid = items.filter(Boolean).map(mergeDefaults);
        if (!valid.length) return defaultDataForCompany();
        valid.sort((a, b) => {
            const stampDifference = Number(b?._meta?.updatedAt || 0) - Number(a?._meta?.updatedAt || 0);
            return stampDifference || (dataScore(b) - dataScore(a));
        });
        return valid[0];
    }

    async function fetchRemoteData(options = {}) {
        if (location.protocol === 'file:') return null;
        try {
            const headers = { 'Cache-Control': 'no-cache', Pragma: 'no-cache' };
            if (options.admin === true) {
                if (!hasAdminCredential()) return null;
                Object.assign(headers, authorizedHeaders());
            }
            const query = options.admin === true
                ? `scope=admin&company=${encodeURIComponent(currentCompanyId)}&ts=${Date.now()}`
                : `ts=${Date.now()}`;
            const res = await fetch(`/api/data?${query}`, {
                cache: 'no-store',
                headers
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async function cacheDataLocally(data) {
        const key = companyCacheKey();
        await idbSet(key, data);
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { }
    }

    function shouldPreserveUnsyncedLocal(remote, local) {
        const remoteStamp = Number(remote?._meta?.updatedAt || 0);
        const localStamp = Number(local?._meta?.updatedAt || 0);
        return Boolean(local?._meta?.pendingSync === true && localStamp > remoteStamp);
    }

    async function loadData() {
        const key = companyCacheKey();
        const local = parseJson(localStorage.getItem(key));
        const indexed = await idbGet(key);
        const remote = page === 'admin' ? null : await fetchRemoteData();
        const bestLocal = chooseBestData([indexed, local]);
        // Sunucu verisi cihazlar arasındaki tek ana kaynaktır. Yalnızca sunucudan
        // daha yeni olduğu kanıtlanan çevrimdışı bir yönetim kaydı geçici olarak
        // korunur; eski cihaz kayıtları merkezi silmeleri geri getiremez.
        const preserveUnsyncedLocal = shouldPreserveUnsyncedLocal(remote, bestLocal);
        const selected = remote
            ? mergeDefaults(preserveUnsyncedLocal ? bestLocal : remote)
            : mergeDefaults(bestLocal);
        await cacheDataLocally(selected);

        return selected;
    }

    async function loadAuthenticatedAdminData() {
        const remote = await fetchRemoteData({ admin: true });
        if (!remote) return false;
        const key = companyCacheKey();
        const local = parseJson(localStorage.getItem(key));
        const indexed = await idbGet(key);
        const bestLocal = chooseBestData([indexed, local]);
        state = mergeDefaults(shouldPreserveUnsyncedLocal(remote, bestLocal) ? bestLocal : remote);
        await cacheDataLocally(state);
        return true;
    }

    async function refreshPublicData() {
        if (page !== 'public' || publicRefreshInFlight || document.body.classList.contains('modal-open')) return;
        publicRefreshInFlight = true;
        try {
            const remote = await fetchRemoteData();
            if (!remote) return;
            const incoming = mergeDefaults(remote);
            const currentStamp = Number(state?._meta?.updatedAt || 0);
            const incomingStamp = Number(incoming?._meta?.updatedAt || 0);
            if (state?._meta?.pendingSync === true && currentStamp > incomingStamp) return;
            if (incomingStamp === 0 && currentStamp > 0) return;
            if (incomingStamp !== currentStamp || JSON.stringify(incoming.settings) !== JSON.stringify(state?.settings)) {
                state = incoming;
                await cacheDataLocally(state);
                renderPublic();
            }
        } finally {
            publicRefreshInFlight = false;
        }
    }

    function mergeDefaults(data) {
        const d = defaultDataForCompany();
        data = data || {};
        const settings = { ...d.settings, ...(data.settings || {}) };
        delete settings.adminPassword;
        delete settings.password;
        return {
            _meta: { ...d._meta, ...(data._meta || {}) },
            settings,
            tours: normalizeTours(Array.isArray(data.tours) ? data.tours : d.tours),
            reviews: Array.isArray(data.reviews) ? data.reviews : d.reviews,
            gallery: Array.isArray(data.gallery) ? data.gallery : d.gallery,
            staff: Array.isArray(data.staff) ? data.staff : d.staff,
            blogs: currentCompanyId === 'hakikat'
                ? (Array.isArray(data.blogs) ? data.blogs : d.blogs)
                : mergeSeoDefaultBlogs(Array.isArray(data.blogs) ? data.blogs : d.blogs),
            passengerLists: normalizePassengerLists(Array.isArray(data.passengerLists) ? data.passengerLists : [])
        };
    }

    function passengerIdentityKey(passenger) {
        return [passenger?.tc, passenger?.passportNo, normalizeSearchText(passenger?.name), passenger?.birthDate].map(value => String(value || '').trim()).join('|');
    }

    function mergeRemoteAccountingIntoState(remoteData) {
        const remote = mergeDefaults(remoteData);
        (state.passengerLists || []).forEach(localList => {
            const remoteList = (remote.passengerLists || []).find(item => item.id === localList.id);
            if (!remoteList) return;
            (localList.passengers || []).forEach(localPassenger => {
                const identity = passengerIdentityKey(localPassenger);
                const remotePassenger = (remoteList.passengers || []).find(item => item.id === localPassenger.id)
                    || (identity.replace(/\|/g, '') ? (remoteList.passengers || []).find(item => passengerIdentityKey(item) === identity) : null);
                if (remotePassenger?.accounting) localPassenger.accounting = clone(remotePassenger.accounting);
            });
        });
    }

    async function saveData(options = {}) {
        if (state && state.settings) {
            delete state.settings.adminPassword;
            delete state.settings.password;
        }
        if (location.protocol !== 'file:' && hasAdminCredential()) {
            const latest = await fetchRemoteData({ admin: true });
            if (latest) {
                const remoteStamp = Number(latest?._meta?.updatedAt || 0);
                const localStamp = Number(state?._meta?.updatedAt || 0);
                if (remoteStamp > localStamp) {
                    alert('Başka bir bilgisayarda daha yeni bir değişiklik yapıldı. Veri kaybını önlemek için bu kayıt gönderilmedi. “Senkronize Et” düğmesine basıp güncel veriyi aldıktan sonra işlemi tekrar yap.');
                    return false;
                }
                if (!options.keepLocalAccounting && state?._meta?.pendingSync !== true) mergeRemoteAccountingIntoState(latest);
            }
        }
        state._meta = { ...(state._meta || {}), updatedAt: Math.max(Date.now(), Number(state?._meta?.updatedAt || 0) + 1), pendingSync: true };
        await cacheDataLocally(state);

        if (location.protocol !== 'file:') {
            try {
                const syncedState = clone(state);
                syncedState._meta = { ...(syncedState._meta || {}), pendingSync: false };
                const res = await fetch(`/api/data?company=${encodeURIComponent(currentCompanyId)}`, { method: 'POST', headers: authorizedHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(syncedState) });
                if (!res.ok) {
                    const details = await res.json().catch(() => ({}));
                    throw new Error(details.error || 'Sunucu kaydı başarısız');
                }
                state = syncedState;
                await cacheDataLocally(state);
                return true;
            } catch (e) {
                console.warn('Sunucu kaydı yapılamadı; IndexedDB kaydı kullanıldı.', e);
                alert('Kayıt bu cihazda korundu ancak merkezi sisteme aktarılamadı. Lütfen internet bağlantını kontrol edip tekrar kaydet.');
                return false;
            }
        }
        return true;
    }

    function getHeroBanners() {
        const s = state.settings || {};
        const list = Array.isArray(s.heroBanners) ? s.heroBanners : [];
        const cleaned = list.map((b, i) => ({
            id: b.id || ('hb' + i),
            image: String(b.image || '').trim() || 'assets/hero.svg',
            title: String(b.title || '').trim() || s.heroTitle || DEFAULT_DATA.settings.heroTitle,
            subtitle: String(b.subtitle || '').trim() || s.heroSubtitle || DEFAULT_DATA.settings.heroSubtitle,
            textColor: String(b.textColor || '').trim() || '#ffffff',
            textPosition: ['left', 'center', 'right'].includes(b.textPosition) ? b.textPosition : 'left'
        })).filter(b => b.image || b.title || b.subtitle);

        return cleaned.length ? cleaned : [{ id: 'hb-default', image: 'assets/hero.svg', title: s.heroTitle || DEFAULT_DATA.settings.heroTitle, subtitle: s.heroSubtitle || DEFAULT_DATA.settings.heroSubtitle, textColor: '#ffffff', textPosition: 'left' }];
    }

    function setHeroText(banner) {
        const copy = document.querySelector('.hero-copy');
        const title = $('heroTitle');
        const subtitle = $('heroSubtitle');

        if (title) title.textContent = banner.title || '';
        if (subtitle) subtitle.textContent = banner.subtitle || '';

        if (copy) {
            copy.classList.remove('hero-pos-left', 'hero-pos-center', 'hero-pos-right');
            copy.classList.add('hero-pos-' + (banner.textPosition || 'left'));
            copy.style.color = banner.textColor || '#ffffff';
        }
        if (title) title.style.color = banner.textColor || '#ffffff';
        if (subtitle) subtitle.style.color = banner.textColor || '#ffffff';
    }

    function showHeroBanner(index) {
        const banners = getHeroBanners();
        if (!banners.length) return;
        heroSlideIndex = ((index % banners.length) + banners.length) % banners.length;
        document.querySelectorAll('.hero-slide').forEach((el, i) => {
            const relative = (i - heroSlideIndex + banners.length) % banners.length;
            el.classList.toggle('active', relative === 0);
            el.classList.toggle('next', banners.length > 1 && relative === 1);
            el.classList.toggle('prev', banners.length > 1 && relative === banners.length - 1);
        });
        setHeroText(banners[heroSlideIndex]);
    }

    function restartHeroTimer() {
        if (heroTimer) clearInterval(heroTimer);
        heroTimer = null;
        const banners = getHeroBanners();
        const mode = (state.settings && state.settings.heroMode) || 'single';
        if (mode === 'slider' && banners.length > 1) {
            heroTimer = setInterval(() => showHeroBanner(heroSlideIndex + 1), 5500);
        }
    }

    function renderHeroBanners() {
        const bg = document.querySelector('.hero-bg');
        if (!bg) return;

        const banners = getHeroBanners();
        bg.innerHTML = banners.map((b, i) => `<div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image:url('${escapeHtml(b.image)}')"></div>`).join('');

        showHeroBanner(0);

        restartHeroTimer();
    }

    function applyPageHeroSettings() {
        const s = state.settings || {};
        const staffHero = $('staffPageHero');
        if (staffHero) {
            const image = String(s.staffBannerImage || DEFAULT_DATA.settings.staffBannerImage).replace(/["\\\n\r]/g, '');
            staffHero.style.backgroundImage = `linear-gradient(135deg,rgba(8,8,10,.9),rgba(22,22,24,.55)),url("${image}")`;
            if ($('staffBannerKicker')) $('staffBannerKicker').textContent = s.staffBannerKicker || DEFAULT_DATA.settings.staffBannerKicker;
            if ($('staffBannerTitle')) $('staffBannerTitle').textContent = s.staffBannerTitle || DEFAULT_DATA.settings.staffBannerTitle;
            if ($('staffBannerSubtitle')) $('staffBannerSubtitle').textContent = s.staffBannerSubtitle || DEFAULT_DATA.settings.staffBannerSubtitle;
        }

        const blogHero = $('blogPageHero');
        if (blogHero) {
            const image = String(s.blogBannerImage || DEFAULT_DATA.settings.blogBannerImage).replace(/["\\\n\r]/g, '');
            blogHero.style.backgroundImage = `linear-gradient(135deg,rgba(8,8,10,.9),rgba(72,48,10,.58)),url("${image}")`;
            if ($('blogBannerKicker')) $('blogBannerKicker').textContent = s.blogBannerKicker || DEFAULT_DATA.settings.blogBannerKicker;
            if ($('blogBannerTitle')) $('blogBannerTitle').textContent = s.blogBannerTitle || DEFAULT_DATA.settings.blogBannerTitle;
            if ($('blogBannerSubtitle')) $('blogBannerSubtitle').textContent = s.blogBannerSubtitle || DEFAULT_DATA.settings.blogBannerSubtitle;
        }
    }

    function sanitizeSearchConsoleVerification(value) {
        const raw = String(value || '').trim();
        const pastedMetaContent = raw.match(/content\s*=\s*(["'])(.*?)\1/i);
        const token = pastedMetaContent ? pastedMetaContent[2] : raw;
        return token.replace(/[^A-Za-z0-9._:=+\/-]/g, '').slice(0, 256);
    }

    function applySearchConsoleVerification() {
        const normalizedPath = (location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
        if (!['/', '/tr', '/index.html'].includes(normalizedPath)) return;

        const token = sanitizeSearchConsoleVerification(state?.settings?.searchConsoleVerification);
        let meta = document.head.querySelector('meta[name="google-site-verification"]');
        if (!token) {
            if (meta?.dataset.hazeynRuntime === '1') meta.remove();
            return;
        }
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'google-site-verification';
            meta.dataset.hazeynRuntime = '1';
            document.head.appendChild(meta);
        }
        meta.content = token;
    }

    function applySettings() {
        const s = state.settings;
        applySearchConsoleVerification();
        document.querySelectorAll('.phone-link').forEach(a => { a.href = 'tel:' + normalizePhone(s.phone); });
        document.querySelectorAll('.whatsapp-link').forEach(a => { a.href = 'https://wa.me/' + normalizePhone(s.whatsapp); });

        const instagramUser = String(s.instagram || 'hazeynturizm').replace('@', '').trim() || 'hazeynturizm';
        document.querySelectorAll('.instagram-link').forEach(a => { a.href = 'https://www.instagram.com/' + instagramUser + '/'; });

        const instagramText = $('instagramText');
        if (instagramText) instagramText.textContent = '@' + instagramUser;

        const footerInstagramText = $('footerInstagramText');
        if (footerInstagramText) footerInstagramText.textContent = '@' + instagramUser;

        renderHeroBanners();
        applyPageHeroSettings();

        const phoneText = $('phoneText');
        if (phoneText) phoneText.textContent = s.phone;

        const addressText = $('addressText');
        if (addressText) addressText.textContent = s.address;

        const year = $('year');
        if (year) year.textContent = new Date().getFullYear();
    }

    function tourCard(t) {
        t = normalizeTour(t);
        const departure = formatDateTR(t.departureDate);
        const duration = durationLabel(t);
        const departureLabel = departureCityLabel(t);
        const cardText = t.type === 'umre' ? formatPerPersonPrice(startingPriceValue(t)) : (String(t.cardText || '').trim() || pricePreview(t));
        const hotelText = [t.mekkeHotelName ? `Mekke: ${t.mekkeHotelName}` : '', t.medineHotelName ? `Medine: ${t.medineHotelName}` : ''].filter(Boolean).join('\n') || t.hotels || '';
        const slug = t.slug || defaultTourSlug(t);
        return `<article class="tour-card reveal" data-program-id="${escapeHtml(t.id)}" data-program-title="${escapeHtml(t.title)}" data-program-slug="${escapeHtml(slug)}">
        <div class="tour-img"><img src="${escapeHtml(t.image || 'assets/hotel.svg')}" alt="${escapeHtml(t.title)}" loading="lazy" decoding="async" onerror="this.src='assets/hotel.svg'"><span class="tour-tag">${escapeHtml(t.tag || capacityLabel(t) || 'Program')}</span></div>
        <div class="tour-body">
            <h3>${escapeHtml(t.title)}</h3>
            <div class="tour-meta">${departure ? `<span>📅 ${escapeHtml(departure)}</span>` : ''}${duration ? `<span>◷ ${escapeHtml(duration)}</span>` : ''}<span>✈ ${escapeHtml(departureLabel)}</span></div>
            <div class="tour-hotels">${escapeHtml(hotelText)}</div>
            <div class="tour-bottom"><span class="price tour-price-block">${t.type === 'umre' ? '<small>Başlangıç fiyatı</small>' : ''}<strong>${escapeHtml(cardText)}</strong></span><a class="small-btn" data-program-link data-track="program_click" data-program-id="${escapeHtml(t.id)}" data-program-title="${escapeHtml(t.title)}" data-program-slug="${escapeHtml(slug)}" href="/${escapeHtml(slug)}">Programı İncele <span aria-hidden="true">→</span></a></div>
        </div>
    </article>`;
    }

    function renderTourGroup(type, targetId, limit) {
        const target = $(targetId);
        if (!target) return;
        const list = state.tours.filter(t => t.type === type && normalizedTourStatus(t) !== 'draft' && (type !== 'umre' || normalizedTourStatus(t) === 'active')).sort((a, b) => String(a.departureDate || '9999-12-31').localeCompare(String(b.departureDate || '9999-12-31'))).slice(0, limit || 50);
        target.innerHTML = list.map(tourCard).join('');
        const optionalGroup = target.closest('.optional-tour-group');
        if (optionalGroup) optionalGroup.hidden = list.length === 0;
        const extraTours = $('extraToursSection');
        if (extraTours) {
            const visibleCount = ['hac', 'yurtici'].filter(groupType => state.tours.some(t => t.type === groupType && normalizedTourStatus(t) !== 'draft')).length;
            extraTours.hidden = visibleCount === 0;
            extraTours.classList.toggle('single-tour-group', visibleCount === 1);
        }
    }

    function renderReviews() {
        const target = $('reviewMarquee');
        if (!target) return;
        const reviews = state.reviews.length ? state.reviews : DEFAULT_DATA.reviews;
        const loopReviews = Array.from({ length: Math.max(2, Math.ceil(8 / Math.max(1, reviews.length))) }, () => reviews).flat();
        const cards = loopReviews.map(r => `<article class="review-card"><div class="stars">${stars(r.stars)}</div><p>“${escapeHtml(r.text)}”</p><b>${escapeHtml(r.name)}</b><small>Google yorumu</small></article>`).join('');
        target.innerHTML = `<div class="review-track"><div class="review-group">${cards}</div><div class="review-group" aria-hidden="true">${cards}</div></div>`;
    }

    function renderGallery() {
        const target = $('galleryGrid');
        if (!target) return;
        const list = state.gallery.length ? state.gallery : DEFAULT_DATA.gallery;
        target.classList.add('gallery-marquee');
        const cards = list.map((g, i) => `<figure class="gallery-item reveal" data-gallery-index="${i}" tabindex="0" role="button" aria-label="${escapeHtml(g.title)} görselini büyüt"><img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.title)}" loading="lazy" decoding="async" onerror="this.src='assets/hero.svg'"><span>${escapeHtml(g.title)}</span></figure>`).join('');
        target.innerHTML = `<div class="gallery-track">${cards}${cards}</div>`;
    }

    function renderStaff() {
        const target = $('staffGrid');
        if (!target) return;
        const list = state.staff && state.staff.length ? state.staff : DEFAULT_DATA.staff;
        target.innerHTML = list.map(s => `<article class="staff-card reveal"><div class="staff-photo"><img src="${escapeHtml(s.image || 'assets/icon.png')}" alt="${escapeHtml(s.name)}" loading="lazy" decoding="async" onerror="this.src='assets/icon.png'"></div><div><span>${escapeHtml(s.role || `${currentCompany().shortName} Ekibi`)}</span><h3>${escapeHtml(s.name || '')}</h3><p>${escapeHtml(s.bio || '')}</p></div></article>`).join('');
    }

    function renderBlogs() {
        const target = $('blogGrid');
        if (!target) return;
        const list = mergeSeoDefaultBlogs(state.blogs && state.blogs.length ? state.blogs : DEFAULT_DATA.blogs);
        target.innerHTML = list.map(normalizeBlog).map(b => `<a class="blog-card reveal" href="/rehber/${escapeHtml(b.slug)}"><span>${escapeHtml(b.category || 'Merak Edilenler')}</span><h3>${escapeHtml(b.title || '')}</h3><p>${escapeHtml(b.summary || firstLine(b.content) || '')}</p><span class="text-btn">Devamını Oku →</span></a>`).join('');
    }

    function setModalOpen(open) {
        const modal = $('tourModal');
        if (!modal) return;
        modal.classList.toggle('open', Boolean(open));
        modal.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.classList.toggle('modal-open', Boolean(open));
        if (!open) {
            const card = modal.querySelector('.modal-card');
            if (card) card.classList.remove('gallery-modal-card', 'blog-modal-card', 'tour-detail-modal-card');
        }
    }

    function setModalMode(mode) {
        const card = $('tourModal')?.querySelector('.modal-card');
        if (!card) return;
        card.classList.remove('gallery-modal-card', 'blog-modal-card', 'tour-detail-modal-card');
        if (mode) card.classList.add(`${mode}-modal-card`);
    }

    function openBlogModal(id) {
        const list = state.blogs && state.blogs.length ? state.blogs : DEFAULT_DATA.blogs;
        const b = list.find(x => x.id === id);
        if (!b) return;
        setModalMode('blog');
        $('modalBody').innerHTML = `<div class="modal-content blog-modal">${b.image ? `<img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.title)}" onerror="this.style.display='none'">` : ''}<div><span class="section-kicker">${escapeHtml(b.category || 'Merak Edilenler')}</span><h2>${escapeHtml(b.title || '')}</h2><p class="blog-summary">${escapeHtml(b.summary || '')}</p><div class="blog-content">${escapeHtml(b.content || '').replace(/\n/g, '<br>')}</div></div></div>`;
        setModalOpen(true);
    }

    function fitGalleryStageToImage(image) {
        const stage = image?.closest('.gallery-stage');
        if (!stage || !image.naturalWidth || !image.naturalHeight) return;
        const maxWidth = Math.min(window.innerWidth * 0.94, 1280);
        const maxHeight = Math.min(window.innerHeight * 0.78, 780);
        const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
        stage.style.width = `${Math.max(280, Math.round(image.naturalWidth * scale))}px`;
        stage.style.height = `${Math.max(220, Math.round(image.naturalHeight * scale))}px`;
    }

    function openGalleryModal(index) {
        const list = state.gallery.length ? state.gallery : DEFAULT_DATA.gallery;
        if (!list.length) return;
        const n = Number(index);
        currentGalleryIndex = Number.isFinite(n) ? ((n % list.length) + list.length) % list.length : 0;
        const g = list[currentGalleryIndex];
        const prev = list[(currentGalleryIndex - 1 + list.length) % list.length];
        const next = list[(currentGalleryIndex + 1) % list.length];
        if (!g) return;
        setModalMode('gallery');
        $('modalBody').innerHTML = `<div class="image-viewer gallery-viewer">
        <div class="gallery-stage">
            <div class="gallery-strip">
                ${[prev, g, next].map((item, itemIndex) => `<div class="gallery-slide"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" draggable="false" ${itemIndex === 1 ? 'data-gallery-current' : ''} onerror="this.src='assets/hero.svg'"></div>`).join('')}
            </div>
            <button class="gallery-nav gallery-prev" type="button" data-gallery-prev aria-label="Önceki görsel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
            <button class="gallery-nav gallery-next" type="button" data-gallery-next aria-label="Sonraki görsel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
        <div class="gallery-viewer-footer"><h2>${escapeHtml(g.title || '')}</h2><span>${currentGalleryIndex + 1} / ${list.length}</span></div>
    </div>`;
        const currentImage = $('modalBody').querySelector('[data-gallery-current]');
        if (currentImage) {
            currentImage.addEventListener('load', () => fitGalleryStageToImage(currentImage), { once: true });
            if (currentImage.complete) fitGalleryStageToImage(currentImage);
        }
        setModalOpen(true);
    }

    function moveGalleryModal(step) {
        const list = state.gallery.length ? state.gallery : DEFAULT_DATA.gallery;
        if (!list.length) return;
        openGalleryModal(currentGalleryIndex + step);
    }

    function bindSwipeNavigation(element, handlers, ignoreSelector) {
        if (!element || element.dataset.swipeBound === '1') return;
        element.dataset.swipeBound = '1';
        let startX = 0;
        let startY = 0;
        let pointerId = null;
        let dragged = false;
        let suppressClick = false;

        element.addEventListener('pointerdown', event => {
            if (ignoreSelector && event.target.closest(ignoreSelector)) return;
            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            dragged = false;
            if (element.setPointerCapture) element.setPointerCapture(pointerId);
        });
        element.addEventListener('pointermove', event => {
            if (pointerId !== event.pointerId) return;
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            if (!dragged && Math.abs(deltaX) > 7 && Math.abs(deltaX) > Math.abs(deltaY)) {
                dragged = true;
                element.classList.add('is-dragging');
            }
            if (dragged && handlers.onMove) handlers.onMove(deltaX);
        });
        element.addEventListener('pointerup', event => {
            if (pointerId !== event.pointerId) return;
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            element.classList.remove('is-dragging');
            pointerId = null;
            const step = Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX < 0 ? 1 : -1) : 0;
            if (dragged) {
                suppressClick = true;
                setTimeout(() => { suppressClick = false; }, 80);
            }
            if (handlers.onEnd) handlers.onEnd(step, deltaX);
            dragged = false;
        });
        element.addEventListener('pointercancel', () => {
            element.classList.remove('is-dragging');
            pointerId = null;
            dragged = false;
            if (handlers.onEnd) handlers.onEnd(0, 0);
        });
        element.addEventListener('click', event => {
            if (!suppressClick) return;
            event.preventDefault();
            event.stopImmediatePropagation();
        });
    }

    function bindPublicSwipeInteractions() {
        const hero = document.querySelector('.hero');
        const heroBg = document.querySelector('.hero-bg');
        bindSwipeNavigation(hero, {
            onMove(deltaX) {
                if (!heroBg || getHeroBanners().length < 2) return;
                heroBg.classList.add('is-dragging');
                heroBg.style.setProperty('--hero-drag-x', `${deltaX}px`);
            },
            onEnd(step) {
                if (!heroBg || getHeroBanners().length < 2) return;
                heroBg.classList.remove('is-dragging');
                if (!step) {
                    heroBg.classList.remove('is-animating');
                    heroBg.style.setProperty('--hero-drag-x', '0px');
                    return;
                }
                heroBg.classList.add('is-animating');
                const target = step > 0 ? -hero.clientWidth : hero.clientWidth;
                heroBg.style.setProperty('--hero-drag-x', `${target}px`);
                setTimeout(() => {
                    heroBg.classList.add('no-transition');
                    showHeroBanner(heroSlideIndex + step);
                    heroBg.style.setProperty('--hero-drag-x', '0px');
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        heroBg.classList.remove('no-transition');
                        heroBg.classList.remove('is-animating');
                    }));
                }, 320);
                restartHeroTimer();
            }
        }, 'a,button,input,select,textarea');

        const modalBody = $('modalBody');
        bindSwipeNavigation(modalBody, {
            onMove(deltaX) {
                const viewer = modalBody.querySelector('.gallery-viewer');
                if (viewer) viewer.style.setProperty('--gallery-drag-x', `${deltaX}px`);
            },
            onEnd(step) {
                const viewer = modalBody.querySelector('.gallery-viewer');
                if (!viewer) return;
                if (!step) {
                    viewer.style.setProperty('--gallery-drag-x', '0px');
                    return;
                }
                const target = step > 0 ? -viewer.clientWidth : viewer.clientWidth;
                viewer.style.setProperty('--gallery-drag-x', `${target}px`);
                setTimeout(() => moveGalleryModal(step), 280);
            }
        }, 'button,a,input,select,textarea,summary');
    }

    function openTourModal(id) {
        const t = state.tours.find(x => x.id === id);
        if (!t) return;
        const program = String(t.program || 'Program detayı yakında eklenecek.');
        const programPreview = program.length > 145 ? program.slice(0, 145).trim() + '…' : program;
        const coverImage = t.image || 'assets/hotel.svg';
        setModalMode('tour-detail');
        $('modalBody').innerHTML = `<div class="modal-content">
        <div class="tour-modal-cover"><img src="${escapeHtml(coverImage)}" alt="${escapeHtml(t.title)}" onerror="this.src='assets/hotel.svg'"></div>
        <div>
            <span class="section-kicker">${escapeHtml(t.tag || '')}</span>
            <h2>${escapeHtml(t.title)}</h2>
            ${t.departureDate ? `<p><b>Kalkış Tarihi:</b> ${escapeHtml(formatDateTR(t.departureDate))}</p>` : ''}
            <p><b>Süre:</b> ${escapeHtml(t.nights || '-')}</p>
            <p><b>Otel:</b><br>${escapeHtml(t.hotels || '-').replace(/\n/g, '<br>')}</p>
            <p><b>Ulaşım:</b> ${escapeHtml(t.airline || '-')}</p>
            <a href="${escapeHtml(tourWhatsappHref(t))}" target="_blank" class="btn btn-gold tour-whatsapp-cta">WhatsApp'tan Bilgi Al</a>
            ${priceTableHtml(t)}
            ${hotelGalleryHtml(t)}
            <section class="program-preview">
                <h3>Program Örneği</h3>
                <p>${escapeHtml(programPreview).replace(/\n/g, ' ')}</p>
                <details>
                    <summary>Tüm programı göster</summary>
                    <pre>${escapeHtml(program)}</pre>
                </details>
            </section>
        </div>
    </div>`;
        setModalOpen(true);
    }

    function initScrollReveals() {
        const items = document.querySelectorAll('.reveal,.travel-tool,.trust-panel article,.why-features article,.contact-card');
        if (!('IntersectionObserver' in window)) {
            items.forEach(item => item.classList.add('in-view'));
            return;
        }
        if (!revealObserver) {
            revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
        }
        items.forEach((item, index) => {
            if (item.dataset.revealBound === '1') return;
            item.dataset.revealBound = '1';
            item.classList.add('scroll-reveal');
            item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
            revealObserver.observe(item);
        });
    }

    function initMobileNavigation() {
        const toggle = $('menuToggle');
        const sourceLinks = $('navLinks');
        const sourceActions = document.querySelector('.site-header .nav-actions');
        if (!toggle || !sourceLinks || !sourceActions) return;

        let overlay = $('mobileNavOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobileNavOverlay';
            overlay.className = 'mobile-nav-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `<div class="mobile-nav-shell"><nav class="mobile-nav-links">${sourceLinks.innerHTML}</nav><div class="mobile-nav-actions">${sourceActions.innerHTML}</div></div>`;
        overlay.querySelectorAll('.mobile-nav-links a').forEach((link, index) => link.style.setProperty('--menu-index', index));
        overlay.querySelectorAll('.mobile-nav-actions a').forEach((link, index) => link.style.setProperty('--menu-index', index + 8));

        const closeMenu = () => {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Menüyü aç');
            document.body.classList.remove('mobile-menu-open');
        };
        const openMenu = () => {
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
            toggle.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Menüyü kapat');
            document.body.classList.add('mobile-menu-open');
        };

        toggle.innerHTML = `<svg class="menu-icon menu-icon-bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h14M5 12h14M5 16.5h14"/></svg><svg class="menu-icon menu-icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>`;
        if (toggle.dataset.mobileMenuBound !== '1') {
            toggle.dataset.mobileMenuBound = '1';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.addEventListener('click', () => overlay.classList.contains('open') ? closeMenu() : openMenu());
            document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
        }
        overlay.onclick = event => { if (event.target.closest('a')) closeMenu(); };
        applySettings();
    }

    function renderPublic() {
        applySettings();
        renderTourGroup('umre', 'umreTours', 4);
        renderTourGroup('hac', 'hacTours', 2);
        renderTourGroup('yurtici', 'yurticiTours', 4);
        renderReviews();
        renderGallery();
        renderStaff();
        renderBlogs();
        renderTravelHub();
        bindPublicSwipeInteractions();
        initMobileNavigation();
        requestAnimationFrame(initScrollReveals);

        if (document.body.dataset.publicEventsBound !== '1') {
        document.body.dataset.publicEventsBound = '1';
        document.addEventListener('click', (e) => {
            const tourBtn = e.target.closest('[data-tour]');
            if (tourBtn) openTourModal(tourBtn.dataset.tour);
            const galleryBtn = e.target.closest('[data-gallery-index]');
            if (galleryBtn) openGalleryModal(galleryBtn.dataset.galleryIndex);
            const galleryPrev = e.target.closest('[data-gallery-prev]');
            if (galleryPrev) moveGalleryModal(-1);
            const galleryNext = e.target.closest('[data-gallery-next]');
            if (galleryNext) moveGalleryModal(1);
            const blogBtn = e.target.closest('[data-blog]');
            if (blogBtn) openBlogModal(blogBtn.dataset.blog);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const galleryBtn = e.target.closest && e.target.closest('[data-gallery-index]');
                if (galleryBtn) openGalleryModal(galleryBtn.dataset.galleryIndex);
                const blogBtn = e.target.closest && e.target.closest('[data-blog]');
                if (blogBtn) openBlogModal(blogBtn.dataset.blog);
            }
            const galleryIsOpen = $('tourModal')?.querySelector('.modal-card')?.classList.contains('gallery-modal-card');
            if (e.key === 'ArrowLeft' && galleryIsOpen) moveGalleryModal(-1);
            if (e.key === 'ArrowRight' && galleryIsOpen) moveGalleryModal(1);
            if (e.key === 'Escape') {
                setModalOpen(false);
            }
        });

        const close = $('modalClose');
        if (close) close.onclick = () => setModalOpen(false);
        const modal = $('tourModal');
        if (modal) modal.addEventListener('click', e => { if (e.target === modal) setModalOpen(false); });
        }
    }

    function renderTravelHub() {
        const flightInput = $('publicFlightDate');
        const passportInput = $('publicPassportEnd');
        const result = $('publicPassportResult');
        const upcoming = (state.tours || []).filter(t => parseLocalDate(t.departureDate) && parseLocalDate(t.departureDate) >= new Date()).sort((a, b) => parseLocalDate(a.departureDate) - parseLocalDate(b.departureDate))[0];
        if (flightInput && upcoming?.departureDate) flightInput.value = upcoming.departureDate;
        if ($('nextTourSummary')) {
            $('nextTourSummary').innerHTML = upcoming ? `<span>${escapeHtml(upcoming.tag || 'Yaklaşan tur')}</span><h4>${escapeHtml(upcoming.title)}</h4><p>${escapeHtml(formatDateTR(upcoming.departureDate))}</p><small>${escapeHtml(upcoming.nights || '')} • ${escapeHtml(firstLine(upcoming.hotels || upcoming.airline || ''))}</small>` : '<span>Yeni programlarımız için bize ulaşın.</span>';
        }
        if ($('checkPassportBtn')) $('checkPassportBtn').onclick = () => {
            if (!flightInput.value || !passportInput.value) {
                result.className = 'passport-result missing';
                result.textContent = 'Lütfen iki tarihi de seçin.';
                return;
            }
            const threshold = addCalendarMonths(parseLocalDate(flightInput.value), 6);
            if (isPassportExpiring(passportInput.value, flightInput.value)) {
                result.className = 'passport-result danger';
                result.innerHTML = `<b>Pasaport süresi yetersiz.</b> En az ${escapeHtml(formatDateTR(threshold.toISOString().slice(0, 10)))} tarihine kadar geçerli olmalı.`;
            } else {
                result.className = 'passport-result ok';
                result.innerHTML = '<b>Pasaport süresi uygun.</b> 6 ay geçerlilik kuralını karşılıyor.';
            }
        };
        const checks = Array.from(document.querySelectorAll('#travelChecklist input'));
        const updateChecklist = () => {
            const done = checks.filter(x => x.checked).length;
            if ($('checklistCount')) $('checklistCount').textContent = `${done} / ${checks.length} hazır`;
            if ($('checklistBar')) $('checklistBar').style.width = `${checks.length ? done / checks.length * 100 : 0}%`;
        };
        checks.forEach(c => c.addEventListener('change', updateChecklist));
        updateChecklist();
    }

    async function switchCompanyAccount(companyId) {
        const nextCompanyId = normalizeCompanyId(companyId);
        if (IS_DESKTOP_APP && adminLoggedIn && !canAccessCompany(nextCompanyId)) {
            if ($('companySwitcher')) $('companySwitcher').value = currentCompanyId;
            toast('Bu firma hesabı için yetkin yok.');
            return false;
        }
        if (nextCompanyId === currentCompanyId) {
            updateCompanyBranding();
            return true;
        }
        currentCompanyId = nextCompanyId;
        localStorage.setItem('turizmLastCompany', currentCompanyId);
        const url = new URL(location.href);
        url.searchParams.set('company', currentCompanyId);
        history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        getUploadConfig.cache = null;
        accountingSearchQuery = '';
        updateCompanyBranding();

        if (!adminLoggedIn) {
            state = await loadData();
            renderAdmin();
            return true;
        }

        const loaded = await loadAuthenticatedAdminData();
        if (!loaded) {
            adminLoggedIn = false;
            renderAdmin();
            alert(`${currentCompany().name} hesabı açılamadı. Lütfen şifreni tekrar gir.`);
            return false;
        }
        try { resetTourForm(); } catch (e) { }
        try { clearPassengerForm(); } catch (e) { }
        renderAdmin();
        switchTab('dashboard');
        toast(`${currentCompany().name} hesabına geçildi.`);
        return true;
    }

    function renderAdmin() {
        updateCompanyBranding();
        const isLogged = adminLoggedIn === true;
        const login = $('loginScreen');
        const shell = $('adminShell');

        if (login) { login.hidden = isLogged; login.style.display = isLogged ? 'none' : 'grid'; }
        if (shell) { shell.hidden = !isLogged; shell.style.display = isLogged ? 'grid' : 'none'; shell.setAttribute('aria-hidden', String(!isLogged)); }
        if (!isLogged) return;

        fillSettingsForm();
        renderDashboard();
        renderTourAdmin();
        renderReviewAdmin();
        renderGalleryAdmin();
        renderStaffAdmin();
        renderBlogAdmin();
        renderPassengerTourSelect();
        renderPassengerAdmin();
        renderAccounting();
        if (IS_DESKTOP_APP && isAppOwner()) renderDesktopUsers();
        ensurePassengerRows();
    }

    function renderDashboard() {
        $('statTours').textContent = state.tours.length;
        $('statReviews').textContent = state.reviews.length;
        $('statGallery').textContent = state.gallery.length;
        $('statLists').textContent = state.passengerLists.length;
        if ($('statStaff')) $('statStaff').textContent = (state.staff || []).length;
        if ($('statBlogs')) $('statBlogs').textContent = (state.blogs || []).length;
    }

    function switchTab(tab) {
        if (IS_DESKTOP_APP && tab === 'users' && !isAppOwner()) { toast('Kullanıcı yönetimi yalnızca baş yöneticiye açıktır.'); return; }
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
        if (tab === 'accounting') {
            renderAccounting(accountingSearchQuery);
            setTimeout(() => $('accountingSearch')?.focus(), 0);
        }
        if (tab === 'users' && isAppOwner()) loadDesktopUsers();
    }

    function resetDesktopUserForm() {
        if (!$('desktopUserForm')) return;
        $('desktopUserForm').reset();
        $('desktopUserId').value = '';
        $('desktopUserActive').checked = true;
    }

    function renderDesktopUsers() {
        const target = $('desktopUserList');
        if (!target || !isAppOwner()) return;
        target.innerHTML = desktopUsers.length ? desktopUsers.map(user => `
            <article class="desktop-user-card ${user.active === false ? 'inactive' : ''}" data-desktop-user-id="${escapeHtml(user.id)}">
                <div><b>${escapeHtml(user.displayName)}</b><small>@${escapeHtml(user.username)} • ${user.active === false ? 'Pasif' : 'Aktif'}</small></div>
                <div class="user-company-badges">${(user.companies || []).map(company => `<span class="${escapeHtml(company)}">${company === 'hakikat' ? 'Hakikat' : 'Hazeyn'}</span>`).join('')}</div>
                <div class="admin-item-actions"><button class="icon-btn" type="button" data-edit-desktop-user="${escapeHtml(user.id)}">Düzenle</button><button class="icon-btn danger" type="button" data-delete-desktop-user="${escapeHtml(user.id)}">Sil</button></div>
            </article>`).join('') : '<div class="empty small">Henüz çalışan kullanıcısı oluşturulmadı.</div>';
    }

    async function loadDesktopUsers() {
        if (!IS_DESKTOP_APP || !isAppOwner()) return;
        try {
            const result = await desktopApi('users');
            desktopUsers = Array.isArray(result.users) ? result.users : [];
            renderDesktopUsers();
        } catch (error) {
            toast(error.message || 'Kullanıcılar alınamadı.');
        }
    }

    function editDesktopUser(id) {
        const user = desktopUsers.find(item => item.id === id);
        if (!user) return;
        $('desktopUserId').value = user.id;
        $('desktopUserDisplayName').value = user.displayName || '';
        $('desktopUsername').value = user.username || '';
        $('desktopUserPassword').value = '';
        $('desktopUserHazeyn').checked = (user.companies || []).includes('hazeyn');
        $('desktopUserHakikat').checked = (user.companies || []).includes('hakikat');
        $('desktopUserActive').checked = user.active !== false;
        $('desktopUserDisplayName').focus();
    }

    async function saveDesktopUser(event) {
        event.preventDefault();
        if (!isAppOwner()) return;
        const companies = [];
        if ($('desktopUserHazeyn').checked) companies.push('hazeyn');
        if ($('desktopUserHakikat').checked) companies.push('hakikat');
        const user = {
            id: $('desktopUserId').value,
            displayName: $('desktopUserDisplayName').value.trim(),
            username: $('desktopUsername').value.trim(),
            password: $('desktopUserPassword').value,
            companies,
            active: $('desktopUserActive').checked
        };
        try {
            await desktopApi('save-user', { method: 'POST', body: { user } });
            resetDesktopUserForm();
            await loadDesktopUsers();
            toast('Çalışan kullanıcısı kaydedildi.');
        } catch (error) {
            toast(error.message || 'Kullanıcı kaydedilemedi.');
        }
    }

    async function previewFile(input, cb) {
        const file = input.files && input.files[0];
        if (!file) return;
        const maxMb = 50;
        if (file.size > maxMb * 1024 * 1024) { toast('Görsel çok büyük. En fazla ' + maxMb + ' MB yükleyebilirsin.'); input.value = ''; return; }
        try {
            toast('Görsel yükleniyor...');
            const folder = input.id || 'uploads';
            const uploaded = await uploadImageToSupabase(file, folder);
            const src = uploaded || await fileToDataUrl(file);
            cb(src);
            toast(uploaded ? 'Görsel buluta yüklendi.' : 'Görsel yerel olarak hazırlandı.');
        } catch (e) {
            try { cb(await fileToDataUrl(file)); toast('Bulut yükleme olmadı, görsel yerel olarak eklendi.'); } catch (err) { toast('Görsel okunamadı.'); }
        }
    }

    async function previewFiles(input, cb) {
        const files = Array.from(input.files || []);
        if (!files.length) return;
        const maxMb = 50;
        const tooBig = files.find(file => file.size > maxMb * 1024 * 1024);
        if (tooBig) { toast('Görsellerden biri çok büyük. Her görsel en fazla ' + maxMb + ' MB olabilir.'); input.value = ''; return; }

        const results = [];
        toast('Görseller yükleniyor...');
        for (const file of files) {
            try {
                const folder = input.id || 'uploads';
                const uploaded = await uploadImageToSupabase(file, folder);
                results.push(uploaded || await fileToDataUrl(file));
            } catch (e) {
                try { results.push(await fileToDataUrl(file)); } catch (err) { }
            }
        }
        cb(results.filter(Boolean));
        toast('Görseller hazır.');
    }

    function uniqueList(list) {
        const seen = new Set();
        return (list || []).map(x => String(x || '').trim()).filter(Boolean).filter(x => {
            if (seen.has(x)) return false; seen.add(x); return true;
        });
    }

    function normalizeImageArray(value) {
        if (Array.isArray(value)) return uniqueList(value);
        if (typeof value === 'string' && value.trim()) return [value.trim()];
        return [];
    }

    function getHotelImageArrays(t) {
        const h = (t && t.hotelImages) || {};
        return {
            mekke: uniqueList([
                ...normalizeImageArray(h.mekke),
                ...normalizeImageArray(t && t.mekkeHotelImages),
                ...normalizeImageArray(t && t.hotelMekkeImages),
                ...normalizeImageArray(t && t.mekkeImages),
                ...normalizeImageArray(t && t.hotelMekkeImage)
            ]),
            medine: uniqueList([
                ...normalizeImageArray(h.medine),
                ...normalizeImageArray(t && t.medineHotelImages),
                ...normalizeImageArray(t && t.hotelMedineImages),
                ...normalizeImageArray(t && t.medineImages),
                ...normalizeImageArray(t && t.hotelMedineImage)
            ])
        };
    }

    function getTourGroupImages(t) {
        return uniqueList([
            ...normalizeImageArray(t && t.groupImages),
            ...normalizeImageArray(t && t.groupImage),
            ...normalizeImageArray(t && t.passengerImages)
        ]);
    }

    function linesToList(value) {
        return uniqueList(String(value || '').split(/\n+/));
    }

    function renderMultiPreview(id, images) {
        const el = $(id);
        if (!el) return;
        const list = uniqueList(images);
        el.innerHTML = list.length ? list.map((src, i) => `<figure><img src="${escapeHtml(src)}" alt="Program görseli ${i + 1}" loading="lazy" decoding="async" onerror="this.closest('figure').style.display='none'"><figcaption>${i + 1}</figcaption></figure>`).join('') : '<span>Henüz görsel yok</span>';
    }

    function hotelGalleryHtml(t) {
        const h = getHotelImageArrays(t);
        const blocks = [];
        h.mekke.forEach((src, i) => blocks.push({ src, title: h.mekke.length > 1 ? `Mekke Oteli ${i + 1}` : 'Mekke Oteli' }));
        h.medine.forEach((src, i) => blocks.push({ src, title: h.medine.length > 1 ? `Medine Oteli ${i + 1}` : 'Medine Oteli' }));
        const groupImages = getTourGroupImages(t);
        groupImages.forEach((src, i) => blocks.push({ src, title: groupImages.length > 1 ? `Kafile Görseli ${i + 1}` : 'Kafile Görseli' }));
        if (!blocks.length) return '';
        return `<div class="hotel-modal-gallery"><h3>Otel ve Kafile Görselleri</h3><div>${blocks.map(b => `<figure><img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.title)}" loading="lazy" decoding="async" onerror="this.closest('figure').style.display='none'"><figcaption>${escapeHtml(b.title)}</figcaption></figure>`).join('')}</div></div>`;
    }

    function resetTourForm() {
        $('tourForm').reset();
        $('tourId').value = '';
        tempTourImage = '';
        tempTourDetailBannerImage = '';
        tempHotelMekkeImages = [];
        tempHotelMedineImages = [];
        tempTourGroupImages = [];
        if ($('tourSlug')) {
            $('tourSlug').value = '';
            delete $('tourSlug').dataset.manual;
        }
        if ($('tourStatus')) $('tourStatus').value = 'active';
        if ($('tourDepartureCities')) $('tourDepartureCities').value = 'istanbul';
        if ($('tourCapacityStatus')) $('tourCapacityStatus').value = 'available';
        const coverPreview = $('tourPreview');
        if (coverPreview) coverPreview.removeAttribute('src');
        const detailBannerPreview = $('tourDetailBannerPreview');
        if (detailBannerPreview) detailBannerPreview.removeAttribute('src');
        renderMultiPreview('tourHotelMekkePreview', []);
        renderMultiPreview('tourHotelMedinePreview', []);
        renderMultiPreview('tourGroupPreview', []);
    }

    function renderTourAdmin() {
        const list = $('tourAdminList');
        if (!list) return;
        const statusLabels = { active: 'Aktif', completed: 'Sona Ermiş', draft: 'Taslak' };
        list.innerHTML = state.tours.map(t => normalizeTour(t)).map(t => `<div class="admin-item">
        <div><h3>${escapeHtml(t.title)} <small>(${escapeHtml(t.type === 'umre' ? 'Umre' : t.type === 'hac' ? 'Hac' : 'Yurt İçi')} · ${escapeHtml(statusLabels[t.status] || t.status)})</small></h3><p>${t.departureDate ? 'Kalkış: ' + escapeHtml(formatDateTR(t.departureDate)) + '\n' : ''}${escapeHtml(durationLabel(t))}\n${escapeHtml(departureCityLabel(t))}\n/${escapeHtml(t.slug)}\n${escapeHtml(capacityLabel(t))}\n${escapeHtml(String(t.cardText || '').trim() || pricePreview(t))}</p></div>
        <div class="admin-item-actions"><button class="icon-btn" data-edit-tour="${escapeHtml(t.id)}">Düzenle</button>${t.status === 'completed' ? '' : `<button class="icon-btn danger" data-delete-tour="${escapeHtml(t.id)}">${t.status === 'draft' ? 'Taslağı Sil' : 'Sona Erdir'}</button>`}</div>
    </div>`).join('');
    }

    function editTour(id) {
        const found = state.tours.find(x => x.id === id);
        if (!found) return;
        const t = normalizeTour(found);
        switchTab('tours');
        $('tourId').value = t.id; $('tourType').value = t.type; $('tourTitle').value = t.title || ''; $('tourTag').value = t.tag || '';
        $('tourSlug').value = t.slug || defaultTourSlug(t); $('tourSlug').dataset.manual = '1';
        $('tourStatus').value = t.status || 'active';
        $('tourDepartureCities').value = normalizeDepartureCities(t.departureCities).join(',');
        $('tourCapacityStatus').value = t.capacityStatus || 'available';
        $('tourCapacity').value = t.capacity || '';
        $('tourDurationDays').value = t.durationDays;
        $('tourDurationNights').value = t.durationNights;
        $('tourImage').value = (t.image && !t.image.startsWith('data:')) ? t.image : '';
        tempTourImage = t.image || '';
        $('tourDetailBannerImage').value = (t.detailBannerImage && !t.detailBannerImage.startsWith('data:')) ? t.detailBannerImage : '';
        $('tourDetailBannerKicker').value = t.detailBannerKicker || '';
        $('tourDetailBannerTitle').value = t.detailBannerTitle || '';
        $('tourDetailBannerSubtitle').value = t.detailBannerSubtitle || '';
        $('tourDetailBannerPosition').value = t.detailBannerPosition || 'center';
        tempTourDetailBannerImage = t.detailBannerImage || '';
        const hotelImages = getHotelImageArrays(t);
        tempHotelMekkeImages = hotelImages.mekke.slice(); tempHotelMedineImages = hotelImages.medine.slice();
        const groupImages = getTourGroupImages(t);
        tempTourGroupImages = groupImages.slice();
        $('tourHotelMekkeImage').value = hotelImages.mekke.filter(src => !src.startsWith('data:')).join('\n');
        $('tourHotelMedineImage').value = hotelImages.medine.filter(src => !src.startsWith('data:')).join('\n');
        $('tourGroupImage').value = groupImages.filter(src => !src.startsWith('data:')).join('\n');
        $('tourDepartureDate').value = t.departureDate || '';
        if ($('tourCardText')) $('tourCardText').value = t.cardText || '';
        const roomPrices = getRoomPrices(t);
        $('tourPrice1').value = roomPrices['1']; $('tourPrice2').value = roomPrices['2']; $('tourPrice3').value = roomPrices['3']; $('tourPrice4').value = roomPrices['4']; $('tourPrice5plus').value = roomPrices['5+'];
        $('tourNights').value = t.nights || ''; $('tourHotels').value = t.hotels || ''; $('tourAirline').value = t.airline || ''; $('tourPrice').value = t.price || ''; $('tourProgram').value = t.program || '';
        $('tourMekkeHotelName').value = t.mekkeHotelName || '';
        $('tourMekkeDistanceService').value = t.mekkeDistanceService || '';
        $('tourMedineHotelName').value = t.medineHotelName || '';
        $('tourMedineDistanceService').value = t.medineDistanceService || '';
        $('tourFlightDetails').value = t.flightDetails || '';
        $('tourIncludedServices').value = textBlock(t.includedServices);
        $('tourExcludedServices').value = textBlock(t.excludedServices);
        $('tourVisitProgram').value = textBlock(t.visitProgram);
        $('tourSeoTitle').value = t.seoTitle || '';
        $('tourSeoDescription').value = t.seoDescription || '';
        if (!t.seoTitle || !t.seoDescription) fillTourSeo(false);
        $('tourPreview').src = t.image || '';
        $('tourDetailBannerPreview').src = t.detailBannerImage || t.image || '';
        renderMultiPreview('tourHotelMekkePreview', hotelImages.mekke);
        renderMultiPreview('tourHotelMedinePreview', hotelImages.medine);
        renderMultiPreview('tourGroupPreview', groupImages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function saveTour(e) {
        e.preventDefault();
        const id = $('tourId').value || uid('t');
        const existing = state.tours.find(x => x.id === id) || {};
        const image = tempTourImage || $('tourImage').value.trim() || ($('tourType').value === 'yurtici' ? 'assets/yurtici.svg' : 'assets/hotel.svg');
        const detailBannerImage = tempTourDetailBannerImage || $('tourDetailBannerImage').value.trim();
        const hotelImages = { mekke: uniqueList([...tempHotelMekkeImages, ...linesToList($('tourHotelMekkeImage')?.value)]), medine: uniqueList([...tempHotelMedineImages, ...linesToList($('tourHotelMedineImage')?.value)]) };
        const groupImages = uniqueList([...tempTourGroupImages, ...linesToList($('tourGroupImage')?.value)]);
        const roomPrices = cleanRoomPrices({ '1': $('tourPrice1').value, '2': $('tourPrice2').value, '3': $('tourPrice3').value, '4': $('tourPrice4').value, '5+': $('tourPrice5plus').value });

        const draft = { type: $('tourType').value, title: $('tourTitle').value.trim(), departureDate: $('tourDepartureDate').value };
        const slug = uniqueTourSlug($('tourSlug').value.trim() || existing.slug || defaultTourSlug(draft), id);
        const previousSlug = slugifyTR(existing.slug || '');
        const legacySlugs = uniqueList([
            ...(Array.isArray(existing.legacySlugs) ? existing.legacySlugs : []),
            ...(previousSlug && previousSlug !== slug ? [previousSlug] : [])
        ]).map(slugifyTR).filter(Boolean);
        const t = normalizeTour({
            ...existing,
            id,
            ...draft,
            slug,
            legacySlugs,
            status: $('tourStatus').value,
            departureCities: normalizeDepartureCities($('tourDepartureCities').value),
            durationDays: positiveInteger($('tourDurationDays').value),
            durationNights: positiveInteger($('tourDurationNights').value),
            capacityStatus: $('tourCapacityStatus').value,
            capacity: $('tourCapacity').value.trim(),
            tag: $('tourTag').value.trim(),
            cardText: $('tourCardText') ? $('tourCardText').value.trim() : '',
            image,
            detailBannerImage,
            detailBannerKicker: $('tourDetailBannerKicker').value.trim(),
            detailBannerTitle: $('tourDetailBannerTitle').value.trim(),
            detailBannerSubtitle: $('tourDetailBannerSubtitle').value.trim(),
            detailBannerPosition: $('tourDetailBannerPosition').value,
            hotelImages,
            groupImages,
            roomPrices,
            nights: $('tourNights').value.trim(),
            hotels: $('tourHotels').value.trim(),
            mekkeHotelName: $('tourMekkeHotelName').value.trim(),
            mekkeDistanceService: $('tourMekkeDistanceService').value.trim(),
            medineHotelName: $('tourMedineHotelName').value.trim(),
            medineDistanceService: $('tourMedineDistanceService').value.trim(),
            airline: $('tourAirline').value.trim(),
            flightDetails: $('tourFlightDetails').value.trim(),
            price: $('tourPrice').value.trim(),
            program: $('tourProgram').value.trim(),
            includedServices: $('tourIncludedServices').value.trim(),
            excludedServices: $('tourExcludedServices').value.trim(),
            visitProgram: $('tourVisitProgram').value.trim(),
            seoTitle: $('tourSeoTitle').value.trim() || seoTextsForTour({ ...draft, departureCities: normalizeDepartureCities($('tourDepartureCities').value), durationDays: positiveInteger($('tourDurationDays').value), mekkeHotelName: $('tourMekkeHotelName').value.trim(), medineHotelName: $('tourMedineHotelName').value.trim() }).title,
            seoDescription: $('tourSeoDescription').value.trim() || seoTextsForTour({ ...draft, departureCities: normalizeDepartureCities($('tourDepartureCities').value), durationDays: positiveInteger($('tourDurationDays').value), mekkeHotelName: $('tourMekkeHotelName').value.trim(), medineHotelName: $('tourMedineHotelName').value.trim() }).description
        });

        const idx = state.tours.findIndex(x => x.id === id);
        if (idx > -1) state.tours[idx] = t; else state.tours.unshift(t);
        if (!await saveData()) return; resetTourForm(); renderTourAdmin(); renderPassengerTourSelect(); renderDashboard(); toast('Tur kaydedildi.');
    }

    function resetReviewForm() { $('reviewForm').reset(); $('reviewId').value = ''; }
    function renderReviewAdmin() {
        const list = $('reviewAdminList');
        if (!list) return;
        list.innerHTML = state.reviews.map(r => `<div class="admin-item"><div><h3>${escapeHtml(r.name)} <small>${stars(r.stars)}</small></h3><p>${escapeHtml(r.text)}</p></div><div class="admin-item-actions"><button class="icon-btn" data-edit-review="${escapeHtml(r.id)}">Düzenle</button><button class="icon-btn danger" data-delete-review="${escapeHtml(r.id)}">Sil</button></div></div>`).join('');
    }
    function editReview(id) {
        const r = state.reviews.find(x => x.id === id);
        if (!r) return; switchTab('reviews');
        $('reviewId').value = r.id; $('reviewName').value = r.name; $('reviewStars').value = r.stars; $('reviewText').value = r.text;
    }
    async function saveReview(e) {
        e.preventDefault();
        const id = $('reviewId').value || uid('r');
        const r = { id, name: $('reviewName').value.trim(), stars: Number($('reviewStars').value), text: $('reviewText').value.trim() };
        const idx = state.reviews.findIndex(x => x.id === id);
        if (idx > -1) state.reviews[idx] = r; else state.reviews.unshift(r);
        if (!await saveData()) return; resetReviewForm(); renderReviewAdmin(); renderDashboard(); toast('Yorum kaydedildi.');
    }

    function renderGalleryAdmin() {
        const list = $('galleryAdminList');
        if (!list) return;
        list.innerHTML = state.gallery.map(g => `<div class="admin-item"><img src="${escapeHtml(g.image)}" onerror="this.src='assets/hero.svg'" alt=""><div><h3>${escapeHtml(g.title)}</h3><p>${escapeHtml(g.image).slice(0, 80)}</p></div><div class="admin-item-actions"><button class="icon-btn danger" data-delete-gallery="${escapeHtml(g.id)}">Sil</button></div></div>`).join('');
    }
    async function saveGallery(e) {
        e.preventDefault();
        const g = { id: uid('g'), title: $('galleryTitle').value.trim(), image: tempGalleryImage || $('galleryImage').value.trim() || 'assets/hero.svg' };
        state.gallery.unshift(g);
        if (!await saveData()) return; $('galleryForm').reset(); tempGalleryImage = ''; $('galleryPreview').removeAttribute('src'); renderGalleryAdmin(); renderDashboard(); toast('Galeri görseli eklendi.');
    }

    function resetStaffForm() { $('staffForm').reset(); $('staffId').value = ''; tempStaffImage = ''; const p = $('staffPreview'); if (p) p.removeAttribute('src'); }
    function renderStaffAdmin() {
        const list = $('staffAdminList');
        if (!list) return;
        list.innerHTML = (state.staff || []).map(s => `<div class="admin-item staff-admin-item"><img src="${escapeHtml(s.image || 'assets/icon.png')}" onerror="this.src='assets/icon.png'" alt=""><div><h3>${escapeHtml(s.name)} <small>${escapeHtml(s.role || '')}</small></h3><p>${escapeHtml(s.bio || '')}</p></div><div class="admin-item-actions"><button class="icon-btn" data-edit-staff="${escapeHtml(s.id)}">Düzenle</button><button class="icon-btn danger" data-delete-staff="${escapeHtml(s.id)}">Sil</button></div></div>`).join('') || '<p>Henüz ekip üyesi eklenmedi.</p>';
    }
    function editStaff(id) {
        const s = (state.staff || []).find(x => x.id === id);
        if (!s) return; switchTab('staff');
        $('staffId').value = s.id; $('staffName').value = s.name || ''; $('staffRole').value = s.role || ''; $('staffImage').value = (s.image && !s.image.startsWith('data:')) ? s.image : '';
        tempStaffImage = s.image || ''; $('staffPreview').src = s.image || ''; $('staffBio').value = s.bio || ''; window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    async function saveStaff(e) {
        e.preventDefault();
        const id = $('staffId').value || uid('s');
        const item = { id, name: $('staffName').value.trim(), role: $('staffRole').value.trim(), image: tempStaffImage || $('staffImage').value.trim() || 'assets/icon.png', bio: $('staffBio').value.trim() };
        if (!Array.isArray(state.staff)) state.staff = [];
        const idx = state.staff.findIndex(x => x.id === id);
        if (idx > -1) state.staff[idx] = item; else state.staff.unshift(item);
        if (!await saveData()) return; resetStaffForm(); renderStaffAdmin(); renderDashboard(); toast('Kadro kaydedildi.');
    }

    function resetBlogForm() { $('blogForm').reset(); $('blogId').value = ''; tempBlogImage = ''; const p = $('blogPreview'); if (p) p.removeAttribute('src'); }
    function renderBlogAdmin() {
        const list = $('blogAdminList');
        if (!list) return;
        list.innerHTML = (state.blogs || []).map(normalizeBlog).map(b => `<div class="admin-item"><div><h3>${escapeHtml(b.title)} <small>${escapeHtml(b.category || 'Merak Edilenler')}</small></h3><p>/${escapeHtml(b.slug)}\n${escapeHtml(b.summary || firstLine(b.content) || '')}</p></div><div class="admin-item-actions"><button class="icon-btn" data-edit-blog="${escapeHtml(b.id)}">Düzenle</button><button class="icon-btn danger" data-delete-blog="${escapeHtml(b.id)}">Sil</button></div></div>`).join('') || '<p>Henüz yazı eklenmedi.</p>';
    }
    function editBlog(id) {
        const b = (state.blogs || []).find(x => x.id === id);
        if (!b) return; switchTab('blog');
        $('blogId').value = b.id; $('blogCategory').value = b.category || ''; $('blogTitle').value = b.title || ''; $('blogSummary').value = b.summary || ''; $('blogContent').value = b.content || '';
        $('blogImage').value = (b.image && !b.image.startsWith('data:')) ? b.image : ''; tempBlogImage = b.image || ''; if ($('blogPreview')) $('blogPreview').src = b.image || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    async function saveBlog(e) {
        e.preventDefault();
        const id = $('blogId').value || uid('b');
        const existing = (state.blogs || []).find(x => x.id === id) || {};
        const title = $('blogTitle').value.trim();
        const item = normalizeBlog({ ...existing, id, slug: existing.slug || slugifyTR(title), category: $('blogCategory').value.trim(), title, summary: $('blogSummary').value.trim(), image: tempBlogImage || $('blogImage').value.trim(), content: $('blogContent').value.trim() });
        if (!Array.isArray(state.blogs)) state.blogs = [];
        const idx = state.blogs.findIndex(x => x.id === id);
        if (idx > -1) state.blogs[idx] = item; else state.blogs.unshift(item);
        if (!await saveData()) return; resetBlogForm(); renderBlogAdmin(); renderDashboard(); toast('Merak edilenler yazısı kaydedildi.');
    }

    function resetHeroBannerForm() {
        const ids = ['heroBannerId', 'heroBannerImage', 'heroBannerTitle', 'heroBannerSubtitle'];
        ids.forEach(id => { if ($(id)) $(id).value = ''; });
        if ($('heroBannerTextColor')) $('heroBannerTextColor').value = '#ffffff';
        if ($('heroBannerTextPosition')) $('heroBannerTextPosition').value = 'left';
        tempHeroBannerImage = '';
        const p = $('heroBannerPreview'); if (p) p.removeAttribute('src');
    }

    function reorderHeroBanner(fromId, toId) {
        if (!Array.isArray(state.settings.heroBanners) || !fromId || !toId || fromId === toId) return false;
        const arr = state.settings.heroBanners;
        const fromIndex = arr.findIndex(x => String(x.id) === String(fromId));
        const toIndex = arr.findIndex(x => String(x.id) === String(toId));
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return false;
        const [item] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, item);
        return true;
    }

    function renderHeroBannerAdmin() {
        const list = $('heroBannerAdminList');
        if (!list) return;
        const banners = getHeroBanners();
        list.innerHTML = banners.map((b, i) => `<div class="admin-item hero-banner-admin-item" draggable="true" data-hero-banner-id="${escapeHtml(b.id)}"><span class="drag-handle hero-banner-drag" title="Tut sürükle">☰</span><img src="${escapeHtml(b.image)}" onerror="this.src='assets/hero.svg'" alt=""><div><h3>${i + 1}. ${escapeHtml(b.title || 'Banner')}</h3><p>${escapeHtml(b.subtitle || '')} Yazı konumu: ${escapeHtml(b.textPosition || 'left')} • Yazı rengi: ${escapeHtml(b.textColor || '#ffffff')}</p></div><div class="admin-item-actions"><button class="icon-btn" type="button" data-edit-hero-banner="${escapeHtml(b.id)}">Düzenle</button><button class="icon-btn danger" type="button" data-delete-hero-banner="${escapeHtml(b.id)}">Sil</button></div></div>`).join('') || '<p>Henüz banner eklenmedi.</p>';
    }

    async function saveHeroBanner() {
        if (!Array.isArray(state.settings.heroBanners)) state.settings.heroBanners = [];
        const id = $('heroBannerId').value || uid('hb');
        const image = tempHeroBannerImage || $('heroBannerImage').value.trim() || 'assets/hero.svg';
        const title = $('heroBannerTitle').value.trim() || $('setHeroTitle').value.trim() || DEFAULT_DATA.settings.heroTitle;
        const subtitle = $('heroBannerSubtitle').value.trim() || $('setHeroSubtitle').value.trim() || DEFAULT_DATA.settings.heroSubtitle;
        const textColor = $('heroBannerTextColor').value || '#ffffff';
        const textPosition = $('heroBannerTextPosition').value || 'left';

        const item = { id, image, title, subtitle, textColor, textPosition };
        const idx = state.settings.heroBanners.findIndex(x => x.id === id);
        if (idx > -1) state.settings.heroBanners[idx] = item; else state.settings.heroBanners.push(item);

        if (!await saveData()) return; resetHeroBannerForm(); renderHeroBannerAdmin(); applySettings(); toast('Banner kaydedildi.');
    }

    function editHeroBanner(id) {
        const b = getHeroBanners().find(x => x.id === id);
        if (!b) return;
        $('heroBannerId').value = b.id; $('heroBannerImage').value = b.image && !b.image.startsWith('data:') ? b.image : ''; $('heroBannerTitle').value = b.title || ''; $('heroBannerSubtitle').value = b.subtitle || ''; $('heroBannerTextColor').value = b.textColor || '#ffffff'; $('heroBannerTextPosition').value = b.textPosition || 'left';
        tempHeroBannerImage = b.image || '';
        if ($('heroBannerPreview')) $('heroBannerPreview').src = b.image || '';
    }

    function fillSettingsForm() {
        const s = state.settings;
        $('setPhone').value = s.phone || ''; $('setPhone2').value = s.phone2 || ''; $('setWhatsapp').value = s.whatsapp || ''; $('setEmail').value = s.email || ''; $('setWebsite').value = s.website || '';
        if ($('setInstagram')) $('setInstagram').value = s.instagram || 'hazeynturizm';
        $('setAddress').value = s.address || ''; $('setHeroTitle').value = s.heroTitle || ''; $('setHeroSubtitle').value = s.heroSubtitle || '';
        if ($('setHeroMode')) $('setHeroMode').value = s.heroMode || 'single';
        if ($('setStaffBannerKicker')) $('setStaffBannerKicker').value = s.staffBannerKicker || DEFAULT_DATA.settings.staffBannerKicker;
        if ($('setStaffBannerTitle')) $('setStaffBannerTitle').value = s.staffBannerTitle || DEFAULT_DATA.settings.staffBannerTitle;
        if ($('setStaffBannerSubtitle')) $('setStaffBannerSubtitle').value = s.staffBannerSubtitle || DEFAULT_DATA.settings.staffBannerSubtitle;
        if ($('setStaffBannerImage')) $('setStaffBannerImage').value = s.staffBannerImage && !String(s.staffBannerImage).startsWith('data:') ? s.staffBannerImage : '';
        tempStaffBannerImage = s.staffBannerImage || '';
        if ($('staffBannerPreview')) $('staffBannerPreview').src = s.staffBannerImage || DEFAULT_DATA.settings.staffBannerImage;
        if ($('setBlogBannerKicker')) $('setBlogBannerKicker').value = s.blogBannerKicker || DEFAULT_DATA.settings.blogBannerKicker;
        if ($('setBlogBannerTitle')) $('setBlogBannerTitle').value = s.blogBannerTitle || DEFAULT_DATA.settings.blogBannerTitle;
        if ($('setBlogBannerSubtitle')) $('setBlogBannerSubtitle').value = s.blogBannerSubtitle || DEFAULT_DATA.settings.blogBannerSubtitle;
        if ($('setBlogBannerImage')) $('setBlogBannerImage').value = s.blogBannerImage && !String(s.blogBannerImage).startsWith('data:') ? s.blogBannerImage : '';
        tempBlogBannerImage = s.blogBannerImage || '';
        if ($('blogBannerPreview')) $('blogBannerPreview').src = s.blogBannerImage || DEFAULT_DATA.settings.blogBannerImage;
        if ($('setSearchConsoleVerification')) $('setSearchConsoleVerification').value = s.searchConsoleVerification || '';
        if ($('setGoogleMapsEmbedUrl')) $('setGoogleMapsEmbedUrl').value = s.googleMapsEmbedUrl || '';
        if ($('setOfficeImages')) $('setOfficeImages').value = normalizeImageArray(s.officeImages).join('\n');
        if ($('setGa4MeasurementId')) $('setGa4MeasurementId').value = s.ga4MeasurementId || '';
        if ($('setMetaPixelId')) $('setMetaPixelId').value = s.metaPixelId || '';
        if ($('setGoogleAdsId')) $('setGoogleAdsId').value = s.googleAdsId || '';
        if ($('setGoogleAdsWhatsappLabel')) $('setGoogleAdsWhatsappLabel').value = s.googleAdsWhatsappLabel || '';
        if ($('setGoogleAdsPhoneLabel')) $('setGoogleAdsPhoneLabel').value = s.googleAdsPhoneLabel || '';
        if ($('setGoogleAdsFormLabel')) $('setGoogleAdsFormLabel').value = s.googleAdsFormLabel || '';
        renderHeroBannerAdmin();
    }

    async function saveSettings(e) {
        e.preventDefault();
        state.settings = {
            ...state.settings,
            phone: $('setPhone').value.trim(), phone2: $('setPhone2').value.trim(), whatsapp: $('setWhatsapp').value.trim(), email: $('setEmail').value.trim(), website: $('setWebsite').value.trim(),
            instagram: ($('setInstagram') ? $('setInstagram').value.trim().replace('@', '') : (state.settings.instagram || 'hazeynturizm')),
            address: $('setAddress').value.trim(), heroTitle: $('setHeroTitle').value.trim(), heroSubtitle: $('setHeroSubtitle').value.trim(),
            heroMode: ($('setHeroMode') ? $('setHeroMode').value : (state.settings.heroMode || 'single')),
            staffBannerKicker: $('setStaffBannerKicker')?.value.trim() || DEFAULT_DATA.settings.staffBannerKicker,
            staffBannerTitle: $('setStaffBannerTitle')?.value.trim() || DEFAULT_DATA.settings.staffBannerTitle,
            staffBannerSubtitle: $('setStaffBannerSubtitle')?.value.trim() || DEFAULT_DATA.settings.staffBannerSubtitle,
            staffBannerImage: tempStaffBannerImage || $('setStaffBannerImage')?.value.trim() || state.settings.staffBannerImage || DEFAULT_DATA.settings.staffBannerImage,
            blogBannerKicker: $('setBlogBannerKicker')?.value.trim() || DEFAULT_DATA.settings.blogBannerKicker,
            blogBannerTitle: $('setBlogBannerTitle')?.value.trim() || DEFAULT_DATA.settings.blogBannerTitle,
            blogBannerSubtitle: $('setBlogBannerSubtitle')?.value.trim() || DEFAULT_DATA.settings.blogBannerSubtitle,
            blogBannerImage: tempBlogBannerImage || $('setBlogBannerImage')?.value.trim() || state.settings.blogBannerImage || DEFAULT_DATA.settings.blogBannerImage,
            searchConsoleVerification: $('setSearchConsoleVerification')?.value.trim() || '',
            googleMapsEmbedUrl: $('setGoogleMapsEmbedUrl')?.value.trim() || '',
            officeImages: linesToList($('setOfficeImages')?.value),
            ga4MeasurementId: $('setGa4MeasurementId')?.value.trim() || '',
            metaPixelId: $('setMetaPixelId')?.value.trim() || '',
            googleAdsId: $('setGoogleAdsId')?.value.trim() || '',
            googleAdsWhatsappLabel: $('setGoogleAdsWhatsappLabel')?.value.trim() || '',
            googleAdsPhoneLabel: $('setGoogleAdsPhoneLabel')?.value.trim() || '',
            googleAdsFormLabel: $('setGoogleAdsFormLabel')?.value.trim() || ''
        };
        if (!await saveData()) return; toast('Ayarlar kaydedildi.');
    }

    function renderPassengerTourSelect(selectedId = '') {
        const select = $('listTourSelect'); if (!select) return;
        const current = selectedId || $('listTourId')?.value || '';
        const options = state.tours.map(t => `<option value="${escapeHtml(t.id)}" ${t.id === current ? 'selected' : ''}>${escapeHtml(t.title)} - ${escapeHtml(t.type === 'umre' ? 'Umre' : t.type === 'hac' ? 'Hac' : 'Yurt İçi')}</option>`).join('');
        select.innerHTML = '<option value="">Tur seçin</option>' + options;
    }

    function roomLabel(roomPeople) {
        const v = String(roomPeople || '').trim();
        if (!v) return 'Oda bilgisi seçilmemiş';
        return `${v} Kişilik Odalar`;
    }

    function roomOrderValue(roomPeople) {
        const v = String(roomPeople || '').replace('+', '');
        const n = parseInt(v, 10);
        if (Number.isFinite(n)) return n;
        return 99;
    }

    function groupPassengersByRoom(passengers) {
        const groups = new Map();
        (passengers || []).forEach((p, originalIndex) => {
            const key = String(p.roomPeople || p.room || '').trim() || 'secilmedi';
            if (!groups.has(key)) groups.set(key, []);
            const sourceIndex = Number.isInteger(p._sourceIndex) ? p._sourceIndex : originalIndex;
            groups.get(key).push({ ...p, _originalIndex: sourceIndex });
        });
        return Array.from(groups.entries()).sort((a, b) => roomOrderValue(a[0]) - roomOrderValue(b[0])).map(([key, items]) => ({ key, title: roomLabel(key === 'secilmedi' ? '' : key), items }));
    }

    function splitPassengerName(fullName) {
        const parts = String(fullName || '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
        if (parts.length < 2) return { firstName: parts[0] || '', surname: '' };
        return { firstName: parts.slice(0, -1).join(' '), surname: parts[parts.length - 1] };
    }

    function roomingTypeLabel(roomPeople) {
        return ({ '1': 'TEKLİ', '2': 'İKİLİ', '3': 'ÜÇLÜ', '4': 'DÖRTLÜ', '5+': '5+ KİŞİLİK' })[String(roomPeople || '')] || 'BELİRSİZ';
    }

    function createRoomAssignments(passengers) {
        let roomSequence = 0;
        let passengerSequence = 0;
        const rooms = [];
        groupPassengersByRoom(passengers || []).forEach(group => {
            const capacity = Math.max(1, parseInt(String(group.key || '1').replace('+', ''), 10) || 1);
            for (let i = 0; i < group.items.length; i += capacity) {
                const occupants = group.items.slice(i, i + capacity).map(p => ({ ...p, sheetNo: ++passengerSequence }));
                roomSequence += 1;
                rooms.push({
                    roomSequence,
                    roomIndexInType: Math.floor(i / capacity),
                    roomPeople: group.key,
                    roomingLabel: roomingTypeLabel(group.key),
                    mekkeRoomNo: occupants.find(p => p.mekkeRoomNo || p.roomNo)?.mekkeRoomNo || occupants.find(p => p.roomNo)?.roomNo || '',
                    medineRoomNo: occupants.find(p => p.medineRoomNo || p.roomNo)?.medineRoomNo || occupants.find(p => p.roomNo)?.roomNo || '',
                    occupants
                });
            }
        });
        return rooms;
    }

    function normalizeNameForSort(value) {
        return String(value || '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('tr-TR');
    }

    function getSurname(name) {
        const parts = normalizeNameForSort(name).split(' ').filter(Boolean);
        return parts.length ? parts[parts.length - 1] : '';
    }

    function sortPassengersForRooms(passengers) {
        return (passengers || []).map((p, index) => ({ ...p, _sortIndex: index })).sort((a, b) => {
            const roomDiff = roomOrderValue(a.roomPeople || a.room) - roomOrderValue(b.roomPeople || b.room);
            if (roomDiff) return roomDiff;
            const surnameDiff = getSurname(a.name).localeCompare(getSurname(b.name), 'tr');
            if (surnameDiff) return surnameDiff;
            const nameDiff = normalizeNameForSort(a.name).localeCompare(normalizeNameForSort(b.name), 'tr');
            if (nameDiff) return nameDiff;
            return a._sortIndex - b._sortIndex;
        }).map(({ _sortIndex, ...p }) => p);
    }

    function passengersForList(list) {
        const passengers = (list && Array.isArray(list.passengers)) ? list.passengers : [];
        const indexed = passengers.map((passenger, index) => ({ ...passenger, _sourceIndex: index }));
        return list && surnameSortedLists.has(list.id) ? sortPassengersForRooms(indexed) : indexed;
    }

    function passengerRow(p = {}) {
        const tr = document.createElement('tr');
        const gender = p.gender || '';
        const roomPeople = p.roomPeople || p.room || '';
        const accounting = clone(p.accounting || { agreedPrice: '', currency: '', priceSource: 'room', payments: [] });
        tr.dataset.passengerId = p.id || uid('p_');
        tr.dataset.priceSource = accounting.priceSource === 'custom' ? 'custom' : 'room';
        tr._accounting = accounting;
        tr._createdBy = clone(p.createdBy || null);
        tr.innerHTML = `
        <td><input class="p-name" value="${escapeHtml(p.name || '')}" placeholder="Ad Soyad"></td>
        <td><select class="p-gender"><option value="">Seç</option><option ${gender === 'Kadın' ? 'selected' : ''}>Kadın</option><option ${gender === 'Erkek' ? 'selected' : ''}>Erkek</option></select></td>
        <td><input class="p-tc" value="${escapeHtml(p.tc || '')}" placeholder="TC No" inputmode="numeric"></td>
        <td><input class="p-phone" value="${escapeHtml(p.phone || '')}" placeholder="05xx" inputmode="tel"></td>
        <td><input class="p-passport" value="${escapeHtml(p.passportNo || '')}" placeholder="Pasaport No"></td>
        <td><input class="p-birth" type="date" value="${escapeHtml(p.birthDate || '')}"></td>
        <td><input class="p-pass-start" type="date" value="${escapeHtml(p.passportStart || '')}"></td>
        <td><input class="p-pass-end" type="date" value="${escapeHtml(p.passportEnd || '')}"></td>
        <td><select class="p-room-people"><option value="">Seç</option>${['1', '2', '3', '4', '5+'].map(v => `<option value="${v}" ${String(roomPeople) === v ? 'selected' : ''}>${v} Kişilik</option>`).join('')}</select></td>
        <td class="desktop-only"><input class="p-custom-price" type="number" min="0" step="0.01" value="${escapeHtml(accounting.agreedPrice)}" placeholder="Otomatik"></td>
        <td class="desktop-only"><select class="p-custom-currency">${['USD', 'EUR', 'TRY'].map(currency => `<option value="${currency}" ${currency === (accounting.currency || 'USD') ? 'selected' : ''}>${currency}</option>`).join('')}</select></td>
        <td><input class="p-mekke-room-no" value="${escapeHtml(p.mekkeRoomNo || p.roomNo || '')}" placeholder="Örn: M-305"></td>
        <td><input class="p-medine-room-no" value="${escapeHtml(p.medineRoomNo || p.roomNo || '')}" placeholder="Örn: D-214"></td>
        <td><input class="p-note" value="${escapeHtml(p.note || '')}" placeholder="Not"></td>
        <td><button type="button" class="icon-btn danger remove-row">Sil</button></td>`;
        $('passengerTable').querySelector('tbody').appendChild(tr);
        const priceInput = tr.querySelector('.p-custom-price');
        if (priceInput) priceInput.addEventListener('input', () => { tr.dataset.priceSource = 'custom'; });
        const currencyInput = tr.querySelector('.p-custom-currency');
        if (currencyInput) currencyInput.addEventListener('change', () => { tr.dataset.priceSource = 'custom'; });
        if (IS_DESKTOP_APP && accounting.agreedPrice === '' && roomPeople) syncPassengerRowPrice(tr, true);
    }

    function syncPassengerRowPrice(tr, force = false) {
        if (!tr || (!force && tr.dataset.priceSource === 'custom')) return;
        const tourId = $('listTourSelect')?.value || $('listTourId')?.value || '';
        const tour = state?.tours?.find(item => item.id === tourId);
        const roomPeople = tr.querySelector('.p-room-people')?.value || '';
        const fallback = passengerTourPrice(tour, { roomPeople });
        const amountInput = tr.querySelector('.p-custom-price');
        const currencyInput = tr.querySelector('.p-custom-currency');
        if (amountInput) amountInput.value = fallback.amount > 0 ? String(fallback.amount) : '';
        if (currencyInput && fallback.currency) currencyInput.value = fallback.currency;
        tr.dataset.priceSource = 'room';
    }

    function ensurePassengerRows() {
        const tbody = $('passengerTable')?.querySelector('tbody');
        if (tbody && !tbody.children.length) { passengerRow(); passengerRow(); }
    }

    function clearPassengerForm() {
        $('listId').value = ''; $('listTourId').value = ''; $('listTourSelect').value = ''; $('listTitle').value = ''; $('listDate').value = ''; $('listLeader').value = ''; $('listNotes').value = '';
        if ($('listOriginAirport')) $('listOriginAirport').value = '';
        if ($('listDestinationAirport')) $('listDestinationAirport').value = '';
        $('passengerTable').querySelector('tbody').innerHTML = '';
        passengerRow(); passengerRow(); renderPassengerTourSelect();
    }

    function readPassengers() {
        const tourId = $('listTourSelect')?.value || $('listTourId')?.value || '';
        const tour = state?.tours?.find(item => item.id === tourId);
        return Array.from($('passengerTable').querySelectorAll('tbody tr')).map(tr => {
            const roomPeople = tr.querySelector('.p-room-people').value;
            const amountInput = tr.querySelector('.p-custom-price');
            const currencyInput = tr.querySelector('.p-custom-currency');
            const fallback = passengerTourPrice(tour, { roomPeople });
            const typedAmount = Number(amountInput?.value);
            const hasTypedAmount = Boolean(amountInput && amountInput.value !== '' && Number.isFinite(typedAmount) && typedAmount >= 0);
            const priceSource = tr.dataset.priceSource === 'custom' ? 'custom' : 'room';
            const desktopAccounting = {
                ...(tr._accounting || {}),
                agreedPrice: hasTypedAmount ? typedAmount : fallback.amount,
                currency: currencyInput?.value || fallback.currency || 'TRY',
                priceSource,
                payments: clone(tr._accounting?.payments || [])
            };
            const accounting = IS_DESKTOP_APP ? desktopAccounting : clone(tr._accounting || { agreedPrice: '', currency: '', priceSource: 'room', payments: [] });
            return {
            id: tr.dataset.passengerId || uid('p_'),
            name: tr.querySelector('.p-name').value.trim(),
            gender: tr.querySelector('.p-gender').value.trim(),
            tc: tr.querySelector('.p-tc').value.trim(),
            phone: tr.querySelector('.p-phone').value.trim(),
            passportNo: tr.querySelector('.p-passport').value.trim(),
            birthDate: tr.querySelector('.p-birth').value,
            passportStart: tr.querySelector('.p-pass-start').value,
            passportEnd: tr.querySelector('.p-pass-end').value,
            roomPeople,
            mekkeRoomNo: tr.querySelector('.p-mekke-room-no')?.value.trim() || '',
            medineRoomNo: tr.querySelector('.p-medine-room-no')?.value.trim() || '',
            note: tr.querySelector('.p-note').value.trim(),
            createdBy: clone(tr._createdBy || currentActor()),
            accounting
            };
        }).filter(p => p.name || p.gender || p.tc || p.phone || p.passportNo || p.birthDate || p.passportStart || p.passportEnd || p.roomPeople || p.mekkeRoomNo || p.medineRoomNo || p.note);
    }

    async function savePassengerList() {
        const passengers = readPassengers();
        const tourId = $('listTourSelect').value || $('listTourId').value || '';
        const selectedTour = state.tours.find(t => t.id === tourId);
        if (selectedTour && !$('listTitle').value.trim()) $('listTitle').value = selectedTour.title;

        if (!$('listTitle').value.trim()) { toast('Tur seç veya liste başlığı yaz.'); return; }
        if (!passengers.length) { toast('En az 1 yolcu ekle.'); return; }

        const id = $('listId').value || uid('l');
        const existing = state.passengerLists.find(x => x.id === id);
        const item = {
            id, tourId, title: $('listTitle').value.trim(), date: $('listDate').value,
            leader: $('listLeader').value.trim(), notes: $('listNotes').value.trim(),
            originAirport: airportCode($('listOriginAirport')?.value),
            destinationAirport: airportCode($('listDestinationAirport')?.value),
            passengers,
            createdBy: clone(existing?.createdBy || currentActor()),
            createdAt: existing?.createdAt || new Date().toISOString()
        };

        const idx = state.passengerLists.findIndex(x => x.id === id);
        if (idx > -1) state.passengerLists[idx] = item; else state.passengerLists.unshift(item);

        if (!await saveData({ keepLocalAccounting: IS_DESKTOP_APP })) return; clearPassengerForm(); renderPassengerAdmin(); renderDashboard(); toast('Yolcu listesi ve muhasebe fiyatları kaydedildi.');
    }

    function editPassengerList(id) {
        const l = state.passengerLists.find(x => x.id === id);
        if (!l) return; switchTab('passengers');
        renderPassengerTourSelect(l.tourId || '');
        $('listId').value = l.id; $('listTourId').value = l.tourId || ''; $('listTourSelect').value = l.tourId || ''; $('listTitle').value = l.title || ''; $('listDate').value = l.date || ''; $('listLeader').value = l.leader || ''; $('listNotes').value = l.notes || '';
        if ($('listOriginAirport')) $('listOriginAirport').value = l.originAirport || '';
        if ($('listDestinationAirport')) $('listDestinationAirport').value = l.destinationAirport || '';
        $('passengerTable').querySelector('tbody').innerHTML = '';
        (l.passengers || []).forEach(passengerRow); ensurePassengerRows(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function passengerRowHtml(p, i, listId, roomBandClass = '') {
        const originalIndex = typeof p._originalIndex === 'number' ? p._originalIndex : i;
        const list = state.passengerLists.find(x => x.id === listId) || {};
        const flightDate = getListFlightDate(list);
        const status = passportStatus(p, flightDate);
        const warningClass = status.level === 'danger' ? 'passport-warning' : status.level === 'missing' ? 'passport-missing' : '';

        const isSurnameView = surnameSortedLists.has(listId);
        return `<tr class="passenger-order-row ${warningClass} ${roomBandClass}" draggable="${isSurnameView ? 'false' : 'true'}" data-list-id="${escapeHtml(listId)}" data-passenger-index="${originalIndex}">
        <td class="drag-cell"><span class="drag-handle" title="${isSurnameView ? 'Manuel sıralama için soyad görünümünü kapat' : 'Tut sürükle'}">☰</span> ${i + 1}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.gender)}</td>
        <td>${escapeHtml(p.tc)}</td>
        <td>${escapeHtml(p.phone)}</td>
        <td>${escapeHtml(p.passportNo)}</td>
        <td>${escapeHtml(formatDateDMY(p.birthDate))}</td>
        <td>${escapeHtml(formatDateDMY(p.passportStart))}</td>
        <td>${escapeHtml(formatDateDMY(p.passportEnd))}<span class="passport-status ${status.level}">${escapeHtml(status.label)}</span></td>
        <td><select class="inline-room-people" data-list-id="${escapeHtml(listId)}" data-room-people-index="${originalIndex}">${['', '1', '2', '3', '4', '5+'].map(v => `<option value="${v}" ${String(p.roomPeople || p.room || '') === v ? 'selected' : ''}>${v ? v + ' Kişilik' : 'Seç'}</option>`).join('')}</select></td>
        <td><input class="inline-room-no" data-list-id="${escapeHtml(listId)}" data-room-field="mekkeRoomNo" data-room-no-index="${originalIndex}" value="${escapeHtml(p.mekkeRoomNo || p.roomNo || '')}" placeholder="Mekke"></td>
        <td><input class="inline-room-no" data-list-id="${escapeHtml(listId)}" data-room-field="medineRoomNo" data-room-no-index="${originalIndex}" value="${escapeHtml(p.medineRoomNo || p.roomNo || '')}" placeholder="Medine"></td>
        <td>${escapeHtml(p.note)}</td>
    </tr>`;
    }

    function passengerRoomGroupsHtml(l) {
        const groups = groupPassengersByRoom(passengersForList(l));
        if (!groups.length) return '<div class="empty small">Bu listede yolcu bilgisi yok.</div>';
        return groups.map(group => {
            const colorClass = getRoomColorClass(group.title);
            return `<div class="room-group-block ${colorClass}">
            <div class="room-group-title">${escapeHtml(group.title)} <span>${group.items.length} yolcu</span></div>
            <div class="passenger-detail-wrap">
                <table class="passenger-detail-table room-table">
                    <thead><tr><th>Sıra</th><th>Ad Soyad</th><th>Cinsiyet</th><th>TC No</th><th>Telefon</th><th>Pasaport No</th><th>Doğum Tarihi</th><th>Pasaport Başlangıç</th><th>Pasaport Bitiş</th><th>Oda Kaç Kişilik</th><th>Mekke Oda</th><th>Medine Oda</th><th>Not</th></tr></thead>
                    <tbody>${group.items.map((p, i) => {
                        const capacity = Math.max(1, parseInt(String(group.key || '1').replace('+', ''), 10) || 1);
                        const band = Math.floor(i / capacity) % 2 === 0 ? 'room-band-blue' : 'room-band-gold';
                        return passengerRowHtml(p, i, l.id, band);
                    }).join('')}</tbody>
                </table>
            </div>
        </div>`;
        }).join('');
    }

    function roomingSheetHtml(l) {
        const flightDate = getListFlightDate(l);
        const rooms = createRoomAssignments(passengersForList(l));
        const rows = rooms.map(room => room.occupants.map((p, index) => {
            const name = splitPassengerName(p.name);
            const status = passportStatus(p, flightDate);
            const statusClass = status.level === 'danger' ? 'passport-warning' : status.level === 'missing' ? 'passport-missing' : '';
            const rowClass = `${statusClass} ${room.roomIndexInType % 2 === 0 ? 'room-band-blue' : 'room-band-gold'}`;
            const shared = index === 0 ? `<td rowspan="${room.occupants.length}" class="rooming-shared">${room.roomSequence}</td><td rowspan="${room.occupants.length}" class="rooming-shared rooming-type">${escapeHtml(room.roomingLabel)}</td>` : '';
            const mekkeRoomNo = p.mekkeRoomNo || p.roomNo || room.mekkeRoomNo || '';
            const medineRoomNo = p.medineRoomNo || room.medineRoomNo || '';
            return `<tr class="${rowClass}"><td>${p.sheetNo}</td><td>${escapeHtml(name.firstName)}</td><td>${escapeHtml(name.surname)}</td>${shared}<td>${escapeHtml(mekkeRoomNo)}</td><td>${escapeHtml(medineRoomNo)}</td><td><span class="passport-status ${status.level}">${escapeHtml(status.label)}</span><small>${escapeHtml(formatDateDMY(p.passportEnd) || '-')}</small></td></tr>`;
        }).join('')).join('');
        return `<div class="rooming-preview">
            <div class="rooming-preview-head"><div><span>${escapeHtml(currentCompany().shortName.toLocaleUpperCase('tr-TR'))}</span><strong>${escapeHtml(l.title)} ODALAMA YERLEŞKESİ</strong></div><small>Excel çıktısıyla aynı düzen</small></div>
            <div class="passenger-detail-wrap"><table class="rooming-table"><thead><tr><th>NO</th><th>İSİM</th><th>SOY İSİM</th><th>SAYI</th><th>ODALAMA</th><th>MEKKE</th><th>MEDİNE</th><th>PASAPORT</th></tr></thead><tbody>${rows || '<tr><td colspan="8">Yolcu bulunamadı.</td></tr>'}</tbody></table></div>
        </div>`;
    }

    function passengerListCard(l) {
        const tourTitle = (state.tours.find(t => t.id === l.tourId) || {}).title || l.title || '-';
        const total = (l.passengers || []).length;
        const males = (l.passengers || []).filter(p => p.gender === 'Erkek').length;
        const females = (l.passengers || []).filter(p => p.gender === 'Kadın').length;
        const flightDate = getListFlightDate(l);
        const expiringCount = (l.passengers || []).filter(p => isPassportExpiring(p.passportEnd, flightDate)).length;
        const route = [airportCode(l.originAirport), airportCode(l.destinationAirport)].filter(Boolean).join('-') || '-';

        return `<div class="passenger-list-card" data-list-card="${escapeHtml(l.id)}">
        <div class="passenger-list-top">
            <div>
                <h3>${escapeHtml(l.title)} <small>${escapeHtml(l.date || '')}</small></h3>
                <p><b>Tur:</b> ${escapeHtml(tourTitle)} &nbsp; <b>Uçuş:</b> ${escapeHtml(formatDateTR(flightDate) || '-')} &nbsp; <b>Parkur:</b> ${escapeHtml(route)} &nbsp; <b>Rehber:</b> ${escapeHtml(l.leader || '-')}</p>
                <p><b>Toplam Yolcu:</b> ${total} &nbsp; <b>Erkek:</b> ${males} &nbsp; <b>Kadın:</b> ${females} &nbsp; <b style="color:#d32f2f">Pasaportu 6 Aydan Az Kalan:</b> <span style="color:#d32f2f; font-weight:bold">${expiringCount}</span></p>
                ${l.notes ? `<p><b>Liste Notu:</b> ${escapeHtml(l.notes)}</p>` : ''}
                <p class="hint-text"><b>Manuel sıra korunur:</b> ☰ işaretinden yolcuyu taşıyabilirsin. İstersen soyad düğmesiyle geçici olarak aynı soyadları yan yana görebilirsin.</p>
            </div>
            <div class="admin-item-actions">
                <button class="icon-btn" data-edit-list="${escapeHtml(l.id)}">Düzenle</button>
                <button class="icon-btn surname-toggle-btn ${surnameSortedLists.has(l.id) ? 'active' : ''}" data-surname-toggle="${escapeHtml(l.id)}">${surnameSortedLists.has(l.id) ? 'Manuel Sıraya Dön' : 'Soyada Göre Grupla'}</button>
                <button class="icon-btn excel-btn" data-excel-list="${escapeHtml(l.id)}">Excel Oda Listesi</button>
                <button class="icon-btn flight-excel-btn" data-flight-excel-list="${escapeHtml(l.id)}">Excel Uçuş Listesi</button>
                <button class="icon-btn" data-print-list="${escapeHtml(l.id)}" data-ori="portrait">PDF (Dikey)</button>
                <button class="icon-btn" data-print-list="${escapeHtml(l.id)}" data-ori="landscape">PDF (Yatay)</button>
                <button class="icon-btn danger" data-delete-list="${escapeHtml(l.id)}">Sil</button>
            </div>
        </div>
        <input type="checkbox" id="filter-expiring-${escapeHtml(l.id)}" class="filter-expiring-cb">
        <label for="filter-expiring-${escapeHtml(l.id)}" class="filter-expiring-label">Sadece Pasaport Süresi Yetersiz Olanları Göster</label>
        <div class="passenger-room-area">${roomingSheetHtml(l)}<details class="passenger-details" data-details-list-id="${escapeHtml(l.id)}"><summary>Tüm yolcu ve pasaport detaylarını göster</summary>${passengerRoomGroupsHtml(l)}</details></div>
    </div>`;
    }

    function reorderPassenger(listId, fromIndex, toIndex) {
        const l = state.passengerLists.find(x => x.id === listId);
        if (!l || !Array.isArray(l.passengers)) return;
        fromIndex = Number(fromIndex); toIndex = Number(toIndex);
        if (!Number.isFinite(fromIndex) || !Number.isFinite(toIndex) || fromIndex === toIndex) return;
        const item = l.passengers.splice(fromIndex, 1)[0];
        if (!item) return;
        const insertAt = fromIndex < toIndex ? toIndex : toIndex;
        l.passengers.splice(insertAt, 0, item);
    }

    async function updatePassengerRoomField(listId, passengerIndex, field, value) {
        const l = state.passengerLists.find(x => x.id === listId);
        if (!l || !l.passengers || !l.passengers[passengerIndex]) return;
        const passenger = l.passengers[passengerIndex];
        passenger[field] = value;
        if (IS_DESKTOP_APP && field === 'roomPeople' && passenger.accounting?.priceSource !== 'custom') {
            const tour = state.tours.find(item => item.id === l.tourId);
            const fallback = passengerTourPrice(tour, passenger);
            passenger.accounting = { ...(passenger.accounting || {}), agreedPrice: fallback.amount, currency: fallback.currency, priceSource: 'room', payments: passenger.accounting?.payments || [] };
        }
        if (!await saveData({ keepLocalAccounting: IS_DESKTOP_APP && field === 'roomPeople' })) return;
        if (field === 'roomPeople' || field === 'mekkeRoomNo' || field === 'medineRoomNo' || field === 'roomNo') renderPassengerAdmin();
    }

    function normalizeSearchText(value) {
        return slugifyTR(String(value || '').replace(/-/g, ' ')).replace(/-/g, ' ');
    }

    function parseMoneyAmount(value) {
        let raw = String(value ?? '').trim().replace(/[^0-9,.-]/g, '');
        if (!raw) return NaN;
        const sign = raw.startsWith('-') ? -1 : 1;
        raw = raw.replace(/-/g, '');
        if (/^\d{1,3}(\.\d{3})+$/.test(raw)) raw = raw.replace(/\./g, '');
        else if (/^\d{1,3}(,\d{3})+$/.test(raw)) raw = raw.replace(/,/g, '');
        else if (raw.includes('.') && raw.includes(',')) {
            const decimal = raw.lastIndexOf(',') > raw.lastIndexOf('.') ? ',' : '.';
            const thousands = decimal === ',' ? /\./g : /,/g;
            raw = raw.replace(thousands, '').replace(decimal, '.');
        } else if (raw.includes(',')) raw = raw.replace(',', '.');
        const amount = Number(raw);
        return Number.isFinite(amount) ? amount * sign : NaN;
    }

    function currencyFromText(value) {
        const text = String(value || '').toLocaleUpperCase('tr-TR');
        if (text.includes('EUR') || text.includes('€')) return 'EUR';
        if (text.includes('USD') || text.includes('$')) return 'USD';
        return 'TRY';
    }

    function formatMoney(amount, currency = 'TRY') {
        const value = Number(amount || 0);
        try {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency', currency,
                minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
                maximumFractionDigits: 2
            }).format(value);
        } catch (e) {
            return `${value.toLocaleString('tr-TR')} ${currency}`;
        }
    }

    function passengerTourPrice(tour, passenger) {
        const roomPeople = String(passenger?.roomPeople || passenger?.room || '');
        const raw = tour?.roomPrices?.[roomPeople] || tour?.price || '';
        const amount = parseMoneyAmount(raw);
        return {
            amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
            currency: currencyFromText(raw)
        };
    }

    function getPassengerContext(listId, passengerId) {
        const list = (state.passengerLists || []).find(item => item.id === listId);
        if (!list) return null;
        const passengerIndex = (list.passengers || []).findIndex(item => item.id === passengerId);
        if (passengerIndex < 0) return null;
        const passenger = list.passengers[passengerIndex];
        const tour = (state.tours || []).find(item => item.id === list.tourId) || null;
        return { list, passenger, passengerIndex, tour };
    }

    function passengerAccountSnapshot(context) {
        const fallback = passengerTourPrice(context.tour, context.passenger);
        const accounting = context.passenger.accounting || { payments: [] };
        const agreed = Number(accounting.agreedPrice);
        const hasAgreed = Number.isFinite(agreed) && agreed >= 0 && accounting.agreedPrice !== '';
        const isCustom = accounting.priceSource === 'custom';
        const currency = accounting.currency || fallback.currency || 'TRY';
        const payments = (Array.isArray(accounting.payments) ? accounting.payments : []).map(normalizePayment);
        const paid = payments.filter(payment => !payment.voided).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const agreedPrice = hasAgreed ? agreed : fallback.amount;
        return { agreedPrice, currency, payments, paid, balance: agreedPrice - paid, usesProgramPrice: !isCustom, priceSource: isCustom ? 'custom' : 'room' };
    }

    function allPassengerContexts() {
        return (state.passengerLists || []).flatMap(list => (list.passengers || []).map((passenger, passengerIndex) => ({
            list,
            passenger,
            passengerIndex,
            tour: (state.tours || []).find(item => item.id === list.tourId) || null
        })));
    }

    function passengerRoommates(context) {
        const target = context.passenger;
        const passengers = context.list.passengers || [];
        const mekke = String(target.mekkeRoomNo || target.roomNo || '').trim();
        const medine = String(target.medineRoomNo || target.roomNo || '').trim();
        let roommates = passengers.filter(item => item.id !== target.id && (
            (mekke && String(item.mekkeRoomNo || item.roomNo || '').trim() === mekke) ||
            (medine && String(item.medineRoomNo || item.roomNo || '').trim() === medine)
        ));
        if (!roommates.length) {
            const assignment = createRoomAssignments(passengers).find(room => room.occupants.some(item => item.id === target.id));
            roommates = assignment ? assignment.occupants.filter(item => item.id !== target.id) : [];
        }
        return roommates.map(item => item.name).filter(Boolean);
    }

    function createReceiptNumber() {
        const now = new Date();
        const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        return `${currentCompany().receiptPrefix}-${date}-${now.getTime().toString(36).slice(-5).toLocaleUpperCase('tr-TR')}`;
    }

    function multiCurrencyHtml(values) {
        const order = ['USD', 'EUR', 'TRY'];
        const entries = order.filter(currency => Math.abs(Number(values[currency] || 0)) > 0.0001);
        if (!entries.length) return '<span>—</span>';
        return entries.map(currency => `<span>${escapeHtml(formatMoney(values[currency], currency))}</span>`).join('');
    }

    function renderAccountingStats() {
        const contract = { USD: 0, EUR: 0, TRY: 0 };
        const paid = { USD: 0, EUR: 0, TRY: 0 };
        const balance = { USD: 0, EUR: 0, TRY: 0 };
        let openCount = 0;
        allPassengerContexts().forEach(context => {
            const snapshot = passengerAccountSnapshot(context);
            contract[snapshot.currency] += snapshot.agreedPrice;
            paid[snapshot.currency] += snapshot.paid;
            balance[snapshot.currency] += snapshot.balance;
            if (snapshot.balance > 0.005) openCount += 1;
        });
        if ($('accountingStatContract')) $('accountingStatContract').innerHTML = multiCurrencyHtml(contract);
        if ($('accountingStatPaid')) $('accountingStatPaid').innerHTML = multiCurrencyHtml(paid);
        if ($('accountingStatBalance')) $('accountingStatBalance').innerHTML = multiCurrencyHtml(balance);
        if ($('accountingStatOpen')) $('accountingStatOpen').textContent = String(openCount);
        renderProgramBalances();
    }

    function currencySummary(values) {
        const entries = ['USD', 'EUR', 'TRY'].filter(currency => Math.abs(Number(values[currency] || 0)) > 0.0001);
        return entries.length ? entries.map(currency => formatMoney(values[currency], currency)).join(' / ') : '—';
    }

    function renderProgramBalances() {
        const target = $('accountingProgramBalances');
        if (!target) return;
        const groups = new Map();
        allPassengerContexts().forEach(context => {
            const key = context.tour?.id || context.list?.tourId || context.list?.id;
            if (!groups.has(key)) groups.set(key, {
                title: context.tour?.title || context.list?.title || 'Programsız Liste',
                date: context.tour?.departureDate || context.list?.date || '',
                contract: { USD: 0, EUR: 0, TRY: 0 },
                paid: { USD: 0, EUR: 0, TRY: 0 },
                balance: { USD: 0, EUR: 0, TRY: 0 },
                passengers: 0,
                open: 0,
                debtors: []
            });
            const group = groups.get(key);
            const snapshot = passengerAccountSnapshot(context);
            group.contract[snapshot.currency] += snapshot.agreedPrice;
            group.paid[snapshot.currency] += snapshot.paid;
            group.balance[snapshot.currency] += snapshot.balance;
            group.passengers += 1;
            if (snapshot.balance > 0.005) {
                group.open += 1;
                group.debtors.push({
                    listId: context.list.id,
                    passengerId: context.passenger.id,
                    name: context.passenger.name || 'İsimsiz yolcu',
                    phone: context.passenger.phone || '',
                    roomPeople: context.passenger.roomPeople || context.passenger.room || '',
                    balance: snapshot.balance,
                    currency: snapshot.currency
                });
            }
        });
        const items = [...groups.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));
        target.innerHTML = items.length ? items.map(group => `
            <article class="program-balance-card ${group.open ? 'open' : 'paid'}">
                <header><div><h4>${escapeHtml(group.title)}</h4><small>${escapeHtml(formatDateTR(group.date) || 'Tarih belirtilmemiş')} • ${group.passengers} yolcu</small></div><span>${group.open ? `${group.open} bakiye açık` : 'Tamamı ödendi'}</span></header>
                <div class="program-balance-values"><span><small>Toplam</small><b>${escapeHtml(currencySummary(group.contract))}</b></span><span><small>Ödenen</small><b>${escapeHtml(currencySummary(group.paid))}</b></span><span><small>Kalan</small><b>${escapeHtml(currencySummary(group.balance))}</b></span></div>
                ${group.debtors.length ? `<details class="program-debtor-list"><summary>${group.debtors.length} borçlu yolcuyu göster</summary><div class="program-debtor-rows">${group.debtors
                    .sort((a, b) => b.balance - a.balance)
                    .map(debtor => `<div class="program-debtor-row"><div><b>${escapeHtml(debtor.name)}</b><small>${escapeHtml(debtor.roomPeople ? `${debtor.roomPeople} kişilik oda` : 'Oda belirtilmemiş')}${debtor.phone ? ` • ${escapeHtml(debtor.phone)}` : ''}</small></div><strong>${escapeHtml(formatMoney(debtor.balance, debtor.currency))}</strong><button class="icon-btn" type="button" data-open-debtor="${escapeHtml(debtor.passengerId)}" data-debtor-list="${escapeHtml(debtor.listId)}" data-debtor-name="${escapeHtml(debtor.name)}">Ödeme Aç</button></div>`).join('')}</div></details>` : ''}
            </article>`).join('') : '<div class="empty small">Program bazında bakiye göstermek için yolcu kaydı ekleyin.</div>';
    }

    function accountingPaymentHistoryHtml(context, snapshot) {
        if (!snapshot.payments.length) return '<div class="empty small">Henüz ödeme kaydı yok.</div>';
        const rows = [...snapshot.payments].reverse().map(payment => `
            <tr class="${payment.voided ? 'payment-voided' : ''}">
                <td><b>${escapeHtml(payment.receiptNo)}</b>${payment.voided ? '<small>İPTAL EDİLDİ</small>' : ''}</td>
                <td>${escapeHtml(formatDateDMY(payment.paidAt))}</td>
                <td>${escapeHtml(formatMoney(payment.amount, snapshot.currency))}</td>
                <td>${escapeHtml(payment.method || '-')}</td>
                ${IS_DESKTOP_APP ? `<td>${escapeHtml(actorName(payment.receivedBy, 'Eski kayıt'))}</td>` : ''}
                <td>${escapeHtml(payment.note || '-')}</td>
                <td class="payment-actions"><button class="icon-btn" type="button" data-print-receipt="${escapeHtml(payment.id)}">Makbuz</button>${payment.voided ? '' : `<button class="icon-btn danger" type="button" data-void-payment="${escapeHtml(payment.id)}">İptal</button>`}</td>
            </tr>`).join('');
        return `<div class="accounting-payment-table"><table><thead><tr><th>Makbuz No</th><th>Tarih</th><th>Tutar</th><th>Yöntem</th>${IS_DESKTOP_APP ? '<th>Tahsilatı Alan</th>' : ''}<th>Not</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }

    function accountingProgramType(context) {
        const explicit = String(context.tour?.type || '').toLowerCase();
        if (explicit === 'hac') return 'Hac';
        if (explicit === 'umre') return 'Umre';
        if (explicit === 'yurtici') return 'Kültür Turu';
        const title = normalizeSearchText(`${context.list?.title || ''} ${context.tour?.title || ''}`);
        if (title.includes('hac')) return 'Hac';
        if (title.includes('umre')) return 'Umre';
        return 'Kültür Turu';
    }

    function accountingResultCard(context) {
        const { list, passenger, tour } = context;
        const snapshot = passengerAccountSnapshot(context);
        const roommates = passengerRoommates(context);
        const roomPeople = String(passenger.roomPeople || passenger.room || '');
        const mekkeRoom = passenger.mekkeRoomNo || passenger.roomNo || '';
        const medineRoom = passenger.medineRoomNo || passenger.roomNo || '';
        const balanceClass = snapshot.balance > 0.005 ? 'open' : snapshot.balance < -0.005 ? 'credit' : 'paid';
        const balanceLabel = snapshot.balance > 0.005 ? 'Kalan' : snapshot.balance < -0.005 ? 'Fazla Ödeme' : 'Ödendi';
        const auditHtml = IS_DESKTOP_APP ? `<div class="accounting-audit-line"><span>Kaydı yapan: <b>${escapeHtml(actorName(passenger.createdBy || list.createdBy, 'Eski kayıt'))}</b></span>${snapshot.payments.length ? `<span>Son tahsilat: <b>${escapeHtml(actorName(snapshot.payments[snapshot.payments.length - 1].receivedBy, 'Eski kayıt'))}</b></span>` : ''}</div>` : '';
        const priceEditorTitle = IS_DESKTOP_APP ? 'Kişiye Özel Anlaşma / İndirimli Fiyat' : 'Program Ücreti';
        const priceSaveLabel = IS_DESKTOP_APP ? 'Özel Fiyatı Kaydet' : 'Fiyatı Kaydet';
        const priceResetButton = IS_DESKTOP_APP ? '<button class="icon-btn" type="button" data-reset-account-price>Oda Fiyatına Dön</button>' : '';
        const priceHelp = IS_DESKTOP_APP ? 'İndirim yapacaksan bu yolcuya özel toplam fiyatı yaz. “Oda Fiyatına Dön” seçeneği programdaki oda fiyatını yeniden uygular.' : 'Oda fiyatından farklı anlaşma varsa burada değiştirebilirsin.';
        return `<article class="accounting-card" data-account-card data-list-id="${escapeHtml(list.id)}" data-passenger-id="${escapeHtml(passenger.id)}">
            <header class="accounting-card-head">
                <div><span class="accounting-tour-type">${escapeHtml(accountingProgramType(context))}</span><h3>${escapeHtml(passenger.name || 'İsimsiz yolcu')}</h3><p>${escapeHtml(tour?.title || list.title || 'Program')} • ${escapeHtml(formatDateTR(tour?.departureDate || list.date) || 'Tarih yok')}</p>${auditHtml}</div>
                <div class="accounting-balance ${balanceClass}"><small>${balanceLabel}</small><strong>${escapeHtml(formatMoney(Math.abs(snapshot.balance), snapshot.currency))}</strong></div>
            </header>
            <div class="passenger-facts">
                <span><small>Oda Tipi</small><b>${escapeHtml(roomPeople ? `${roomPeople} Kişilik` : 'Belirtilmemiş')}</b></span>
                <span><small>Mekke Oda</small><b>${escapeHtml(mekkeRoom || '—')}</b></span>
                <span><small>Medine Oda</small><b>${escapeHtml(medineRoom || '—')}</b></span>
                <span><small>Telefon</small><b>${escapeHtml(passenger.phone || '—')}</b></span>
                <span class="roommates"><small>Oda Arkadaşları</small><b>${escapeHtml(roommates.length ? roommates.join(', ') : 'Henüz belirlenmemiş')}</b></span>
            </div>
            <div class="accounting-totals">
                <span><small>Program Ücreti</small><strong>${escapeHtml(formatMoney(snapshot.agreedPrice, snapshot.currency))}</strong>${snapshot.usesProgramPrice ? '<em>Oda fiyatından otomatik</em>' : '<em>Özel fiyat</em>'}</span>
                <span><small>Toplam Ödeme</small><strong>${escapeHtml(formatMoney(snapshot.paid, snapshot.currency))}</strong></span>
                <span><small>Kalan Bakiye</small><strong>${escapeHtml(formatMoney(snapshot.balance, snapshot.currency))}</strong></span>
            </div>
            <details class="accounting-editor" ${accountingSearchQuery ? 'open' : ''}>
                <summary>Fiyat ve ödeme işlemleri</summary>
                <div class="accounting-editor-grid">
                    <div class="accounting-form-block">
                        <h4>${priceEditorTitle}</h4>
                        <div class="inline-money-form"><input class="account-agreed-price" type="number" min="0" step="0.01" value="${escapeHtml(snapshot.agreedPrice)}" aria-label="Program ücreti"><select class="account-currency" aria-label="Para birimi">${['USD', 'EUR', 'TRY'].map(currency => `<option value="${currency}" ${currency === snapshot.currency ? 'selected' : ''}>${currency}</option>`).join('')}</select><div class="account-price-actions"><button class="btn btn-outline dark" type="button" data-save-account-price>${priceSaveLabel}</button>${priceResetButton}</div></div>
                        <small>${priceHelp}</small>
                    </div>
                    <div class="accounting-form-block payment-form">
                        <h4>Yeni Ödeme Ekle</h4>
                        <div class="payment-fields"><label>Tutar<input class="payment-amount" type="number" min="0.01" step="0.01" placeholder="200"></label><label>Tarih<input class="payment-date" type="date" value="${todayIso()}"></label><label>Ödeme Yöntemi<select class="payment-method"><option>Nakit</option><option>Havale / EFT</option><option>Kredi Kartı</option><option>Diğer</option></select></label><label>Not<input class="payment-note" placeholder="Kapora, ikinci ödeme..."></label></div>
                        <button class="btn btn-gold" type="button" data-add-payment>Ödemeyi Kaydet ve Makbuz Yazdır</button>
                    </div>
                </div>
                <div class="payment-history"><h4>Ödeme Geçmişi</h4>${accountingPaymentHistoryHtml(context, snapshot)}</div>
            </details>
        </article>`;
    }

    function renderAccounting(query = accountingSearchQuery) {
        const results = $('accountingSearchResults');
        if (!results) return;
        // Kullanıcı ad ile soyad arasına boşluk yazarken değeri kırpma; aksi halde
        // her tuşta yeniden çizim son boşluğu siler ve ikinci kelime yazılamaz.
        accountingSearchQuery = String(query || '');
        if ($('accountingSearch') && $('accountingSearch').value !== accountingSearchQuery) $('accountingSearch').value = accountingSearchQuery;
        if ($('globalPassengerSearch') && $('globalPassengerSearch').value !== accountingSearchQuery) $('globalPassengerSearch').value = accountingSearchQuery;
        renderAccountingStats();
        const normalizedQuery = normalizeSearchText(accountingSearchQuery);
        if (normalizedQuery.length < 2) {
            results.innerHTML = '<div class="empty accounting-empty">Aramak için yolcunun adından veya soyadından en az 2 harf yazın.</div>';
            return;
        }
        const matches = allPassengerContexts().filter(context => {
            const searchable = [context.passenger.name, context.passenger.tc, context.passenger.passportNo, context.passenger.phone, context.tour?.title, context.list.title].map(normalizeSearchText).join(' ');
            return searchable.includes(normalizedQuery);
        });
        results.innerHTML = matches.length
            ? `<div class="accounting-result-count"><b>${matches.length}</b> kayıt bulundu</div>${matches.map(accountingResultCard).join('')}`
            : `<div class="empty accounting-empty"><b>“${escapeHtml(accountingSearchQuery)}”</b> için hiçbir programda yolcu bulunamadı.</div>`;
    }

    async function latestAccountingContext(listId, passengerId) {
        const remote = await fetchRemoteData({ admin: true });
        if (remote) {
            state = mergeDefaults(remote);
            await cacheDataLocally(state);
        }
        return getPassengerContext(listId, passengerId);
    }

    async function savePassengerAccountPrice(card) {
        const listId = card.dataset.listId;
        const passengerId = card.dataset.passengerId;
        const amount = Number(card.querySelector('.account-agreed-price')?.value);
        const currency = card.querySelector('.account-currency')?.value || 'TRY';
        if (!Number.isFinite(amount) || amount < 0) { toast('Geçerli bir program ücreti yaz.'); return; }
        const context = await latestAccountingContext(listId, passengerId);
        if (!context) { toast('Yolcu kaydı başka bir kullanıcı tarafından değiştirilmiş. Verileri senkronize et.'); return; }
        context.passenger.accounting = { ...(context.passenger.accounting || {}), agreedPrice: amount, currency, priceSource: 'custom', payments: context.passenger.accounting?.payments || [] };
        const saved = await saveData({ keepLocalAccounting: true });
        if (!saved) return;
        renderAccounting(accountingSearchQuery);
        toast('Yolcu program ücreti kaydedildi.');
    }

    async function resetPassengerAccountPrice(card) {
        const context = await latestAccountingContext(card.dataset.listId, card.dataset.passengerId);
        if (!context) { toast('Yolcu kaydı bulunamadı.'); return; }
        const fallback = passengerTourPrice(context.tour, context.passenger);
        context.passenger.accounting = {
            ...(context.passenger.accounting || {}),
            agreedPrice: fallback.amount,
            currency: fallback.currency,
            priceSource: 'room',
            payments: context.passenger.accounting?.payments || []
        };
        if (!await saveData({ keepLocalAccounting: true })) return;
        renderAccounting(accountingSearchQuery);
        toast('Programdaki oda fiyatı yeniden uygulandı.');
    }

    async function addPassengerPayment(card) {
        const listId = card.dataset.listId;
        const passengerId = card.dataset.passengerId;
        const currentContext = getPassengerContext(listId, passengerId);
        if (!currentContext) return;
        const amount = Number(card.querySelector('.payment-amount')?.value);
        const paidAt = card.querySelector('.payment-date')?.value || todayIso();
        const method = card.querySelector('.payment-method')?.value || 'Nakit';
        const note = card.querySelector('.payment-note')?.value.trim() || '';
        const selectedCurrency = card.querySelector('.account-currency')?.value || 'TRY';
        if (!Number.isFinite(amount) || amount <= 0) { toast('Ödeme tutarı 0’dan büyük olmalı.'); return; }
        const currentSnapshot = passengerAccountSnapshot(currentContext);
        if (!currentSnapshot.agreedPrice) { toast('Önce yolcunun program ücretini kaydet.'); return; }
        const receiptWindow = window.open('', '_blank');
        const context = await latestAccountingContext(listId, passengerId);
        if (!context) { if (receiptWindow) receiptWindow.close(); toast('Yolcu kaydı başka bir kullanıcı tarafından değiştirilmiş. Verileri senkronize et.'); return; }
        const snapshot = passengerAccountSnapshot(context);
        if (!snapshot.agreedPrice) { if (receiptWindow) receiptWindow.close(); toast('Önce yolcunun program ücretini kaydet.'); return; }
        const payment = normalizePayment({ id: uid('pay_'), receiptNo: createReceiptNumber(), amount, paidAt, method, note, receivedBy: currentActor(), createdAt: new Date().toISOString() });
        context.passenger.accounting = {
            agreedPrice: snapshot.agreedPrice,
            currency: selectedCurrency || snapshot.currency,
            priceSource: snapshot.priceSource,
            payments: [...snapshot.payments, payment]
        };
        const saved = await saveData({ keepLocalAccounting: true });
        if (!saved) { if (receiptWindow) receiptWindow.close(); return; }
        renderAccounting();
        const opened = printPaymentReceipt(context.list.id, context.passenger.id, payment.id, receiptWindow);
        toast(opened ? 'Ödeme kaydedildi; makbuz yazdırmaya hazır.' : 'Ödeme kaydedildi; makbuz dosyası indirildi.');
    }

    async function voidPassengerPayment(card, paymentId) {
        const listId = card.dataset.listId;
        const passengerId = card.dataset.passengerId;
        const currentContext = getPassengerContext(listId, passengerId);
        const currentPayment = currentContext?.passenger.accounting?.payments?.find(item => item.id === paymentId);
        if (!currentPayment || currentPayment.voided) return;
        if (!confirm(`${currentPayment.receiptNo} numaralı ${formatMoney(currentPayment.amount, currentContext.passenger.accounting.currency)} ödeme kaydı iptal edilsin mi? Kayıt denetim için geçmişte görünmeye devam eder.`)) return;
        const context = await latestAccountingContext(listId, passengerId);
        const payment = context?.passenger.accounting?.payments?.find(item => item.id === paymentId);
        if (!payment || payment.voided) { renderAccounting(); toast('Bu ödeme kaydı başka bir kullanıcı tarafından zaten değiştirilmiş.'); return; }
        payment.voided = true;
        payment.voidedAt = new Date().toISOString();
        payment.voidedBy = currentActor();
        const saved = await saveData({ keepLocalAccounting: true });
        if (!saved) return;
        renderAccounting();
        toast('Ödeme kaydı iptal edildi.');
    }

    function printPaymentReceipt(listId, passengerId, paymentId, targetWindow) {
        const context = getPassengerContext(listId, passengerId);
        if (!context) { if (targetWindow) targetWindow.close(); return false; }
        const snapshot = passengerAccountSnapshot(context);
        const payment = snapshot.payments.find(item => item.id === paymentId);
        if (!payment) { if (targetWindow) targetWindow.close(); return false; }
        const settings = state.settings || {};
        const roomPeople = context.passenger.roomPeople || context.passenger.room || '';
        const programDate = context.tour?.departureDate || context.list.date || '';
        const company = currentCompany();
        const logoUrl = companyLogoUrl();
        const receiptLogoStyle = IS_DESKTOP_APP
            ? 'width:58mm;height:21mm;object-fit:contain;object-position:left center;background:transparent;border:0;border-radius:0;padding:0'
            : 'width:52mm;height:20mm;object-fit:contain;background:#111;border-radius:4px;padding:3mm';
        const receiptAuditDetails = IS_DESKTOP_APP
            ? `<div class="detail"><small>Kaydı Yapan</small><b>${escapeHtml(actorName(context.passenger.createdBy || context.list.createdBy, 'Eski kayıt'))}</b></div><div class="detail"><small>Tahsilatı Alan</small><b>${escapeHtml(actorName(payment.receivedBy, 'Eski kayıt'))}</b></div>`
            : '';
        const receiptHtml = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${escapeHtml(payment.receiptNo)} Tahsilat Makbuzu</title><style>
            @page{size:A4 portrait;margin:15mm}*{box-sizing:border-box}body{margin:0;background:#eee;color:#17130d;font-family:Arial,sans-serif}.receipt{width:180mm;min-height:125mm;margin:12mm auto;background:#fff;border:2px solid #1b1812;padding:12mm;position:relative}.head{display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:3px solid #b8892d;padding-bottom:9mm}.head img{${receiptLogoStyle}}.title{text-align:right}.title h1{margin:0;font-size:25px}.title p{margin:5px 0 0;color:#756342;font-weight:bold}.receipt-no{display:grid;grid-template-columns:1fr 1fr;gap:8mm;margin:8mm 0}.box{border:1px solid #b8aa91;padding:4mm;border-radius:3px}.box small,.detail small{display:block;color:#756342;font-size:11px;text-transform:uppercase;font-weight:bold;margin-bottom:2mm}.box b{font-size:17px}.details{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #b8aa91}.detail{padding:4mm;border-bottom:1px solid #d6cdbd}.detail:nth-child(odd){border-right:1px solid #d6cdbd}.detail:nth-last-child(-n+2){border-bottom:0}.amount{margin:8mm 0;border:2px solid #b8892d;background:#fff9ec;padding:6mm;display:flex;align-items:center;justify-content:space-between}.amount span{font-size:16px;font-weight:bold}.amount strong{font-size:29px}.note{min-height:16mm;border-bottom:1px solid #b8aa91;padding:3mm 0}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:20mm;margin-top:11mm;text-align:center}.signature{border-top:1px solid #222;padding-top:3mm;font-weight:bold}.footer{position:static;margin-top:10mm;padding-top:3mm;border-top:1px solid #d6cdbd;text-align:center;color:#756342;font-size:9px;line-height:1.5;overflow-wrap:anywhere}.void{position:absolute;inset:42% 15%;transform:rotate(-12deg);border:6px solid #b40000;color:#b40000;font-size:48px;font-weight:bold;text-align:center;padding:8px;opacity:.75}@media print{body{background:#fff}.receipt{margin:0;box-shadow:none}}
        </style></head><body><main class="receipt"><div class="head"><img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(company.name)}"><div class="title"><h1>TAHSİLAT MAKBUZU</h1><p>PAYMENT RECEIPT</p></div></div><div class="receipt-no"><div class="box"><small>Makbuz No</small><b>${escapeHtml(payment.receiptNo)}</b></div><div class="box"><small>Ödeme Tarihi</small><b>${escapeHtml(formatDateDMY(payment.paidAt))}</b></div></div><div class="details"><div class="detail"><small>Yolcu</small><b>${escapeHtml(context.passenger.name)}</b></div><div class="detail"><small>Program</small><b>${escapeHtml(context.tour?.title || context.list.title || '-')}</b></div><div class="detail"><small>Program Tarihi</small><b>${escapeHtml(formatDateTR(programDate) || '-')}</b></div><div class="detail"><small>Oda Tipi</small><b>${escapeHtml(roomPeople ? `${roomPeople} Kişilik Oda` : '-')}</b></div><div class="detail"><small>Ödeme Yöntemi</small><b>${escapeHtml(payment.method || '-')}</b></div><div class="detail"><small>Kalan Bakiye</small><b>${escapeHtml(formatMoney(snapshot.balance, snapshot.currency))}</b></div>${receiptAuditDetails}</div><div class="amount"><span>Tahsil Edilen Tutar</span><strong>${escapeHtml(formatMoney(payment.amount, snapshot.currency))}</strong></div><div class="note"><b>Açıklama:</b> ${escapeHtml(payment.note || 'Program ödemesi')}</div><div class="signatures"><div class="signature">Ödeyen / Yolcu İmzası</div><div class="signature">Kaşe / Yetkili İmza</div></div><div class="footer">${escapeHtml(settings.brand || company.name)} • ${escapeHtml(settings.phone || '')} • ${escapeHtml(settings.address || '')}</div>${payment.voided ? '<div class="void">İPTAL</div>' : ''}</main><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;
        const receiptWindow = targetWindow || window.open('', '_blank');
        if (!receiptWindow) {
            const blob = new Blob([receiptHtml], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${payment.receiptNo}-tahsilat-makbuzu.html`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            return false;
        }
        receiptWindow.document.open();
        receiptWindow.document.write(receiptHtml);
        receiptWindow.document.close();
        return true;
    }

    async function refreshAdminFromServer() {
        const loaded = await loadAuthenticatedAdminData();
        if (!loaded) { toast('Merkezi veriye ulaşılamadı. İnternet bağlantısını kontrol et.'); return; }
        renderAdmin();
        renderAccounting(accountingSearchQuery);
        toast('Tüm bilgisayarlardaki güncel veriler alındı.');
    }

    function safeFileName(value) {
        return String(value || 'oda-listesi').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü]+/gi, '-').replace(/^-+|-+$/g, '');
    }

    async function exportRoomingExcel(id) {
        const list = state.passengerLists.find(item => item.id === id);
        if (!list) return;
        if (!window.ExcelJS) {
            toast('Excel hazırlama bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
            return;
        }

        const tour = state.tours.find(item => item.id === list.tourId) || {};
        const rooms = createRoomAssignments(passengersForList(list));
        const workbook = new window.ExcelJS.Workbook();
        workbook.creator = currentCompany().name;
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Oda Yerleşimi', {
            views: [{ showGridLines: false, state: 'frozen', ySplit: 2 }]
        });
        sheet.pageSetup = {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            paperSize: 9,
            margins: { left: 0.25, right: 0.25, top: 0.4, bottom: 0.4, header: 0.15, footer: 0.15 }
        };
        const rawTitle = String(list.title || tour.title || 'TUR').trim();
        const shortTitle = rawTitle.replace(/\s+\d+\s+Günlük.*$/iu, '').trim() || rawTitle;
        const title = `${shortTitle} ODALAMA YERLEŞKESİ`;
        sheet.getCell('A1').value = currentCompany().shortName.toLocaleUpperCase('tr-TR');
        sheet.getCell('C1').value = title.toLocaleUpperCase('tr-TR');
        sheet.mergeCells('A1:B1');
        sheet.mergeCells('C1:G1');
        sheet.getRow(1).height = 30;
        sheet.getRow(2).values = ['NO', 'İSİM', 'SOY İSİM', 'SAYI', 'ODALAMA', 'MEKKE', 'MEDİNE'];
        sheet.getRow(2).height = 23;

        let rowNumber = 3;
        rooms.forEach(room => {
            const roomStart = rowNumber;
            room.occupants.forEach((passenger, index) => {
                const name = splitPassengerName(passenger.name);
                const mekkeRoomNo = passenger.mekkeRoomNo || passenger.roomNo || room.mekkeRoomNo || '';
                const medineRoomNo = passenger.medineRoomNo || room.medineRoomNo || '';
                sheet.addRow([
                    passenger.sheetNo,
                    name.firstName.toLocaleUpperCase('tr-TR'),
                    name.surname.toLocaleUpperCase('tr-TR'),
                    index === 0 ? room.roomSequence : '',
                    index === 0 ? room.roomingLabel : '',
                    mekkeRoomNo,
                    medineRoomNo
                ]);
                sheet.getRow(rowNumber).height = 19;
                rowNumber += 1;
            });
            const roomEnd = rowNumber - 1;
            if (roomEnd > roomStart) {
                sheet.mergeCells(roomStart, 4, roomEnd, 4);
                sheet.mergeCells(roomStart, 5, roomEnd, 5);
            }
        });

        const thinBorder = {
            top: { style: 'thin', color: { argb: 'FF1F1F1F' } },
            left: { style: 'thin', color: { argb: 'FF1F1F1F' } },
            bottom: { style: 'thin', color: { argb: 'FF1F1F1F' } },
            right: { style: 'thin', color: { argb: 'FF1F1F1F' } }
        };

        sheet.getRow(1).eachCell({ includeEmpty: true }, cell => {
            cell.font = { name: 'Calibri', size: cell.column <= 2 ? 14 : 15, bold: true, color: { argb: 'FF111111' } };
            cell.alignment = { vertical: 'middle', horizontal: cell.column <= 2 ? 'left' : 'center' };
            cell.border = thinBorder;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        });

        sheet.getRow(2).eachCell({ includeEmpty: true }, cell => {
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: cell.column === 6 ? 'FFFFFFFF' : 'FF111111' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = thinBorder;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cell.column === 6 ? 'FF2F2F2F' : cell.column === 7 ? 'FF79D84E' : 'FFE2F0D9' } };
        });

        sheet.eachRow({ includeEmpty: false }, (row, currentRow) => {
            if (currentRow < 3) return;
            row.eachCell({ includeEmpty: true }, cell => {
                const isRoomCell = cell.column === 4 || cell.column === 5;
                cell.font = { name: 'Calibri', size: 11, color: { argb: isRoomCell ? 'FF8B0000' : 'FF111111' }, bold: true };
                cell.alignment = { vertical: 'middle', horizontal: [1, 4, 5, 6, 7].includes(cell.column) ? 'center' : 'left' };
                cell.border = thinBorder;
            });
        });

        [8, 24, 22, 9, 14, 16, 16].forEach((width, index) => {
            sheet.getColumn(index + 1).width = width;
        });
        sheet.printArea = `A1:G${Math.max(2, rowNumber - 1)}`;

        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${safeFileName(list.title)}-odalama.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1500);
            toast('Excel oda listesi .xlsx olarak indirildi.');
        } catch (error) {
            console.error('Excel dosyası hazırlanamadı.', error);
            toast('Excel dosyası hazırlanamadı.');
        }
    }

    async function exportFlightExcel(id) {
        const list = state.passengerLists.find(item => item.id === id);
        if (!list) return;
        if (!window.ExcelJS) {
            toast('Excel hazırlama bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
            return;
        }

        const workbook = new window.ExcelJS.Workbook();
        workbook.creator = currentCompany().name;
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Uçuş Listesi', { views: [{ showGridLines: false, state: 'frozen', ySplit: 5 }] });
        sheet.pageSetup = {
            orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9,
            margins: { left: 0.25, right: 0.25, top: 0.35, bottom: 0.35, header: 0.15, footer: 0.15 }
        };

        const flightDate = getListFlightDate(list);
        const parsedFlightDate = parseLocalDate(flightDate);
        const dateLabel = parsedFlightDate
            ? parsedFlightDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }).toLocaleUpperCase('tr-TR')
            : String(list.title || 'UÇUŞ').toLocaleUpperCase('tr-TR');
        const route = [airportCode(list.originAirport), airportCode(list.destinationAirport)].filter(Boolean).join('-') || '-';

        sheet.mergeCells('A2:G4');
        sheet.getCell('A2').value = `${dateLabel} UÇAK LİSTESİ`;
        sheet.getCell('A2').font = { name: 'Times New Roman', size: 25, bold: true, color: { argb: 'FF000000' } };
        sheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells('H2:I4');
        sheet.getCell('H2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111318' } };

        try {
            const logoResponse = await fetch(companyLogoUrl(), { cache: 'no-store' });
            if (!logoResponse.ok) throw new Error('Logo alınamadı');
            const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
            const logoId = workbook.addImage({ buffer: logoBytes, extension: 'png' });
            sheet.addImage(logoId, { tl: { col: 7.08, row: 1.12 }, ext: { width: 185, height: 72 } });
        } catch (error) {
            sheet.getCell('H2').value = currentCompany().shortName.toLocaleUpperCase('tr-TR');
            sheet.getCell('H2').font = { name: 'Calibri', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
            sheet.getCell('H2').alignment = { horizontal: 'center', vertical: 'middle' };
        }

        const headers = ['NO', 'İSİM', 'SOY İSİM', 'PAS NO', 'BİTİŞ TARİHİ', 'TC NO', 'D.TARİHİ', 'CİNSİYET', 'PARKUR'];
        sheet.getRow(5).values = headers;
        sheet.getRow(5).height = 23;

        const passengers = passengersForList(list);
        passengers.forEach((passenger, index) => {
            const name = splitPassengerName(passenger.name);
            const infant = isPassengerInfant(passenger.birthDate, flightDate);
            const endDate = parseLocalDate(passenger.passportEnd);
            const birthDate = parseLocalDate(passenger.birthDate);
            const row = sheet.addRow([
                index + 1,
                name.firstName.toLocaleUpperCase('tr-TR'),
                name.surname.toLocaleUpperCase('tr-TR'),
                String(passenger.passportNo || '').toLocaleUpperCase('tr-TR'),
                endDate || '',
                String(passenger.tc || ''),
                birthDate || '',
                infant ? 'BEBEK' : String(passenger.gender || '').toLocaleUpperCase('tr-TR'),
                route
            ]);
            row.height = 25;
            row.getCell(4).numFmt = '@';
            row.getCell(6).numFmt = '@';
            row.getCell(5).numFmt = 'dd.mm.yyyy';
            row.getCell(7).numFmt = 'dd.mm.yyyy';
            if (infant) {
                row.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } };
                row.getCell(8).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF7F6000' } };
                row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
            }
        });

        const thinBorder = {
            top: { style: 'thin', color: { argb: 'FF111111' } }, left: { style: 'thin', color: { argb: 'FF111111' } },
            bottom: { style: 'thin', color: { argb: 'FF111111' } }, right: { style: 'thin', color: { argb: 'FF111111' } }
        };
        for (let rowNumber = 2; rowNumber <= Math.max(5, 5 + passengers.length); rowNumber += 1) {
            const row = sheet.getRow(rowNumber);
            row.eachCell({ includeEmpty: true }, cell => { cell.border = thinBorder; });
        }
        sheet.getRow(5).eachCell({ includeEmpty: true }, cell => {
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF385D8A' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = thinBorder;
        });
        for (let rowNumber = 6; rowNumber <= 5 + passengers.length; rowNumber += 1) {
            const row = sheet.getRow(rowNumber);
            row.eachCell({ includeEmpty: true }, cell => {
                if (cell.col === 8 && cell.value === 'BEBEK') return;
                cell.font = { name: 'Calibri', size: 11, bold: cell.col <= 3, color: { argb: 'FF111111' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7FC' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = thinBorder;
            });
        }
        [6, 17, 19, 15, 16, 16, 15, 14, 14].forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
        sheet.printArea = `A2:I${Math.max(5, 5 + passengers.length)}`;

        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${safeFileName(list.title)}-ucus-listesi.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1500);
            toast('Excel uçuş listesi .xlsx olarak indirildi.');
        } catch (error) {
            console.error('Excel uçuş listesi hazırlanamadı.', error);
            toast('Excel uçuş listesi hazırlanamadı.');
        }
    }

    function renderPassengerAdmin() {
        const list = $('passengerListAdmin');
        if (!list) return;
        const openDetailIds = new Set(Array.from(list.querySelectorAll('.passenger-details[open][data-details-list-id]')).map(details => details.dataset.detailsListId));
        if (!state.passengerLists.length) { list.innerHTML = '<p>Henüz kayıtlı yolcu listesi yok.</p>'; return; }

        const groups = [];
        state.tours.forEach(t => {
            const items = state.passengerLists.filter(l => l.tourId === t.id);
            groups.push({ title: t.title, type: t.type === 'umre' ? 'Umre' : t.type === 'hac' ? 'Hac' : 'Yurt İçi', items });
        });

        const noTour = state.passengerLists.filter(l => !state.tours.some(t => t.id === l.tourId));
        if (noTour.length) groups.push({ title: 'Tur seçilmemiş / eski kayıtlar', type: 'Liste', items: noTour });

        list.innerHTML = groups.map(g => `<section class="passenger-group"><div class="passenger-group-head"><h3>${escapeHtml(g.title)}</h3><span>${escapeHtml(g.type)} • ${g.items.length} liste</span></div>${g.items.length ? g.items.map(passengerListCard).join('') : '<div class="empty small">Bu turun altında kayıtlı yolcu listesi yok.</div>'}</section>`).join('');
        openDetailIds.forEach(id => {
            const details = list.querySelector(`.passenger-details[data-details-list-id="${CSS.escape(id)}"]`);
            if (details) details.open = true;
        });
    }

    function printList(id, orientation = 'landscape') {
        const l = state.passengerLists.find(x => x.id === id);
        if (!l) return;
        const tourTitle = (state.tours.find(t => t.id === l.tourId) || {}).title || l.title || '-';

        const total = (l.passengers || []).length;
        const males = (l.passengers || []).filter(p => p.gender === 'Erkek').length;
        const females = (l.passengers || []).filter(p => p.gender === 'Kadın').length;
        const flightDate = getListFlightDate(l);
        const expiringCount = (l.passengers || []).filter(p => isPassportExpiring(p.passportEnd, flightDate)).length;

        const groupsHtml = groupPassengersByRoom(passengersForList(l)).map(group => {
            const capacity = Math.max(1, parseInt(String(group.key || '1').replace('+', ''), 10) || 1);
            const rows = group.items.map((p, i) => {
                const roomBand = Math.floor(i / capacity) % 2 === 0 ? 'room-band-blue' : 'room-band-gold';
                const warningClass = isPassportExpiring(p.passportEnd, flightDate) ? ' passport-print-warning' : '';
                return `<tr class="${roomBand}${warningClass}"><td>${i + 1}</td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.gender)}</td><td>${escapeHtml(p.tc)}</td><td>${escapeHtml(p.phone)}</td><td>${escapeHtml(p.passportNo)}</td><td>${escapeHtml(formatDateDMY(p.birthDate))}</td><td>${escapeHtml(formatDateDMY(p.passportStart))}</td><td>${escapeHtml(formatDateDMY(p.passportEnd))}</td><td>${escapeHtml(p.roomPeople || p.room)}</td><td>${escapeHtml(p.mekkeRoomNo || p.roomNo || '')}</td><td>${escapeHtml(p.medineRoomNo || p.roomNo || '')}</td><td>${escapeHtml(p.note)}</td></tr>`;
            }).join('');
            return `<div class="room-group-block"><h2 class="print-room-title">${escapeHtml(group.title)} (${group.items.length} yolcu)</h2><table><thead><tr><th>No</th><th>Ad Soyad</th><th>Cinsiyet</th><th>TC No</th><th>Telefon</th><th>Pasaport No</th><th>Doğum Tarihi</th><th>Pasaport Başlangıç</th><th>Pasaport Bitiş</th><th>Oda Kişilik</th><th>Mekke</th><th>Medine</th><th>Not</th></tr></thead><tbody>${rows}</tbody></table></div>`;
        }).join('') || '<p>Bu listede yolcu bilgisi yok.</p>';

        const printCss = `
        @page { size: A4 ${orientation}; margin: 8mm; }
        .room-group-block { border: 2px solid #ccc; padding: 10px; margin-bottom: 15px; border-radius: 8px; page-break-inside: avoid; }
        tr.room-band-blue td { background:#dff2ff !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        tr.room-band-gold td { background:#fff1c7 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        tr.passport-print-warning td { color:#d32f2f !important; font-weight:700; }
        .print-room-title { font-size: 16px; margin: 0 0 10px; padding: 5px; background: transparent; border: none; color: inherit; }
        .print-meta { margin: 12px 0; font-size: 14px; line-height: 1.6; }
    `;

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(l.title)} Yolcu Listesi</title><link rel="stylesheet" href="style.css"><style>${printCss}</style></head><body><div class="print-page passenger-print"><div class="print-head"><div><h1>${escapeHtml(l.title)}</h1><div class="print-meta"><b>Firma:</b> ${escapeHtml(currentCompany().name)} &nbsp; <b>Tur:</b> ${escapeHtml(tourTitle)} &nbsp; <b>Uçuş:</b> ${escapeHtml(formatDateTR(flightDate) || '-')} &nbsp; <b>Rehber:</b> ${escapeHtml(l.leader || '-')}<br><b>Toplam Yolcu:</b> ${total} &nbsp; <b>Erkek:</b> ${males} &nbsp; <b>Kadın:</b> ${females} &nbsp; <b style="color:#d32f2f">Uçuşta 6 Aydan Az Pasaport:</b> <span style="color:#d32f2f; font-weight:bold;">${expiringCount}</span></div></div><img src="${escapeHtml(companyLogoUrl())}" alt="${escapeHtml(currentCompany().name)}"></div>${groupsHtml}<div class="print-notes"><b>Liste Notu:</b><br>${escapeHtml(l.notes || '')}</div></div><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;

        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); } else {
            const blob = new Blob([html], { type: 'text/html' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (l.title || 'yolcu-listesi') + '.html'; a.click(); URL.revokeObjectURL(a.href); toast('Popup engellendi. Yazdırma dosyası indirildi.');
        }
    }

    function exportBackup() {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${currentCompanyId}-yedek-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function bindAdminEvents() {
        $('loginBtn').onclick = async () => {
            const password = $('adminPassword').value;
            const username = $('adminUsername')?.value || 'admin';
            const loginResult = IS_DESKTOP_APP ? await validateDesktopLogin(username, password) : { ok: await validateAdminPassword(password) };
            const ok = loginResult.ok;
            if (ok) {
                $('adminPassword').value = '';
                const loaded = await loadAuthenticatedAdminData();
                if (!loaded) {
                    if (IS_DESKTOP_APP) clearDesktopSession(); else sessionStorage.removeItem(adminPasswordKey());
                    alert('Yonetici verileri guvenli sekilde yuklenemedi. Lutfen baglantini kontrol edip tekrar dene.');
                    return;
                }
                adminLoggedIn = true;
                renderAdmin();
                if (isAppOwner()) loadDesktopUsers();
            } else { alert(loginResult.error || 'Şifre hatalı.'); }
        };
        $('adminPassword').addEventListener('keydown', e => { if (e.key === 'Enter') $('loginBtn').click(); });
        if ($('adminUsername')) $('adminUsername').addEventListener('keydown', e => { if (e.key === 'Enter') $('loginBtn').click(); });
        $('logoutBtn').onclick = () => {
            adminLoggedIn = false;
            if (IS_DESKTOP_APP) clearDesktopSession();
            sessionStorage.removeItem(adminPasswordKey());
            sessionStorage.removeItem('turizmAdminPassword');
            sessionStorage.removeItem('hazeynAdminPassword');
            renderAdmin();
        };
        document.querySelectorAll('[data-company-choice]').forEach(button => {
            button.onclick = () => switchCompanyAccount(button.dataset.companyChoice);
        });
        if ($('companySwitcher')) $('companySwitcher').addEventListener('change', event => switchCompanyAccount(event.target.value));
        document.querySelectorAll('.admin-tab').forEach(btn => btn.onclick = () => switchTab(btn.dataset.tab));
        $('exportBtn').onclick = exportBackup;
        if ($('refreshAdminData')) $('refreshAdminData').onclick = refreshAdminFromServer;
        if ($('desktopUserForm')) $('desktopUserForm').addEventListener('submit', saveDesktopUser);
        if ($('desktopUserReset')) $('desktopUserReset').onclick = resetDesktopUserForm;
        const handleAccountingSearch = event => {
            accountingSearchQuery = event.target.value;
            if (event.target.id === 'globalPassengerSearch' && accountingSearchQuery.trim().length >= 2) switchTab('accounting');
            renderAccounting(accountingSearchQuery);
        };
        if ($('accountingSearch')) $('accountingSearch').addEventListener('input', handleAccountingSearch);
        if ($('globalPassengerSearch')) $('globalPassengerSearch').addEventListener('input', handleAccountingSearch);

        $('tourForm').addEventListener('submit', saveTour);
        $('tourReset').onclick = resetTourForm;
        $('tourImageFile').addEventListener('change', e => previewFile(e.target, src => { tempTourImage = src; $('tourPreview').src = src; }));
        $('tourDetailBannerFile').addEventListener('change', e => previewFile(e.target, src => { tempTourDetailBannerImage = src; $('tourDetailBannerPreview').src = src; }));
        $('tourDetailBannerImage').addEventListener('input', e => { if (!tempTourDetailBannerImage) $('tourDetailBannerPreview').src = e.target.value.trim() || tempTourImage || $('tourImage').value.trim(); });
        $('tourSeoGenerate').onclick = () => fillTourSeo(true);
        $('tourHotelMekkeFile').addEventListener('change', e => previewFiles(e.target, srcs => { tempHotelMekkeImages = uniqueList([...tempHotelMekkeImages, ...srcs]); renderMultiPreview('tourHotelMekkePreview', tempHotelMekkeImages); }));
        $('tourHotelMedineFile').addEventListener('change', e => previewFiles(e.target, srcs => { tempHotelMedineImages = uniqueList([...tempHotelMedineImages, ...srcs]); renderMultiPreview('tourHotelMedinePreview', tempHotelMedineImages); }));
        $('tourGroupFile').addEventListener('change', e => previewFiles(e.target, srcs => { tempTourGroupImages = uniqueList([...tempTourGroupImages, ...srcs]); renderMultiPreview('tourGroupPreview', tempTourGroupImages); }));
        ['tourTitle', 'tourDepartureDate', 'tourType'].forEach(id => $(id).addEventListener(id === 'tourType' ? 'change' : 'input', () => syncTourSlugField(false)));
        $('tourSlug').addEventListener('input', e => {
            if (e.target.value.trim()) e.target.dataset.manual = '1';
            else delete e.target.dataset.manual;
        });
        $('tourSlug').addEventListener('blur', e => { e.target.value = slugifyTR(e.target.value); });

        $('reviewForm').addEventListener('submit', saveReview); $('reviewReset').onclick = resetReviewForm;
        $('galleryForm').addEventListener('submit', saveGallery); $('galleryFile').addEventListener('change', e => previewFile(e.target, src => { tempGalleryImage = src; $('galleryPreview').src = src; }));
        $('staffForm').addEventListener('submit', saveStaff); $('staffReset').onclick = resetStaffForm; $('staffFile').addEventListener('change', e => previewFile(e.target, src => { tempStaffImage = src; $('staffPreview').src = src; }));
        $('blogForm').addEventListener('submit', saveBlog); $('blogReset').onclick = resetBlogForm; $('blogFile').addEventListener('change', e => previewFile(e.target, src => { tempBlogImage = src; $('blogPreview').src = src; }));
        $('settingsForm').addEventListener('submit', saveSettings);
        if ($('heroBannerFile')) $('heroBannerFile').addEventListener('change', e => previewFile(e.target, src => { tempHeroBannerImage = src; $('heroBannerPreview').src = src; }));
        if ($('staffBannerFile')) $('staffBannerFile').addEventListener('change', e => previewFile(e.target, src => { tempStaffBannerImage = src; $('staffBannerPreview').src = src; }));
        if ($('blogBannerFile')) $('blogBannerFile').addEventListener('change', e => previewFile(e.target, src => { tempBlogBannerImage = src; $('blogBannerPreview').src = src; }));
        if ($('saveHeroBanner')) $('saveHeroBanner').onclick = saveHeroBanner;
        if ($('resetHeroBanner')) $('resetHeroBanner').onclick = resetHeroBannerForm;

        $('listTourSelect').addEventListener('change', e => {
            const tourId = e.target.value;
            const t = state.tours.find(x => x.id === tourId);
            const savedList = state.passengerLists.find(x => x.tourId === tourId);
            $('listTourId').value = tourId;

            if (savedList) {
                $('listId').value = savedList.id;
                $('listTitle').value = savedList.title || t?.title || '';
                $('listDate').value = savedList.date || t?.departureDate || '';
                $('listLeader').value = savedList.leader || '';
                $('listNotes').value = savedList.notes || '';
                if ($('listOriginAirport')) $('listOriginAirport').value = savedList.originAirport || '';
                if ($('listDestinationAirport')) $('listDestinationAirport').value = savedList.destinationAirport || '';
                $('passengerTable').querySelector('tbody').innerHTML = '';
                (savedList.passengers || []).forEach(passengerRow);
                ensurePassengerRows();
                toast('Bu programa ait kayıtlı yolcular açıldı.');
                return;
            }

            $('listId').value = '';
            $('listLeader').value = '';
            $('listNotes').value = '';
            if ($('listOriginAirport')) $('listOriginAirport').value = 'SAW';
            if ($('listDestinationAirport')) $('listDestinationAirport').value = t && (t.type === 'umre' || t.type === 'hac') ? 'JED' : '';
            $('passengerTable').querySelector('tbody').innerHTML = '';
            passengerRow();
            passengerRow();
            if (t) {
                $('listTitle').value = t.title;
                $('listDate').value = t.departureDate || '';
            }
        });
        ['listOriginAirport', 'listDestinationAirport'].forEach(id => {
            if ($(id)) $(id).addEventListener('input', event => { event.target.value = airportCode(event.target.value); });
        });
        $('addPassengerRow').onclick = () => passengerRow();
        $('savePassengerList').onclick = savePassengerList;
        $('clearPassengerList').onclick = clearPassengerForm;
        $('passengerTable').addEventListener('click', e => { if (e.target.classList.contains('remove-row')) { e.target.closest('tr').remove(); ensurePassengerRows(); } });
        $('passengerTable').addEventListener('change', e => { if (IS_DESKTOP_APP && e.target.classList.contains('p-room-people')) syncPassengerRowPrice(e.target.closest('tr'), true); });

        document.addEventListener('dragstart', (e) => {
            const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item');
            if (bannerItem) { dragHeroBannerInfo = { id: bannerItem.dataset.heroBannerId }; bannerItem.classList.add('dragging'); if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', JSON.stringify(dragHeroBannerInfo)); } return; }
            const row = e.target.closest && e.target.closest('.passenger-order-row');
            if (!row) return;
            if (surnameSortedLists.has(row.dataset.listId)) { e.preventDefault(); toast('Manuel taşıma için önce “Manuel Sıraya Dön” düğmesine bas.'); return; }
            dragPassengerInfo = { listId: row.dataset.listId, index: Number(row.dataset.passengerIndex) }; row.classList.add('dragging'); if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', JSON.stringify(dragPassengerInfo)); }
        });

        document.addEventListener('dragover', (e) => {
            const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item');
            if (bannerItem && dragHeroBannerInfo) { e.preventDefault(); bannerItem.classList.add('drag-over'); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; return; }
            const row = e.target.closest && e.target.closest('.passenger-order-row');
            if (!row || !dragPassengerInfo || row.dataset.listId !== dragPassengerInfo.listId) return;
            e.preventDefault(); row.classList.add('drag-over'); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        });

        document.addEventListener('dragleave', (e) => {
            const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item'); if (bannerItem) bannerItem.classList.remove('drag-over');
            const row = e.target.closest && e.target.closest('.passenger-order-row'); if (row) row.classList.remove('drag-over');
        });

        document.addEventListener('drop', async (e) => {
            const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item');
            if (bannerItem && dragHeroBannerInfo) { e.preventDefault(); bannerItem.classList.remove('drag-over'); const changed = reorderHeroBanner(dragHeroBannerInfo.id, bannerItem.dataset.heroBannerId); dragHeroBannerInfo = null; if (changed) { if (!await saveData()) return; renderHeroBannerAdmin(); applySettings(); toast('Banner sırası güncellendi.'); } return; }
            const row = e.target.closest && e.target.closest('.passenger-order-row');
            if (!row || !dragPassengerInfo || row.dataset.listId !== dragPassengerInfo.listId) return;
            e.preventDefault(); row.classList.remove('drag-over'); reorderPassenger(dragPassengerInfo.listId, dragPassengerInfo.index, Number(row.dataset.passengerIndex)); dragPassengerInfo = null; if (!await saveData()) return; renderPassengerAdmin(); toast('Yolcu sırası güncellendi.');
        });

        document.addEventListener('dragend', () => {
            dragPassengerInfo = null; dragHeroBannerInfo = null;
            document.querySelectorAll('.passenger-order-row.dragging,.passenger-order-row.drag-over,.hero-banner-admin-item.dragging,.hero-banner-admin-item.drag-over').forEach(el => el.classList.remove('dragging', 'drag-over'));
        });

        document.addEventListener('change', async (e) => {
            const roomNo = e.target.closest && e.target.closest('[data-room-no-index]');
            if (roomNo) { await updatePassengerRoomField(roomNo.dataset.listId, Number(roomNo.dataset.roomNoIndex), roomNo.dataset.roomField || 'roomNo', roomNo.value.trim()); return; }
            const roomPeople = e.target.closest && e.target.closest('[data-room-people-index]');
            if (roomPeople) { await updatePassengerRoomField(roomPeople.dataset.listId, Number(roomPeople.dataset.roomPeopleIndex), 'roomPeople', roomPeople.value); }
        });

        document.addEventListener('click', async (e) => {
            const openDebtor = e.target.closest && e.target.closest('[data-open-debtor]');
            if (openDebtor) {
                const debtorName = String(openDebtor.dataset.debtorName || '').trim();
                accountingSearchQuery = debtorName;
                renderAccounting(debtorName);
                setTimeout(() => {
                    const card = document.querySelector(`[data-account-card][data-list-id="${CSS.escape(openDebtor.dataset.debtorList || '')}"][data-passenger-id="${CSS.escape(openDebtor.dataset.openDebtor || '')}"]`);
                    if (card) { card.querySelector('details')?.setAttribute('open', ''); card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                }, 0);
                return;
            }
            const accountingCard = e.target.closest && e.target.closest('[data-account-card]');
            const saveAccountPrice = e.target.closest && e.target.closest('[data-save-account-price]');
            if (saveAccountPrice && accountingCard) { await savePassengerAccountPrice(accountingCard); return; }
            const resetAccountPrice = e.target.closest && e.target.closest('[data-reset-account-price]');
            if (resetAccountPrice && accountingCard) { await resetPassengerAccountPrice(accountingCard); return; }
            const addPayment = e.target.closest && e.target.closest('[data-add-payment]');
            if (addPayment && accountingCard) { await addPassengerPayment(accountingCard); return; }
            const printReceipt = e.target.closest && e.target.closest('[data-print-receipt]');
            if (printReceipt && accountingCard) {
                const opened = printPaymentReceipt(accountingCard.dataset.listId, accountingCard.dataset.passengerId, printReceipt.dataset.printReceipt);
                if (!opened) toast('Makbuz dosyası indirildi; açıp yazdırabilirsin.');
                return;
            }
            const voidPayment = e.target.closest && e.target.closest('[data-void-payment]');
            if (voidPayment && accountingCard) { await voidPassengerPayment(accountingCard, voidPayment.dataset.voidPayment); return; }

            const editDesktopUserButton = e.target.closest && e.target.closest('[data-edit-desktop-user]');
            if (editDesktopUserButton) { editDesktopUser(editDesktopUserButton.dataset.editDesktopUser); return; }
            const deleteDesktopUserButton = e.target.closest && e.target.closest('[data-delete-desktop-user]');
            if (deleteDesktopUserButton && confirm('Bu çalışan kullanıcısı silinsin mi?')) {
                try { await desktopApi('delete-user', { method: 'POST', body: { id: deleteDesktopUserButton.dataset.deleteDesktopUser } }); await loadDesktopUsers(); toast('Çalışan kullanıcısı silindi.'); }
                catch (error) { toast(error.message || 'Kullanıcı silinemedi.'); }
                return;
            }

            const delTour = e.target.closest('[data-delete-tour]');
            if (delTour) {
                const tourId = delTour.dataset.deleteTour;
                const foundTour = state.tours.find(x => x.id === tourId);
                if (foundTour && normalizedTourStatus(foundTour) === 'draft' && confirm('Taslak program silinsin mi?')) {
                    state.tours = state.tours.filter(x => x.id !== tourId);
                    if (!await saveData()) return; renderTourAdmin(); renderPassengerTourSelect(); renderDashboard(); toast('Taslak silindi.');
                } else if (foundTour && normalizedTourStatus(foundTour) !== 'draft' && confirm('Program sona ermiş olarak arşivlensin mi? Sayfası ve Google bağlantısı korunacaktır.')) {
                    foundTour.status = 'completed';
                    if (!await saveData()) return; renderTourAdmin(); renderPassengerTourSelect(); renderDashboard(); toast('Program arşivlendi; sayfası korunuyor.');
                }
            }
            const editTourBtn = e.target.closest('[data-edit-tour]'); if (editTourBtn) editTour(editTourBtn.dataset.editTour);

            const delReview = e.target.closest('[data-delete-review]');
            if (delReview && confirm('Yorum silinsin mi?')) { state.reviews = state.reviews.filter(x => x.id !== delReview.dataset.deleteReview); if (!await saveData()) return; renderReviewAdmin(); renderDashboard(); toast('Yorum silindi.'); }
            const editReviewBtn = e.target.closest('[data-edit-review]'); if (editReviewBtn) editReview(editReviewBtn.dataset.editReview);

            const delGallery = e.target.closest('[data-delete-gallery]');
            if (delGallery && confirm('Görsel silinsin mi?')) { state.gallery = state.gallery.filter(x => x.id !== delGallery.dataset.deleteGallery); if (!await saveData()) return; renderGalleryAdmin(); renderDashboard(); toast('Görsel silindi.'); }

            const editStaffBtn = e.target.closest('[data-edit-staff]'); if (editStaffBtn) editStaff(editStaffBtn.dataset.editStaff);
            const delStaff = e.target.closest('[data-delete-staff]');
            if (delStaff && confirm('Ekip üyesi silinsin mi?')) { state.staff = (state.staff || []).filter(x => x.id !== delStaff.dataset.deleteStaff); if (!await saveData()) return; renderStaffAdmin(); renderDashboard(); toast('Kadro silindi.'); }

            const editBlogBtn = e.target.closest('[data-edit-blog]'); if (editBlogBtn) editBlog(editBlogBtn.dataset.editBlog);
            const delBlog = e.target.closest('[data-delete-blog]');
            if (delBlog && confirm('Yazı silinsin mi?')) { state.blogs = (state.blogs || []).filter(x => x.id !== delBlog.dataset.deleteBlog); if (!await saveData()) return; renderBlogAdmin(); renderDashboard(); toast('Yazı silindi.'); }

            const editHeroBannerBtn = e.target.closest('[data-edit-hero-banner]'); if (editHeroBannerBtn) editHeroBanner(editHeroBannerBtn.dataset.editHeroBanner);
            const delHeroBanner = e.target.closest('[data-delete-hero-banner]');
            if (delHeroBanner && confirm('Banner silinsin mi?')) { state.settings.heroBanners = (state.settings.heroBanners || []).filter(x => x.id !== delHeroBanner.dataset.deleteHeroBanner); if (!await saveData()) return; renderHeroBannerAdmin(); applySettings(); toast('Banner silindi.'); }

            const editList = e.target.closest('[data-edit-list]'); if (editList) editPassengerList(editList.dataset.editList);
            const surnameToggle = e.target.closest('[data-surname-toggle]');
            if (surnameToggle) {
                const listId = surnameToggle.dataset.surnameToggle;
                if (surnameSortedLists.has(listId)) surnameSortedLists.delete(listId); else surnameSortedLists.add(listId);
                renderPassengerAdmin();
                toast(surnameSortedLists.has(listId) ? 'Aynı soyadlı yolcular geçici olarak yan yana gösteriliyor.' : 'Manuel yolcu sırasına dönüldü.');
            }

            // YAZDIRMA YÖNETİMİ
            const printListBtn = e.target.closest('[data-print-list]');
            if (printListBtn) printList(printListBtn.dataset.printList, printListBtn.dataset.ori);
            const excelListBtn = e.target.closest('[data-excel-list]');
            if (excelListBtn) exportRoomingExcel(excelListBtn.dataset.excelList);
            const flightExcelBtn = e.target.closest('[data-flight-excel-list]');
            if (flightExcelBtn) exportFlightExcel(flightExcelBtn.dataset.flightExcelList);

            const delList = e.target.closest('[data-delete-list]');
            if (delList && confirm('Yolcu listesi silinsin mi?')) { surnameSortedLists.delete(delList.dataset.deleteList); state.passengerLists = state.passengerLists.filter(x => x.id !== delList.dataset.deleteList); if (!await saveData()) return; renderPassengerAdmin(); renderDashboard(); toast('Liste silindi.'); }
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        // Admin girişini uzak veri yüklemesine bağlama. Supabase yavaşlasa veya
        // geçici olarak cevap vermese bile şifre alanı ve giriş düğmesi çalışsın.
        if (page === 'admin') {
            localStorage.setItem('turizmLastCompany', currentCompanyId);
            updateCompanyBranding();
            bindAdminEvents();
            if (IS_DESKTOP_APP && await restoreDesktopSession()) {
                adminLoggedIn = await loadAuthenticatedAdminData();
                if (!adminLoggedIn) clearDesktopSession();
                if (adminLoggedIn && isAppOwner()) loadDesktopUsers();
            }
            renderAdmin();
        }

        state = state || await loadData();
        if (page === 'public') {
            renderPublic();
            window.addEventListener('focus', refreshPublicData);
            window.addEventListener('pageshow', refreshPublicData);
            window.addEventListener('storage', event => { if (event.key === 'hazeynData') refreshPublicData(); });
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshPublicData(); });
            window.setInterval(refreshPublicData, 30000);
        }
        if (page === 'admin') renderAdmin();
    });

})();
