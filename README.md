# 🔪 TERS DEDEKTİF: KATİLİ BUL

Firebase tabanlı gerçek zamanlı multiplayer dedektif oyunu.

## 🎯 Oyun Hakkında

**Ters Dedektif**, geleneksel Mafia/Werewolf oyunlarından esinlenen, ancak kendine özgü mekaniği olan bir sosyal çıkarım oyunudur. Oyunda olay yok, sahne yok - sadece gizli roller var!

### 🎭 Roller

- **🔎 Dedektif (1 kişi)**: Her tur sonunda ölen kişiden bir ipucu öğrenebilir. Amacı: Katili bulmak.
- **🕵️ Casus (1 kişi)**: Katilin kim olduğunu bilir. Dedektife gizliden yardım eder ama belli etmeden.
- **🔪 Katil (1 kişi)**: Her gece birini öldürür. Yakalanmamaya çalışır.
- **👥 Şüpheliler (Geri kalanlar)**: Rollerini bilmezler. Dedektife yardım etmeye çalışır.

### 🎮 Nasıl Oynanır?

1. **Lobby**: Oyuncular oda kodunu paylaşarak katılır (minimum 4 kişi)
2. **Rol Dağıtımı**: Her oyuncu gizlice kendi rolünü öğrenir
3. **Gece Fazı**: Katil kurbanını seçer
4. **Gündüz Fazı**: Herkes tartışır, dedektif ipucu alabilir
5. **Oylama Fazı**: En çok oy alan oyuncu elenir
6. Bu döngü kazanan taraf belirlenene kadar devam eder

### 🏆 Kazanma Koşulları

- **İyi Takım**: Katili elirlerse kazanır
- **Katil**: Dedektifi öldürürse veya 2 kişi kalırsa kazanır

## 🚀 Kurulum

### Ön Gereksinimler

- Node.js (v16 veya üzeri)
- Firebase hesabı

### 1. Projeyi İndirin

```bash
git clone https://github.com/your-username/ters-dedektif-oyunu.git
cd ters-dedektif-oyunu
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Firebase Kurulumu

Detaylı Firebase kurulum talimatları için [FIREBASE_SETUP.md](FIREBASE_SETUP.md) dosyasını inceleyin.

Kısa özet:
1. Firebase Console'da yeni proje oluşturun
2. Realtime Database'i etkinleştirin
3. Web app kaydı yapın
4. Config bilgilerini `src/firebase.js` dosyasına yapıştırın

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Oyun `http://localhost:5173` adresinde çalışacaktır.

## 🔧 Teknolojiler

- **Frontend**: React 19, Tailwind CSS
- **Backend**: Firebase Realtime Database
- **Build Tool**: Vite
- **Deployment**: Firebase Hosting (opsiyonel)

## 🎮 Özellikler

### ✅ Mevcut Özellikler

- **Gerçek zamanlı multiplayer**: Tüm oyuncular aynı anda senkronize
- **Dinamik oda sistemi**: Oda kodu ile kolay katılım
- **Rol tabanlı yetkilendirme**: Her rol sadece kendi eylemlerini yapabilir
- **Akıllı ipucu sistemi**: Dedektif için çeşitli ipucu türleri
- **Responsive tasarım**: Mobil ve masaüstü uyumlu
- **Oyun kuralları modalı**: Detaylı açıklamalar
- **Host yönetimi**: Oda sahibi oyunu kontrol eder

### 🔮 Gelecek Özellikler

- Oyuncu profilleri ve istatistikler
- Özel oda ayarları (süre limitleri, özel roller)
- Sesli chat entegrasyonu
- Turnuva modu
- Mobil uygulama

## 📱 Deployment

### Firebase Hosting ile Canlıya Alma

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
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## 🎯 Oyun Stratejileri

### Dedektif İçin
- İpuçlarını dikkatlice analiz edin
- Şüphelilerin davranışlarını gözlemleyin
- Casusun gizli yardımlarını fark etmeye çalışın

### Casus İçin
- Katili belli etmeden dedektife yardım edin
- Doğrudan suçlama yapmayın
- Şüpheliler gibi davranın

### Katil İçin
- Dedektifi öncelikli hedef yapın
- Şüpheli davranmamaya çalışın
- İpuçlarını karıştıracak hamler yapın

### Şüpheliler İçin
- Dedektife güvenin ve yardım edin
- Şüpheli davranışları rapor edin
- Mantıklı oylama yapın

## 🐛 Bilinen Sorunlar

- Çok hızlı oda değiştirme bazen bağlantı sorunlarına neden olabilir
- Mobil cihazlarda çok uzun isimler UI'da taşabilir

## 📞 İletişim

Sorularınız veya önerileriniz için:
- GitHub Issues kullanın
- Email: your-email@example.com

---

**Eğlenceli oyunlar! 🎮**
