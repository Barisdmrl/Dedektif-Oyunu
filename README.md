# 🔪 Ters Dedektif: Katili Bul

Firebase tabanlı gerçek zamanlı multiplayer dedektif oyunu. 21 farklı rol, dinamik gece olayları ve gelişmiş ipucu sistemi ile her oyun farklı bir deneyim!

## 🎯 Oyun Hakkında

**Ters Dedektif**, geleneksel Mafia/Werewolf oyunlarından esinlenen sosyal çıkarım oyunudur. Konum tabanlı ipuçları, görsel semboller, sahte notlar ve 3 takım sistemi (İyi/Kötü/Nötr) ile zenginleştirilmiş derin strateji oyunu.

## 🎭 Roller Sistemi

### 🌟 Temel Roller (Her Oyunda)
| Rol | Açıklama | Takım |
|-----|----------|-------|
| 🔎 **Dedektif** | Her tur sonunda ölen kişiden ipucu öğrenir. Katili bulmaya çalışır. | İyi |
| 🕵️ **Casus** | Katilin kim olduğunu bilir. Dedektife gizlice yardım eder. | İyi |
| 🔪 **Katil** | Her gece birini öldürür. Yakalanmamaya çalışır. | Kötü |
| 🛡️ **Güvenlik** | Her gece bir kişiyi korur. Korunan kişi öldürülemez. | İyi |

### 🎲 Rastgele Roller - İyi Takım (2-3 Tanesi Her Oyunda)
| Rol | Açıklama | Özel Yetenek |
|-----|----------|--------------|
| 🔬 **Adli Tıpçı** | Ölen oyuncuların rollerini öğrenir. Bilgiyi gizli tutar. | Ölü analizi |
| 🧠 **Psikolog** | İki oyuncu seçer, aralarındaki ilişkiyi analiz eder (%50 doğruluk). | İlişki analizi |
| 👥 **İkizler** | Birbirlerini bilir. Biri ölürse diğeri çift oy kullanır. | Çift güç |
| 🪞 **Yansıtıcı** | Saldırıyı geri yansıtır. Tek kullanımlık koruma. | Saldırı yansıtma |
| 🛡️ **Gölge Koruyucu** | Gizlice korur, kimse koruduğunu bilmez. | Gizli koruma |
| 📊 **Strateji Uzmanı** | Oylama davranışlarını analiz eder, şüpheli hareketleri tespit eder. | Davranış analizi |
| 😇 **Masum** | Özel yeteneği yoktur. Dedektife yardım eder. | - |

### 🎲 Rastgele Roller - Kötü Takım
| Rol | Açıklama | Özel Yetenek |
|-----|----------|--------------|
| 🧛 **Kan Emici** | Katili bilir, geceleri hipnotize eder (oy gücü çalar). | Hipnotizm |
| 🎭 **Manipülatör** | Geceleri oyuncuların oylarını yönlendirir. | Oy manipülasyonu |
| 🎪 **Taklitçi Katil** | Gerçek katili bilir, dikkat dağıtıcı rol oynar. | Sahte katil |
| 💥 **Sabotajcı** | Oylama sırasında oyları geçersiz kılabilir (tek kullanım). | Oylama sabotajı |
| 🎭 **Yalancı Dedektif** | Kendini dedektif olarak tanıtır, sahte ipuçları verir. | Sahte dedektiflik |

