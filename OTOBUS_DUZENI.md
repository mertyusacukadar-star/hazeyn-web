# Tur bazında otobüs düzeni

Tur çalışma alanında bir tur açın, **Otobüs düzeni** sekmesine geçin.

- **Otobüs ekle:** Her araca ayrı ad, 1–80 koltuk ve otomatik yerleştirme hedefi verilir. Bir turda en fazla 20 otobüs bulunur.
- Varsayılan çizim 49 koltuk, 2+2 sıra, sağda orta kapı boşluğu ve arkada 5 koltuktur. Kapı önündeki sıra ve arka sıra sayısı ayarlanır. Numaralandırma bu şemaya göredir; farklı araçların fiziksel numaralarıyla karşılaştırılmalıdır.
- **Otomatik hedef:** Örneğin 49 koltuklu ilk otobüsün hedefi 30 yapılabilir. Sonraki gruplar ikinci otobüse geçer. Hedef 0 olan araç otomatik yerleştirmeye alınmaz. Elle yerleştirme kapasiteye kadar yapılabilir.
- **Boşta kalanları otomatik yerleştir:** Turun kayıtlı liste sırasını izler. Aynı soyadlıların ilk görünme sırasına göre gruplar oluşturur, grubu bölmez, mümkünse ardışık koltuk verir. Mevcut yerleşimi değiştirmez. Grubun bir kısmı elle yerleşmişse diğerleri aynı otobüse sığdığı takdirde eklenir. Birden fazla otobüse elle bölünmüş gruplar otomatik tamamlanmaz; açıklama gösterilir. Ayrı soyadı alanı yoksa adın son kelimesi soyadı kabul edilir.
- **Elle yerleştirme:** Bir veya birkaç yolcu seçip boş koltuğa dokunun; toplu seçimde o numaradan itibaren boş koltuklara yerleştirilir. Ya da otobüsü seçip **Seçilenleri bu otobüse al** düğmesini kullanın. **Soyadı seç** bütün listedeki aynı soyadlıları seçer.
- Dolu koltuk seçilerek yolcu başka boş koltuğa taşınabilir. Tek bir yerleşmiş yolcu seçiliyken başka dolu koltuğa dokunulursa onayla yer değiştirirler.
- **Koltuktan çıkar** yalnızca yerleşimi kaldırır. **Bu otobüsü kaldır** içindeki yolcuları bekleyenlere döndürür. Yolcu ve ödeme kayıtları silinmez.
- **Planı kaydet** kayıt yapar. **Vazgeç** son kayıtlı plana döner. Kaydedilmemiş plan varken tur/firma değiştirme, senkronizasyon ve çıkış engellenir. Ağ hatasında cihazda saklanan planın merkezi kaydı tamamlanmadığı açıkça gösterilir; tekrar kaydetmek gerekir.

## Esnek düzen ve çıktı

- Sol önde ayrı **Kaptan** alanı bulunur. İlk dört yolcu koltuğu boşken **Görevli** yazar. Otomatik yerleştirme bu dört koltuğu atlar. Yolcuyu seçip görevli koltuğuna dokunarak **elle yerleştirme yapılabilir**; mevcut kayıtlar taşınmaz veya silinmez.
- **Otobüs ayarları → Sağ-sol koltukları ve kapıyı özelleştir:** Sol sıra sayısı, sağ ön/arka sıra sayısı, iki tarafta sıra başına 1–3 koltuk, arka 0–5 koltuk ve orta kapının tarafı/boşluğu ayarlanır. Kapı kaldırılabilir. Özel düzende toplam kapasite hesaplanır; 4–80 koltuk desteklenir. **Standart 49 koltuk düzeni** ilk düzeni geri getirir. Kaldırılacak koltuklarda yolcu varsa kapasite küçültülmez.
- Standart ayarlardaki **Orta kapı arkasındaki sıra** sağ arka sıraları sınırlar. Kapasite sabit kalır, kalan koltuklar sol tarafta devam eder. Özel düzende ise sağ/sol sıra sayıları toplam kapasiteyi belirler.
- **Koltuk numaralarını düzenle:** 1–999 arasında farklı numaralar verilebilir. Numaralar yalnızca etikettir; yolcular kendi koltuklarında kalır. Aynı numara iki kez kullanılamaz. Numaraları uyguladıktan sonra **Planı kaydet** kullanılmalıdır.
- **Bu otobüsü yazdır / Tümünü yazdır:** Uygulama içinde A4 ön izleme açılır. **Yazdır / PDF kaydet** sistem yazdırma penceresini açar. Otobüsler ayrı sayfalardan başlar; uzun düzenler devam sayfalarına ayrılır. Çıktı için `exportPassengerLists` yetkisi gerekir. Kaydedilmemiş ekrandaki düzenin de ön izlemesi alınabilir.

