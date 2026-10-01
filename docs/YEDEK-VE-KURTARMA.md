# Turizm Muhasebe — yedek ve kurtarma

## Veriler nerede?

- Asıl yolcu, ödeme, gider ve tur kayıtları Supabase `hazeyn_data` tablosundadır. Üç firmanın satırları ayrıdır. Ortak otobüsler ve çalışan hesapları ayrıca saklanır.
- GitHub uygulamanın kaynak kodunu ve halka açık site içeriğini saklar. Müşteri yedeği GitHub'a gönderilmez.
- Tarayıcı / masaüstü uygulaması IndexedDB ve localStorage içinde cihaz kopyası tutar. Bu kopya cihaz kaybına karşı yedek değildir.

## Güncellemenin sağladığı koruma

Her merkezi kayıt, kullanıcı değişikliği ve ortak otobüs değişikliğinden önce özel tabloda önceki sürümün kopyası alınır. Kopya yazılamazsa asıl veri değiştirilmez. Aynı sürümü iki cihazın üzerine yazması sürüm kontrolüyle engellenir. Baş yönetici girişinde, en fazla günde bir kez, mevcut üç firma ve ortak kayıtlar için kurtarma noktası kontrol edilir. Bu, uygulama kapalıyken çalışan bir zamanlayıcı değildir.

Kopyalar içerik özetiyle tekilleştirilir; otomatik silme veya süre dolumu uygulanmaz. Veritabanı büyüklüğü izlenmelidir. Bu koruma, Supabase hesabının kendi yedek / PITR hizmetinden bağımsız uygulama korumasıdır. Aynı veritabanındaki kopyalar tüm projenin kaybolmasına karşı yeterli değildir.

## Bağımsız dosya yedeği

Baş yönetici hesabında **Yedek ve kurtarma → Üç firmayı yedekle**. Ayrı bir yedek şifresi belirleyin. Dosya tarayıcıda AES-256-GCM ile şifrelenir; anahtar PBKDF2-SHA256 ile türetilir. Şifre sunucuya gönderilmez ve uygulamada tutulmaz. Şifre unutulursa dosya açılamaz.

Dosya üç firmanın yolcu, kimlik, ödeme, gider, tur, silinen tur ve otobüs kayıtları ile çalışan hesaplarını içerir. Sunucunun tutarlı sürümleri indirilir. Henüz eşitlenmemiş mevcut cihaz değişiklikleri varsa `deviceDraft` alanına ayrıca konur; otomatik olarak sunucu verisinin üzerine yazılmaz. Gerektiğinde geri yükleme bölümünde “eşitlenmemiş cihaz taslağı” seçilerek önizleme ve onayla geri alınabilir. Kullanıcı hesaplarının parola özetleri de bulunduğundan dosyayı ve şifreyi güvenli ve ayrı yerlerde saklayın.

Yedeği yalnız aynı bilgisayarda bırakmayın; harici disk veya size ait güvenilir bulut hesabında ikinci kopya tutun. Bağlantıyla tutulan Storage görsellerinin dosyaları bu JSON yedeğine dahil değildir; yalnız bağlantıları bulunur. Supabase proje silinmesi / Storage kaybı için görseller ayrıca yedeklenmelidir. Sağlayıcının mevcut yedek planı bu kod güncellemesiyle doğrulanmış veya etkinleştirilmiş olmaz.

## Geri alma

### Bağımsız hedef seçimi

**Yedek ve kurtarma → Bilgisayar · Google Drive · OneDrive** bölümünde her hedefin kutusu bağımsızdır. Hiçbiri zorunlu değildir. Bir, iki veya üçünü seçebilirsiniz. “Üçünü de seç” ve “Seçimi temizle” kısayolları vardır. Seçimler, sıklık ve şifreleme anahtarı bu cihazın IndexedDB alanında kalır; başka cihazda yeniden ayarlanır.

- Bilgisayar: destekleyen tarayıcıda klasör seçilir. Yalnız bu klasöre yeni şifreli dosya yazılır. İzin kaybında kullanıcıya bildirilir.
- Google Drive: doğrudan bağlı hesaptaki `Turizm Muhasebe Yedekleri` klasörüne yüklenir. Bilgisayara dosya indirme veya Drive masaüstü uygulaması gerekmez.
- OneDrive: doğrudan uygulamanın özel `Apps` klasörüne yüklenir. Bilgisayara dosya yazılmaz.

Bulut hedeflerinde “Hesap bağla” ardından izin ekranı bağlantısı açılır; kullanıcı kendi hesabıyla onaylar. Her seçili hedef için yedek şifresi belirlenir. “Seçili hedeflere şimdi yedekle” anında deneme yapar. Başarı ancak dosya oluşturulup boyutu sağlayıcı yanıtından doğrulanınca gösterilir. Bir hedefte hata diğerini durdurmaz. Uygulama açık ve baş yönetici giriş yapmışken seçilen sıklıkta kontrol edilir; içerik değişmemişse aynı gün tekrar dosya oluşturulmaz. Elle yedekleme her zaman yeni dosya oluşturur. Kapalı uygulama veya kilitlenmiş/uyutulmuş telefon arka planda yedek üretmez.