### 🎲 Rastgele Roller - Nötr Takım
| Rol | Açıklama | Kazanma Koşulu |
|-----|----------|----------------|
| 🌙 **Gölge** | Nötr rol. Hayatta kalmaya odaklanır. | Son 3 kişide kalır |
| 🧙 **Gizemli Adam** | Her tur rol değiştirir. Rolünü kendisi bile bilmez. | Son 3 kişide kalır |
| 🛡️ **Hayatta Kalan** | Sadece hayatta kalmaya odaklanır. | Oyun sonuna kadar yaşar |
| 🌪️ **Kaos Ustası** | Bir kez başkasının rolünü değiştirebilir. | Hiçbir takım kazanamazsa |
| 🎪 **Şöhret Avcısı** | En çok oy alıp ölmeye çalışır. | En çok oyu alıp elenir |
| 🕵️ **İkili Ajan** | İlk turdan sonra hangi takımda olacağını seçer. | Seçtiği takımla |
| 🔮 **Sezici** | Rastgele oyuncular hakkında bilgi alır (%70 doğruluk). | Hayatta kalır |

## 🎮 Nasıl Oynanır

### 1. Oyun Kurulumu
- Minimum 4, maksimum 15+ oyuncu
- Oda kodu ile katılım
- Host oyunu başlatır
- **Rastgele roller** her oyunda farklı seçilir (2-3 ekstra rol)

### 2. Detaylı Oyun Akışı
1. **Rol Dağıtımı** → Her oyuncu rolünü, konumunu ve görsel özelliğini öğrenir
2. **Güvenlik Fazı** → Güvenlik koruyacağı kişiyi seçer (varsa)
3. **Gölge Koruyucu Fazı** → Gölge koruyucu gizlice koruma yapar (varsa)
4. **Manipülatör Fazı** → Manipülatör oyları yönlendirir (varsa)
5. **Adli Tıp Fazı** → Adli tıpçı ölen oyuncuları inceler (varsa)
6. **Psikolog Fazı** → Psikolog ilişki analizi yapar (varsa)
7. **Sezici Fazı** → Sezici rastgele bilgi alır (varsa)
8. **Gece Fazı** → Katil kurbanını seçer, %30 ihtimalle gece olayı
9. **Gündüz Fazı** → Herkes tartışır, dedektif ipucu alabilir
10. **Strateji Uzmanı Fazı** → Davranış analizi yapar (varsa)
11. **Oylama Fazı** → Sabotajcı müdahale edebilir, en çok oy alan elenir
12. Bu döngü kazanan taraf belirlenene kadar devam eder

### 3. Kazanma Koşulları
- **İyi Takım**: Tüm katilleri ve kan emicileri elirlerse kazanır
- **Kötü Takım**: Tüm iyi takımı öldürürse veya sayı üstünlüğü ele geçirirse kazanır
- **Nötr Takım**: 
  - Gölge/Gizemli Adam/Hayatta Kalan son 3 kişide kalırsa kazanır
  - Şöhret Avcısı en çok oyu alıp ölürse kazanır
  - Kaos Ustası hiçbir takım kazanamazsa kazanır
  - İkili Ajan seçtiği takımla kazanır
- **Son Tahmin**: 3 kişi kalırsa dedektif son tahmin hakkı kullanabilir

## 🌙 Gelişmiş Gece Olayları Sistemi (%30 İhtimal)

### 🌫️ Kısıtlayıcı Olaylar
| Olay | Etki | İhtimal |
|------|------|---------|
| ☁️ **Bulutlu Gece** | Adli tıpçı çalışamaz | %15 |
| 😱 **Panik Gecesi** | Kimse oy veremez | %10 |
| ⛈️ **Fırtınalı Gece** | Psikolog çalışamaz | %15 |

### ✨ Güçlendirici Olaylar
| Olay | Etki | İhtimal |
|------|------|---------|
| 😨 **Çığlık Gecesi** | Dedektif ekstra ipucu alır | %12 |
| 💫 **Empati Gecesi** | Psikolog 3 kişilik analiz yapabilir | %7 |
| 🌕 **Dolunay** | Kan emici 2 kişiyi hipnotize edebilir | %8 |
| 👼 **Koruyucu Gece** | Kimse öldürülemez | %5 |
| 💡 **İçgörü Gecesi** | Herkes ipucu alır | %10 |

