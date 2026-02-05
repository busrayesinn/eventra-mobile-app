<div align="center">
  <img src="screenshots/logo.png" width="220"
       style="background:#f2f3f7; padding:16px; border-radius:16px;" />
</div>

<div align="center">

### Oyunlaştırma Destekli Mobil Etkinlik Keşif ve Takip Uygulaması

![Course](https://img.shields.io/badge/Course-Mobile%20Programming-6c5ce7?style=for-the-badge)
![University](https://img.shields.io/badge/Bursa%20Technical%20University-BTU-2d3436?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-Stable-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178c6?style=for-the-badge&logo=typescript)
![Gamification](https://img.shields.io/badge/Gamification-Enabled-6c5ce7?style=for-the-badge)
![Streak](https://img.shields.io/badge/Streak%20System-Active-ff7675?style=for-the-badge)

> **Kullanıcıyı etkinlik keşfine teşvik eden,<br>
oyunlaştırma temelli mobil etkinlik deneyimi.**

</div>

---

## 📌 İçindekiler
- [Proje Hakkında](#-proje-hakkında)
- [Motivasyon ve Problem Tanımı](#-motivasyon-ve-problem-tanımı)
- [Temel Özellikler](#-temel-özellikler)
- [Uygulama Mimarisi](#-uygulama-mimarisi)
- [Oyunlaştırma Sistemi](#-oyunlaştırma-sistemi)
- [Veri Yönetimi](#-veri-yönetimi)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Kurulum & Çalıştırma](#-kurulum--çalıştırma)
- [Kullanılan Teknolojiler](#-kullanılan-teknolojiler)
- [Akademik Not](#-akademik-not)
- [Geliştiriciler](#-geliştiriciler)

---

## Proje Hakkında

**Eventra**, kullanıcıların bulundukları şehirdeki güncel etkinlikleri
keşfetmelerini, bu etkinliklerle etkileşime geçmelerini ve düzenli
kullanım alışkanlığı kazanmalarını amaçlayan bir **mobil etkinlik keşif
uygulamasıdır**.

Uygulama; klasik etkinlik listeleme yaklaşımını,
**puan, streak ve rozet mekanikleri** ile destekleyerek
kullanıcı deneyimini oyunlaştırılmış bir yapıya dönüştürür.

---

## Motivasyon ve Problem Tanımı

Mevcut etkinlik platformlarının büyük bir kısmı:

- Kullanıcıyı pasif içerik tüketicisi konumunda bırakır  
- Düzenli kullanım için teşvik mekanizması sunmaz  

Eventra’nın temel motivasyonu:

- Kullanıcıyı **aktif katılıma teşvik etmek**
- Etkinlik deneyimini **kişiselleştirmek**
- Uygulamaya geri dönüşü **oyunlaştırma** ile desteklemektir

---

## Temel Özellikler

- Şehir, kategori ve tarih bazlı etkinlik filtreleme  
- Etkinlikleri favorilere ekleme / çıkarma  
- Etkinliklere özel kişisel notlar oluşturma  
- Etkinliğe katılım bildirimi  
- Günlük giriş (streak) takibi  
- Puan, rozet ve ödül sistemi  
- Kullanıcı profili ve istatistik ekranı  

---

## Uygulama Mimarisi

<p align="center">
  <img src="screenshots/hiyerarsi.png"
       alt="Eventra Uygulama Hiyerarşisi"
       width="800"/>
</p>

Eventra, **React Navigation** kullanılarak oluşturulmuş  
**Stack ve Bottom Tab** navigasyonlarının birlikte kullanıldığı
modüler bir mimariye sahiptir.

Bu mimari yapı, uygulama içi navigasyonun yanı sıra
veri sürekliliğini sağlamak amacıyla **AsyncStorage**
kullanımıyla desteklenmiştir.

Kullanıcıya ait streak, puan, son giriş tarihi ve
favori verileri cihaz üzerinde güvenli şekilde
saklanmaktadır.

### Navigasyon Yapısı
- **Root Stack**
  - Intro
  - Onboarding
  - MainTabs
- **Bottom Tab Navigation**
  - Anasayfa (Stack)
  - Favoriler
  - Notlar (Stack)
  - Ödüller

---

## Oyunlaştırma Sistemi

### Günlük Streak Mekaniği
- Günlük uygulama girişleri takip edilir  
- Bir gün giriş yapılmazsa streak sıfırlanır  
- Streak, özel rozetlerin kilidini açar  

<p align="center">
  <img src="screenshots/streak10.png" width="70"/>
  <img src="screenshots/streak20.png" width="70"/>
  <img src="screenshots/streak30.png" width="70"/>
</p>

---

### Rozet ve Ödüller

<p align="center">
  <img src="screenshots/rozet1.png" width="60"/>
  <img src="screenshots/rozet2.png" width="60"/>
  <img src="screenshots/rozet3.png" width="60"/>
  <img src="screenshots/rozet4.png" width="60"/>
  <img src="screenshots/rozet5.png" width="60"/>
</p>

**Ödül Türleri**
- **STREAK** → Günlük kullanım başarımına bağlı  
- **SHOP** → Puan harcanarak satın alınan ödüller  

### Puan Kazanma Mantığı

Uygulama içerisinde kullanıcı etkileşimleri,
**kontrollü ve adil bir puan sistemi** ile ödüllendirilmektedir.

Puanlama kuralları aşağıdaki gibidir:

* **Günlük giriş (streak)**
  * Her gün ilk girişte **+10 puan**
  * Aynı gün tekrar girişte puan verilmez

* **Favori ekleme**
  * Gün içinde yapılan **ilk favori ekleme** için **+5 puan**
  * Aynı gün içinde eklenen diğer favoriler puan kazandırmaz

* **Not ekleme**
  * Gün içinde eklenen **ilk not** için **+5 puan**
  * Aynı gün içinde eklenen diğer notlar puan kazandırmaz

* **Etkinliğe katılım bildirimi**
  * Her etkinlik için **tek seferlik +20 puan**
  * Aynı etkinlik tekrar eklenemez

Bu yapı sayesinde:

* Rastgele puan kasılması engellenir
* Günlük kullanım teşvik edilir
* Oyunlaştırma mekanizması dengeli şekilde çalışır

---

## Veri Yönetimi

AsyncStorage ile saklanan veriler:
- Kullanıcı takma adı  
- Favoriler  
- Notlar  
- Katılım geçmişi  
- Toplam puan  
- Günlük streak  
- Son giriş tarihi  
- Kazanılan rozetler  

---

## Ekran Görüntüleri

### Giriş & Onboarding
<p align="center">
  <img src="screenshots/intro.jpg" width="80"/>
  <img src="screenshots/onboarding.jpg" width="80"/>
</p>

### Ana Akış
<p align="center">
  <img src="screenshots/home.png" width="80"/>
  <img src="screenshots/profile.png" width="80"/>
  <img src="screenshots/event_detail.png" width="80"/>
</p>

### Kullanıcı Etkileşimi
<p align="center">
  <img src="screenshots/favorites.png" width="80"/>
  <img src="screenshots/notes.png" width="80"/>
</p>

### Oyunlaştırma
<p align="center">
  <img src="screenshots/rewards.png" width="80"/>
</p>

---

## Kurulum & Çalıştırma

### Gereksinimler
- Node.js (LTS)
- npm veya yarn
- Android Studio
- React Native CLI

### Kurulum

```bash
git clone https://github.com/busrayesinn/eventra-mobile-app.git
cd eventra
npm install
````

### Ortam Değişkenleri

```env
ETKINLIK_API_KEY=YOUR_API_KEY   # Etkinlik.io API anahtarı
```

### Android için Çalıştırma

```bash
npx react-native run-android
```

---

## Kullanılan Teknolojiler

* React Native
* TypeScript
* React Navigation
* AsyncStorage
* React Native Reanimated
* Ionicons
* Etkinlik.io REST API

---

## Akademik Not

Bu proje,
**Bursa Teknik Üniversitesi – Bilgisayar Mühendisliği** bölümünde yürütülen
**Mobil Programlama** dersi kapsamında geliştirilmiştir.

---

## Gelistiriciler

* **Büşra Yesin**
* **Beyza Kahraman**
* **Ece Açar**