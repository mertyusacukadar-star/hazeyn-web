# Hazeyn public site — 30 Eylül 2026

Ana sayfa, tur ayrıntıları, fiyatlar, Ümraniye, rehber ve kadro sayfaları yayınlanmış site verisinden sunucuda hazırlanır. Başlık, açıklama, kapak, otel, fiyatlar ve günlük program ilk HTML'de bulunur. JavaScript'in sonradan eski bannerı veya boş programı değiştirmesi gerekmez.

`api/site-page.js` yalnızca GET kabul eder ve sanitizePublicState kullanır. Muhasebe, yolcular ve kimlik bilgileri public HTML'e eklenmez; bu endpoint hiçbir veri kaydı yapmaz. Panelde kaydedilen site içeriği sonraki renderlarda okunur (edge önbelleği 30 saniye, stale-while-revalidate 60 saniye). Bağlantı kesilirse son public yayın kopyası gösterilir. Eski kapaklar ortak tasarım katmanında düzeltilir; yeni özel yüklemeler korunur.

`node scripts/prepare-public-pages.cjs` public API'den sadece yayınlanabilir alanları okuyarak yedek HTML ve public snapshot üretir. Eski build-tour-seo / restore-public-pages komutları aynı hazırlayıcıya yönlendirilir. `node scripts/configure-public-routes.cjs` iki Vercel proje kökü için yönlendirme ayarlarını üretir. Deployment sonrası canlı endpoint, yönlendirmeler ve ilk HTML tekrar doğrulanmalıdır.

Tur URL'leri kalıcı `/<slug>` biçimindedir. Eski `program.html?slug=…` bağlantıları kalıcı yönlendirilir. Sona eren programlar aktif listelerden ve sitemap'ten çıkarılır; arşiv URL'si açıklamayla açık kalır. Oda seçenekleri TouristTrip/Offer olarak işaretlenir. Puan veya yorum şeması uydurulmaz. Güncel sitemap canlı site verisinden üretilir.

Search Console'da sitemap gönderimi ve 6 Kasım turunun indeksleme isteği 29 Eylül'de kabul edildi. Google Haritalar'daki mevcut işletme için site ekleme önerisi gönderildi; işletme sahipliği doğrulaması değildir. Sonuçlar Search Console gösterim/tıklama/indeks raporuyla takip edilir. Ücretli reklam, satın alınmış link veya sahte yorum uygulanmadı.

Google sıralaması, indeksleme zamanı veya yapay zekâ önerisi garanti edilemez. Google AI özellikleri için ayrıca özel şema gerekmediğini belirtir: https://developers.google.com/search/docs/appearance/ai-features

Vercel bu projede `server.js` Node sunucusunu da çalıştırır. `/api/site-page` GET-only adapterı bu sunucuya bağlanmıştır; mevcut veri/yetki/muhasebe endpointleri değiştirilmemiştir. 30 Eylül canlı denetiminde ana sayfalar ve sekiz program 200 döndü. Google 404 raporundaki `/tr/haberler`, `/tr/iletisim`, `/tr/hac-umre` adresleri karşılıklarına kalıcı yönlendirilir. Karşılığı doğrulanamayan eski 5 yıldız/kampanya veya kültür turu adresleri için yeni içerik uydurulmaz; özgün içerik bulunmadan topluca ana sayfaya yönlendirilmez.