Bulut yedeklerinden son 20 dosya uygulamada listelenir; şifreyle açıp doğrudan geri yüklemek mümkündür. Dosyaları otomatik silen bir işlem yoktur. Hesap bağlantısını kaldırmak uygulamada saklanan yetkiyi siler; buluttaki dosyaları veya sağlayıcı hesabındaki onay kaydını silmez.

### Bulut sunucusu kurulumu (bir defa)

Bu özellik kodunun eklenmesi sağlayıcı hesaplarının bağlandığı anlamına gelmez. İlgili ortam değişkenleri yokken düğme “sunucu kurulumu gerekiyor” durumunda kalır; başarı gösterilmez.

1. Google Cloud projesinde Drive API etkinleştirilir, OAuth izin ekranı ve **Web application** istemcisi oluşturulur. Dar `drive.file` kapsamı yalnız uygulamayla kullanılan dosyalar içindir. Dış kullanıcılar için sağlayıcının yayın/izin ekranı gereksinimleri tamamlanır; test durumundaki izinler kalıcı işletim için uygun olmayabilir.
2. Microsoft Entra uygulama kaydında ihtiyaç duyulan hesap türleri (kişisel Microsoft hesabı dahil olacaksa ona uygun tür) ve Web yönlendirme adresi tanımlanır. Yetkiler `Files.ReadWrite.AppFolder`, `User.Read`, `offline_access`.
3. İki sağlayıcının yönlendirme adresi **tam olarak** `https://www.hazeynturizm.com/api/backup-cloud?action=callback` olmalıdır. Başka alan adı için `BACKUP_PUBLIC_ORIGIN` ve sağlayıcı yönlendirmeleri birlikte değiştirilir.
4. `ENV.example` içindeki istemci kimlikleri ve gizli anahtarlar yalnız dağıtım sunucusunun gizli ortam ayarlarına yazılır. `BACKUP_TOKEN_ENCRYPTION_KEY` uzun, rastgele ve kalıcı bir sunucu anahtarı olmalıdır. Git'e, tarayıcıya veya kullanıcı yedeğine konmaz. Eksikse mevcut sunucu oturum anahtarı / servis anahtarı kullanılır; anahtarın değişmesi yeniden hesap bağlamayı gerektirir.
5. Dağıtımdan sonra baş yönetici kendi Google/Microsoft hesabına izin verir, hedefleri seçer, yedek şifresini belirler ve ilk dosyayı oluşturur. Gerçek sağlayıcıda yükleme ve geri yükleme denemesi tamamlanmadan bulut yedekleri çalışır kabul edilmemelidir. Otomatik testler sağlayıcı yanıtlarını taklit eder; gerçek hesapları kullanmaz.

OAuth PKCE ve tek kullanımlık, 10 dakika geçerli durum kodu kullanır. Yenileme anahtarları sunucuda AES-GCM ile şifreli tutulur. Dosya içeriği ayrıca tarayıcıda şifrelendiğinden sunucu buluta yalnız şifreli dosyayı yollar. Doğrudan bulut aktarımı için dosya sınırı 3.5 MB'tır; daha büyük dosyalarda hata açıkça gösterilir ve şifreli elle indirme kullanılabilir. Fotoğraf dosyaları yine ayrıca korunmalıdır.

Kaynaklar: [Google OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [Drive yükleme](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [OneDrive uygulama klasörü](https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder).

### Kayıtları geri yükleme

**Turu sil**: yolcu / ödeme varsa sayılar ve dosya indirme seçeneği gösterilir. Tur ve bağlı kayıtlar `Silinen turlar` bölümüne taşınır. Ortak otobüs bağlantısı olan turda önce bağlantının kaldırılması gerekir.

**Silinen turlar → Geri al**: yolcular, ödemeler, giderler ve oturma planı birlikte döner. Yinelenen kimlikler varsa işlem durur; mevcut kayıt ezilmez.

**Kurtarma noktaları → İncele** veya **Dosyadan geri yükle**: firma, ortak otobüsler ya da çalışan hesapları ayrı seçilir. Onay öncesi kayıt sayıları gösterilir, mevcut durum yedeklenir ve sürüm kontrolü yapılır. Firma geri yüklemesi halka açık site içeriğini değiştirmez. Ortak otobüsler için önce ilgili firmaların kayıtları tamamlanmalıdır. Çalışan hesaplarını geri yüklemek eski çalışan oturumlarını kapatır. Tam veri kaybı durumunda önce üç firma, sonra ortak otobüsler ve çalışan hesapları geri yüklenir. Tek tur yedeği de dosyadan eklenebilir.

## İşletme kontrolü

Supabase panelinde canlı RLS politikaları, erişim anahtarları, yedek planı ve geri yüklenebilir en son tarih ayrıca kontrol edilmelidir. Resmî bilgi: https://supabase.com/docs/guides/platform/backups

Uygulama içi kurtarma ve şifreli dosya, bağımsız otomatik yedek hizmetinin yerine geçmez. Bağımsız otomatik kopyanın hedefi ve erişimi ayrıca yapılandırılmalıdır. Hiçbir yöntem sıfır veri kaybı garantisi olarak sunulmaz; düzenli geri yükleme denemesi yapılmalıdır.
