# Turizm NFC — Android ve iPhone

Bu uygulama mevcut `https://www.hazeynturizm.com/admin.html?mobile=1` muhasebe ekranını açar. Giriş yaptıktan sonra Yolcu Listesi bölümünde **önce programı seçin**, ardından **NFC ile okut** düğmesini kullanın. Belgenin üzerindeki numara, doğum ve bitiş tarihini (veya destekleniyorsa 6 haneli CAN'ı) girip telefonu çipe tutun. Önizlemede eski ve yeni alanları karşılaştırın; ardından **Değişiklikleri listeye uygula** ve **Listeyi Kaydet** düğmelerine basın. Telefon ve bilgisayar merkezi veriyi paylaşır.

Aynı T.C. veya belge numarası seçilen programda bulunursa mevcut yolcu güncellenir. Birden fazla eşleşme ya da çelişen T.C. varsa otomatik değişiklik yapılmaz. Çipte bulunmayan alanlar korunur. DG2 fotoğrafı varsa **Fotoğrafı indir / paylaş** ile telefona alınabilir; fotoğraf muhasebe veritabanına eklenmez. DG11/DG12 varsa doğum yeri, düzenleyen makam, tam doğum tarihi ve düzenlenme tarihi de okunur. Tüm belgelerde bu alanlar bulunmaz. Çipin dijital imzası şu sürümde doğrulanmaz.

Pasaport çipinde T.C. numarası yoksa okuma öncesinde T.C. alanına numarayı elle girin. Uygulama kontrol basamağını doğrular ve çipte farklı numara varsa işlemi durdurur. Önizlemede elle girilen numarayı ayrıca kontrol edin.

## Android

`flutter pub get && flutter build apk --release --target-platform android-arm64` komutu APK üretir. Teslim edilen deneme APK'sı Flutter'ın geliştirme anahtarıyla imzalıdır; Play Store yayını ve otomatik güncelleme için işletmenin kalıcı Android imza anahtarıyla yeniden derlenmelidir. Android cihazda NFC açık olmalıdır.

## iPhone

Kaynak kodu iOS için hazırdır. Mac + Xcode + Apple geliştirici hesabında `flutter build ipa` ile imzalanıp yüklenmelidir. Bu Windows makinede imzalı iPhone uygulaması üretilemez. Safari'nin “Ana Ekrana Ekle” sürümü muhasebe işlemlerini açar fakat pasaport çipi okumak için yerel uygulama gerekir.

## Bilgisayar

Masaüstü uygulaması web ile aynı liste verisini gösterir. Bilgisayarda doğrudan NFC okuma, uyumlu USB okuyucu modeli ve sürücüsü bilinmeden eklenmemiştir. Telefondan kaydedilen yolcu senkronize olduğunda bilgisayarda görünür.

`flutter test`, `flutter analyze` ve kök `pnpm test` doğrulaması çalıştırılır. Gerçek belgeyle NFC okuması ve iOS cihaz kurulumu fiziksel cihaz olmadan doğrulanamaz.
