# 🔥 Firebase Kurulum Rehberi

## 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" butonuna tıklayın
3. Proje adını girin (örn: "ters-dedektif-oyunu")
4. Google Analytics'i istediğinize göre açın/kapatın
5. "Create project" butonuna tıklayın

## 2. Realtime Database Kurulumu

1. Sol menüden "Realtime Database" seçin
2. "Create Database" butonuna tıklayın
3. Lokasyon seçin (örn: europe-west1)
4. Security rules için "Start in test mode" seçin
5. "Enable" butonuna tıklayın

## 3. Web App Kaydı

1. Project Overview sayfasında "</>" (Web) ikonuna tıklayın
2. App nickname girin (örn: "ters-dedektif-web")
3. "Register app" butonuna tıklayın
4. Firebase config bilgilerini kopyalayın

## 4. Güvenlik Kuralları Ayarlama

Realtime Database > Rules sekmesinde aşağıdaki kuralları yapıştırın:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        "players": {
          "$playerId": {
            ".validate": "newData.hasChildren(['id', 'name', 'isHost', 'joinedAt', 'isAlive'])"
          }
        }
      }
    }
  }
}
```

## 5. Config Dosyasını Güncelleme

`src/firebase.js` dosyasındaki config bilgilerini Firebase Console'dan aldığınız bilgilerle değiştirin:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBvOiM9OiI-HUHlewGohQeRVyaN0H0Sg-k",
  authDomain: "ters-dedektif-oyunu.firebaseapp.com",
  databaseURL: "https://ters-dedektif-oyunu-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "ters-dedektif-oyunu",
  storageBucket: "ters-dedektif-oyunu.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};
```

## 6. Paketleri Yükleme ve Çalıştırma

```bash
# Node.js ve npm yükleyin (nodejs.org)
# Proje klasöründe:
npm install
npm run dev
```

## 7. Oyunu Test Etme

1. Tarayıcıda `http://localhost:5173` adresine gidin
2. "Yeni Oyun Oluştur" ile oda oluşturun
3. Oda kodunu başka tarayıcı sekmelerinde kullanarak katılın
4. En az 4 oyuncu ile oyunu başlatın

## 🎮 Oyun Özellikleri

- **Gerçek zamanlı multiplayer**: Firebase Realtime Database
- **Otomatik senkronizasyon**: Tüm oyuncular aynı anda güncellenir
- **Rol tabanlı yetkilendirme**: Her rol sadece kendi eylemlerini yapabilir
- **Dinamik oda sistemi**: Oyuncular oda kodu ile katılabilir
- **Host yönetimi**: Oda sahibi oyunu kontrol eder

## 🔧 Sorun Giderme

### "Firebase not initialized" hatası
- Config bilgilerinin doğru olduğundan emin olun
- Realtime Database'in etkin olduğunu kontrol edin

### "Permission denied" hatası
- Database rules'ı kontrol edin
- Test mode'da başladığınızdan emin olun

### Oyuncular görünmüyor
- İnternet bağlantınızı kontrol edin
- Firebase Console'da Database'de veri oluştuğunu kontrol edin

## 📱 Deployment (İsteğe Bağlı)

Firebase Hosting ile canlıya alabilirsiniz:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🎯 Oyun Kuralları

1. **Lobby**: Oyuncular oda kodunu paylaşarak katılır
2. **Rol Dağıtımı**: Roller rastgele atanır
3. **Gece**: Katil kurbanını seçer
4. **Gündüz**: Tartışma ve dedektif ipucu alır
5. **Oylama**: En çok oy alan elenir
6. **Kazanma**: İyi takım katili bulursa, katil dedektifi öldürürse kazanır 