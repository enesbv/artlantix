# Artlantix ürün ve production incelemesi

Son güncelleme: 16 Eylül 2026

## Sonuç

Kod tabanı, sahte ödeme ve tarayıcıda kalan iş akışlarından gerçek bir **teklif talebi ürünü** modeline geçirildi. Müşteri hesabı, özel dosya yükleme, teklif/sipariş kaydı, stüdyo kuyruğu, mesajlaşma, önizleme onayı, revizyon ve gerçek master teslimi Supabase üzerinden çalışacak şekilde tasarlandı.

Canlı Supabase projesine temel şema ve güvenlik sertleştirmesi MCP üzerinden uygulandı; altı `public` tablosunda RLS açık olduğu doğrulandı. Yerel uygulama proje URL'si ve publishable key ile bağlandı, demo modu kapatıldı ve `/api/health` backend'i `configured` olarak gördü. Bu yine de “canlı ortam tamamen hazır” anlamına gelmez: iki müşteri + bir admin ile canlı RLS/Storage yetki matrisi henüz çalıştırılmadı; ClamAV zinciri kodda ve container olarak hazır olsa da bu makinede Docker bulunmadığı için gerçek engine çalıştırılmadı. Final alan adı/CDN smoke testi de yapılmadı. Bu dış adımlar tamamlanmadan gerçek müşteri dosyası kabul edilmemelidir.

## Bu çalışmada tamamlananlar

- Production ortamında Supabase eksikse localStorage demo kullanıcısına veya sahte siparişe düşme kapatıldı.
- Demo modu geliştirme ortamıyla ve açık `NEXT_PUBLIC_DEMO_MODE=true` seçeneğiyle sınırlandı.
- Sahte kart tahsilatı, sahte fatura ve ödeme başarı mesajları kaldırıldı.
- Tüm yeni müşteri işleri `quote_requested` durumunda, ödeme alınmadan stüdyo incelemesine giriyor.
- Giriş yapmamış müşteri teklif taslağını kaybetmeden giriş sayfasına yönlendiriliyor ve `/quote` güvenli dönüş allowlist'ine eklendi.
- Müşteri dosyası yüklendikten sonra sipariş ve dosya metadata'sı `create_order_with_file` RPC'sinde tek veritabanı transaction'ı içinde yazılıyor.
- RPC başarısızsa yalnız henüz siparişe bağlı olmayan müşteri nesnesini silebilen dar Storage politikasıyla telafi temizliği yapılıyor.
- B2B sayfası yerel dosya adı taslağı yerine 20 dosyaya kadar gerçek yükleme ve dosya başına takip edilebilir teklif oluşturuyor.
- Sahte ZIP/metin manifesti kaldırıldı; arşiv alanı yalnız gerçek `final_master` dosyalarını indiriyor.
- `/api/health`, `robots.txt`, `sitemap.xml`, 404/global error ekranları ve production standalone çıktısı eklendi.
- GitHub Actions; frozen dependency kurulumu, test, lint ve build kontrollerini çalıştırıyor.
- Supabase CLI, local config ve pgTAP ile iki müşteri + bir admin tenant izolasyonu testi eklendi; CI'da Docker üzerinde çalışacak ayrı database-security işi hazırlandı.
- Private ClamAV adapter, container tanımı, bearer-token doğrulaması, boyut sınırı, scan durumları, karantina politikası, zararlı nesne silme ve admin retry akışı eklendi.
- README ve AI proje rehberi yeni ürün sınırlarına göre güncellendi.

## Doğrulanan kontroller

```text
pnpm test   13/13 geçti (ClamAV protokol/adaptör testi dahil)
pnpm lint   0 hata, 0 uyarı
pnpm build  başarılı; TypeScript ve 24 route üretimi geçti
```

## Yayın öncesi zorunlu dış adımlar

| Öncelik | İş | Tamamlanma ölçütü |
| --- | --- | --- |
| P0 | Canlı RLS/Storage tenant doğrulaması | Temel şema ve hardening production projesine uygulandı; iki müşteri + bir admin ile profil, sipariş, mesaj ve private bucket izin/red matrisi hâlâ geçmeli. |
| P0 | Malware engine aktivasyonu | Dahili ClamAV container'ı private network'te çalışmalı; temiz ve EICAR dosyalarıyla `pending → clean/infected` ve operatör erişim kapısı doğrulanmalı. |
| P0 | Auth ve edge koruması | Email doğrulama, kesin OAuth redirect listesi, rate limit, CAPTCHA, admin MFA/AAL2 ve request body limitleri doğrulanmalı. |
| P0 | Canlı smoke test | Kayıt, giriş, reset, upload, teklif, mesaj, önizleme, revizyon, master teslimi ve signed URL final alan adında geçmeli. |
| P1 | Operasyon gözlemi | Merkezi hata izleme, append-only audit olayları, alarm, yedek/geri dönüş ve orphan object taraması kurulmalı. |
| P1 | Yerelleştirme | Sipariş detayı, hesap, B2B ve admin ekranlarında kalan İngilizce metinler sözlüklere taşınmalı. |
| P1 | Ölçüm ve performans | Gerçek production medyasıyla Lighthouse/LCP/INP ölçülmeli; liste pagination'ı eklenmeli. |

## Bilinçli ürün sınırları

- Uygulama çevrim içi ödeme almaz. Tahsilat, stüdyo teklif onayından sonra harici yürütülür. Gelecekte ödeme eklenirse server-side fiyat, kalıcı payment kaydı, idempotency ve doğrulanmış webhook zorunludur.
- Toplu B2B akışı gerçek teklif oluşturur; otomatik indirim, kredi limiti, şirket onayı veya fatura üretmez.
- “Tümünü indir” tarayıcıda gerçek master dosyalarının her biri için ayrı indirme başlatır; sunucuda ZIP üretmez.
- Geliştirme demosu gerçek üretim verisi veya müşteri referansı değildir.

## Son değerlendirme

Uygulama kodu artık dürüst ve işlevsel bir quote-first MVP sınırına sahiptir. Production deployment için kod tarafındaki ana demo engelleri kaldırılmıştır. Yayın kararı, yukarıdaki P0 dış sistem kontrollerinin kanıtlanmasına bağlıdır.
