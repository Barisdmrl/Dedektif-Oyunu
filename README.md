# 🔪 Ters Dedektif: Katili Bul

Firebase tabanlı gerçek zamanlı multiplayer dedektif oyunu. Dinamik roller, gece olayları ve gelişmiş ipucu sistemi ile her oyun farklı bir deneyim!

## 🎯 Oyun Hakkında

**Ters Dedektif**, geleneksel Mafia/Werewolf oyunlarından esinlenen sosyal çıkarım oyunudur. Konum tabanlı ipuçları, görsel semboller ve sahte notlarla zenginleştirilmiş derin strateji oyunu.

## 🎭 Roller

### 🌟 Temel Roller (Her Oyunda)
| Rol | Açıklama | Takım |
|-----|----------|-------|
| 🔎 **Dedektif** | Her tur sonunda ölen kişiden ipucu öğrenir. Katili bulmaya çalışır. | İyi |
| 🕵️ **Casus** | Katilin kim olduğunu bilir. Dedektife gizlice yardım eder. | İyi |
| 🔪 **Katil** | Her gece birini öldürür. Yakalanmamaya çalışır. | Kötü |
| 🛡️ **Güvenlik** | Her gece bir kişiyi korur. Korunan kişi öldürülemez. | İyi |
| 😇 **Masum** | Özel yeteneği yoktur. Dedektife yardım eder. | İyi |
| 👥 **Şüpheliler** | Rollerini bilmezler. Dedektife yardım etmeye çalışırlar. | İyi |

### 🎲 Rastgele Roller (2-3 Tanesi Her Oyunda)
| Rol | Açıklama | Takım |
|-----|----------|-------|
| 🔬 **Adli Tıpçı** | Ölen oyuncuların rollerini öğrenir. Bilgiyi gizli tutar. | İyi |
| 🧠 **Psikolog** | Oyuncuları sorgular, %50 doğru sonuç alır. | İyi |
| 🧛 **Kan Emici** | Katili bilir, öldürme yetkisi yok. Kaos yaratır. | Kötü |
| 👥 **İkizler** | Birbirlerini bilir. Biri ölürse diğeri çift oy kullanır. | İyi |
| 🪞 **Yansıtıcı** | Saldırıyı geri yansıtır. Tek kullanımlık. | İyi |
| 🧙 **Gizemli Adam** | Her tur rol değiştirir. Rolünü kendisi bile bilmez. | Nötr |

## 🎮 Nasıl Oynanır

### 1. Oyun Kurulumu
- Minimum 4, maksimum 15+ oyuncu
- Oda kodu ile katılım
- Host oyunu başlatır
- **Rastgele roller** her oyunda farklı seçilir

### 2. Oyun Akışı
1. **Rol Dağıtımı** → Her oyuncu rolünü, konumunu ve görsel özelliğini öğrenir
2. **Güvenlik Fazı** → Güvenlik koruyacağı kişiyi seçer (varsa)
3. **Adli Tıp Fazı** → Adli tıpçı ölen oyuncuları inceler (varsa)
4. **Psikolog Fazı** → Psikolog oyuncu sorgular (varsa)
5. **Gece Fazı** → Katil kurbanını seçer, %30 ihtimalle gece olayı
6. **Gündüz Fazı** → Herkes tartışır, dedektif ipucu alabilir
7. **Oylama Fazı** → En çok oy alan oyuncu elenir
8. Bu döngü kazanan taraf belirlenene kadar devam eder

### 3. Kazanma Koşulları
- **İyi Takım**: Tüm katilleri ve kan emicileri elirlerse kazanır
- **Kötü Takım**: Tüm iyi takımı öldürürse veya sayı üstünlüğü ele geçirirse kazanır
- **Son Tahmin**: 3 kişi kalırsa dedektif son tahmin hakkı kullanabilir

## 🌙 Gece Olayları (%30 İhtimal)

