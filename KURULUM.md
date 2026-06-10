# Hazeyn Web Sitesi - Ücretsiz Yayın Kurulumu

Bu sürüm Vercel + Supabase için hazırlandı. VPS almadan ücretsiz yayınlayabilirsin.

## 1) Supabase kur

1. https://supabase.com adresinden yeni proje oluştur.
2. Project Settings > API kısmından şunları kopyala:
   - Project URL
   - anon public key
   - service_role secret key
3. SQL Editor aç ve `supabase.sql` dosyasındaki SQL kodunu çalıştır.

Not: Görsel yükleme için bucket API tarafından otomatik oluşturulmaya çalışır. Oluşmazsa Supabase panelinden Storage > New bucket ile `hazeyn` adlı public bucket oluştur.

## 2) Vercel kur

1. Bu klasörü GitHub'a yükle.
2. https://vercel.com üzerinden Add New Project ile GitHub reposunu içe aktar.
3. Project Settings > Environment Variables kısmına şunları ekle:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=anon public key
SUPABASE_SERVICE_ROLE_KEY=service_role secret key
ADMIN_PASSWORD=senin-admin-sifren
SUPABASE_TABLE=hazeyn_data
SUPABASE_ROW_ID=main
SUPABASE_BUCKET=hazeyn
```

4. Deploy et.

## 3) Domain bağla

Vercel projesinde Settings > Domains kısmına domainini ekle:

```
hazeynturizm.com
www.hazeynturizm.com
```

Vercel sana hangi DNS kayıtlarını girmen gerektiğini gösterecek. İsimtescil DNS ekranında Vercel'in verdiği kayıtları aynen gir.

Genelde kullanılan kayıtlar:

```
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

Ama en doğrusu Vercel'in Domain ekranında verdiği değerleri kopyalamaktır.

## 4) Admin panel

Yayınlandıktan sonra:

```
https://domainin.com/admin
```

Şifre: Vercel Environment Variables kısmında `ADMIN_PASSWORD` olarak ne yazdıysan odur.

## 5) Neler değişti?

- Artık kayıtlar `data/db.json` dosyasına değil Supabase veritabanına kaydolur.
- Görseller Supabase Storage'a yüklenir.
- Vercel ücretsiz planda siteyi yayınlayabilirsin.
- Admin panelden tur, banner, yolcu, blog, kadro ve galeri düzenlenebilir.
- Görsel yükleme 50 MB sınırına göre ayarlı. Supabase/Vercel hesabındaki limitler dolarsa panelden temizleme gerekebilir.

## Yerelde deneme

Sadece eski lokal sistemi denemek için:

```
node server.js
```

Lokal kullanımda Supabase görsel yükleme devreye girmez; görseller tarayıcı/JSON mantığında çalışır. Canlı yayın için Vercel + Supabase kullan.