### 🎭 Özel Rol Olayları
| Olay | Etki | İhtimal |
|------|------|---------|
| 🌪️ **Kaos Gecesi** | Gizemli adam iki kez değişir | %8 |
| 🧠 **Manipülasyon Gecesi** | Manipülatör 2 kişinin oyunu yönlendirebilir | %6 |
| 😵 **Kafa Karışıklığı Gecesi** | Sabotajcı 2 oylamayı geçersiz kılabilir | %7 |
| 🌑 **Gölge Gecesi** | Gölge koruyucu 2 kişiyi koruyabilir | %5 |
| 📊 **Analiz Gecesi** | Strateji uzmanı detaylı analiz yapabilir | %8 |
| 🔮 **Sezgi Gecesi** | Sezici %100 doğru bilgi alır | %6 |
| 🎭 **Aldatma Gecesi** | Yalancı dedektif çok ikna edici | %7 |

## 🔍 Gelişmiş İpucu Sistemi

### 📍 Konum Sistemi (15 Farklı Konum)
Her oyuncunun bir konumu vardır:
- 🏠 Ev, 🍴 Mutfak, 🛏️ Yatak Odası, 🚿 Banyo, 📚 Çalışma Odası
- 🌳 Bahçe, 🚗 Garaj, 🏢 Ofis, 🛒 Market, ⛪ Kilise
- 🏫 Okul, 🏥 Hastane, 🍺 Bar, ☕ Kafe, 🎬 Sinema

### 👁️ Görsel Semboller (15 Farklı Özellik)
Her oyuncunun görsel özelliği vardır:
- 👓 Gözlük, 🎩 Şapka, 👞 Siyah Ayakkabı, ⌚ Saat, 🧣 Atkı
- 💍 Yüzük, 🎒 Çanta, 🧤 Eldiven, 👔 Takım Elbise, 👕 Kırmızı Gömlek
- 🕶️ Güneş Gözlüğü, 🎯 Rozet, 📱 Telefon, 🔑 Anahtar, 💼 Evrak Çantası

### 🧩 İpucu Türleri
- **📍 Konum İpuçları**: `"Ceset mutfağa yakın bulundu. Yakınlarda bahçe bölgesinden biri görülmüş."`
- **👁️ Görsel İpuçları**: `"Tanıklar katilın gözlük taktığını söylüyor."`
- **⚠️ Sahte İpuçları**: %30 ihtimalle yanıltıcı bilgiler (aldatıcı roller varsa)

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16+)
- Firebase hesabı

### Adımlar