| Olay | Etki | İhtimal |
|------|------|---------|
| ☁️ **Bulutlu Gece** | Adli tıpçı çalışamaz | %15 |
| 😱 **Panik Gecesi** | Kimse oy veremez | %10 |
| 😨 **Çığlık Gecesi** | Dedektif ekstra ipucu alır | %12 |
| ⛈️ **Fırtınalı Gece** | Psikolog çalışamaz | %15 |
| 🌕 **Dolunay** | Kan emici güçlenir | %8 |
| 👼 **Koruyucu Gece** | Kimse öldürülemez | %5 |
| 💡 **İçgörü Gecesi** | Herkes ipucu alır | %10 |
| 🌪️ **Kaos Gecesi** | Gizemli adam iki kez değişir | %8 |

## 🔍 Gelişmiş İpucu Sistemi

### 📍 Konum Sistemi
Her oyuncunun bir konumu vardır:
- 🏠 Ev, 🍴 Mutfak, 🛏️ Yatak Odası, 🚿 Banyo, 📚 Kütüphane
- 🌳 Bahçe, 🚗 Garaj, 🏢 Ofis, 🛒 Market, ⛪ Kilise
- 🏫 Okul, 🏥 Hastane, 🍺 Bar, ☕ Kafe, 🎬 Sinema

### 👁️ Görsel Semboller
Her oyuncunun görsel özelliği vardır:
- 👓 Gözlük, 🎩 Şapka, 👞 Siyah Ayakkabı, ⌚ Saat, 🧣 Atkı
- 💍 Yüzük, 🎒 Çanta, 🧤 Eldiven, 👔 Takım Elbise, 👕 Tişört
- 🕶️ Güneş Gözlüğü, 🎯 Rozet, 📱 Telefon, 🔑 Anahtar, 💼 Evrak Çantası

### 🧩 İpucu Türleri
- **📍 Konum İpuçları**: `"Ceset mutfağa yakın bulundu. Yakınlarda bahçe bölgesinden biri görülmüş."`
- **👁️ Görsel İpuçları**: `"Tanıklar katilın gözlük taktığını söylüyor."`
- **⚠️ Sahte İpuçları**: %30 ihtimalle yanıltıcı bilgiler (kötü roller varsa)

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
- ✅ **Dinamik rol sistemi** - Her oyunda farklı roller
- ✅ **Gece olayları** - %30 ihtimalle özel durumlar
- ✅ **Konum tabanlı ipuçları** - 15 farklı konum
- ✅ **Görsel sembol sistemi** - 15 farklı görsel özellik
- ✅ **Sahte ipuçları** - Yanıltıcı bilgiler
- ✅ **Çoklu katil desteği** - Oyuncu sayısına göre
- ✅ **İkiz gücü** - Çift oy kullanımı
- ✅ **Yansıtıcı mekanizması** - Saldırı geri döner

### 🎯 Strateji Özellikleri
- ✅ **Akıllı ipucu sistemi** - 3 farklı türde ipucu
- ✅ **Rol gizliliği** - Katiller dedektifi tanımaz
- ✅ **Dengeli kazanma koşulları** - Adil oyun deneyimi
- ✅ **Son tahmin hakkı** - Kritik anlarda dedektif avantajı
- ✅ **Rastgele roller havuzu** - Tekrar oynanabilirlik

### 🎨 UI/UX Özellikleri
- ✅ **Responsive tasarım** - Tüm cihazlarda uyumlu
- ✅ **Renkli ipucu kategorileri** - Görsel ayrım
- ✅ **Dinamik oda sistemi** - Kolay katılım
- ✅ **Oyun kuralları modalı** - Detaylı açıklamalar
- ✅ **Host yönetimi** - Oyun kontrolü
- ✅ **Bağlantı durumu** - Gerçek zamanlı bilgi

