# 📱 PDAM Inventory Mobile

Aplikasi mobile sistem inventory **Perumda Air Minum Tirta Sago (PAMTIGO) Kota Payakumbuh**.

## 🛠️ Tech Stack

- Expo 57
- React Native 0.86
- TypeScript
- Expo Router
- Axios

## ✨ Fitur

- Login SSO dari Web 1
- Dashboard dengan statistik
- CRUD Master Barang
- CRUD Barang Masuk
- CRUD Barang Keluar
- Notifikasi real-time (polling 3 detik)
- AI Assistant (Gemini)
- Export Laporan (PDF & Excel)
- Filter tanggal
- Multi-bahasa (ID & EN)
- Pull-to-refresh
- Backup & Restore data

## 📸 Tampilan Aplikasi

<p align="center">
  <img src="screenshots/login.png" alt="Login" width="180" />
  <img src="screenshots/dashboard.png" alt="Dashboard" width="180" />
  <img src="screenshots/barang.png" alt="Master Barang" width="180" />
  <img src="screenshots/masuk.png" alt="Barang Masuk" width="180" />
</p>

<p align="center">
  <img src="screenshots/keluar.png" alt="Barang Keluar" width="180" />
  <img src="screenshots/laporan.png" alt="Laporan" width="180" />
  <img src="screenshots/ai.png" alt="AI Assistant" width="180" />
  <img src="screenshots/profile.png" alt="Profile" width="180" />
</p>

## 🚀 Cara Install

```bash
git clone https://github.com/MuhammadReki/pdam-inventory-mobile.git
cd pdam-inventory-mobile
npm install
cp .env.example .env
npx expo start --go -c
