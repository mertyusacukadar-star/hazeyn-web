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

## Kalabalık listeler ve giriş düzenlemesi

Turlar Güncel / Geçmiş / Taslak / Tümü filtreleriyle altışar gösterilir. Bitiş tarihi kalkış ve süreyle hesaplanır; kayıtlara durum yazılmaz. Tarihi olmayan turlar güncel listede kalır. Muhasebe programları dörder, borçlu yolcular beşer gösterilir; geçmiş borçlar gizlenmez. Arama sayfadaki değil bütün eşleşen kayıtları kapsar.

Giriş ekranı özgün Hazeyn logosunu kullanır. Hatalar odak kilitleyen yerel uyarı penceresi yerine sayfada gösterilir; uygulama onayları erişilebilir HTML iletişim kutusudur.

Bu düzenleme öncesi kod: `backup/ui-before-20260927-refinements` (`1b534ee72b1baf3849e2166c339894ce26697155`). Klasik görünüm düğmesi kullanılabilir.

Doğrulama: 11 test grubu; sentetik 35 tur/35 borçlu ile sayfalama, Türkçe arama, geçmiş turlar, ödeme kartına gitme, klasik görünüm, yanlış şifre ardından tekrar giriş ve 390 px giriş yerleşimi. Yerel testte sıfır veri yazımı ve değişmeyen veri özeti doğrulandı. Gerçek Electron penceresinde odak testi ayrıca kullanıcı cihazında gözlemlenmelidir.