```bash
# 1. Projeyi klonlayın
git clone https://github.com/Barisdmrl/Dedektif-Oyunu.git
cd Dedektif-Oyunu

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

### Firebase Kurulumu
1. [Firebase Console](https://console.firebase.google.com)'da yeni proje oluşturun
2. Realtime Database'i etkinleştirin
3. Web app kaydı yapın
4. Config bilgilerini `src/firebase.js` dosyasına ekleyin

Detaylı kurulum: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

## 🔧 Teknolojiler

- **Frontend**: React 19, Tailwind CSS
- **Backend**: Firebase Realtime Database
- **Build Tool**: Vite
- **Deployment**: Firebase Hosting

## ✨ Özellikler

### 🎮 Oyun Mekanikleri
- ✅ **Gerçek zamanlı multiplayer** - Firebase ile senkronize
- ✅ **21 farklı rol sistemi** - 3 takım (İyi/Kötü/Nötr)
- ✅ **Dinamik rol sistemi** - Her oyunda farklı roller
- ✅ **15 farklı gece olayı** - %30 ihtimalle özel durumlar
- ✅ **Konum tabanlı ipuçları** - 15 farklı konum
- ✅ **Görsel sembol sistemi** - 15 farklı görsel özellik
- ✅ **Sahte ipuçları** - Yanıltıcı bilgiler
- ✅ **Oy manipülasyonu** - Manipülatör yönlendirmesi
- ✅ **Oylama sabotajı** - Sabotajcı müdahalesi
- ✅ **Gizli koruma** - Gölge koruyucu sistemi
- ✅ **Rol değiştirme** - Kaos ustası yeteneği

### 🎯 Strateji Özellikleri
- ✅ **Akıllı ipucu sistemi** - 3 farklı türde ipucu
- ✅ **Rol gizliliği** - Katiller dedektifi tanımaz
- ✅ **3 takım dengesi** - İyi/Kötü/Nötr dinamiği
- ✅ **Son tahmin hakkı** - Kritik anlarda dedektif avantajı
- ✅ **Rastgele roller havuzu** - Tekrar oynanabilirlik
- ✅ **Davranış analizi** - Strateji uzmanı sistemi
- ✅ **Takım seçimi** - İkili ajan mekanizması

### 🎨 UI/UX Özellikleri
- ✅ **Responsive tasarım** - Tüm cihazlarda uyumlu
- ✅ **Renkli ipucu kategorileri** - Görsel ayrım
- ✅ **Dinamik oda sistemi** - Kolay katılım
- ✅ **Detaylı oyun kuralları** - Kapsamlı açıklamalar
- ✅ **Host yönetimi** - Oyun kontrolü
- ✅ **Bağlantı durumu** - Gerçek zamanlı bilgi
- ✅ **Rol modalları** - Detaylı rol açıklamaları

## 🎯 Strateji Rehberi

### 👼 İyi Takım Stratejileri

#### 🔎 Dedektif İçin
- İpuçlarını oyuncu konumları ve sembolleriyle karşılaştırın
- Sahte ipuçlarına dikkat edin (%30 ihtimal)
- Diğer oyuncuların davranışlarını gözlemleyin
- Casusun gizli yardımlarını fark etmeye çalışın
- Son tahmin hakkınızı akıllıca kullanın

#### 🕵️ Casus İçin
- Katili belli etmeden dedektife yardım edin
- Doğrudan suçlama yapmayın
- İyi takım üyesi gibi davranın
- Konum ve sembol ipuçlarını akıllıca kullanın

#### 🛡️ Güvenlik & Gölge Koruyucu İçin
- Dedektifi ve önemli rolleri koruyun
- Gölge koruyucu gizli kalmalı, güvenlik açık olabilir
- Koruma stratejinizi çeşitlendirin
- Katillerin hedef seçimlerini zorlaştırın

#### 📊 Strateji Uzmanı İçin
- Oylama davranışlarını dikkatle analiz edin
- Şüpheli oy değişikliklerini tespit edin
- Manipülasyon belirtilerini arayın
- Bilgilerinizi dedektifle paylaşın

### 😈 Kötü Takım Stratejileri

#### 🔪 Katil İçin
- Tüm iyi takımı hedefleyin, sadece dedektifi değil
- Şüpheli davranışlardan kaçının
- Konum ve sembol bilgilerinizi unutmayın
- Gece olaylarından faydalanın

#### 🎭 Manipülatör İçin
- Oyları stratejik olarak yönlendirin
- Masum oyuncuları suçlu gösterin
- Kendi takımınızı koruyun
- Manipülasyon gecelerinde çift güç kullanın

#### 💥 Sabotajcı İçin
- Kritik oylamalarda müdahale edin
- Tek kullanımlık gücünüzü doğru zamanda kullanın
- Kafa karışıklığı gecelerinde çift sabotaj yapın
- Oylamayı karmaşıklaştırın

#### 🎭 Yalancı Dedektif İçin
- Kendini gerçek dedektif olarak tanıt
- Sahte ipuçları vererek yönlendir
- Gerçek dedektifi şüpheli göster
- Aldatma gecelerinde çok ikna edici ol

### 🔮 Nötr Takım Stratejileri

#### 🌙 Gölge & 🛡️ Hayatta Kalan İçin
- Dikkat çekmemeye çalışın
- Her iki takım arasında denge kurun
- Son aşamaya kadar hayatta kalın
- Gereksiz riskler almayın

#### 🧙 Gizemli Adam İçin
- Her tur rolünüzü sistemi takip edin
- Hangi rol olduğunuzu kimseye söylemeyin
- Mevcut rolünüze göre davranış sergileyin
- Kaos gecelerinde çift değişim yaşayın

#### 🌪️ Kaos Ustası İçin
- Rol değiştirme gücünüzü stratejik kullanın
- Oyun dengesini bozarak avantaj sağlayın
- Hiçbir takımın kazanmamasını hedefleyin
- Kritik rolleri hedef alın

#### 🎪 Şöhret Avcısı İçin
- Dikkat çekici davranışlar sergileyin
- En çok oy almaya odaklanın
- Kendini şüpheli gösterecek hareketler yapın
- Oylamada hedef haline gelin

#### 🕵️ İkili Ajan İçin
- İlk turu gözlem için kullanın
- Güçlü görünen takımı seçin
- Seçiminizi gizli tutun
- Seçtiğin takımın stratejisini destekle

#### 🔮 Sezici İçin
- %70 doğruluk oranını hesaba katın
- Bilgilerinizi akıllıca paylaşın
- Sezgi gecelerinde %100 doğru bilgi alın
- Hayatta kalma odaklı oyna

## 📊 Oyun Dengesi

### Oyuncu Sayısına Göre Rol Dağılımı
- **4 kişi**: 1 Katil, 1 Casus, 1 Dedektif, 1 Gölge
- **5-6 kişi**: +1 Güvenlik, 2-3 rastgele rol
- **7-8 kişi**: +1 Kan Emici, 2-3 rastgele rol
- **9-10 kişi**: +1 Katil, 2-3 rastgele rol
- **11+ kişi**: +Manipülatör, +Sabotajcı, +Gelişmiş roller

### Takım Dengesi
- **İyi Takım**: ~50% kazanma oranı
- **Kötü Takım**: ~35% kazanma oranı  
- **Nötr Takım**: ~15% kazanma oranı
- **Son Tahmin**: ~50% başarı oranı

### Rol Aktiflik Oranları
- **Temel Roller**: %100 (her oyunda)
- **Rastgele Roller**: %60-70 (2-3 tanesi aktif)
- **Gelişmiş Roller**: %40-50 (oyuncu sayısına bağlı)
- **Nötr Roller**: %30 (dengeli dağılım)

## 🔮 Gelecek Özellikler

### Yakın Gelecek (v3.0)
- 🔮 **Oyuncu profilleri ve istatistikler**
- 🔮 **Özel oda ayarları** - Rol seçimi, olay sıklığı
- 🔮 **Gelişmiş chat sistemi** - Emoji, gif desteği
- 🔮 **Oyun geçmişi** - Maç kayıtları

### Orta Vadeli (v3.5)
- 🔮 **Sesli chat entegrasyonu**
- 🔮 **Turnuva modu** - Çoklu oyun sistemi
- 🔮 **Özel etkinlikler** - Sezonluk roller
- 🔮 **Mobil uygulama optimizasyonu**

### Uzun Vadeli (v4.0)
- 🔮 **AI oyuncu desteği** - Bot oyuncular
- 🔮 **Özel roller oluşturma** - Kullanıcı tanımlı
- 🔮 **Harita sistemi** - Görsel konum sistemi
- 🔮 **Canlı yayın entegrasyonu** - Twitch/YouTube

## 📱 Deployment

```bash
# Firebase CLI'yi yükleyin
npm install -g firebase-tools