### 🔮 Gelecek Özellikler
- 🔮 **Oyuncu profilleri ve istatistikler**
- 🔮 **Özel oda ayarları** - Rol seçimi, olay sıklığı
- 🔮 **Sesli chat entegrasyonu**
- 🔮 **Turnuva modu** - Çoklu oyun
- 🔮 **Mobil uygulama**
- 🔮 **AI oyuncu desteği**

## 🎯 Oyun Stratejileri

### 🔎 Dedektif İçin
- İpuçlarını oyuncu konumları ve sembolleriyle karşılaştırın
- Sahte ipuçlarına dikkat edin (%30 ihtimal)
- Şüphelilerin davranışlarını gözlemleyin
- Casusun gizli yardımlarını fark etmeye çalışın

### 🕵️ Casus İçin
- Katili belli etmeden dedektife yardım edin
- Doğrudan suçlama yapmayın
- Şüpheliler gibi davranın
- Konum ve sembol ipuçlarını akıllıca kullanın

### 🔪 Katil İçin
- Tüm iyi takımı hedefleyin, sadece dedektifi değil
- Şüpheli davranmamaya çalışın
- Konum ve sembol bilgilerinizi unutmayın
- Gece olaylarından faydalanın

### 🧛 Kan Emici İçin
- Katili koruyun ama belli etmeyin
- Kaos yaratın ve dedektifi yanıltın
- Sahte ipuçları oluşmasına katkıda bulunun

### 👥 Şüpheliler İçin
- Dedektife güvenin ve yardım edin
- İpuçlarını analiz edin
- Konum ve sembol bilgilerini takip edin
- Mantıklı oylama yapın

### 🔬 Özel Roller İçin
- **Adli Tıpçı**: Rol bilgilerini gizli tutun, sözlü yönlendirme yapın
- **Psikolog**: %50 doğruluk oranını unutmayın, sonuçları sorgulatın
- **İkizler**: Birbirinizi koruyun, çift oy gücünüzü akıllıca kullanın
- **Yansıtıcı**: Tek kullanımlık gücünüzü doğru zamanda kullanın

## 📊 Oyun Dengesi

### Oyuncu Sayısına Göre Rol Dağılımı
- **4 kişi**: 1 Katil, 1 Casus, 1 Dedektif, 1 Masum/Şüpheli
- **5-6 kişi**: +1 Güvenlik, 2-3 rastgele rol
- **7-8 kişi**: +1 Kan Emici, 2-3 rastgele rol
- **9-10 kişi**: +1 Katil, 2-3 rastgele rol
- **11+ kişi**: +İkizler, +Yansıtıcı, +Gizemli Adam

### Kazanma İstatistikleri
- **İyi Takım**: ~60% kazanma oranı (dengeli)
- **Kötü Takım**: ~40% kazanma oranı (zorlayıcı)
- **Son Tahmin**: ~50% başarı oranı (kritik)

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

### 💡 Özellik Önerisi
- **GitHub Discussions** kullanın
- Özelliğin amacını açıklayın
- Kullanım senaryoları verin

## 🐛 Bilinen Sorunlar

- Çok hızlı oda değiştirme bazen bağlantı sorunlarına neden olabilir
- Mobil cihazlarda çok uzun isimler UI'da taşabilir
- 15+ oyuncuda performans düşüşü olabilir

## 📈 Sürüm Geçmişi

### v2.0.0 (2024)
- 🎲 Rastgele roller havuzu sistemi
- 🌙 8 farklı gece olayı
- 📍 Konum tabanlı ipuçları
- 👁️ Görsel sembol sistemi
- ⚠️ Sahte ipuçları mekanizması
- 🧛 6 yeni rol eklendi
- ⚖️ Oyun dengesi iyileştirmeleri

### v1.0.0 (2024)
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

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🎮 Eğlenceli oyunlar! Her oyun yeni bir macera!**

*"Gerçek dedektif, ipuçlarını birleştiren ve sahte olanları ayırt edendir."*