# Windows kurulumu

Paylaşılacak dosya: **Turizm-Muhasebe-Kurulum-2.1.5-Windows10-11-32ve64bit.exe**.

Bu kurulum Windows'un 32 / 64 bit sistem türünü otomatik belirler ve uygun uygulamayı yükler. Windows 10 ve 11 içindir. Windows 7, 8 ve 8.1 güncel Electron tarafından desteklenmez.

Portable dosyaları ayrı mimarilere aittir: `ia32` 32 bit, `x64` 64 bit Windows içindir. Çalışanlara karışıklığı önlemek için yukarıdaki **Kurulum** dosyasını gönderin. `win-unpacked` klasöründeki EXE tek başına paylaşılacak kurulum değildir.

## “Bu uygulama bilgisayarınızda çalışamıyor”

1. Ayarlar → Sistem → Hakkında → **Sistem türü** ve **Windows sürümü** bilgisini kontrol edin.
2. Windows 10 / 11 için yukarıdaki ortak kurulumu tamamen indirip çalıştırın.
3. Dosyayı gönderdikten sonra dosya boyutu veya SHA-256 değerini `SHA256SUMS.txt` ile karşılaştırarak aktarımın tamamlandığını doğrulayın.
4. Windows 7 / 8 / 8.1 varsa bu paket uygun değildir. Desteklenen Windows'a geçiş gerekir; uygulama hesabı aynı kalır.

Kurulumun uygulama kimliği ve veri klasörü önceki sürümle aynıdır. Hesaplar ve firma kayıtları merkezi sunucudadır; kurulum bunları değiştirmez.

## Yeniden paketleme

`pnpm install --frozen-lockfile`, `pnpm build` ve `pnpm verify:release`.

Doğrulama, kurulumun 32 bit başlatıcısını ve içine gömülmüş iki mimarinin EXE dosyalarını kontrol eder, her iki çalışma motorunu kurulum yapmadan başlatır ve sıkıştırılmış paketlerin bütünlüğünü sınar. Başarılı sonuçta `SHA256SUMS.txt` ve `verification-report.json` oluşturulur.

Electron 43 serisi Windows ia32 paketlerini destekleyen son ana seridir. Electron yükseltmesi yapılırken 32 bit desteği ayrıca değerlendirilmelidir. Kurulum her iki mimariyi birlikte içerir; portable çıktılarında mimari dosya adına eklenir.
