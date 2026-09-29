# Umre görünürlüğü — 29 Eylül 2026

Sekiz aktif tur için ilk HTML'de başlık, tarih, süre, otel ve oda fiyatları bulunur. Mevcut program-page.js canlı public API'den güncel ayrıntıları yüklemeye devam eder. Canonical, Open Graph, TouristTrip/Offer ve BreadcrumbList bilgileri aynı veriden oluşturulur. Sahte puan, değerlendirme veya garanti eklenmedi.

## İçerik güncelleme

Statik HTML arama motoru kopyasıdır; yönetim panelindeki değişiklikler JavaScript görünümüne hemen yansır, ilk HTML kopyasını otomatik güncellemez. Tur/fiyat/durum değişince `node scripts/build-tour-seo.cjs` çalıştırılıp değişiklikler yayınlanmalıdır. Bu adım public API dışında veri okumaz, muhasebeye yazmaz. Yeni/sona eren tur değişikliklerinde sitemap de güncellenmelidir. Uzun vadede sunucu tarafında canlı render veya güvenli yayın tetikleyicisi eklenmelidir.

## Kullanıcıyla yapılacaklar

1. Google hesabıyla Search Console'a giriş; mevcut mülk varsa onu kullan, yoksa alan adı sahipliğini doğrula. Mevcut DNS kayıtlarını silme.
2. `https://www.hazeynturizm.com/sitemap.xml` adresini gönder. URL Denetimi ile ana sayfa ve tur sayfalarının durumunu kontrol et.
3. Google Haritalar'da mevcut Hazeyn profilini bul; mükerrer profil oluşturma. İşletme sahibi doğrulamasını kullanıcı tamamlar.
4. Gerçek işletme adı, adres, telefon, çalışma saatleri, TÜRSAB belge bilgisi ve gerçek ofis/kafile fotoğraflarını işletme sahibinden doğrula. Bilinmeyen bilgi ekleme.
5. Gerçek müşterilerden dürüst yorum iste; sahte yorum, toplu spam ve satın alınmış bağlantı kullanma.
6. Search Console gösterim/tıklama/indeks verileriyle sonucu ölç. Ücretli reklam için ayrı bütçe ve açık onay gerekir.

Google, AI sonuçları için özel işaretleme gerekmediğini ve indeksleme/gösterim garantisi olmadığını belirtir: https://developers.google.com/search/docs/appearance/ai-features
