# SofraAI

Türk mutfağına özel doğal dil öğün girişi, makro/kalori takibi, 7 günlük trend grafiği ve Günün Kartı PNG paylaşımı sunan beslenme asistanı.

## 🌐 Web'de Kullan

- **Canlı Adres:** https://zachariatrying.github.io/sofra-ai/
- **Telefona PWA Olarak Ekleme:** Mobil tarayıcınızda **Ana Ekrana Ekle** seçeneğiyle uygulama gibi kullanabilirsiniz.

## 📱 Android APK İndir & Kur

1. [Build Android APK & Play AAB](https://github.com/zachariatrying/sofra-ai/actions/workflows/android-apk.yml) sayfasına gidin.
2. En üstteki yeşil (başarılı) iş akışı koşusuna tıklayın.
3. Sayfanın en altındaki **Artifacts** bölümünden **`sofra-ai-debug-apk`** dosyasını indirin.
4. İnen `.zip` dosyasını açıp içindeki `app-debug.apk` dosyasını Android telefonunuza aktarın.
5. Android'de **Bilinmeyen kaynaklardan uygulama yükleme** iznini verip kurulumu tamamlayın.

> Google Play Store için aynı sayfada **`sofra-ai-release-aab`** (`app-release.aab`, R8 küçültmeli) paketi de üretilmektedir.

## ✨ Öne Çıkan Özellikler

- **Türk Mutfağı Odaklı Öğün Ayrıştırıcı:** "2 yumurta, 1 dilim tam buğday ekmek, 5 zeytin" gibi doğal cümlelerden anında kalori ve makro hesabı.
- **7 Günlük Kalori & Protein Trendi:** Haftalık denge ve hedef takibi.
- **Günün Kartı PNG (`1080x1350`):** Günlük özetinizi tek dokunuşla görsel kart olarak indirin.
- **KVKK Veri Kontrolü:** Tüm öğün geçmişi cihazınızda kalır; JSON dışa/içe aktarım ve 2 adımlı silme içerir.

## 🛠️ Yerel Geliştirme & Mobil Derleme

```bash
npm install
npm run dev        # Yerel geliştirme sunucusu
npm run build      # Üretim derlemesi (dist/)
npx cap sync       # Android & iOS projelerini güncelleme
```
