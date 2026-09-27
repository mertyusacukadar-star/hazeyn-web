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

## Veri ve yetki sınırları

Planlar şirket verisinde ayrı `tourBusPlans[tourId]` alanında tutulur. Koltuklar yolcu listesi ve yolcu kimliği çiftine bağlıdır; isim değişimi koltuğu kaybettirmez. Silinen yolcuların eski koltukları plan açıldığında temizlenir. `viewPassengers` görüntüleme, `managePassengers` düzenleme yetkisidir. Sunucu kapasite, hedef, koltuk ve tekrarlı yerleşim biçimini doğrular. Site kayıtları ve alanı tanımayan eski istemciler mevcut planları korur. Planlar herkese açık site verisine dahil edilmez.

## Doğrulama ve geri dönüş

`pnpm test`: otomatik aile gruplama, hedef dolmadan sonraki otobüse geçme, elle taşıma, kapasite sınırları, aynı adlı yolcu kimlikleri, 1–80 koltuk için tekil numaralar, veri koruma, eski istemciler, sunucu yetkileri ve rota testleri.

Yerel sentetik turda iki otobüs, aile seçimi, elle taşıma, koltuk takası, kapasite küçültme engeli, kaydetme ve yeniden yükleme kontrol edildi. İlk plan kaydında bütün mevcut alan değerleri korundu; yolcu listeleri ve ödemeler birebir aynı kaldı. Telefon genişliğinde koltuk seçimi ve taşma kontrol edildi. Gerçek yolcu verisiyle test yapılmadı.

Kod öncesi yedek etiketi: `backup/before-bus-plan-20260927`. Özellik geri alınırsa sunucudaki plan alanı korunmalı; yolcu verisi yedeği içe aktarılmamalıdır.
