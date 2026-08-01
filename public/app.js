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
            address: 'Ümraniye / İstanbul',
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
            adminPassword: 'Hazeyn_2026_!x9'
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

    let state = null;
    let adminLoggedIn = false;
    let tempTourImage = '';
    let tempHotelMekkeImages = [];
    let tempHotelMedineImages = [];
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
    const surnameSortedLists = new Set();

    const page = document.body.dataset.page;
    const $ = (id) => document.getElementById(id);

    function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
    function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

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
        return sessionStorage.getItem('hazeynAdminPassword') || '';
    }

    async function validateAdminPassword(password) {
        if (location.protocol !== 'file:') {
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                if (res.ok) {
                    sessionStorage.setItem('hazeynAdminPassword', password);
                    return true;
                }
                if (res.status !== 404 && res.status !== 405) return false;
            } catch (e) {
                console.warn('Sunucu şifre kontrolü yapılamadı, yerel kontrol deneniyor.', e);
            }
        }
        const ok = password === (state.settings.adminPassword || '1234');
        if (ok) sessionStorage.setItem('hazeynAdminPassword', password);
        return ok;
    }

    async function getUploadConfig() {
        if (getUploadConfig.cache) return getUploadConfig.cache;
        if (location.protocol === 'file:') return null;
        try {
            const res = await fetch('/api/data?action=upload-config', { cache: 'no-store' });
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
        const password = getAdminPassword();
        if (!password) return null;

        if (location.protocol !== 'file:') {
            try {
                const prepared = await prepareImageBlob(file);
                const direct = await fetch('/api/media-upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': prepared.type || 'image/jpeg',
                        'x-admin-password': password,
                        'x-file-name': file.name || 'image.jpg',
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

        const signed = await fetch('/api/data?action=signed-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
            body: JSON.stringify({ filename: file.name, type: file.type, size: file.size, folder: folder || 'uploads' })
        });
        if (!signed.ok) throw new Error('Yükleme izni alınamadı. Admin şifreni tekrar gir.');

        const info = await signed.json();
        const client = window.supabase.createClient(cfg.url, cfg.anonKey);

        const { error } = await client.storage.from(info.bucket || cfg.bucket).uploadToSignedUrl(info.path, info.token, file, { contentType: file.type || 'image/jpeg' });
        if (error) throw error;

        const pub = client.storage.from(info.bucket || cfg.bucket).getPublicUrl(info.path);
        return pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : null;
    }

    function prepareImageBlob(file) {
        if (!file || !String(file.type || '').startsWith('image/') || file.size <= 1400 * 1024) {
            return Promise.resolve(file);
        }
        return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                const maxSide = 1600;
                const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
                const width = Math.max(1, Math.round(image.naturalWidth * scale));
                const height = Math.max(1, Math.round(image.naturalHeight * scale));
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                URL.revokeObjectURL(objectUrl);
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Görsel hazırlanamadı.')), 'image/jpeg', 0.78);
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
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                URL.revokeObjectURL(objectUrl);
                resolve(canvas.toDataURL('image/jpeg', 0.84));
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
        let score = Number(data._meta && data._meta.updatedAt ? data._meta.updatedAt : 0);
        if (Array.isArray(data.passengerLists) && data.passengerLists.length) score += 500000000000;
        if (Array.isArray(data.tours) && JSON.stringify(data.tours) !== JSON.stringify(DEFAULT_DATA.tours)) score += 400000000000;
        if (Array.isArray(data.reviews) && JSON.stringify(data.reviews) !== JSON.stringify(DEFAULT_DATA.reviews)) score += 200000000000;
        if (Array.isArray(data.gallery) && JSON.stringify(data.gallery) !== JSON.stringify(DEFAULT_DATA.gallery)) score += 100000000000;
        if (Array.isArray(data.staff) && data.staff.length) score += 50000000000;
        if (Array.isArray(data.blogs) && data.blogs.length) score += 25000000000;
        return score;
    }

    function chooseBestData(items) {
        const valid = items.filter(Boolean).map(mergeDefaults);
        if (!valid.length) return clone(DEFAULT_DATA);
        valid.sort((a, b) => dataScore(b) - dataScore(a));
        return valid[0];
    }

    async function fetchRemoteData() {
        if (location.protocol === 'file:') return null;
        try {
            const res = await fetch(`/api/data?ts=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async function cacheDataLocally(data) {
        await idbSet('hazeynData', data);
        try { localStorage.setItem('hazeynData', JSON.stringify(data)); } catch (e) { }
    }

    async function loadData() {
        const local = parseJson(localStorage.getItem('hazeynData'));
        const indexed = await idbGet('hazeynData');
        const remote = await fetchRemoteData();

        // Zaman damgası olan sunucu kaydı cihazlar arasında tek doğru kaynaktır.
        // Eski, boş sunucu kaydı varsa yalnızca gerçekten kaydedilmiş yerel yönetim
        // verisini koru; tarayıcının eski örnek verisi yeni site içeriğini ezmesin.
        const remoteStamp = Number(remote?._meta?.updatedAt || 0);
        const bestLocal = chooseBestData([indexed, local]);
        const localStamp = Number(bestLocal?._meta?.updatedAt || 0);
        const selected = remoteStamp > 0
            ? mergeDefaults(remote)
            : localStamp > 0
                ? chooseBestData([remote, bestLocal])
                : mergeDefaults(remote || bestLocal);
        await cacheDataLocally(selected);

        return selected;
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
        const d = clone(DEFAULT_DATA);
        data = data || {};
        return {
            _meta: { ...d._meta, ...(data._meta || {}) },
            settings: { ...d.settings, ...(data.settings || {}) },
            tours: Array.isArray(data.tours) ? data.tours : d.tours,
            reviews: Array.isArray(data.reviews) ? data.reviews : d.reviews,
            gallery: Array.isArray(data.gallery) ? data.gallery : d.gallery,
            staff: Array.isArray(data.staff) ? data.staff : d.staff,
            blogs: Array.isArray(data.blogs) ? data.blogs : d.blogs,
            passengerLists: Array.isArray(data.passengerLists) ? data.passengerLists : []
        };
    }

    async function saveData() {
        state._meta = { ...(state._meta || {}), updatedAt: Date.now() };
        await idbSet('hazeynData', state);
        try { localStorage.setItem('hazeynData', JSON.stringify(state)); } catch (e) {
            console.warn('Tarayıcı localStorage kotası dolu olabilir. IndexedDB kaydı kullanıldı.', e);
        }

        if (location.protocol !== 'file:') {
            try {
                const password = getAdminPassword();
                const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(state) });
                if (!res.ok) throw new Error('Sunucu kaydı başarısız');
            } catch (e) {
                console.warn('Sunucu kaydı yapılamadı; IndexedDB kaydı kullanıldı.', e);
            }
        }
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

    function applySettings() {
        const s = state.settings;
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
        const departure = formatDateTR(t.departureDate);
        const cardText = String(t.cardText || '').trim() || pricePreview(t);
        return `<article class="tour-card reveal">
        <div class="tour-img"><img src="${escapeHtml(t.image || 'assets/hotel.svg')}" alt="${escapeHtml(t.title)}" onerror="this.src='assets/hotel.svg'"><span class="tour-tag">${escapeHtml(t.tag || 'Program')}</span></div>
        <div class="tour-body">
            <h3>${escapeHtml(t.title)}</h3>
            <div class="tour-meta"><span>◷ ${escapeHtml(t.nights || '')}</span><span>✈ ${escapeHtml(t.airline || '')}</span>${departure ? `<span>📅 ${escapeHtml(departure)}</span>` : ''}</div>
            <div class="tour-hotels">${escapeHtml(t.hotels || '')}</div>
            <div class="tour-bottom"><span class="price">${escapeHtml(cardText)}</span><button class="small-btn" data-tour="${escapeHtml(t.id)}">İncele</button></div>
        </div>
    </article>`;
    }

    function renderTourGroup(type, targetId, limit) {
        const target = $(targetId);
        if (!target) return;
        const list = state.tours.filter(t => t.type === type).slice(0, limit || 50);
        target.innerHTML = list.map(tourCard).join('');
        const optionalGroup = target.closest('.optional-tour-group');
        if (optionalGroup) optionalGroup.hidden = list.length === 0;
        const extraTours = $('extraToursSection');
        if (extraTours) {
            const visibleCount = ['hac', 'yurtici'].filter(groupType => state.tours.some(t => t.type === groupType)).length;
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
        const cards = list.map((g, i) => `<figure class="gallery-item reveal" data-gallery-index="${i}" tabindex="0" role="button" aria-label="${escapeHtml(g.title)} görselini büyüt"><img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.title)}" onerror="this.src='assets/hero.svg'"><span>${escapeHtml(g.title)}</span></figure>`).join('');
        target.innerHTML = `<div class="gallery-track">${cards}${cards}</div>`;
    }

    function renderStaff() {
        const target = $('staffGrid');
        if (!target) return;
        const list = state.staff && state.staff.length ? state.staff : DEFAULT_DATA.staff;
        target.innerHTML = list.map(s => `<article class="staff-card reveal"><div class="staff-photo"><img src="${escapeHtml(s.image || 'assets/icon.png')}" alt="${escapeHtml(s.name)}" onerror="this.src='assets/icon.png'"></div><div><span>${escapeHtml(s.role || 'Hâzeyn Ekibi')}</span><h3>${escapeHtml(s.name || '')}</h3><p>${escapeHtml(s.bio || '')}</p></div></article>`).join('');
    }

    function renderBlogs() {
        const target = $('blogGrid');
        if (!target) return;
        const list = state.blogs && state.blogs.length ? state.blogs : DEFAULT_DATA.blogs;
        target.innerHTML = list.map(b => `<article class="blog-card reveal" data-blog="${escapeHtml(b.id)}" tabindex="0" role="button"><span>${escapeHtml(b.category || 'Merak Edilenler')}</span><h3>${escapeHtml(b.title || '')}</h3><p>${escapeHtml(b.summary || firstLine(b.content) || '')}</p><button class="text-btn" type="button">Devamını Oku →</button></article>`).join('');
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
        const maxHeight = Math.min(window.innerHeight * 0.88, 860);
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
                    heroBg.style.setProperty('--hero-drag-x', '0px');
                    return;
                }
                const target = step > 0 ? -hero.clientWidth : hero.clientWidth;
                heroBg.style.setProperty('--hero-drag-x', `${target}px`);
                setTimeout(() => {
                    heroBg.classList.add('no-transition');
                    showHeroBanner(heroSlideIndex + step);
                    heroBg.style.setProperty('--hero-drag-x', '0px');
                    requestAnimationFrame(() => requestAnimationFrame(() => heroBg.classList.remove('no-transition')));
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

    function renderAdmin() {
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
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
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

    function linesToList(value) {
        return uniqueList(String(value || '').split(/\n+/));
    }

    function renderMultiPreview(id, images) {
        const el = $(id);
        if (!el) return;
        const list = uniqueList(images);
        el.innerHTML = list.length ? list.map((src, i) => `<figure><img src="${escapeHtml(src)}" alt="Otel görseli ${i + 1}" onerror="this.closest('figure').style.display='none'"><figcaption>${i + 1}</figcaption></figure>`).join('') : '<span>Henüz görsel yok</span>';
    }

    function hotelGalleryHtml(t) {
        const h = getHotelImageArrays(t);
        const blocks = [];
        h.mekke.forEach((src, i) => blocks.push({ src, title: h.mekke.length > 1 ? `Mekke Oteli ${i + 1}` : 'Mekke Oteli' }));
        h.medine.forEach((src, i) => blocks.push({ src, title: h.medine.length > 1 ? `Medine Oteli ${i + 1}` : 'Medine Oteli' }));
        if (!blocks.length) return '';
        return `<div class="hotel-modal-gallery"><h3>Otel Görselleri</h3><div>${blocks.map(b => `<figure><img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.title)}" onerror="this.closest('figure').style.display='none'"><figcaption>${escapeHtml(b.title)}</figcaption></figure>`).join('')}</div></div>`;
    }

    function resetTourForm() {
        $('tourForm').reset();
        $('tourId').value = '';
        tempTourImage = '';
        tempHotelMekkeImages = [];
        tempHotelMedineImages = [];
        const coverPreview = $('tourPreview');
        if (coverPreview) coverPreview.removeAttribute('src');
        renderMultiPreview('tourHotelMekkePreview', []);
        renderMultiPreview('tourHotelMedinePreview', []);
    }

    function renderTourAdmin() {
        const list = $('tourAdminList');
        if (!list) return;
        list.innerHTML = state.tours.map(t => `<div class="admin-item">
        <div><h3>${escapeHtml(t.title)} <small>(${escapeHtml(t.type === 'umre' ? 'Umre' : t.type === 'hac' ? 'Hac' : 'Yurt İçi')})</small></h3><p>${t.departureDate ? 'Kalkış: ' + escapeHtml(formatDateTR(t.departureDate)) + '\n' : ''}${escapeHtml(t.nights || '')}\n${escapeHtml(firstLine(t.hotels))}\n${escapeHtml(String(t.cardText || '').trim() || pricePreview(t))}</p></div>
        <div class="admin-item-actions"><button class="icon-btn" data-edit-tour="${escapeHtml(t.id)}">Düzenle</button><button class="icon-btn danger" data-delete-tour="${escapeHtml(t.id)}">Sil</button></div>
    </div>`).join('');
    }

    function editTour(id) {
        const t = state.tours.find(x => x.id === id);
        if (!t) return;
        switchTab('tours');
        $('tourId').value = t.id; $('tourType').value = t.type; $('tourTitle').value = t.title || ''; $('tourTag').value = t.tag || '';
        $('tourImage').value = (t.image && !t.image.startsWith('data:')) ? t.image : '';
        tempTourImage = t.image || '';
        const hotelImages = getHotelImageArrays(t);
        tempHotelMekkeImages = hotelImages.mekke.slice(); tempHotelMedineImages = hotelImages.medine.slice();
        $('tourHotelMekkeImage').value = hotelImages.mekke.filter(src => !src.startsWith('data:')).join('\n');
        $('tourHotelMedineImage').value = hotelImages.medine.filter(src => !src.startsWith('data:')).join('\n');
        $('tourDepartureDate').value = t.departureDate || '';
        if ($('tourCardText')) $('tourCardText').value = t.cardText || '';
        const roomPrices = getRoomPrices(t);
        $('tourPrice1').value = roomPrices['1']; $('tourPrice2').value = roomPrices['2']; $('tourPrice3').value = roomPrices['3']; $('tourPrice4').value = roomPrices['4']; $('tourPrice5plus').value = roomPrices['5+'];
        $('tourNights').value = t.nights || ''; $('tourHotels').value = t.hotels || ''; $('tourAirline').value = t.airline || ''; $('tourPrice').value = t.price || ''; $('tourProgram').value = t.program || '';
        $('tourPreview').src = t.image || '';
        renderMultiPreview('tourHotelMekkePreview', hotelImages.mekke);
        renderMultiPreview('tourHotelMedinePreview', hotelImages.medine);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function saveTour(e) {
        e.preventDefault();
        const id = $('tourId').value || uid('t');
        const image = tempTourImage || $('tourImage').value.trim() || ($('tourType').value === 'yurtici' ? 'assets/yurtici.svg' : 'assets/hotel.svg');
        const hotelImages = { mekke: uniqueList([...tempHotelMekkeImages, ...linesToList($('tourHotelMekkeImage')?.value)]), medine: uniqueList([...tempHotelMedineImages, ...linesToList($('tourHotelMedineImage')?.value)]) };
        const roomPrices = cleanRoomPrices({ '1': $('tourPrice1').value, '2': $('tourPrice2').value, '3': $('tourPrice3').value, '4': $('tourPrice4').value, '5+': $('tourPrice5plus').value });

        const t = { id, type: $('tourType').value, title: $('tourTitle').value.trim(), tag: $('tourTag').value.trim(), departureDate: $('tourDepartureDate').value, cardText: $('tourCardText') ? $('tourCardText').value.trim() : '', image, hotelImages, roomPrices, nights: $('tourNights').value.trim(), hotels: $('tourHotels').value.trim(), airline: $('tourAirline').value.trim(), price: $('tourPrice').value.trim(), program: $('tourProgram').value.trim() };

        const idx = state.tours.findIndex(x => x.id === id);
        if (idx > -1) state.tours[idx] = t; else state.tours.unshift(t);
        await saveData(); resetTourForm(); renderTourAdmin(); renderPassengerTourSelect(); renderDashboard(); toast('Tur kaydedildi.');
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
        await saveData(); resetReviewForm(); renderReviewAdmin(); renderDashboard(); toast('Yorum kaydedildi.');
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
        await saveData(); $('galleryForm').reset(); tempGalleryImage = ''; $('galleryPreview').removeAttribute('src'); renderGalleryAdmin(); renderDashboard(); toast('Galeri görseli eklendi.');
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
        await saveData(); resetStaffForm(); renderStaffAdmin(); renderDashboard(); toast('Kadro kaydedildi.');
    }

    function resetBlogForm() { $('blogForm').reset(); $('blogId').value = ''; tempBlogImage = ''; const p = $('blogPreview'); if (p) p.removeAttribute('src'); }
    function renderBlogAdmin() {
        const list = $('blogAdminList');
        if (!list) return;
        list.innerHTML = (state.blogs || []).map(b => `<div class="admin-item"><div><h3>${escapeHtml(b.title)} <small>${escapeHtml(b.category || 'Merak Edilenler')}</small></h3><p>${escapeHtml(b.summary || firstLine(b.content) || '')}</p></div><div class="admin-item-actions"><button class="icon-btn" data-edit-blog="${escapeHtml(b.id)}">Düzenle</button><button class="icon-btn danger" data-delete-blog="${escapeHtml(b.id)}">Sil</button></div></div>`).join('') || '<p>Henüz yazı eklenmedi.</p>';
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
        const item = { id, category: $('blogCategory').value.trim(), title: $('blogTitle').value.trim(), summary: $('blogSummary').value.trim(), image: tempBlogImage || $('blogImage').value.trim(), content: $('blogContent').value.trim() };
        if (!Array.isArray(state.blogs)) state.blogs = [];
        const idx = state.blogs.findIndex(x => x.id === id);
        if (idx > -1) state.blogs[idx] = item; else state.blogs.unshift(item);
        await saveData(); resetBlogForm(); renderBlogAdmin(); renderDashboard(); toast('Merak edilenler yazısı kaydedildi.');
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

        await saveData(); resetHeroBannerForm(); renderHeroBannerAdmin(); applySettings(); toast('Banner kaydedildi.');
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
        $('setAdminPassword').value = s.adminPassword || '1234';
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
            adminPassword: $('setAdminPassword').value.trim() || '1234'
        };
        await saveData(); toast('Ayarlar kaydedildi.');
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
        <td><input class="p-mekke-room-no" value="${escapeHtml(p.mekkeRoomNo || p.roomNo || '')}" placeholder="Örn: M-305"></td>
        <td><input class="p-medine-room-no" value="${escapeHtml(p.medineRoomNo || p.roomNo || '')}" placeholder="Örn: D-214"></td>
        <td><input class="p-note" value="${escapeHtml(p.note || '')}" placeholder="Not"></td>
        <td><button type="button" class="icon-btn danger remove-row">Sil</button></td>`;
        $('passengerTable').querySelector('tbody').appendChild(tr);
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
        return Array.from($('passengerTable').querySelectorAll('tbody tr')).map(tr => ({
            name: tr.querySelector('.p-name').value.trim(),
            gender: tr.querySelector('.p-gender').value.trim(),
            tc: tr.querySelector('.p-tc').value.trim(),
            phone: tr.querySelector('.p-phone').value.trim(),
            passportNo: tr.querySelector('.p-passport').value.trim(),
            birthDate: tr.querySelector('.p-birth').value,
            passportStart: tr.querySelector('.p-pass-start').value,
            passportEnd: tr.querySelector('.p-pass-end').value,
            roomPeople: tr.querySelector('.p-room-people').value,
            mekkeRoomNo: tr.querySelector('.p-mekke-room-no')?.value.trim() || '',
            medineRoomNo: tr.querySelector('.p-medine-room-no')?.value.trim() || '',
            note: tr.querySelector('.p-note').value.trim()
        })).filter(p => p.name || p.gender || p.tc || p.phone || p.passportNo || p.birthDate || p.passportStart || p.passportEnd || p.roomPeople || p.mekkeRoomNo || p.medineRoomNo || p.note);
    }

    async function savePassengerList() {
        const passengers = readPassengers();
        const tourId = $('listTourSelect').value || $('listTourId').value || '';
        const selectedTour = state.tours.find(t => t.id === tourId);
        if (selectedTour && !$('listTitle').value.trim()) $('listTitle').value = selectedTour.title;

        if (!$('listTitle').value.trim()) { toast('Tur seç veya liste başlığı yaz.'); return; }
        if (!passengers.length) { toast('En az 1 yolcu ekle.'); return; }

        const id = $('listId').value || uid('l');
        const item = {
            id, tourId, title: $('listTitle').value.trim(), date: $('listDate').value,
            leader: $('listLeader').value.trim(), notes: $('listNotes').value.trim(),
            originAirport: airportCode($('listOriginAirport')?.value),
            destinationAirport: airportCode($('listDestinationAirport')?.value),
            passengers, createdAt: new Date().toISOString()
        };

        const idx = state.passengerLists.findIndex(x => x.id === id);
        if (idx > -1) state.passengerLists[idx] = item; else state.passengerLists.unshift(item);

        await saveData(); clearPassengerForm(); renderPassengerAdmin(); renderDashboard(); toast('Yolcu listesi kaydedildi.');
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
        <td>${escapeHtml(p.birthDate)}</td>
        <td>${escapeHtml(p.passportStart)}</td>
        <td>${escapeHtml(p.passportEnd)}<span class="passport-status ${status.level}">${escapeHtml(status.label)}</span></td>
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
            return `<tr class="${rowClass}"><td>${p.sheetNo}</td><td>${escapeHtml(name.firstName)}</td><td>${escapeHtml(name.surname)}</td>${shared}<td>${escapeHtml(mekkeRoomNo)}</td><td>${escapeHtml(medineRoomNo)}</td><td><span class="passport-status ${status.level}">${escapeHtml(status.label)}</span><small>${escapeHtml(p.passportEnd || '-')}</small></td></tr>`;
        }).join('')).join('');
        return `<div class="rooming-preview">
            <div class="rooming-preview-head"><div><span>HAZEYN</span><strong>${escapeHtml(l.title)} ODALAMA YERLEŞKESİ</strong></div><small>Excel çıktısıyla aynı düzen</small></div>
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
        l.passengers[passengerIndex][field] = value;
        await saveData();
        if (field === 'roomPeople' || field === 'mekkeRoomNo' || field === 'medineRoomNo' || field === 'roomNo') renderPassengerAdmin();
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
        workbook.creator = 'Hazeyn Turizm';
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
        sheet.getCell('A1').value = 'HAZEYN';
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
        workbook.creator = 'Hazeyn Turizm';
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
            const logoResponse = await fetch(new URL('assets/logo.png', location.href), { cache: 'no-store' });
            if (!logoResponse.ok) throw new Error('Logo alınamadı');
            const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
            const logoId = workbook.addImage({ buffer: logoBytes, extension: 'png' });
            sheet.addImage(logoId, { tl: { col: 7.08, row: 1.12 }, ext: { width: 185, height: 72 } });
        } catch (error) {
            sheet.getCell('H2').value = 'HAZEYN';
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
                return `<tr class="${roomBand}${warningClass}"><td>${i + 1}</td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.gender)}</td><td>${escapeHtml(p.tc)}</td><td>${escapeHtml(p.phone)}</td><td>${escapeHtml(p.passportNo)}</td><td>${escapeHtml(p.birthDate)}</td><td>${escapeHtml(p.passportStart)}</td><td>${escapeHtml(p.passportEnd)}</td><td>${escapeHtml(p.roomPeople || p.room)}</td><td>${escapeHtml(p.mekkeRoomNo || p.roomNo || '')}</td><td>${escapeHtml(p.medineRoomNo || p.roomNo || '')}</td><td>${escapeHtml(p.note)}</td></tr>`;
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

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(l.title)} Yolcu Listesi</title><link rel="stylesheet" href="style.css"><style>${printCss}</style></head><body><div class="print-page passenger-print"><div class="print-head"><div><h1>${escapeHtml(l.title)}</h1><div class="print-meta"><b>Tur:</b> ${escapeHtml(tourTitle)} &nbsp; <b>Uçuş:</b> ${escapeHtml(formatDateTR(flightDate) || '-')} &nbsp; <b>Rehber:</b> ${escapeHtml(l.leader || '-')}<br><b>Toplam Yolcu:</b> ${total} &nbsp; <b>Erkek:</b> ${males} &nbsp; <b>Kadın:</b> ${females} &nbsp; <b style="color:#d32f2f">Uçuşta 6 Aydan Az Pasaport:</b> <span style="color:#d32f2f; font-weight:bold;">${expiringCount}</span></div></div><img src="assets/logo.png" alt="Hâzeyn"></div>${groupsHtml}<div class="print-notes"><b>Liste Notu:</b><br>${escapeHtml(l.notes || '')}</div></div><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;

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
        a.download = 'hazeyn-yedek-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function bindAdminEvents() {
        $('loginBtn').onclick = async () => {
            const password = $('adminPassword').value;
            const ok = await validateAdminPassword(password);
            if (ok) { adminLoggedIn = true; $('adminPassword').value = ''; renderAdmin(); } else { alert('Şifre hatalı.'); }
        };
        $('adminPassword').addEventListener('keydown', e => { if (e.key === 'Enter') $('loginBtn').click(); });
        $('logoutBtn').onclick = () => { adminLoggedIn = false; sessionStorage.removeItem('hazeynAdminPassword'); renderAdmin(); };
        document.querySelectorAll('.admin-tab').forEach(btn => btn.onclick = () => switchTab(btn.dataset.tab));
        $('exportBtn').onclick = exportBackup;

        $('tourForm').addEventListener('submit', saveTour);
        $('tourReset').onclick = resetTourForm;
        $('tourImageFile').addEventListener('change', e => previewFile(e.target, src => { tempTourImage = src; $('tourPreview').src = src; }));
        $('tourHotelMekkeFile').addEventListener('change', e => previewFiles(e.target, srcs => { tempHotelMekkeImages = uniqueList([...tempHotelMekkeImages, ...srcs]); renderMultiPreview('tourHotelMekkePreview', tempHotelMekkeImages); }));
        $('tourHotelMedineFile').addEventListener('change', e => previewFiles(e.target, srcs => { tempHotelMedineImages = uniqueList([...tempHotelMedineImages, ...srcs]); renderMultiPreview('tourHotelMedinePreview', tempHotelMedineImages); }));

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
            if (bannerItem && dragHeroBannerInfo) { e.preventDefault(); bannerItem.classList.remove('drag-over'); const changed = reorderHeroBanner(dragHeroBannerInfo.id, bannerItem.dataset.heroBannerId); dragHeroBannerInfo = null; if (changed) { await saveData(); renderHeroBannerAdmin(); applySettings(); toast('Banner sırası güncellendi.'); } return; }
            const row = e.target.closest && e.target.closest('.passenger-order-row');
            if (!row || !dragPassengerInfo || row.dataset.listId !== dragPassengerInfo.listId) return;
            e.preventDefault(); row.classList.remove('drag-over'); reorderPassenger(dragPassengerInfo.listId, dragPassengerInfo.index, Number(row.dataset.passengerIndex)); dragPassengerInfo = null; await saveData(); renderPassengerAdmin(); toast('Yolcu sırası güncellendi.');
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
            const delTour = e.target.closest('[data-delete-tour]');
            if (delTour && confirm('Tur silinsin mi?')) { state.tours = state.tours.filter(x => x.id !== delTour.dataset.deleteTour); await saveData(); renderTourAdmin(); renderPassengerTourSelect(); renderDashboard(); toast('Tur silindi.'); }
            const editTourBtn = e.target.closest('[data-edit-tour]'); if (editTourBtn) editTour(editTourBtn.dataset.editTour);

            const delReview = e.target.closest('[data-delete-review]');
            if (delReview && confirm('Yorum silinsin mi?')) { state.reviews = state.reviews.filter(x => x.id !== delReview.dataset.deleteReview); await saveData(); renderReviewAdmin(); renderDashboard(); toast('Yorum silindi.'); }
            const editReviewBtn = e.target.closest('[data-edit-review]'); if (editReviewBtn) editReview(editReviewBtn.dataset.editReview);

            const delGallery = e.target.closest('[data-delete-gallery]');
            if (delGallery && confirm('Görsel silinsin mi?')) { state.gallery = state.gallery.filter(x => x.id !== delGallery.dataset.deleteGallery); await saveData(); renderGalleryAdmin(); renderDashboard(); toast('Görsel silindi.'); }

            const editStaffBtn = e.target.closest('[data-edit-staff]'); if (editStaffBtn) editStaff(editStaffBtn.dataset.editStaff);
            const delStaff = e.target.closest('[data-delete-staff]');
            if (delStaff && confirm('Ekip üyesi silinsin mi?')) { state.staff = (state.staff || []).filter(x => x.id !== delStaff.dataset.deleteStaff); await saveData(); renderStaffAdmin(); renderDashboard(); toast('Kadro silindi.'); }

            const editBlogBtn = e.target.closest('[data-edit-blog]'); if (editBlogBtn) editBlog(editBlogBtn.dataset.editBlog);
            const delBlog = e.target.closest('[data-delete-blog]');
            if (delBlog && confirm('Yazı silinsin mi?')) { state.blogs = (state.blogs || []).filter(x => x.id !== delBlog.dataset.deleteBlog); await saveData(); renderBlogAdmin(); renderDashboard(); toast('Yazı silindi.'); }

            const editHeroBannerBtn = e.target.closest('[data-edit-hero-banner]'); if (editHeroBannerBtn) editHeroBanner(editHeroBannerBtn.dataset.editHeroBanner);
            const delHeroBanner = e.target.closest('[data-delete-hero-banner]');
            if (delHeroBanner && confirm('Banner silinsin mi?')) { state.settings.heroBanners = (state.settings.heroBanners || []).filter(x => x.id !== delHeroBanner.dataset.deleteHeroBanner); await saveData(); renderHeroBannerAdmin(); applySettings(); toast('Banner silindi.'); }

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
            if (delList && confirm('Yolcu listesi silinsin mi?')) { surnameSortedLists.delete(delList.dataset.deleteList); state.passengerLists = state.passengerLists.filter(x => x.id !== delList.dataset.deleteList); await saveData(); renderPassengerAdmin(); renderDashboard(); toast('Liste silindi.'); }
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        // Admin girişini uzak veri yüklemesine bağlama. Supabase yavaşlasa veya
        // geçici olarak cevap vermese bile şifre alanı ve giriş düğmesi çalışsın.
        if (page === 'admin') {
            bindAdminEvents();
            renderAdmin();
        }

        state = await loadData();
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
