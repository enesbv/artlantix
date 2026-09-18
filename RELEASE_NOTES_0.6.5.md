# Artlantix 0.6.5 Sürüm Notları

Tarih: 18 Eylül 2026

Bu sürüm müşteri sipariş takibini sadeleştirir, operatör çalışma alanını yeniden düzenler ve sipariş sonrası numaralı onay ekranını ekler.

## Müşteri sipariş takibi

- `/dashboard` artık istatistik paneli yerine sade bir sipariş takip ekranıdır.
- Üç aşama: grafiker incelemesi, çizim aşaması ve dosyaların hazır olması. Mevcut aşama büyük, kod tabanlı bir illüstrasyonla; adımlar alt bölümde gösterilir.
- Önizleme onayı, revizyon ve paketleme çizim aşamasında kalır. Dosyalar hazır aşaması yalnızca operatör teslimatı tamamladığında gösterilir.
- Kompakt üst menü, bildirimler ve hesap menüsü; duruma uygun tek ana işlem; yüklenme, hata ve boş durumları; mobil uyumlu görünüm.
- Tek ayrı sipariş listesi operatörlere özel `/admin/orders` sayfasıdır. Eski `/dashboard/orders` adresi buraya yönlendirilir; müşteriler `/dashboard` üzerinden takip eder. Sipariş detay adresleri korunur.

## Operatör paneli

- İşlem gerektiren sipariş özetleri, tüm durum filtreleri, arama, 20 satırlık istemci tarafı sayfalama ve mobil sipariş kartları.
- Görünür sekmelerde dakikalık yenileme, manuel yenileme ve son listeyi koruyan hata gösterimi.
- Bildirim menüsü gerçek siparişlerden inceleme, revizyon, paketleme ve gecikme uyarıları üretir; ilgili güncelleme penceresini açar. Bunlar push veya okunmamış mesaj bildirimleri değildir.
- Statik grafikler, doğrulanmamış SLA oranları, sahte aktif grafiker/vardiya bilgileri ve işlevsiz kontroller kaldırıldı.
- Durum değişikliği artık demo modunda bile sahte teslim dosyası üretmez; dosya yüklemek için gerçek bir dosya seçmek gerekir.

## Sipariş numarası ve onay ekranı

- Başarıyla kaydedilen siparişin numarası ayrı onay ekranında gösterilir; takip ekranına geçiş sunulur.
- Yalnızca izole demo modunda, kayıt olmadan ad ve e-posta ile tarayıcıya yerel misafir siparişi oluşturulabilir.
- Resend e-posta uç noktası eklendi: doğrulanmış oturum, sipariş sahipliği ve aynı kaynak kontrolleri; veritabanından sipariş numarası ve oturumdan alıcı adresi; sağlayıcı idempotency anahtarı.
- Sağlayıcının kabul ettiği e-posta kuyrukta olarak gösterilir, teslim edildi olarak değil. Demo e-postaları gönderilmez; başarısız gönderim siparişi tekrar oluşturmaz.

## Vitrin ve demo verileri

- Öncesi/sonrası karşılaştırması daha düzenli ve yerelleştirilmiş bir tasarıma kavuştu; klavye ve işaretçi kontrolleri iyileştirildi.
- Sabit stüdyo demonstrasyonu açıkça etiketlendi; doğrulanmamış performans yüzdeleri yerine açıklayıcı özellikler kullanıldı.
- Başlangıç demo siparişleri bire indirildi. Eski dört örnek tarayıcı kaydı temizlenmeden önce `artlantix_orders_before_single_sample` altında yedeklenir; kullanıcı tarafından oluşturulan siparişler ve canlı Supabase kayıtları korunur.

## Canlı kullanım sınırları

- Gerçek misafir siparişi ve cihazlar arası misafir takibi bu sürümde tamamlanmış değildir; güvenli e-posta doğrulamalı sahiplik akışı gerekir. Üretim siparişleri hâlâ kimliği doğrulanmış kullanıcıya bağlıdır.
- Canlı onay e-postası için Supabase bağlantısı, `RESEND_API_KEY` ve doğrulanmış `ORDER_EMAIL_FROM` gerekir. Bu kurulumda gerçek gönderim doğrulanmadı.
- Kalıcı e-posta outbox'ı ve teslim webhook'u yoktur. Operatör dosya yükleme/durum güncelleme dizisi atomik değildir; sayfalama sunucu tarafında yapılmaz.
- Bu sürüm yayın veya veritabanı migrasyonu uygulandığı anlamına gelmez; mevcut güvenlik ve staging doğrulamaları geçerliliğini korur.

## Doğrulama

- 22/22 regresyon testi başarılı.
- ESLint: sıfır hata ve uyarı.
- Production build ve TypeScript kontrolü başarılı.
- Sipariş takibi masaüstünde ve 390 px mobil görünümde kontrol edildi.