# Firebase'e giriş yapın
firebase login

# Hosting'i başlatın
firebase init hosting

# Projeyi build edin
npm run build

# Deploy edin
firebase deploy
```

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

### 🐛 Hata Bildirimi
- **GitHub Issues** kullanın
- Hata detaylarını ve adımları belirtin
- Ekran görüntüsü ekleyin
- Oyuncu sayısı ve aktif rolleri belirtin

### 💡 Özellik Önerisi
- **GitHub Discussions** kullanın
- Özelliğin amacını açıklayın
- Kullanım senaryoları verin
- Oyun dengesine etkisini değerlendirin

### 🎭 Yeni Rol Önerisi
- Rolün takımını belirtin (İyi/Kötü/Nötr)
- Özel yeteneğini detaylandırın
- Kazanma koşulunu açıklayın
- Oyun dengesine etkisini analiz edin

## 🐛 Bilinen Sorunlar

- Çok hızlı oda değiştirme bazen bağlantı sorunlarına neden olabilir
- Mobil cihazlarda çok uzun isimler UI'da taşabilir
- 15+ oyuncuda performans düşüşü olabilir
- Manipülasyon ve sabotaj aynı anda olduğunda senkronizasyon gecikebilir

## 📈 Sürüm Geçmişi

### v2.5.0 (2024) - Gelişmiş Roller Güncellemesi
- 🎭 11 yeni gelişmiş rol eklendi
- 🌙 7 yeni gece olayı eklendi
- 🎯 3 takım sistemi (İyi/Kötü/Nötr)
- 🎪 Manipülasyon ve sabotaj mekanikleri
- 🛡️ Gizli koruma sistemi
- 📊 Davranış analizi sistemi
- 🔮 Rol değiştirme mekanizması
- ⚖️ Oyun dengesi yeniden düzenlendi

### v2.0.0 (2024) - Dinamik Sistem
- 🎲 Rastgele roller havuzu sistemi
- 🌙 8 farklı gece olayı
- 📍 Konum tabanlı ipuçları
- 👁️ Görsel sembol sistemi
- ⚠️ Sahte ipuçları mekanizması
- 🧛 6 yeni rol eklendi
- ⚖️ Oyun dengesi iyileştirmeleri

### v1.0.0 (2024) - Temel Sürüm
- 🎮 Temel oyun mekanikleri
- 🔥 Firebase entegrasyonu
- 🎭 4 temel rol
- 📱 Responsive tasarım

## 📞 İletişim

- **GitHub Issues**: Sorun bildirimi ve öneriler için
- **GitHub Discussions**: Genel tartışmalar için
- **Email**: barsdemirel19066@gmail.com

## 🏆 Özel Teşekkürler

- Firebase ekibine gerçek zamanlı database için
- React ve Tailwind CSS topluluklarına
- Beta test oyuncularına geri bildirimler için
- Rol tasarımı konusunda katkıda bulunan oyunculara

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🎮 Eğlenceli oyunlar! 21 farklı rolle her oyun yeni bir macera!**

*"Gerçek dedektif, ipuçlarını birleştiren, sahte olanları ayırt eden ve 3 takım arasında dengeyi koruyandır."*

## 📊 Hızlı Başlangıç Rehberi

### 🎯 Yeni Oyuncular İçin
1. **Temel rolleri** öğrenin (Dedektif, Casus, Katil, Güvenlik)
2. **İpucu sistemi**ni anlayın (Konum + Görsel)
3. **3 takım** sistemini kavrayın (İyi/Kötü/Nötr)
4. **Gece olayları**nı takip edin (%30 şans)

### 🎭 Deneyimli Oyuncular İçin
1. **21 farklı rol**ü keşfedin
2. **Manipülasyon** ve **sabotaj** mekaniklerini öğrenin
3. **Nötr takım** stratejilerini geliştirin
4. **Gelişmiş gece olayları**nı takip edin

### 🏆 Uzman Oyuncular İçin
1. **Davranış analizi** yapın
2. **Rol sinerjileri**ni keşfedin
3. **Meta stratejiler** geliştirin
4. **Oyun dengesi**ne katkıda bulunun