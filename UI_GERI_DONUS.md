# Muhasebe görünümü — 27 Eylül 2026

Yeni çalışma alanı yalnızca `admin.html?desktop=1` ve `admin.html?mobile=1` muhasebe ekranlarında açılır. Site yönetimi ayrıdır.

## Beğenmezseniz

Üstte **Klasik görünüme dön** düğmesini kullanın. Tekrar denemek için **Yeni görünümü dene** düğmesine basın. Seçim yalnızca kullandığınız tarayıcı/cihazda hatırlanır. Aynı kayıtlar ve aynı formlar kullanılır; görünüm geçişi sunucuya kayıt göndermez.

## Kayıtların korunması

Bu güncelleme veri tabanı şeması veya kayıt taşıma işlemi içermez. Tur, yolcu, ödeme ve maliyet kimlikleri korunur. Aynı adlı turlar kimliklerine göre ayrılır; tura bağlı olmayan eski listeler ayrı karttan açılır. Firma hesapları ile site/muhasebe tur ayrımı korunur.

Kaydedilmemiş bir form varken yeni görünümde tur/bölüm değiştirmek engellenir. Formu kaydedin ya da ilgili Temizle / Vazgeç düğmesini kullanın. Görünüm değiştirmek formda yazılanları silmez.

## Kod seviyesinde geri dönüş

Güncelleme öncesi kod sürümü `backup/ui-before-20260927` etiketiyle saklandı (f1bc440659d87f35624ec15fe2139b44761d9ee0). Gerekirse bu arayüz güncellemesinin commit'i Git revert ile geri alınabilir. İş verisi yedeğini içe aktarmaya gerek yoktur; yalnızca kod geri çevrilir. Sonradan yapılan bağımsız geliştirmeler korunmalıdır.

## Doğrulama

`pnpm test` tur kimliğiyle ayırma, Türkçe arama, rotalar, eski kayıtlar ve iç içe ödeme/belge bilgilerinin değişmemesini kapsar. Yerel tarayıcı kontrolleri sentetik hesapla yapılır; gerçek müşteri kayıtları test verisi olarak kullanılmaz.
