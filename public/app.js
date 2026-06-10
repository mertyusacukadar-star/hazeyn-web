(function(){
  const DEFAULT_DATA = {
    _meta: { updatedAt: 0 },
    settings: {
      brand: 'HAZEYN Turizm Seyahat Acentası',
      phone: '0216 280 0 777', phone2: '0533 094 0683', whatsapp: '905330940683',
      email: 'info@hazeynturizm.com', website: 'https://www.hazeynturizm.com/tr/', instagram: 'hazeynturizm', address: 'Ümraniye / İstanbul',
      heroTitle: 'Kutsal Yolculuğunuzda Güvenilir Rehberiniz',
      heroSubtitle: 'Hac, Umre ve yurt içi turlarında profesyonel organizasyon.',
      heroMode: 'slider',
      heroBanners: [
        {id:'hb1', image:'assets/hero.svg', title:'Kutsal Yolculuğunuzda Güvenilir Rehberiniz', subtitle:'Hac, Umre ve yurt içi turlarında profesyonel organizasyon.', textColor:'#ffffff', textPosition:'left'}
      ],
      adminPassword: '1234'
    },
    tours: [
      {id:'t1',type:'umre',title:'Şevval Umresi',tag:'Kesin Kalkışlı',departureDate:'2026-05-14',image:'assets/hotel.svg',roomPrices:{'1':'1.650 USD','2':'1.450 USD','3':'1.350 USD','4':'1.250 USD','5+':'1.150 USD'},nights:'11 Gece Mekke / 3 Gece Medine',hotels:'Mekke: Voco Hotel\nMedine: Emaar Royal',airline:'Türk Hava Yolları',price:'1.250 USD',program:'1. Gün: İstanbul çıkış ve Medineye varış.\n2-3. Gün: Medine ziyaretleri.\n4. Gün: Mekkeye geçiş ve umre ibadeti.\nSon Gün: Dönüş hazırlığı ve İstanbul uçuşu.'},
      {id:'t2',type:'umre',title:'Ramazan Umresi',tag:'Yoğun Talep',departureDate:'2026-03-01',image:'assets/hotel.svg',roomPrices:{'1':'2.050 USD','2':'1.850 USD','3':'1.750 USD','4':'1.650 USD'},nights:'14 Gece Mekke / 3 Gece Medine',hotels:'Mekke: Swissotel Al Maqam\nMedine: Anwar Al Madinah',airline:'Türk Hava Yolları',price:'1.650 USD',program:'Ramazan ayına özel program. Sahur ve iftar düzeni, rehber eşliğinde ziyaretler ve grup takibi dahildir.'},
      {id:'t3',type:'hac',title:'2026 Hac Programı',tag:'Ön Kayıt',departureDate:'2026-05-25',image:'assets/hero.svg',roomPrices:{'1':'9.950 USD','2':'8.950 USD','3':'8.650 USD','4':'8.350 USD'},nights:'40 Gün',hotels:'Mekke: Swissotel Al Maqam\nMedine: Anwar Al Madinah',airline:'Türk Hava Yolları',price:'8.950 USD',program:'Hac ibadetleri, rehberlik, ulaşım, konaklama ve grup takibi program detaylarına göre planlanır.'},
      {id:'t4',type:'yurtici',title:'GAP Turu',tag:'Kültür & Tarih',departureDate:'2026-06-08',image:'assets/yurtici.svg',roomPrices:{'2':'15.000 TL','3':'15.000 TL','4':'15.000 TL'},nights:'2 Gece 3 Gün',hotels:'Şanlıurfa / Mardin otel konaklaması',airline:'Otobüs veya uçaklı seçenek',price:'15.000 TL',program:'Halfeti, Şanlıurfa, Mardin, Diyarbakır ve Gaziantep rotasına göre kültür turu programı.'},
      {id:'t5',type:'yurtici',title:'Karadeniz Turu',tag:'Doğa',image:'assets/yurtici.svg',nights:'5 Gece 6 Gün',hotels:'Bölge otellerinde konaklama',airline:'Otobüslü program',price:'Fiyat Sorunuz',program:'Yaylalar, doğa gezileri ve yöresel duraklardan oluşan örnek Karadeniz programı.'}
    ],
    reviews: [
      {id:'r1',name:'Ahmet Yılmaz',text:'Harika bir umre deneyimi yaşadık. Her şey çok güzel organize edilmişti.',stars:5},
      {id:'r2',name:'Zeynep Kaya',text:'Rehberimiz çok ilgiliydi. Otel ve ulaşım hizmetlerinden memnun kaldık.',stars:5},
      {id:'r3',name:'Mehmet Demir',text:'Ailemle birlikte huzurlu ve güvenli bir yolculuk yaptık.',stars:5},
      {id:'r4',name:'Fatma Aydın',text:'Her şey mükemmeldi. Tekrar tercih edeceğimiz bir acenta.',stars:5}
    ],
    gallery:[
      {id:'g1',title:'Kabe Ziyareti',image:'assets/hero.svg'},
      {id:'g2',title:'Otel Konaklama',image:'assets/hotel.svg'},
      {id:'g3',title:'Yurt İçi Tur',image:'assets/yurtici.svg'}
    ],
    staff:[
      {id:'s1',name:'Emrullah Kesken',role:'Umre Rehberi',image:'assets/icon.png',bio:'Hac ve umre organizasyonlarında misafirlere ibadet, ziyaret ve grup takibi konularında rehberlik eder.'},
      {id:'s2',name:'Ahmet İkinci',role:'Kafile Sorumlusu',image:'assets/icon.png',bio:'Program akışı, otel yerleşimi ve yolculuk sürecinde misafir memnuniyetine odaklanır.'},
      {id:'s3',name:'Barış Ay',role:'Şirket Yetkilisi',image:'assets/icon.png',bio:'Tur planlaması, operasyon ve iletişim süreçlerinde profesyonel destek sağlar.'}
    ],
    blogs:[
      {id:'b1',category:'Umre Rehberi',title:'İhram Yasakları Nelerdir?',summary:'Umreye gitmeden önce bilinmesi gereken temel ihram kuralları.',content:'İhrama giren kişinin dikkat etmesi gereken bazı kurallar vardır. Koku sürmemek, saç ve tırnak kesmemek, avlanmamak, dikişli kıyafet giymemek gibi konular rehber eşliğinde detaylı anlatılır.'},
      {id:'b2',category:'Vize İşlemleri',title:'Umre Vize İşlemleri Nasıl Yapılır?',summary:'Pasaport, evrak ve vize süreci hakkında kısa bilgilendirme.',content:'Umre vize işlemleri için pasaport bilgileri ve gerekli evraklar alınır. Başvuru süreci acenta tarafından takip edilir ve misafire gerekli bilgilendirme yapılır.'},
      {id:'b3',category:'Hazırlık',title:'Umreye Giderken Neler Alınmalı?',summary:'Yolculuk öncesi çanta hazırlığı ve gerekli eşyalar.',content:'İhram, rahat terlik, kişisel ilaçlar, küçük çanta, şarj cihazı, pasaport ve gerekli evraklar yolculuk öncesinde hazır edilmelidir.'}
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
  let heroSlideIndex = 0;
  let heroTimer = null;
  let currentGalleryIndex = 0;
  const page = document.body.dataset.page;
  const $ = (id) => document.getElementById(id);

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function uid(prefix){ return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function openHazeynDb(){
    return new Promise((resolve) => {
      if(!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open('hazeynTurizmDb', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function idbGet(key){
    const db = await openHazeynDb();
    if(!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction('kv', 'readonly');
      const req = tx.objectStore('kv').get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
      tx.oncomplete = () => db.close();
    });
  }

  async function idbSet(key, value){
    const db = await openHazeynDb();
    if(!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(value, key);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); resolve(false); };
    });
  }
  function escapeHtml(str){
    return String(str ?? '').replace(/[&<>'"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[s]));
  }
  function stars(n){ return '★★★★★'.slice(0, Number(n)||5); }
  function normalizePhone(phone){ return String(phone || '').replace(/[^0-9+]/g,''); }
  function firstLine(text){ return String(text||'').split('\n')[0]; }
  function formatDateTR(value){
    if(!value) return '';
    const d = new Date(String(value) + 'T12:00:00');
    if(Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('tr-TR', {day:'numeric', month:'long', year:'numeric'});
  }

  function getRoomPrices(t){
    const rp = (t && t.roomPrices) || {};
    return {
      '1': rp['1'] || rp.one || '',
      '2': rp['2'] || rp.two || '',
      '3': rp['3'] || rp.three || '',
      '4': rp['4'] || rp.four || '',
      '5+': rp['5+'] || rp.fivePlus || rp.five || ''
    };
  }

  function cleanRoomPrices(prices){
    const p = prices || {};
    const result = {};
    ['1','2','3','4','5+'].forEach(k => {
      const value = String(p[k] || '').trim();
      if(value) result[k] = value;
    });
    return result;
  }

  function roomPriceEntries(t){
    const prices = getRoomPrices(t);
    return ['1','2','3','4','5+'].map(k => ({key:k, label:k + ' Kişilik Oda', value:String(prices[k] || '').trim()})).filter(x=>x.value);
  }

  function formatPerPersonPrice(value){
    const clean = String(value || '').trim();
    if(!clean) return 'Fiyat Sorunuz';
    if(/fiyat\s*sorunuz/i.test(clean)) return 'Fiyat Sorunuz';
    return /^kişi\s*başı/i.test(clean) ? clean : 'Kişi Başı ' + clean;
  }

  function previewRoomEntry(t){
    const entries = roomPriceEntries(t);
    // Kart üzerinde varsayılan olarak 2 kişilik oda fiyatını gösteriyoruz.
    // Böylece "1450 USD / 2 Kişilik" gibi oda toplamı sanılabilecek ifade görünmez.
    return entries.find(e => e.key === '2') || entries.find(e => e.key === '3') || entries[0] || null;
  }

  function pricePreview(t){
    const preferred = previewRoomEntry(t);
    if(preferred) return formatPerPersonPrice(preferred.value);
    return formatPerPersonPrice(t.price || '');
  }

  function priceTableHtml(t){
    const entries = roomPriceEntries(t);
    if(entries.length){
      return `<div class="price-list"><h3>Oda Tipine Göre Kişi Başı Fiyatlar</h3>${entries.map(e=>`<div><span>${escapeHtml(e.label)}</span><b>${escapeHtml(formatPerPersonPrice(e.value))}</b></div>`).join('')}</div>`;
    }
    return `<p><b>Fiyat:</b> ${escapeHtml(formatPerPersonPrice(t.price || ''))}</p>`;
  }

  function tourWhatsappMessage(t){
    const date = formatDateTR(t.departureDate);
    const parts = [t.title];
    if(date) parts.push(date + ' kalkışlı');
    parts.push('program için bilgi almak istiyorum.');
    return 'Merhaba, ' + parts.filter(Boolean).join(' ');
  }

  function tourWhatsappHref(t){
    return 'https://wa.me/' + normalizePhone(state.settings.whatsapp) + '?text=' + encodeURIComponent(tourWhatsappMessage(t));
  }
  function toast(msg){
    const el = $('toast');
    if(!el){ alert(msg); return; }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('show'), 2300);
  }


  function getAdminPassword(){
    return sessionStorage.getItem('hazeynAdminPassword') || '';
  }

  async function validateAdminPassword(password){
    if(location.protocol !== 'file:'){
      try{
        const res = await fetch('/api/login', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({password})
        });
        if(res.ok){ sessionStorage.setItem('hazeynAdminPassword', password); return true; }
        // Yerelde node server.js kullanırken /api/login olmayabilir; o durumda eski şifre kontrolüne düş.
        if(res.status !== 404 && res.status !== 405) return false;
      } catch(e){
        console.warn('Sunucu şifre kontrolü yapılamadı, yerel kontrol deneniyor.', e);
      }
    }
    const ok = password === (state.settings.adminPassword || '1234');
    if(ok) sessionStorage.setItem('hazeynAdminPassword', password);
    return ok;
  }

  async function getUploadConfig(){
    if(getUploadConfig.cache) return getUploadConfig.cache;
    if(location.protocol === 'file:') return null;
    try{
      const res = await fetch('/api/config', {cache:'no-store'});
      if(!res.ok) return null;
      const cfg = await res.json();
      if(cfg && cfg.url && cfg.anonKey && cfg.bucket){ getUploadConfig.cache = cfg; return cfg; }
    } catch(e){ console.warn('Supabase ayarları alınamadı.', e); }
    return null;
  }

  async function uploadImageToSupabase(file, folder){
    const password = getAdminPassword();
    const cfg = await getUploadConfig();
    if(!password || !cfg || !window.supabase) return null;
    const signed = await fetch('/api/signed-upload', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-admin-password': password},
      body: JSON.stringify({filename: file.name, type: file.type, size: file.size, folder: folder || 'uploads'})
    });
    if(!signed.ok) throw new Error('Yükleme izni alınamadı. Admin şifreni tekrar gir.');
    const info = await signed.json();
    const client = window.supabase.createClient(cfg.url, cfg.anonKey);
    const { error } = await client.storage.from(info.bucket || cfg.bucket).uploadToSignedUrl(info.path, info.token, file, {contentType: file.type || 'image/jpeg'});
    if(error) throw error;
    const pub = client.storage.from(info.bucket || cfg.bucket).getPublicUrl(info.path);
    return pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : null;
  }

  function fileToDataUrl(file){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Görsel okunamadı.'));
      reader.readAsDataURL(file);
    });
  }


  function parseJson(raw){
    try { return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
  }

  function dataScore(data){
    if(!data) return -1;
    let score = Number(data._meta && data._meta.updatedAt ? data._meta.updatedAt : 0);
    // Eski sürümden gelen kayıtlarda tarih yoksa, içeriğe göre kaydı koru.
    if(Array.isArray(data.passengerLists) && data.passengerLists.length) score += 500000000000;
    if(Array.isArray(data.tours) && JSON.stringify(data.tours) !== JSON.stringify(DEFAULT_DATA.tours)) score += 400000000000;
    if(Array.isArray(data.reviews) && JSON.stringify(data.reviews) !== JSON.stringify(DEFAULT_DATA.reviews)) score += 200000000000;
    if(Array.isArray(data.gallery) && JSON.stringify(data.gallery) !== JSON.stringify(DEFAULT_DATA.gallery)) score += 100000000000;
    if(Array.isArray(data.staff) && data.staff.length) score += 50000000000;
    if(Array.isArray(data.blogs) && data.blogs.length) score += 25000000000;
    return score;
  }

  function chooseBestData(items){
    const valid = items.filter(Boolean).map(mergeDefaults);
    if(!valid.length) return clone(DEFAULT_DATA);
    valid.sort((a,b)=>dataScore(b)-dataScore(a));
    return valid[0];
  }

  async function loadData(){
    const local = parseJson(localStorage.getItem('hazeynData'));
    const indexed = await idbGet('hazeynData');
    let remote = null;
    if (location.protocol !== 'file:') {
      try {
        const res = await fetch('/api/data', {cache:'no-store'});
        if(res.ok) remote = await res.json();
      } catch(e) {}
    }
    const selected = chooseBestData([indexed, local, remote]);

    // Admin/site arasında kayıt kaybolmasın diye en iyi veriyi bütün depolara geri yazar.
    await idbSet('hazeynData', selected);
    try { localStorage.setItem('hazeynData', JSON.stringify(selected)); } catch(e) {}
    // Canlı yayında veriyi sadece yönetici kaydedince sunucuya yazarız.
    // Böylece public ziyaretçi sayfa açtığında yanlışlıkla kayıt üzerine yazılmaz.
    if (location.protocol !== 'file:' && dataScore(selected) > dataScore(remote) && getAdminPassword()) {
      try { await fetch('/api/data', {method:'POST',headers:{'Content-Type':'application/json','x-admin-password':getAdminPassword()},body:JSON.stringify(selected)}); } catch(e) {}
    }
    return selected;
  }

  function mergeDefaults(data){
    const d = clone(DEFAULT_DATA);
    data = data || {};
    return {
      _meta: {...d._meta, ...(data._meta||{})},
      settings: {...d.settings, ...(data.settings||{})},
      tours: Array.isArray(data.tours) ? data.tours : d.tours,
      reviews: Array.isArray(data.reviews) ? data.reviews : d.reviews,
      gallery: Array.isArray(data.gallery) ? data.gallery : d.gallery,
      staff: Array.isArray(data.staff) ? data.staff : d.staff,
      blogs: Array.isArray(data.blogs) ? data.blogs : d.blogs,
      passengerLists: Array.isArray(data.passengerLists) ? data.passengerLists : []
    };
  }

  async function saveData(){
    state._meta = {...(state._meta||{}), updatedAt: Date.now()};
    // Büyük görsellerde localStorage kotası dolabilir; asıl tarayıcı kaydı IndexedDB'ye yapılır.
    await idbSet('hazeynData', state);
    try {
      localStorage.setItem('hazeynData', JSON.stringify(state));
    } catch(e) {
      console.warn('Tarayıcı localStorage kotası dolu olabilir. IndexedDB kaydı kullanıldı.', e);
    }
    if (location.protocol !== 'file:') {
      try {
        const password = getAdminPassword();
        const res = await fetch('/api/data', {method:'POST',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify(state)});
        if(!res.ok) throw new Error('Sunucu kaydı başarısız');
      } catch(e) {
        console.warn('Sunucu kaydı yapılamadı; IndexedDB kaydı kullanıldı.', e);
      }
    }
  }

  function getHeroBanners(){
    const s = state.settings || {};
    const list = Array.isArray(s.heroBanners) ? s.heroBanners : [];
    const cleaned = list.map((b, i) => ({
      id: b.id || ('hb' + i),
      image: String(b.image || '').trim() || 'assets/hero.svg',
      title: String(b.title || '').trim() || s.heroTitle || DEFAULT_DATA.settings.heroTitle,
      subtitle: String(b.subtitle || '').trim() || s.heroSubtitle || DEFAULT_DATA.settings.heroSubtitle,
      textColor: String(b.textColor || '').trim() || '#ffffff',
      textPosition: ['left','center','right'].includes(b.textPosition) ? b.textPosition : 'left'
    })).filter(b => b.image || b.title || b.subtitle);
    return cleaned.length ? cleaned : [{id:'hb-default', image:'assets/hero.svg', title:s.heroTitle || DEFAULT_DATA.settings.heroTitle, subtitle:s.heroSubtitle || DEFAULT_DATA.settings.heroSubtitle, textColor:'#ffffff', textPosition:'left'}];
  }

  function setHeroText(banner){
    const copy = document.querySelector('.hero-copy');
    const title = $('heroTitle');
    const subtitle = $('heroSubtitle');
    if(title) title.textContent = banner.title || '';
    if(subtitle) subtitle.textContent = banner.subtitle || '';
    if(copy){
      copy.classList.remove('hero-pos-left','hero-pos-center','hero-pos-right');
      copy.classList.add('hero-pos-' + (banner.textPosition || 'left'));
      copy.style.color = banner.textColor || '#ffffff';
    }
    if(title) title.style.color = banner.textColor || '#ffffff';
    if(subtitle) subtitle.style.color = banner.textColor || '#ffffff';
  }

  function showHeroBanner(index){
    const banners = getHeroBanners();
    if(!banners.length) return;
    heroSlideIndex = ((index % banners.length) + banners.length) % banners.length;
    document.querySelectorAll('.hero-slide').forEach((el, i)=>el.classList.toggle('active', i === heroSlideIndex));
    setHeroText(banners[heroSlideIndex]);
  }

  function renderHeroBanners(){
    const bg = document.querySelector('.hero-bg');
    if(!bg) return;
    const banners = getHeroBanners();
    bg.innerHTML = banners.map((b, i)=>`<div class="hero-slide ${i===0?'active':''}" style="background-image:url('${escapeHtml(b.image)}')"></div>`).join('');
    showHeroBanner(0);
    if(heroTimer) clearInterval(heroTimer);
    const mode = (state.settings && state.settings.heroMode) || 'single';
    if(mode === 'slider' && banners.length > 1){
      heroTimer = setInterval(()=>showHeroBanner(heroSlideIndex + 1), 5500);
    }
  }

  function applySettings(){
    const s = state.settings;
    document.querySelectorAll('.phone-link').forEach(a=>{ a.href = 'tel:' + normalizePhone(s.phone); });
    document.querySelectorAll('.whatsapp-link').forEach(a=>{ a.href = 'https://wa.me/' + normalizePhone(s.whatsapp); });
    const instagramUser = String(s.instagram || 'hazeynturizm').replace('@','').trim() || 'hazeynturizm';
    document.querySelectorAll('.instagram-link').forEach(a=>{ a.href = 'https://www.instagram.com/' + instagramUser + '/'; });
    const instagramText = $('instagramText'); if(instagramText) instagramText.textContent = '@' + instagramUser;
    const footerInstagramText = $('footerInstagramText'); if(footerInstagramText) footerInstagramText.textContent = '@' + instagramUser;
    renderHeroBanners();
    const phoneText = $('phoneText'); if(phoneText) phoneText.textContent = s.phone;
    const addressText = $('addressText'); if(addressText) addressText.textContent = s.address;
    const year = $('year'); if(year) year.textContent = new Date().getFullYear();
  }

  function tourCard(t){
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

  function renderTourGroup(type, targetId, limit){
    const target = $(targetId); if(!target) return;
    const list = state.tours.filter(t=>t.type === type).slice(0, limit || 50);
    target.innerHTML = list.length ? list.map(tourCard).join('') : '<div class="empty">Henüz program eklenmedi.</div>';
  }

  function renderReviews(){
    const target = $('reviewMarquee'); if(!target) return;
    const reviews = state.reviews.length ? state.reviews : DEFAULT_DATA.reviews;
    const cards = reviews.map(r=>`<article class="review-card"><div class="stars">${stars(r.stars)}</div><p>“${escapeHtml(r.text)}”</p><b>${escapeHtml(r.name)}</b><small>Google yorumu</small></article>`).join('');
    target.innerHTML = `<div class="review-track">${cards}${cards}</div>`;
  }

  function renderGallery(){
    const target = $('galleryGrid'); if(!target) return;
    const list = state.gallery.length ? state.gallery : DEFAULT_DATA.gallery;
    target.classList.add('gallery-marquee');
    const cards = list.map((g, i)=>`<figure class="gallery-item reveal" data-gallery-index="${i}" tabindex="0" role="button" aria-label="${escapeHtml(g.title)} görselini büyüt"><img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.title)}" onerror="this.src='assets/hero.svg'"><span>${escapeHtml(g.title)}</span></figure>`).join('');
    target.innerHTML = `<div class="gallery-track">${cards}${cards}</div>`;
  }

  function renderStaff(){
    const target = $('staffGrid'); if(!target) return;
    const list = state.staff && state.staff.length ? state.staff : DEFAULT_DATA.staff;
    target.innerHTML = list.map(s=>`<article class="staff-card reveal"><div class="staff-photo"><img src="${escapeHtml(s.image || 'assets/icon.png')}" alt="${escapeHtml(s.name)}" onerror="this.src='assets/icon.png'"></div><div><span>${escapeHtml(s.role || 'Hazeyn Ekibi')}</span><h3>${escapeHtml(s.name || '')}</h3><p>${escapeHtml(s.bio || '')}</p></div></article>`).join('');
  }

  function renderBlogs(){
    const target = $('blogGrid'); if(!target) return;
    const list = state.blogs && state.blogs.length ? state.blogs : DEFAULT_DATA.blogs;
    target.innerHTML = list.map(b=>`<article class="blog-card reveal" data-blog="${escapeHtml(b.id)}" tabindex="0" role="button"><span>${escapeHtml(b.category || 'Merak Edilenler')}</span><h3>${escapeHtml(b.title || '')}</h3><p>${escapeHtml(b.summary || firstLine(b.content) || '')}</p><button class="text-btn" type="button">Devamını Oku →</button></article>`).join('');
  }

  function openBlogModal(id){
    const list = state.blogs && state.blogs.length ? state.blogs : DEFAULT_DATA.blogs;
    const b = list.find(x=>x.id===id); if(!b) return;
    $('modalBody').innerHTML = `<div class="modal-content blog-modal">${b.image ? `<img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.title)}" onerror="this.style.display='none'">` : ''}<div><span class="section-kicker">${escapeHtml(b.category || 'Merak Edilenler')}</span><h2>${escapeHtml(b.title || '')}</h2><p class="blog-summary">${escapeHtml(b.summary || '')}</p><div class="blog-content">${escapeHtml(b.content || '').replace(/\n/g,'<br>')}</div></div></div>`;
    $('tourModal').classList.add('open');
  }

  function openGalleryModal(index){
    const list = state.gallery.length ? state.gallery : DEFAULT_DATA.gallery;
    if(!list.length) return;
    const n = Number(index);
    currentGalleryIndex = Number.isFinite(n) ? ((n % list.length) + list.length) % list.length : 0;
    const g = list[currentGalleryIndex]; if(!g) return;
    $('modalBody').innerHTML = `<div class="image-viewer gallery-viewer">
      <button class="gallery-nav gallery-prev" type="button" data-gallery-prev aria-label="Önceki görsel">‹</button>
      <img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.title)}" onerror="this.src='assets/hero.svg'">
      <button class="gallery-nav gallery-next" type="button" data-gallery-next aria-label="Sonraki görsel">›</button>
      <div class="gallery-viewer-footer"><h2>${escapeHtml(g.title)}</h2><span>${currentGalleryIndex + 1} / ${list.length}</span></div>
    </div>`;
    $('tourModal').classList.add('open');
  }

  function moveGalleryModal(step){
    const list = state.gallery.length ? state.gallery : DEFAULT_DATA.gallery;
    if(!list.length) return;
    openGalleryModal(currentGalleryIndex + step);
  }

  function openTourModal(id){
    const t = state.tours.find(x=>x.id===id); if(!t) return;
    $('modalBody').innerHTML = `<div class="modal-content">
      <img src="${escapeHtml(t.image || 'assets/hotel.svg')}" alt="${escapeHtml(t.title)}" onerror="this.src='assets/hotel.svg'">
      <div>
        <span class="section-kicker">${escapeHtml(t.tag || '')}</span>
        <h2>${escapeHtml(t.title)}</h2>
        ${t.departureDate ? `<p><b>Kalkış Tarihi:</b> ${escapeHtml(formatDateTR(t.departureDate))}</p>` : ''}
        <p><b>Süre:</b> ${escapeHtml(t.nights || '-')}</p>
        <p><b>Otel:</b><br>${escapeHtml(t.hotels || '-').replace(/\n/g,'<br>')}</p>
        <p><b>Ulaşım:</b> ${escapeHtml(t.airline || '-')}</p>
        ${priceTableHtml(t)}
        ${hotelGalleryHtml(t)}
        <h3>Program Örneği</h3>
        <pre>${escapeHtml(t.program || 'Program detayı yakında eklenecek.')}</pre>
        <a href="${escapeHtml(tourWhatsappHref(t))}" target="_blank" class="btn btn-gold">WhatsApp'tan Bilgi Al</a>
      </div>
    </div>`;
    $('tourModal').classList.add('open');
  }

  function renderPublic(){
    applySettings();
    renderTourGroup('umre','umreTours',4); renderTourGroup('hac','hacTours',2); renderTourGroup('yurtici','yurticiTours',4);
    renderReviews(); renderGallery(); renderStaff(); renderBlogs();
    document.addEventListener('click', (e)=>{
      const tourBtn = e.target.closest('[data-tour]');
      if(tourBtn) openTourModal(tourBtn.dataset.tour);
      const galleryBtn = e.target.closest('[data-gallery-index]');
      if(galleryBtn) openGalleryModal(galleryBtn.dataset.galleryIndex);
      const galleryPrev = e.target.closest('[data-gallery-prev]');
      if(galleryPrev) moveGalleryModal(-1);
      const galleryNext = e.target.closest('[data-gallery-next]');
      if(galleryNext) moveGalleryModal(1);
      const blogBtn = e.target.closest('[data-blog]');
      if(blogBtn) openBlogModal(blogBtn.dataset.blog);
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        const galleryBtn = e.target.closest && e.target.closest('[data-gallery-index]');
        if(galleryBtn) openGalleryModal(galleryBtn.dataset.galleryIndex);
        const blogBtn = e.target.closest && e.target.closest('[data-blog]');
        if(blogBtn) openBlogModal(blogBtn.dataset.blog);
      }
      if(e.key === 'ArrowLeft' && $('tourModal')?.classList.contains('open')) moveGalleryModal(-1);
      if(e.key === 'ArrowRight' && $('tourModal')?.classList.contains('open')) moveGalleryModal(1);
      if(e.key === 'Escape'){
        const modal = $('tourModal'); if(modal) modal.classList.remove('open');
      }
    });
    const close = $('modalClose'); if(close) close.onclick = ()=>$('tourModal').classList.remove('open');
    const modal = $('tourModal'); if(modal) modal.addEventListener('click', e=>{ if(e.target === modal) modal.classList.remove('open'); });
    const menuToggle = $('menuToggle');
    if(menuToggle){ menuToggle.onclick = ()=>{ $('navLinks').classList.toggle('open'); document.querySelector('.nav-actions').classList.toggle('open'); }; }
    const newsletter = $('newsletterForm');
    if(newsletter){ newsletter.addEventListener('submit', e=>{ e.preventDefault(); alert('Kaydınız alındı.'); newsletter.reset(); }); }
  }

  function renderAdmin(){
    const isLogged = adminLoggedIn === true;
    const login = $('loginScreen');
    const shell = $('adminShell');
    if(login){
      login.hidden = isLogged;
      login.style.display = isLogged ? 'none' : 'grid';
    }
    if(shell){
      shell.hidden = !isLogged;
      shell.style.display = isLogged ? 'grid' : 'none';
      shell.setAttribute('aria-hidden', String(!isLogged));
    }
    if(!isLogged) return;
    fillSettingsForm(); renderDashboard(); renderTourAdmin(); renderReviewAdmin(); renderGalleryAdmin(); renderStaffAdmin(); renderBlogAdmin(); renderPassengerTourSelect(); renderPassengerAdmin(); ensurePassengerRows();
  }

  function renderDashboard(){
    $('statTours').textContent = state.tours.length;
    $('statReviews').textContent = state.reviews.length;
    $('statGallery').textContent = state.gallery.length;
    $('statLists').textContent = state.passengerLists.length;
    if($('statStaff')) $('statStaff').textContent = (state.staff||[]).length;
    if($('statBlogs')) $('statBlogs').textContent = (state.blogs||[]).length;
  }

  function switchTab(tab){
    document.querySelectorAll('.admin-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
    document.querySelectorAll('.admin-panel').forEach(p=>p.classList.toggle('active', p.id === 'tab-' + tab));
  }

  async function previewFile(input, cb){
    const file = input.files && input.files[0];
    if(!file) return;
    const maxMb = 50;
    if(file.size > maxMb * 1024 * 1024){ toast('Görsel çok büyük. En fazla ' + maxMb + ' MB yükleyebilirsin.'); input.value=''; return; }
    try{
      toast('Görsel yükleniyor...');
      const folder = input.id || 'uploads';
      const uploaded = await uploadImageToSupabase(file, folder);
      const src = uploaded || await fileToDataUrl(file);
      cb(src);
      toast(uploaded ? 'Görsel buluta yüklendi.' : 'Görsel yerel olarak hazırlandı.');
    } catch(e){
      console.warn(e);
      try{ cb(await fileToDataUrl(file)); toast('Bulut yükleme olmadı, görsel yerel olarak eklendi.'); }
      catch(err){ toast('Görsel okunamadı. Farklı bir dosya dene.'); }
    }
  }

  async function previewFiles(input, cb){
    const files = Array.from(input.files || []);
    if(!files.length) return;
    const maxMb = 50;
    const tooBig = files.find(file => file.size > maxMb * 1024 * 1024);
    if(tooBig){ toast('Görsellerden biri çok büyük. Her görsel en fazla ' + maxMb + ' MB olabilir.'); input.value=''; return; }
    const results = [];
    toast('Görseller yükleniyor...');
    for(const file of files){
      try{
        const folder = input.id || 'uploads';
        const uploaded = await uploadImageToSupabase(file, folder);
        results.push(uploaded || await fileToDataUrl(file));
      } catch(e){
        console.warn(e);
        try{ results.push(await fileToDataUrl(file)); } catch(err){}
      }
    }
    cb(results.filter(Boolean));
    toast('Görseller hazır.');
  }

  function uniqueList(list){
    const seen = new Set();
    return (list || []).map(x=>String(x || '').trim()).filter(Boolean).filter(x=>{
      if(seen.has(x)) return false;
      seen.add(x);
      return true;
    });
  }

  function normalizeImageArray(value){
    if(Array.isArray(value)) return uniqueList(value);
    if(typeof value === 'string' && value.trim()) return [value.trim()];
    return [];
  }

  function getHotelImageArrays(t){
    const h = (t && t.hotelImages) || {};
    return {
      mekke: normalizeImageArray(h.mekke),
      medine: normalizeImageArray(h.medine)
    };
  }

  function linesToList(value){
    return uniqueList(String(value || '').split(/\n+/));
  }

  function renderMultiPreview(id, images){
    const el = $(id);
    if(!el) return;
    const list = uniqueList(images);
    el.innerHTML = list.length ? list.map((src, i)=>`<figure><img src="${escapeHtml(src)}" alt="Otel görseli ${i+1}" onerror="this.closest('figure').style.display='none'"><figcaption>${i+1}</figcaption></figure>`).join('') : '<span>Henüz görsel yok</span>';
  }

  function hotelGalleryHtml(t){
    const h = getHotelImageArrays(t);
    const blocks = [];
    h.mekke.forEach((src, i) => blocks.push({src, title: h.mekke.length > 1 ? `Mekke Oteli ${i+1}` : 'Mekke Oteli'}));
    h.medine.forEach((src, i) => blocks.push({src, title: h.medine.length > 1 ? `Medine Oteli ${i+1}` : 'Medine Oteli'}));
    if(!blocks.length) return '';
    return `<div class="hotel-modal-gallery"><h3>Otel Görselleri</h3><div>${blocks.map(b=>`<figure><img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.title)}" onerror="this.closest('figure').style.display='none'"><figcaption>${escapeHtml(b.title)}</figcaption></figure>`).join('')}</div></div>`;
  }

  function resetTourForm(){
    $('tourForm').reset();
    $('tourId').value='';
    tempTourImage='';
    tempHotelMekkeImages=[];
    tempHotelMedineImages=[];
    const coverPreview = $('tourPreview'); if(coverPreview) coverPreview.removeAttribute('src');
    renderMultiPreview('tourHotelMekkePreview', []);
    renderMultiPreview('tourHotelMedinePreview', []);
  }

  function renderTourAdmin(){
    const list = $('tourAdminList'); if(!list) return;
    list.innerHTML = state.tours.map(t=>`<div class="admin-item">
      <div><h3>${escapeHtml(t.title)} <small>(${escapeHtml(typeLabel(t.type))})</small></h3><p>${t.departureDate ? 'Kalkış: ' + escapeHtml(formatDateTR(t.departureDate)) + '\n' : ''}${escapeHtml(t.nights || '')}\n${escapeHtml(firstLine(t.hotels))}\n${escapeHtml(String(t.cardText || '').trim() || pricePreview(t))}${hotelImageCountText(t)}</p></div>
      <div class="admin-item-actions"><button class="icon-btn" data-edit-tour="${escapeHtml(t.id)}">Düzenle</button><button class="icon-btn danger" data-delete-tour="${escapeHtml(t.id)}">Sil</button></div>
    </div>`).join('');
  }

  function editTour(id){
    const t = state.tours.find(x=>x.id===id); if(!t) return;
    switchTab('tours'); $('tourId').value=t.id; $('tourType').value=t.type; $('tourTitle').value=t.title || ''; $('tourTag').value=t.tag || '';
    $('tourImage').value = (t.image && !t.image.startsWith('data:')) ? t.image : ''; tempTourImage = t.image || '';
    const hotelImages = getHotelImageArrays(t);
    tempHotelMekkeImages = hotelImages.mekke.slice();
    tempHotelMedineImages = hotelImages.medine.slice();
    $('tourHotelMekkeImage').value = hotelImages.mekke.filter(src=>!src.startsWith('data:')).join('\n');
    $('tourHotelMedineImage').value = hotelImages.medine.filter(src=>!src.startsWith('data:')).join('\n');
    $('tourDepartureDate').value=t.departureDate || '';
    if($('tourCardText')) $('tourCardText').value=t.cardText || '';
    const roomPrices = getRoomPrices(t);
    $('tourPrice1').value = roomPrices['1']; $('tourPrice2').value = roomPrices['2']; $('tourPrice3').value = roomPrices['3']; $('tourPrice4').value = roomPrices['4']; $('tourPrice5plus').value = roomPrices['5+'];
    $('tourNights').value=t.nights || ''; $('tourHotels').value=t.hotels || ''; $('tourAirline').value=t.airline || ''; $('tourPrice').value=t.price || ''; $('tourProgram').value=t.program || '';
    $('tourPreview').src = t.image || '';
    renderMultiPreview('tourHotelMekkePreview', hotelImages.mekke);
    renderMultiPreview('tourHotelMedinePreview', hotelImages.medine);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  async function saveTour(e){
    e.preventDefault();
    const id = $('tourId').value || uid('t');
    const image = tempTourImage || $('tourImage').value.trim() || ($('tourType').value === 'yurtici' ? 'assets/yurtici.svg' : 'assets/hotel.svg');
    const hotelImages = {
      mekke: uniqueList([...tempHotelMekkeImages, ...linesToList($('tourHotelMekkeImage')?.value)]),
      medine: uniqueList([...tempHotelMedineImages, ...linesToList($('tourHotelMedineImage')?.value)])
    };
    const roomPrices = cleanRoomPrices({'1':$('tourPrice1').value, '2':$('tourPrice2').value, '3':$('tourPrice3').value, '4':$('tourPrice4').value, '5+':$('tourPrice5plus').value});
    const t = {id, type:$('tourType').value, title:$('tourTitle').value.trim(), tag:$('tourTag').value.trim(), departureDate:$('tourDepartureDate').value, cardText:$('tourCardText') ? $('tourCardText').value.trim() : '', image, hotelImages, roomPrices,
      nights:$('tourNights').value.trim(), hotels:$('tourHotels').value.trim(), airline:$('tourAirline').value.trim(), price:$('tourPrice').value.trim(), program:$('tourProgram').value.trim()};
    const idx = state.tours.findIndex(x=>x.id===id);
    if(idx>-1) state.tours[idx]=t; else state.tours.unshift(t);
    await saveData(); resetTourForm(); renderTourAdmin(); renderPassengerTourSelect(); renderDashboard(); toast('Tur kaydedildi.');
  }

  function resetReviewForm(){ $('reviewForm').reset(); $('reviewId').value=''; }
  function renderReviewAdmin(){
    const list = $('reviewAdminList'); if(!list) return;
    list.innerHTML = state.reviews.map(r=>`<div class="admin-item"><div><h3>${escapeHtml(r.name)} <small>${stars(r.stars)}</small></h3><p>${escapeHtml(r.text)}</p></div><div class="admin-item-actions"><button class="icon-btn" data-edit-review="${escapeHtml(r.id)}">Düzenle</button><button class="icon-btn danger" data-delete-review="${escapeHtml(r.id)}">Sil</button></div></div>`).join('');
  }
  function editReview(id){ const r=state.reviews.find(x=>x.id===id); if(!r) return; switchTab('reviews'); $('reviewId').value=r.id; $('reviewName').value=r.name; $('reviewStars').value=r.stars; $('reviewText').value=r.text; }
  async function saveReview(e){
    e.preventDefault(); const id=$('reviewId').value || uid('r');
    const r={id,name:$('reviewName').value.trim(),stars:Number($('reviewStars').value),text:$('reviewText').value.trim()};
    const idx=state.reviews.findIndex(x=>x.id===id); if(idx>-1) state.reviews[idx]=r; else state.reviews.unshift(r);
    await saveData(); resetReviewForm(); renderReviewAdmin(); renderDashboard(); toast('Yorum kaydedildi.');
  }

  function renderGalleryAdmin(){
    const list = $('galleryAdminList'); if(!list) return;
    list.innerHTML = state.gallery.map(g=>`<div class="admin-item"><img src="${escapeHtml(g.image)}" onerror="this.src='assets/hero.svg'" alt=""><div><h3>${escapeHtml(g.title)}</h3><p>${escapeHtml(g.image).slice(0,80)}</p></div><div class="admin-item-actions"><button class="icon-btn danger" data-delete-gallery="${escapeHtml(g.id)}">Sil</button></div></div>`).join('');
  }
  async function saveGallery(e){
    e.preventDefault();
    const g = {id:uid('g'), title:$('galleryTitle').value.trim(), image:tempGalleryImage || $('galleryImage').value.trim() || 'assets/hero.svg'};
    state.gallery.unshift(g); await saveData(); $('galleryForm').reset(); tempGalleryImage=''; $('galleryPreview').removeAttribute('src'); renderGalleryAdmin(); renderDashboard(); toast('Galeri görseli eklendi.');
  }

  function resetStaffForm(){ $('staffForm').reset(); $('staffId').value=''; tempStaffImage=''; const p=$('staffPreview'); if(p) p.removeAttribute('src'); }
  function renderStaffAdmin(){
    const list = $('staffAdminList'); if(!list) return;
    list.innerHTML = (state.staff||[]).map(s=>`<div class="admin-item staff-admin-item"><img src="${escapeHtml(s.image || 'assets/icon.png')}" onerror="this.src='assets/icon.png'" alt=""><div><h3>${escapeHtml(s.name)} <small>${escapeHtml(s.role||'')}</small></h3><p>${escapeHtml(s.bio||'')}</p></div><div class="admin-item-actions"><button class="icon-btn" data-edit-staff="${escapeHtml(s.id)}">Düzenle</button><button class="icon-btn danger" data-delete-staff="${escapeHtml(s.id)}">Sil</button></div></div>`).join('') || '<p>Henüz ekip üyesi eklenmedi.</p>';
  }
  function editStaff(id){ const s=(state.staff||[]).find(x=>x.id===id); if(!s) return; switchTab('staff'); $('staffId').value=s.id; $('staffName').value=s.name||''; $('staffRole').value=s.role||''; $('staffImage').value=(s.image && !s.image.startsWith('data:')) ? s.image : ''; tempStaffImage=s.image||''; $('staffPreview').src=s.image||''; $('staffBio').value=s.bio||''; window.scrollTo({top:0,behavior:'smooth'}); }
  async function saveStaff(e){
    e.preventDefault();
    const id=$('staffId').value || uid('s');
    const item={id,name:$('staffName').value.trim(),role:$('staffRole').value.trim(),image:tempStaffImage || $('staffImage').value.trim() || 'assets/icon.png',bio:$('staffBio').value.trim()};
    const idx=(state.staff||[]).findIndex(x=>x.id===id);
    if(!Array.isArray(state.staff)) state.staff=[];
    if(idx>-1) state.staff[idx]=item; else state.staff.unshift(item);
    await saveData(); resetStaffForm(); renderStaffAdmin(); renderDashboard(); toast('Kadro kaydedildi.');
  }

  function resetBlogForm(){ $('blogForm').reset(); $('blogId').value=''; tempBlogImage=''; const p=$('blogPreview'); if(p) p.removeAttribute('src'); }
  function renderBlogAdmin(){
    const list = $('blogAdminList'); if(!list) return;
    list.innerHTML = (state.blogs||[]).map(b=>`<div class="admin-item"><div><h3>${escapeHtml(b.title)} <small>${escapeHtml(b.category||'Merak Edilenler')}</small></h3><p>${escapeHtml(b.summary || firstLine(b.content) || '')}</p></div><div class="admin-item-actions"><button class="icon-btn" data-edit-blog="${escapeHtml(b.id)}">Düzenle</button><button class="icon-btn danger" data-delete-blog="${escapeHtml(b.id)}">Sil</button></div></div>`).join('') || '<p>Henüz yazı eklenmedi.</p>';
  }
  function editBlog(id){ const b=(state.blogs||[]).find(x=>x.id===id); if(!b) return; switchTab('blog'); $('blogId').value=b.id; $('blogCategory').value=b.category||''; $('blogTitle').value=b.title||''; $('blogSummary').value=b.summary||''; $('blogContent').value=b.content||''; $('blogImage').value=(b.image && !b.image.startsWith('data:')) ? b.image : ''; tempBlogImage=b.image||''; if($('blogPreview')) $('blogPreview').src=b.image||''; window.scrollTo({top:0,behavior:'smooth'}); }
  async function saveBlog(e){
    e.preventDefault();
    const id=$('blogId').value || uid('b');
    const item={id,category:$('blogCategory').value.trim(),title:$('blogTitle').value.trim(),summary:$('blogSummary').value.trim(),image:tempBlogImage || $('blogImage').value.trim(),content:$('blogContent').value.trim()};
    if(!Array.isArray(state.blogs)) state.blogs=[];
    const idx=state.blogs.findIndex(x=>x.id===id);
    if(idx>-1) state.blogs[idx]=item; else state.blogs.unshift(item);
    await saveData(); resetBlogForm(); renderBlogAdmin(); renderDashboard(); toast('Merak edilenler yazısı kaydedildi.');
  }

  function resetHeroBannerForm(){
    const ids = ['heroBannerId','heroBannerImage','heroBannerTitle','heroBannerSubtitle'];
    ids.forEach(id=>{ if($(id)) $(id).value=''; });
    if($('heroBannerTextColor')) $('heroBannerTextColor').value = '#ffffff';
    if($('heroBannerTextPosition')) $('heroBannerTextPosition').value = 'left';
    tempHeroBannerImage = '';
    const p = $('heroBannerPreview'); if(p) p.removeAttribute('src');
  }

  function reorderHeroBanner(fromId, toId){
    if(!Array.isArray(state.settings.heroBanners) || !fromId || !toId || fromId === toId) return false;
    const arr = state.settings.heroBanners;
    const fromIndex = arr.findIndex(x => String(x.id) === String(fromId));
    const toIndex = arr.findIndex(x => String(x.id) === String(toId));
    if(fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return false;
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    return true;
  }

  function renderHeroBannerAdmin(){
    const list = $('heroBannerAdminList'); if(!list) return;
    const banners = getHeroBanners();
    list.innerHTML = banners.map((b, i)=>`<div class="admin-item hero-banner-admin-item" draggable="true" data-hero-banner-id="${escapeHtml(b.id)}"><span class="drag-handle hero-banner-drag" title="Tut sürükle">☰</span><img src="${escapeHtml(b.image)}" onerror="this.src='assets/hero.svg'" alt=""><div><h3>${i+1}. ${escapeHtml(b.title || 'Banner')}</h3><p>${escapeHtml(b.subtitle || '')}
Yazı konumu: ${escapeHtml(b.textPosition || 'left')} • Yazı rengi: ${escapeHtml(b.textColor || '#ffffff')}</p></div><div class="admin-item-actions"><button class="icon-btn" type="button" data-edit-hero-banner="${escapeHtml(b.id)}">Düzenle</button><button class="icon-btn danger" type="button" data-delete-hero-banner="${escapeHtml(b.id)}">Sil</button></div></div>`).join('') || '<p>Henüz banner eklenmedi.</p>';
  }

  async function saveHeroBanner(){
    if(!Array.isArray(state.settings.heroBanners)) state.settings.heroBanners = [];
    const id = $('heroBannerId').value || uid('hb');
    const image = tempHeroBannerImage || $('heroBannerImage').value.trim() || 'assets/hero.svg';
    const title = $('heroBannerTitle').value.trim() || $('setHeroTitle').value.trim() || DEFAULT_DATA.settings.heroTitle;
    const subtitle = $('heroBannerSubtitle').value.trim() || $('setHeroSubtitle').value.trim() || DEFAULT_DATA.settings.heroSubtitle;
    const textColor = $('heroBannerTextColor').value || '#ffffff';
    const textPosition = $('heroBannerTextPosition').value || 'left';
    const item = {id, image, title, subtitle, textColor, textPosition};
    const idx = state.settings.heroBanners.findIndex(x=>x.id===id);
    if(idx > -1) state.settings.heroBanners[idx] = item; else state.settings.heroBanners.push(item);
    await saveData(); resetHeroBannerForm(); renderHeroBannerAdmin(); applySettings(); toast('Banner kaydedildi.');
  }

  function editHeroBanner(id){
    const b = getHeroBanners().find(x=>x.id===id); if(!b) return;
    $('heroBannerId').value = b.id;
    $('heroBannerImage').value = b.image && !b.image.startsWith('data:') ? b.image : '';
    $('heroBannerTitle').value = b.title || '';
    $('heroBannerSubtitle').value = b.subtitle || '';
    $('heroBannerTextColor').value = b.textColor || '#ffffff';
    $('heroBannerTextPosition').value = b.textPosition || 'left';
    tempHeroBannerImage = b.image || '';
    if($('heroBannerPreview')) $('heroBannerPreview').src = b.image || '';
  }

  function fillSettingsForm(){
    const s = state.settings;
    $('setPhone').value=s.phone||''; $('setPhone2').value=s.phone2||''; $('setWhatsapp').value=s.whatsapp||''; $('setEmail').value=s.email||''; $('setWebsite').value=s.website||''; if($('setInstagram')) $('setInstagram').value=s.instagram||'hazeynturizm'; $('setAddress').value=s.address||''; $('setHeroTitle').value=s.heroTitle||''; $('setHeroSubtitle').value=s.heroSubtitle||''; if($('setHeroMode')) $('setHeroMode').value=s.heroMode||'single'; $('setAdminPassword').value=s.adminPassword||'1234'; renderHeroBannerAdmin();
  }
  async function saveSettings(e){
    e.preventDefault();
    state.settings = {...state.settings, phone:$('setPhone').value.trim(), phone2:$('setPhone2').value.trim(), whatsapp:$('setWhatsapp').value.trim(), email:$('setEmail').value.trim(), website:$('setWebsite').value.trim(), instagram: ($('setInstagram') ? $('setInstagram').value.trim().replace('@','') : (state.settings.instagram || 'hazeynturizm')), address:$('setAddress').value.trim(), heroTitle:$('setHeroTitle').value.trim(), heroSubtitle:$('setHeroSubtitle').value.trim(), heroMode: ($('setHeroMode') ? $('setHeroMode').value : (state.settings.heroMode || 'single')), adminPassword:$('setAdminPassword').value.trim() || '1234'};
    await saveData(); toast('Ayarlar kaydedildi.');
  }

  function renderPassengerTourSelect(selectedId=''){
    const select = $('listTourSelect');
    if(!select) return;
    const current = selectedId || $('listTourId')?.value || '';
    const options = state.tours.map(t=>`<option value="${escapeHtml(t.id)}" ${t.id===current?'selected':''}>${escapeHtml(t.title)} - ${escapeHtml(typeLabel(t.type))}</option>`).join('');
    select.innerHTML = '<option value="">Tur seçin</option>' + options;
  }

  function typeLabel(type){
    return type === 'umre' ? 'Umre' : type === 'hac' ? 'Hac' : 'Yurt İçi';
  }

  function hotelImageCountText(t){
    const h = getHotelImageArrays(t);
    const count = h.mekke.length + h.medine.length;
    return count ? `\n${count} otel görseli eklendi` : '';
  }

  function roomLabel(roomPeople){
    const v = String(roomPeople || '').trim();
    if(!v) return 'Oda bilgisi seçilmemiş';
    return `${v} Kişilik Odalar`;
  }

  function roomOrderValue(roomPeople){
    const v = String(roomPeople || '').replace('+','');
    const n = parseInt(v, 10);
    if(Number.isFinite(n)) return n;
    return 99;
  }

  function groupPassengersByRoom(passengers){
    const groups = new Map();
    (passengers || []).forEach((p, originalIndex) => {
      const key = String(p.roomPeople || p.room || '').trim() || 'secilmedi';
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push({...p, _originalIndex: originalIndex});
    });
    return Array.from(groups.entries()).sort((a,b)=>roomOrderValue(a[0])-roomOrderValue(b[0])).map(([key,items])=>({key, title: roomLabel(key === 'secilmedi' ? '' : key), items}));
  }

  function normalizeNameForSort(value){
    return String(value || '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('tr-TR');
  }

  function getSurname(name){
    const parts = normalizeNameForSort(name).split(' ').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  }

  function sortPassengersForRooms(passengers){
    return (passengers || []).map((p, index)=>({...p, _sortIndex:index})).sort((a,b)=>{
      const roomDiff = roomOrderValue(a.roomPeople || a.room) - roomOrderValue(b.roomPeople || b.room);
      if(roomDiff) return roomDiff;
      const surnameDiff = getSurname(a.name).localeCompare(getSurname(b.name), 'tr');
      if(surnameDiff) return surnameDiff;
      const nameDiff = normalizeNameForSort(a.name).localeCompare(normalizeNameForSort(b.name), 'tr');
      if(nameDiff) return nameDiff;
      return a._sortIndex - b._sortIndex;
    }).map(({_sortIndex, ...p}) => p);
  }

  function passengerRow(p={}){
    const tr = document.createElement('tr');
    const gender = p.gender || '';
    const roomPeople = p.roomPeople || p.room || '';
    tr.innerHTML = `
      <td><input class="p-name" value="${escapeHtml(p.name||'')}" placeholder="Ad Soyad"></td>
      <td><select class="p-gender"><option value="">Seç</option><option ${gender==='Kadın'?'selected':''}>Kadın</option><option ${gender==='Erkek'?'selected':''}>Erkek</option></select></td>
      <td><input class="p-tc" value="${escapeHtml(p.tc||'')}" placeholder="TC No" inputmode="numeric"></td>
      <td><input class="p-phone" value="${escapeHtml(p.phone||'')}" placeholder="05xx" inputmode="tel"></td>
      <td><input class="p-passport" value="${escapeHtml(p.passportNo||'')}" placeholder="Pasaport No"></td>
      <td><input class="p-birth" type="date" value="${escapeHtml(p.birthDate||'')}"></td>
      <td><input class="p-pass-start" type="date" value="${escapeHtml(p.passportStart||'')}"></td>
      <td><input class="p-pass-end" type="date" value="${escapeHtml(p.passportEnd||'')}"></td>
      <td><select class="p-room-people"><option value="">Seç</option>${['1','2','3','4','5+'].map(v=>`<option value="${v}" ${String(roomPeople)===v?'selected':''}>${v} Kişilik</option>`).join('')}</select></td>
      <td><input class="p-room-no" value="${escapeHtml(p.roomNo||'')}" placeholder="Örn: 305"></td>
      <td><input class="p-note" value="${escapeHtml(p.note||'')}" placeholder="Not"></td>
      <td><button type="button" class="icon-btn danger remove-row">Sil</button></td>`;
    $('passengerTable').querySelector('tbody').appendChild(tr);
  }
  function ensurePassengerRows(){ const tbody=$('passengerTable')?.querySelector('tbody'); if(tbody && !tbody.children.length){ passengerRow(); passengerRow(); } }
  function clearPassengerForm(){
    $('listId').value=''; $('listTourId').value=''; $('listTourSelect').value=''; $('listTitle').value=''; $('listDate').value=''; $('listLeader').value=''; $('listNotes').value='';
    $('passengerTable').querySelector('tbody').innerHTML=''; passengerRow(); passengerRow(); renderPassengerTourSelect();
  }
  function readPassengers(){
    return Array.from($('passengerTable').querySelectorAll('tbody tr')).map(tr=>({
      name: tr.querySelector('.p-name').value.trim(),
      gender: tr.querySelector('.p-gender').value.trim(),
      tc: tr.querySelector('.p-tc').value.trim(),
      phone: tr.querySelector('.p-phone').value.trim(),
      passportNo: tr.querySelector('.p-passport').value.trim(),
      birthDate: tr.querySelector('.p-birth').value,
      passportStart: tr.querySelector('.p-pass-start').value,
      passportEnd: tr.querySelector('.p-pass-end').value,
      roomPeople: tr.querySelector('.p-room-people').value,
      roomNo: tr.querySelector('.p-room-no')?.value.trim() || '',
      note: tr.querySelector('.p-note').value.trim()
    })).filter(p=>p.name || p.gender || p.tc || p.phone || p.passportNo || p.birthDate || p.passportStart || p.passportEnd || p.roomPeople || p.roomNo || p.note);
  }
  async function savePassengerList(){
    const passengers = sortPassengersForRooms(readPassengers());
    const tourId = $('listTourSelect').value || $('listTourId').value || '';
    const selectedTour = state.tours.find(t=>t.id===tourId);
    if(selectedTour && !$('listTitle').value.trim()) $('listTitle').value = selectedTour.title;
    if(!$('listTitle').value.trim()){ toast('Tur seç veya liste başlığı yaz.'); return; }
    if(!passengers.length){ toast('En az 1 yolcu ekle.'); return; }
    const id = $('listId').value || uid('l');
    const item = {id,tourId,title:$('listTitle').value.trim(),date:$('listDate').value,leader:$('listLeader').value.trim(),notes:$('listNotes').value.trim(),passengers,createdAt:new Date().toISOString()};
    const idx=state.passengerLists.findIndex(x=>x.id===id); if(idx>-1) state.passengerLists[idx]=item; else state.passengerLists.unshift(item);
    await saveData(); clearPassengerForm(); renderPassengerAdmin(); renderDashboard(); toast('Yolcu listesi kaydedildi.');
  }
  function editPassengerList(id){
    const l=state.passengerLists.find(x=>x.id===id); if(!l) return; switchTab('passengers'); renderPassengerTourSelect(l.tourId || '');
    $('listId').value=l.id; $('listTourId').value=l.tourId||''; $('listTourSelect').value=l.tourId||''; $('listTitle').value=l.title||''; $('listDate').value=l.date||''; $('listLeader').value=l.leader||''; $('listNotes').value=l.notes||'';
    $('passengerTable').querySelector('tbody').innerHTML=''; (l.passengers||[]).forEach(passengerRow); ensurePassengerRows(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function passengerRowHtml(p, i, listId){
    const originalIndex = typeof p._originalIndex === 'number' ? p._originalIndex : i;
    return `<tr class="passenger-order-row" draggable="true" data-list-id="${escapeHtml(listId)}" data-passenger-index="${originalIndex}">
      <td class="drag-cell"><span class="drag-handle" title="Tut sürükle">☰</span> ${i+1}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.gender)}</td>
      <td>${escapeHtml(p.tc)}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${escapeHtml(p.passportNo)}</td>
      <td>${escapeHtml(p.birthDate)}</td>
      <td>${escapeHtml(p.passportStart)}</td>
      <td>${escapeHtml(p.passportEnd)}</td>
      <td><select class="inline-room-people" data-list-id="${escapeHtml(listId)}" data-room-people-index="${originalIndex}">${['','1','2','3','4','5+'].map(v=>`<option value="${v}" ${String(p.roomPeople || p.room || '')===v?'selected':''}>${v ? v + ' Kişilik' : 'Seç'}</option>`).join('')}</select></td>
      <td><input class="inline-room-no" data-list-id="${escapeHtml(listId)}" data-room-no-index="${originalIndex}" value="${escapeHtml(p.roomNo||'')}" placeholder="Oda no"></td>
      <td>${escapeHtml(p.note)}</td>
    </tr>`;
  }

  function passengerRoomGroupsHtml(l){
    const groups = groupPassengersByRoom(l.passengers || []);
    if(!groups.length) return '<div class="empty small">Bu listede yolcu bilgisi yok.</div>';
    return groups.map(group => `<div class="room-group-block">
      <div class="room-group-title">${escapeHtml(group.title)} <span>${group.items.length} yolcu</span></div>
      <div class="passenger-detail-wrap">
        <table class="passenger-detail-table room-table">
          <thead><tr><th>Sıra</th><th>Ad Soyad</th><th>Cinsiyet</th><th>TC No</th><th>Telefon</th><th>Pasaport No</th><th>Doğum Tarihi</th><th>Pasaport Başlangıç</th><th>Pasaport Bitiş</th><th>Oda Kaç Kişilik</th><th>Oda No</th><th>Not</th></tr></thead>
          <tbody>${group.items.map((p,i)=>passengerRowHtml(p,i,l.id)).join('')}</tbody>
        </table>
      </div>
    </div>`).join('');
  }

  function passengerListCard(l){
    const tourTitle = (state.tours.find(t=>t.id===l.tourId)||{}).title || l.title || '-';
    return `<div class="passenger-list-card" data-list-card="${escapeHtml(l.id)}">
      <div class="passenger-list-top">
        <div>
          <h3>${escapeHtml(l.title)} <small>${escapeHtml(l.date||'')}</small></h3>
          <p><b>Tur:</b> ${escapeHtml(tourTitle)} &nbsp; <b>Rehber:</b> ${escapeHtml(l.leader||'-')} &nbsp; <b>Yolcu:</b> ${(l.passengers||[]).length}</p>
          ${l.notes ? `<p><b>Liste Notu:</b> ${escapeHtml(l.notes)}</p>` : ''}
          <p class="hint-text"><b>Otomatik sıra:</b> Yolcular oda kişiliğine ve soyadına göre sıralanır. Aynı soyad + aynı oda kişiliği olanlar alt alta gelir. Solundaki ☰ işaretiyle manuel sıra da değiştirebilirsin.</p>
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" data-edit-list="${escapeHtml(l.id)}">Düzenle</button>
          <button class="icon-btn" data-print-list="${escapeHtml(l.id)}">PDF / Yazdır</button>
          <button class="icon-btn danger" data-delete-list="${escapeHtml(l.id)}">Sil</button>
        </div>
      </div>
      <div class="passenger-room-area">${passengerRoomGroupsHtml(l)}</div>
    </div>`;
  }

  function reorderPassenger(listId, fromIndex, toIndex){
    const l = state.passengerLists.find(x=>x.id===listId);
    if(!l || !Array.isArray(l.passengers)) return;
    fromIndex = Number(fromIndex); toIndex = Number(toIndex);
    if(!Number.isFinite(fromIndex) || !Number.isFinite(toIndex) || fromIndex === toIndex) return;
    const item = l.passengers.splice(fromIndex, 1)[0];
    if(!item) return;
    const insertAt = fromIndex < toIndex ? toIndex : toIndex;
    l.passengers.splice(insertAt, 0, item);
  }

  async function updatePassengerRoomField(listId, passengerIndex, field, value){
    const l = state.passengerLists.find(x=>x.id===listId);
    if(!l || !l.passengers || !l.passengers[passengerIndex]) return;
    l.passengers[passengerIndex][field] = value;
    if(field === 'roomPeople') l.passengers = sortPassengersForRooms(l.passengers);
    await saveData();
    if(field === 'roomPeople') renderPassengerAdmin();
  }

  function renderPassengerAdmin(){
    const list = $('passengerListAdmin'); if(!list) return;
    if(!state.passengerLists.length){ list.innerHTML='<p>Henüz kayıtlı yolcu listesi yok.</p>'; return; }

    const groups = [];
    state.tours.forEach(t => {
      const items = state.passengerLists.filter(l => l.tourId === t.id);
      groups.push({title:t.title, type:typeLabel(t.type), items});
    });
    const noTour = state.passengerLists.filter(l => !state.tours.some(t => t.id === l.tourId));
    if(noTour.length) groups.push({title:'Tur seçilmemiş / eski kayıtlar', type:'Liste', items:noTour});

    list.innerHTML = groups.map(g => `<section class="passenger-group"><div class="passenger-group-head"><h3>${escapeHtml(g.title)}</h3><span>${escapeHtml(g.type)} • ${g.items.length} liste</span></div>${g.items.length ? g.items.map(passengerListCard).join('') : '<div class="empty small">Bu turun altında kayıtlı yolcu listesi yok.</div>'}</section>`).join('');
  }
  function printList(id){
    const l = state.passengerLists.find(x=>x.id===id); if(!l) return;
    const tourTitle = (state.tours.find(t=>t.id===l.tourId)||{}).title || l.title || '-';
    const groupsHtml = groupPassengersByRoom(l.passengers || []).map(group => {
      const rows = group.items.map((p,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.gender)}</td><td>${escapeHtml(p.tc)}</td><td>${escapeHtml(p.phone)}</td><td>${escapeHtml(p.passportNo)}</td><td>${escapeHtml(p.birthDate)}</td><td>${escapeHtml(p.passportStart)}</td><td>${escapeHtml(p.passportEnd)}</td><td>${escapeHtml(p.roomPeople || p.room)}</td><td>${escapeHtml(p.roomNo||'')}</td><td>${escapeHtml(p.note)}</td></tr>`).join('');
      return `<h2 class="print-room-title">${escapeHtml(group.title)} (${group.items.length} yolcu)</h2><table><thead><tr><th>No</th><th>Ad Soyad</th><th>Cinsiyet</th><th>TC No</th><th>Telefon</th><th>Pasaport No</th><th>Doğum Tarihi</th><th>Pasaport Başlangıç</th><th>Pasaport Bitiş</th><th>Oda Kişilik</th><th>Oda No</th><th>Not</th></tr></thead><tbody>${rows}</tbody></table>`;
    }).join('') || '<p>Bu listede yolcu bilgisi yok.</p>';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(l.title)} Yolcu Listesi</title><link rel="stylesheet" href="style.css"></head><body><div class="print-page passenger-print"><div class="print-head"><div><h1>${escapeHtml(l.title)}</h1><div class="print-meta"><b>Tur:</b> ${escapeHtml(tourTitle)} &nbsp; <b>Tarih:</b> ${escapeHtml(l.date||'-')} &nbsp; <b>Rehber:</b> ${escapeHtml(l.leader||'-')} &nbsp; <b>Yolcu:</b> ${(l.passengers||[]).length}</div></div><img src="assets/logo.png" alt="Hazeyn"></div>${groupsHtml}<div class="print-notes"><b>Liste Notu:</b><br>${escapeHtml(l.notes||'')}</div></div><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;
    const w = window.open('', '_blank');
    if(w){ w.document.write(html); w.document.close(); }
    else { const blob = new Blob([html], {type:'text/html'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(l.title||'yolcu-listesi')+'.html'; a.click(); URL.revokeObjectURL(a.href); toast('Popup engellendi. Yazdırma dosyası indirildi.'); }
  }

  function exportBackup(){
    const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hazeyn-yedek-' + new Date().toISOString().slice(0,10) + '.json'; a.click(); URL.revokeObjectURL(a.href);
  }

  function bindAdminEvents(){
    $('loginBtn').onclick = async () => {
      const password = $('adminPassword').value;
      const ok = await validateAdminPassword(password);
      if(ok){
        adminLoggedIn = true;
        $('adminPassword').value = '';
        renderAdmin();
      } else {
        alert('Şifre hatalı.');
      }
    };
    $('adminPassword').addEventListener('keydown', e=>{ if(e.key==='Enter') $('loginBtn').click(); });
    $('logoutBtn').onclick = () => { adminLoggedIn = false; sessionStorage.removeItem('hazeynAdminPassword'); renderAdmin(); };
    document.querySelectorAll('.admin-tab').forEach(btn=>btn.onclick=()=>switchTab(btn.dataset.tab));
    $('exportBtn').onclick = exportBackup;
    $('tourForm').addEventListener('submit', saveTour); $('tourReset').onclick = resetTourForm;
    $('tourImageFile').addEventListener('change', e=>previewFile(e.target, src=>{ tempTourImage=src; $('tourPreview').src=src; }));
    $('tourHotelMekkeFile').addEventListener('change', e=>previewFiles(e.target, srcs=>{ tempHotelMekkeImages=uniqueList([...tempHotelMekkeImages, ...srcs]); renderMultiPreview('tourHotelMekkePreview', tempHotelMekkeImages); }));
    $('tourHotelMedineFile').addEventListener('change', e=>previewFiles(e.target, srcs=>{ tempHotelMedineImages=uniqueList([...tempHotelMedineImages, ...srcs]); renderMultiPreview('tourHotelMedinePreview', tempHotelMedineImages); }));
    $('reviewForm').addEventListener('submit', saveReview); $('reviewReset').onclick = resetReviewForm;
    $('galleryForm').addEventListener('submit', saveGallery);
    $('galleryFile').addEventListener('change', e=>previewFile(e.target, src=>{ tempGalleryImage=src; $('galleryPreview').src=src; }));
    $('staffForm').addEventListener('submit', saveStaff); $('staffReset').onclick = resetStaffForm;
    $('staffFile').addEventListener('change', e=>previewFile(e.target, src=>{ tempStaffImage=src; $('staffPreview').src=src; }));
    $('blogForm').addEventListener('submit', saveBlog); $('blogReset').onclick = resetBlogForm;
    $('blogFile').addEventListener('change', e=>previewFile(e.target, src=>{ tempBlogImage=src; $('blogPreview').src=src; }));
    $('settingsForm').addEventListener('submit', saveSettings);
    if($('heroBannerFile')) $('heroBannerFile').addEventListener('change', e=>previewFile(e.target, src=>{ tempHeroBannerImage=src; $('heroBannerPreview').src=src; }));
    if($('saveHeroBanner')) $('saveHeroBanner').onclick = saveHeroBanner;
    if($('resetHeroBanner')) $('resetHeroBanner').onclick = resetHeroBannerForm;
    $('listTourSelect').addEventListener('change', e=>{ const t = state.tours.find(x=>x.id===e.target.value); $('listTourId').value = e.target.value; if(t) $('listTitle').value = t.title; });
    $('addPassengerRow').onclick = () => passengerRow(); $('savePassengerList').onclick = savePassengerList; $('clearPassengerList').onclick = clearPassengerForm;
    $('passengerTable').addEventListener('click', e=>{ if(e.target.classList.contains('remove-row')){ e.target.closest('tr').remove(); ensurePassengerRows(); } });

    document.addEventListener('dragstart', (e)=>{
      const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item');
      if(bannerItem){
        dragHeroBannerInfo = {id: bannerItem.dataset.heroBannerId};
        bannerItem.classList.add('dragging');
        if(e.dataTransfer){
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', JSON.stringify(dragHeroBannerInfo));
        }
        return;
      }
      const row = e.target.closest && e.target.closest('.passenger-order-row');
      if(!row) return;
      dragPassengerInfo = {listId: row.dataset.listId, index: Number(row.dataset.passengerIndex)};
      row.classList.add('dragging');
      if(e.dataTransfer){
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(dragPassengerInfo));
      }
    });
    document.addEventListener('dragover', (e)=>{
      const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item');
      if(bannerItem && dragHeroBannerInfo){
        e.preventDefault();
        bannerItem.classList.add('drag-over');
        if(e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        return;
      }
      const row = e.target.closest && e.target.closest('.passenger-order-row');
      if(!row || !dragPassengerInfo || row.dataset.listId !== dragPassengerInfo.listId) return;
      e.preventDefault();
      row.classList.add('drag-over');
      if(e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });
    document.addEventListener('dragleave', (e)=>{
      const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item');
      if(bannerItem) bannerItem.classList.remove('drag-over');
      const row = e.target.closest && e.target.closest('.passenger-order-row');
      if(row) row.classList.remove('drag-over');
    });
    document.addEventListener('drop', async (e)=>{
      const bannerItem = e.target.closest && e.target.closest('.hero-banner-admin-item');
      if(bannerItem && dragHeroBannerInfo){
        e.preventDefault();
        bannerItem.classList.remove('drag-over');
        const changed = reorderHeroBanner(dragHeroBannerInfo.id, bannerItem.dataset.heroBannerId);
        dragHeroBannerInfo = null;
        if(changed){
          await saveData();
          renderHeroBannerAdmin();
          applySettings();
          toast('Banner sırası güncellendi.');
        }
        return;
      }
      const row = e.target.closest && e.target.closest('.passenger-order-row');
      if(!row || !dragPassengerInfo || row.dataset.listId !== dragPassengerInfo.listId) return;
      e.preventDefault();
      row.classList.remove('drag-over');
      reorderPassenger(dragPassengerInfo.listId, dragPassengerInfo.index, Number(row.dataset.passengerIndex));
      dragPassengerInfo = null;
      await saveData();
      renderPassengerAdmin();
      toast('Yolcu sırası güncellendi.');
    });
    document.addEventListener('dragend', ()=>{
      dragPassengerInfo = null;
      dragHeroBannerInfo = null;
      document.querySelectorAll('.passenger-order-row.dragging,.passenger-order-row.drag-over,.hero-banner-admin-item.dragging,.hero-banner-admin-item.drag-over').forEach(el=>el.classList.remove('dragging','drag-over'));
    });
    document.addEventListener('change', async (e)=>{
      const roomNo = e.target.closest && e.target.closest('[data-room-no-index]');
      if(roomNo){ await updatePassengerRoomField(roomNo.dataset.listId, Number(roomNo.dataset.roomNoIndex), 'roomNo', roomNo.value.trim()); return; }
      const roomPeople = e.target.closest && e.target.closest('[data-room-people-index]');
      if(roomPeople){ await updatePassengerRoomField(roomPeople.dataset.listId, Number(roomPeople.dataset.roomPeopleIndex), 'roomPeople', roomPeople.value); }
    });

    document.addEventListener('click', async (e)=>{
      const delTour=e.target.closest('[data-delete-tour]'); if(delTour && confirm('Tur silinsin mi?')){ state.tours=state.tours.filter(x=>x.id!==delTour.dataset.deleteTour); await saveData(); renderTourAdmin(); renderPassengerTourSelect(); renderDashboard(); toast('Tur silindi.'); }
      const editTourBtn=e.target.closest('[data-edit-tour]'); if(editTourBtn) editTour(editTourBtn.dataset.editTour);
      const delReview=e.target.closest('[data-delete-review]'); if(delReview && confirm('Yorum silinsin mi?')){ state.reviews=state.reviews.filter(x=>x.id!==delReview.dataset.deleteReview); await saveData(); renderReviewAdmin(); renderDashboard(); toast('Yorum silindi.'); }
      const editReviewBtn=e.target.closest('[data-edit-review]'); if(editReviewBtn) editReview(editReviewBtn.dataset.editReview);
      const delGallery=e.target.closest('[data-delete-gallery]'); if(delGallery && confirm('Görsel silinsin mi?')){ state.gallery=state.gallery.filter(x=>x.id!==delGallery.dataset.deleteGallery); await saveData(); renderGalleryAdmin(); renderDashboard(); toast('Görsel silindi.'); }
      const editStaffBtn=e.target.closest('[data-edit-staff]'); if(editStaffBtn) editStaff(editStaffBtn.dataset.editStaff);
      const delStaff=e.target.closest('[data-delete-staff]'); if(delStaff && confirm('Ekip üyesi silinsin mi?')){ state.staff=(state.staff||[]).filter(x=>x.id!==delStaff.dataset.deleteStaff); await saveData(); renderStaffAdmin(); renderDashboard(); toast('Kadro silindi.'); }
      const editBlogBtn=e.target.closest('[data-edit-blog]'); if(editBlogBtn) editBlog(editBlogBtn.dataset.editBlog);
      const delBlog=e.target.closest('[data-delete-blog]'); if(delBlog && confirm('Yazı silinsin mi?')){ state.blogs=(state.blogs||[]).filter(x=>x.id!==delBlog.dataset.deleteBlog); await saveData(); renderBlogAdmin(); renderDashboard(); toast('Yazı silindi.'); }
      const editHeroBannerBtn=e.target.closest('[data-edit-hero-banner]'); if(editHeroBannerBtn) editHeroBanner(editHeroBannerBtn.dataset.editHeroBanner);
      const delHeroBanner=e.target.closest('[data-delete-hero-banner]'); if(delHeroBanner && confirm('Banner silinsin mi?')){ state.settings.heroBanners=(state.settings.heroBanners||[]).filter(x=>x.id!==delHeroBanner.dataset.deleteHeroBanner); await saveData(); renderHeroBannerAdmin(); applySettings(); toast('Banner silindi.'); }
      const editList=e.target.closest('[data-edit-list]'); if(editList) editPassengerList(editList.dataset.editList);
      const printListBtn=e.target.closest('[data-print-list]'); if(printListBtn) printList(printListBtn.dataset.printList);
      const delList=e.target.closest('[data-delete-list]'); if(delList && confirm('Yolcu listesi silinsin mi?')){ state.passengerLists=state.passengerLists.filter(x=>x.id!==delList.dataset.deleteList); await saveData(); renderPassengerAdmin(); renderDashboard(); toast('Liste silindi.'); }
    });
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    state = await loadData();
    if(page === 'public') renderPublic();
    if(page === 'admin') { bindAdminEvents(); renderAdmin(); }
  });
})();
