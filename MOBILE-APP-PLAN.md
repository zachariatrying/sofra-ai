# SofraAI — iOS & Android Mobil Uygulama Lansman Planı

**Paket Kimliği (Bundle ID / Application ID):** `com.sofraai.app`  
**Mimari:** Capacitor 7 (React 19 + Vite + 80+ Türk Ev Yemeği Veritabanı + İkili Ev/Lokanta Kalibrasyonu + Opsiyonel BYOK Gemini Vision + `free-for-dev` Cloudflare Pages/R2 Sıfır Maliyetli Dağıtım)  
**Hedef Pazar:** Türkiye Sağlıklı Beslenme, Fitness, Diyetisyen Takibi & Ev Yemeği Porsiyon Okuryazarlığı

---

## 1. Mağaza Görselleri ve Marka Kimliği

- **Uygulama İkonu (`1024x1024`):** `public/store-assets/sofraai_icon.png` — Sıcak taş beyazı (`#F7F5F0`) ve nar terrakotta (`#C84B31`) zemin üzerinde stilize seramik kase + makro halkası + zeytin yaprağı amblemi.
- **Tanıtım Banner (`1600x900`):** `public/store-assets/sofraai_promo.png` — Türk ev yemekleri + 2 dokunuşlu Ev/Lokanta yağ kalibrasyonu + 7 günlük beslenme analitiği vitrini.

---

## 2. Capacitor 7 + `microg-services` GMS-Bağımsız Entegrasyon

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install @capacitor/camera @capacitor/haptics @capacitor/share @capacitor/filesystem @capacitor/preferences
npx cap init "SofraAI" "com.sofraai.app" --web-dir dist
npx cap add ios && npx cap add android
```

- **Tam Çevrimdışı & GMS-Free Çalışma (`microg-services` uyumu):** Google Play Services veya zorunlu Firebase Auth olmadan %100 cihaz içi çalışır (Huawei HMS, LineageOS/microG ve standart Android/iOS uyumlu).
- **Kamera & Fotoğraf:** `@capacitor/camera` yalnızca kullanıcı *"Fotoğraftan Tanı"* akışını seçtiğinde ve kendi Gemini API anahtarını bağladığında açılır; anahtarsız modda 80+ yemek kataloğu + doğal Türkçe cümle çözümleyici anında çalışır.

---

## 3. Doğal İzinler (`Info.plist` & `AndroidManifest.xml`)

- **iOS (`Info.plist`):** `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription` (*Günün beslenme kartını PNG olarak kaydetmek için*).
- **Android (`AndroidManifest.xml`):** `CAMERA` (opsiyonel yemek fotoğrafı için), `INTERNET` (yalnızca kullanıcı kendi Gemini Vision anahtarını girdiğinde).

---

## 4. App Store, Google Play & KVKK Uyumluluğu

1. **Sağlık Feragatnamesi (Apple 1.4):** Alt bilgi ve Ayarlar penceresinde açıkça *"SofraAI beslenme farkındalığı sunar; tıbbi teşhis veya klinik diyetisyen tavsiyesi değildir"* uyarısı yer alır.
2. **Apple 5.1.1(v) & KVKK Tam Veri Kontrolü:** Sıfır hesap zorunluluğu + tek tıkla JSON yedek indirme, JSON geri yükleme ve kalıcı veri silme.
3. **Sıfır Takip (`free-for-dev` $0 Dağıtım):** Cloudflare Pages (sınırsız bant genişliği, otomatik SSL) + UptimeRobot ile $0/ay altyapı maliyeti.

---

## 5. Türkçe ASO & TL PPP Gelir Modeli

- **Başlık (30 kr):** `SofraAI: Türk Yemeği Kalori`
- **Alt Başlık (30 kr):** `Ev ve Lokanta Makro Koçun`
- **Anahtar Kelimeler (100 kr):** `kalori,diyet,beslenme,makro,protein,ev yemeği,türk mutfağı,su takibi,kilo,zayıflama,fitness,porsiyon`

| Katman | Fiyat (TRY) | Kapsam |
| :--- | :--- | :--- |
| **Ücretsiz (Sofra)** | ₺0 | 80+ Türk yemeği, Ev/Lokanta kalibrasyonu, 7 günlük özet, su takibi, PNG kart, JSON yedek |
| **SofraAI Koç Plus (Aylık)** | ₺49,99 / ay | Sınırsız AI fotoğraf analizi (Yönetilen Kota) + 90 günlük trend + diyetisyen PDF raporu |
| **SofraAI Koç Plus (Yıllık)** | ₺349,99 / yıl | %41 indirimli yıllık paket + haftalık menü planlayıcı |

---

## 6. 6 Haftalık Lansman Yol Haritası

| Hafta | Odak | Çıktı |
| :---: | :--- | :--- |
| **1–2** | Capacitor 7 & `@capacitor/camera` | İsteğe bağlı Vision AI fotoğraf akışı & PNG dosya paylaşımı |
| **3** | Mağaza Görselleri | 1024x1024 ikon, 1600x900 banner, 6.7" iPhone ekran seti |
| **4** | Saha Beslenme Testi | 20 kullanıcıyla ev/lokanta porsiyon doğruluğu kalibrasyonu |
| **5–6** | Mağaza Uyumu & Lansman | Sağlık feragatnamesi onayı, App Store & Google Play yayını |