## Telefon formu

Havalimanı alanlarında **Havalimanı seç** düğmesi kod veya şehir adıyla arama açar. Kod elle de yazılabilir. Dar/dokunmatik ekranlarda uçuş, doğum ve pasaport tarihleri gün/ay/yıl penceresinde **Tarihi uygula** ile işlenir; pencereyi açmak veya vazgeçmek değeri değiştirmez. Yolcu giriş tablosu dar ekranlarda etiketli kartlara dönüşür.

Yeni doğrulamalar: görevli yerine elle yerleştirme ve kayıt sonrası koruma, otomatik yerleştirmede görevli yerlerini atlama, özel geometri ve numara doğrulaması, çıktı metni kaçışları, artık yıl/geçersiz tarih kontrolü. Yerel tarayıcıda 390 px telefon formu, havaalanı araması, tarih onayı/iptali, 49 koltuğun A4 alanına sığması ve standart düzene dönüş kontrol edildi. Üç yerel otobüs kaydı sonrasında 3118 mevcut alan değeri korundu; yolcu, ödeme, tur ve gider kayıtları değişmedi. Fiziksel iPhone ve yazıcı testi yapılmadı.

Bu güncellemeden önceki kod etiketi: `backup/before-bus-custom-20260927`.

## Veri ve yetki sınırları

Planlar şirket verisinde ayrı `tourBusPlans[tourId]` alanında tutulur. Koltuklar yolcu listesi ve yolcu kimliği çiftine bağlıdır; isim değişimi koltuğu kaybettirmez. Silinen yolcuların eski koltukları plan açıldığında temizlenir. `viewPassengers` görüntüleme, `managePassengers` düzenleme yetkisidir. Sunucu kapasite, hedef, koltuk ve tekrarlı yerleşim biçimini doğrular. Site kayıtları ve alanı tanımayan eski istemciler mevcut planları korur. Planlar herkese açık site verisine dahil edilmez.

## Doğrulama ve geri dönüş

`pnpm test`: otomatik aile gruplama, hedef dolmadan sonraki otobüse geçme, elle taşıma, kapasite sınırları, aynı adlı yolcu kimlikleri, 1–80 koltuk için tekil numaralar, veri koruma, eski istemciler, sunucu yetkileri ve rota testleri.

Yerel sentetik turda iki otobüs, aile seçimi, elle taşıma, koltuk takası, kapasite küçültme engeli, kaydetme ve yeniden yükleme kontrol edildi. İlk plan kaydında bütün mevcut alan değerleri korundu; yolcu listeleri ve ödemeler birebir aynı kaldı. Telefon genişliğinde koltuk seçimi ve taşma kontrol edildi. Gerçek yolcu verisiyle test yapılmadı.

Kod öncesi yedek etiketi: `backup/before-bus-plan-20260927`. Özellik geri alınırsa sunucudaki plan alanı korunmalı; yolcu verisi yedeği içe aktarılmamalıdır.
