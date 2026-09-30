# Afyon Hakikat — muhasebe uygulaması

Giriş ekranında veya üstteki Firma hesabı seçicisinde **Afyon Hakikat** seçilir. Baş yönetici üç firmaya erişir. Çalışanlara erişim, Kullanıcılar & Yetkiler bölümünden Afyon Hakikat işaretlenerek verilir. Eski çalışanların firma yetkileri değiştirilmez.

## Kayıt ayrımı

- Kalıcı firma kimliği: `afyon`; varsayılan Supabase satırı: `afyon`. İlk kayıt yapılana kadar boş firma varsayılanı kullanılır; başka firmadan kayıt kopyalanmaz.
- Cihaz önbelleği: `turizmData:afyon`. Yerel sunucu dosyası: `data/db-afyon.json`. Makbuz ön eki: `AFH`.
- İsteğe bağlı sunucu ayarı: `SUPABASE_AFYON_ROW_ID`. Diğer firma satırlarıyla aynı olamaz.
- Halka açık site, turları ve içerikleri Hazeyn üzerinden çalışmaya devam eder. Firma logosu olarak mevcut Hakikat logosu, yanında açık Afyon Hakikat adı kullanılır.

## Ortak otobüs

Otobüs düzeni → Diğer firmayla birleştir: bir veya iki başka firmanın programı ve yolcu listeleri seçilebilir. Var olan ortak plana **Başka firma ekle** ile üçüncü firma eklenebilir; mevcut koltuklar korunur.

Her otobüste sol ve sağ taraf ayrı seçilir. Tamamı tek firmaya ayrılan araçlar, otomatik öneri, manuel istisna, ilk dört görevli koltuğuna elle yolcu koyma ve çıktı devam eder. Bir çalışanın ortak planı görmesi/düzenlemesi için plana dahil tüm firmalara ve ilgili yolcu yetkilerine sahip olması gerekir.

## WhatsApp

Afyon başka firmanın gönderici hesabını otomatik kullanmaz. Bu özellik isteniyorsa sunucuda `AFYON_WHATSAPP_ACCESS_TOKEN`, `AFYON_WHATSAPP_PHONE_NUMBER_ID` ve `AFYON_WHATSAPP_BUSINESS_NUMBER` tanımlanır. Şablon ayarları da `AFYON_` ön ekiyle özelleştirilebilir. Bu güncelleme mesaj göndermez.

## Geri alma

Önceki sürüm `backup/before-afyon-company-20260930` etiketiyle korunur. Kod geri alınırsa Afyon satırını veya ortak plan kayıtlarını silmeyin. Üç firma içeren planlar eski istemciden düzenlenmemelidir; güncel sunucu bu yazmaları engeller. Afyon verisi oluşturulduktan sonra tamamen eski sunucuyu yayımlamak yerine bu değişikliği ileri yönde düzeltmek tercih edilir.

Doğrulama: firma erişimi ve yetki iptali, satır/önbellek ayrımı, altı sağ-sol eşleşmesi, üç firmalı yerleşim, eski plana ekleme, eşzamanlı kayıt çatışmaları ve firma kayıtlarının değişmemesi otomatik testlerle denetlenir. Ekran testleri yalnızca yerel sentetik verilerle yapılır.
