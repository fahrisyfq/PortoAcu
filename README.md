# PortoAku — Portofolio Pribadi

Portofolio satu halaman untuk mahasiswa dan web developer. Dibangun dengan
Astro 6, React 18, TypeScript strict, GSAP + ScrollTrigger, `<model-viewer>`, dan
CSS kustom tanpa framework CSS.

Semua aset placeholder sudah disertakan (foto profil, gambar proyek, CV, model
GLB, poster 3D, dan OG image), jadi proyek bisa langsung dijalankan.

---

## 1. Menjalankan proyek ini

Prasyarat: **Node.js 22 atau lebih baru** dan npm.

```bash
npm install
npm run dev
```

Buka `http://localhost:4321`.

Perintah lain:

```bash
npm run check     # TypeScript + diagnostic Astro
npm run build     # build statis ke folder dist/
npm run preview   # pratinjau hasil build
```

---

## 2. Setup lengkap dari nol

Jika ingin membuat struktur yang sama dari awal:

```bash
# 1. Scaffold Astro minimal dengan TypeScript strict
npm create astro@latest PortoAku -- --template minimal --typescript strict --no-install --no-git
cd PortoAku

# 2. Pasang Astro 6 dan integrasi utama
npm install astro@^6.4.8 @astrojs/react@^5 @astrojs/sitemap@^3
npm install react@^18.3.1 react-dom@^18.3.1 gsap@^3.15.1 sharp

# 3. Font self-hosted (file WOFF2 disalin ke public/fonts)
npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/source-serif-4

# 4. Alat pengembangan
npm install -D @astrojs/check typescript @types/react@^18 @types/react-dom@^18

# 5. Salin seluruh folder src/, public/, astro.config.mjs, tsconfig.json,
#    package.json, dan .env.example dari repositori ini.
#    Lalu jalankan:
npm install
npm run dev
```

Tambahkan integrasi ke `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://portofolio.example.com',
  output: 'static',
  integrations: [react(), sitemap()],
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
});
```

`tsconfig.json` menggunakan `astro/tsconfigs/strict` dan path alias `@/*` ke
`src/*`. `jsx` diatur ke `react-jsx` dengan `jsxImportSource: "react"`.

---

## 3. Struktur proyek

```text
.
├─ astro.config.mjs
├─ tsconfig.json
├─ package.json
├─ .env.example
├─ public/
│  ├─ cv.pdf
│  ├─ favicon.svg
│  ├─ favicon-32.png
│  ├─ apple-touch-icon.png
│  ├─ site.webmanifest
│  ├─ robots.txt
│  ├─ fonts/                # WOFF2 dari @fontsource-variable
│  ├─ images/
│  │  ├─ og.png
│  │  └─ model-poster.webp
│  └─ models/
│     └─ model.glb
├─ src/
│  ├─ assets/images/        # gambar yang dioptimasi astro:assets
│  ├─ components/
│  │  ├─ About.astro
│  │  ├─ Contact.astro
│  │  ├─ Experience.astro
│  │  ├─ Footer.astro
│  │  ├─ Hero.astro
│  │  ├─ Icon.astro
│  │  ├─ ModelViewer.astro
│  │  ├─ Projects.astro
│  │  ├─ ScrollProgress.astro
│  │  ├─ SEO.astro
│  │  ├─ SectionHeading.astro
│  │  ├─ Skills.astro
│  │  └─ react/
│  │     ├─ ContactForm.tsx
│  │     ├─ Icons.tsx
│  │     └─ Navbar.tsx
│  ├─ content/
│  │  ├─ projects/*.md
│  │  └─ experience/*.json
│  ├─ content.config.ts
│  ├─ data/site.ts
│  ├─ layouts/BaseLayout.astro
│  ├─ pages/index.astro
│  ├─ pages/404.astro
│  ├─ scripts/
│  │  ├─ animations.ts
│  │  ├─ model-viewer.ts
│  │  └─ theme.ts
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ base.css
│  │  ├─ components.css
│  │  └─ utilities.css
│  └─ utils/asset.ts
```

---

## 4. Contoh data dummy

### Proyek — `src/content/projects/sigap.md`

```md
---
title: 'SIGAP'
description: 'Sistem informasi akademik untuk mengelola jadwal, nilai, dan pengumuman kampus.'
cover: '../../assets/images/project-1.png'
coverAlt: 'Pratinjau dasbor SIGAP'
tags: ['Astro', 'React', 'TypeScript', 'PostgreSQL']
year: 2025
demoUrl: 'https://sigap.example.com'
repoUrl: 'https://github.com/fahrisyfq/sigap'
featured: true
draft: false
order: 1
---

Isi Markdown bebas dipakai untuk catatan atau halaman detail di masa depan.
```

Gambar proyek harus berada di `src/assets/images/` dan direferensikan dengan path
relatif dari file Markdown. `featured: true` membuat kartu pertama menjadi kartu
lebar. `draft: true` menyembunyikan proyek tanpa menghapus datanya.

### Pengalaman — `src/content/experience/01-kuliah.json`

```json
{
  "type": "education",
  "role": "Teknologi Rekayasa Komputer",
  "organization": "Politeknik Negeri Semarang",
  "location": "Semarang, Indonesia",
  "period": "Sep 2026 — Sekarang",
  "start": "2026-09",
  "current": true,
  "summary": "Menempuh studi Teknologi Rekayasa Komputer di Jurusan Teknik Elektro.",
  "highlights": ["Semester 1, sedang membangun dasar pemrograman dan sistem komputer."],
  "tags": ["Teknik Elektro", "Teknologi Rekayasa Komputer"],
  "order": 1
}
```

`type` menerima `education`, `work`, `organization`, atau `certification`.
Urutan timeline mengikuti `order`.

---

## 5. Panduan kustomisasi

### 5.1 Nama, peran, bio, dan sosial

Hampir semua teks identitas ada di **`src/data/site.ts`**:

- `name`, `firstName`, `initials`
- `role`, `secondaryRole`, `tagline`, `shortBio`, `bio`
- `email`, `location`, `campus`, `department`, `major`, `semester`, `status`
- `socials` — ganti URL GitHub, Instagram, dan email
- `nav`, `stats`, `skills`

Judul halaman, meta description, dan JSON-LD mengambil data dari file ini.
Setelah mengganti nama, perbarui juga teks di `public/images/og.png` dan
`public/site.webmanifest` jika perlu.

### 5.2 Foto dan gambar

- **Foto profil:** ganti `src/assets/images/profile.png`. Gunakan rasio 4:5
  (disarankan 900 × 1100 px). Gambar otomatis diubah ke WebP oleh
  `<Image />`.
- **Gambar proyek:** ganti `src/assets/images/project-1.png` … `project-5.png`
  atau tambahkan file baru dan ubah `cover` di frontmatter.
- **OG image:** ganti `public/images/og.png` (1200 × 630 px).
- **Poster 3D / fallback:** ganti `public/images/model-poster.webp`
  (disarankan persegi, 1000 × 1000 px).
- **CV:** timpa `public/cv.pdf` dengan CV Anda.

Semua gambar proyek dan profil diproses `astro:assets`, sehingga `srcset`,
lazy loading, dan format WebP/AVIF dibuat otomatis saat build.

### 5.3 Warna dan tipografi

Semua token ada di `src/styles/tokens.css`:

```css
:root {
  --bg: #0a0c10;
  --surface: #11141a;
  --border: #1f242d;
  --text: #e6e8eb;
  --text-secondary: #8b93a1;
  --accent: #4c8dff;
}

[data-theme='light'] {
  --bg: #f7f8fa;
  --surface: #ffffff;
  --accent: #2563eb;
}
```

Ubah nilai token, bukan warna per komponen. Untuk mengganti font, timpa file
WOFF2 di `public/fonts/` dan sesuaikan `@font-face` serta variabel
`--font-sans`, `--font-mono`, `--font-serif`.

### 5.4 Model 3D

1. Ganti `public/models/model.glb` dengan model Anda. Gunakan format `.glb`
   (glTF binary), idealnya di bawah 5 MB.
2. Ganti `public/images/model-poster.webp` dengan gambar fallback.
3. Jika posisi kamera perlu diubah, edit atribut `camera-orbit`,
   `min-field-of-view`, dan `max-field-of-view` di
   `src/components/ModelViewer.astro`.
4. Untuk kompresi, gunakan `gltf-transform` atau ekspor langsung dari Blender
   dengan opsi Draco/Meshopt.

`<model-viewer>` dimuat malas dari CDN ketika elemen mendekati viewport. Jika
WebGL tidak tersedia, CDN gagal dimuat, atau model gagal diunduh, poster fallback
tetap tampil. Versi CDN diatur di `src/scripts/model-viewer.ts`.

### 5.5 Formulir kontak

Salin `.env.example` menjadi `.env`, lalu isi salah satu:

```bash
# Opsi A — Web3Forms (gratis, tanpa backend)
PUBLIC_WEB3FORMS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Opsi B — Formspree
PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxx
```

Cara mendapatkan Web3Forms key:

1. Buka <https://web3forms.com>.
2. Masukkan email penerima.
3. Salin access key dari email.
4. Tempel ke `.env`, lalu restart `npm run dev`.

Kedua env ini bersifat publik (dikirim ke browser) dan memang dirancang untuk
form statis. Jangan pernah menaruh secret/API key privat di variabel berawalan
`PUBLIC_`. Formulir sudah memiliki validasi client-side, status pengiriman,
honeypot anti-bot, dan pesan fallback ke email jika endpoint belum diatur.

### 5.6 URL situs, OG, dan sitemap

Ubah `site` di `astro.config.mjs` ke domain produksi. Setelah itu perbarui URL
sitemap di `public/robots.txt`:

```text
Sitemap: https://domain-anda.com/sitemap-index.xml
```

Sitemap dibuat otomatis oleh `@astrojs/sitemap` saat build.

### 5.7 Animasi dan aksesibilitas

- Animasi GSAP ada di `src/scripts/animations.ts` dan memakai `gsap.context()`.
- Semua animasi dimatikan bila sistem mengaktifkan
  `prefers-reduced-motion: reduce`.
- ScrollTrigger di-refresh setelah font dan halaman selesai dimuat, lalu
  dibersihkan saat `pagehide` / `astro:before-swap`.
- Progress bar scroll, parallax, counter statistik, dan stagger kartu semuanya
  berada di file yang sama.
- Jika menambah section baru, tambahkan `data-reveal` pada elemen yang ingin
  dianimasikan, atau `data-stagger` pada kontainer dan `data-stagger-item` pada
  anak-anaknya.

---

## 6. Panduan deploy

### 6.1 Vercel

1. Push proyek ke GitHub/GitLab/Bitbucket.
2. Di Vercel, pilih **Add New Project** dan impor repositori.
3. Vercel mendeteksi Astro otomatis.
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node.js version: 22.x
4. Tambahkan environment variable `PUBLIC_WEB3FORMS_KEY` atau
   `PUBLIC_FORMSPREE_ENDPOINT` di **Settings → Environment Variables**.
5. Deploy.

Atau lewat CLI:

```bash
npm install -g vercel
vercel
vercel --prod
```

### 6.2 Netlify

1. Impor repositori di Netlify.
2. Gunakan konfigurasi:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 22 (bisa lewat `NODE_VERSION=22` di environment).
3. Tambahkan environment variable formulir kontak.
4. Deploy.

Atau buat `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

CLI:

```bash
npm install -g netlify-cli
netlify deploy
netlify deploy --prod
```

### 6.3 GitHub Pages

**Untuk site pengguna/organisasi** (`username.github.io`): base path tidak perlu.

**Untuk project site** (`username.github.io/PortoAku`): ubah `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://username.github.io',
  base: '/PortoAku',
  output: 'static',
  integrations: [react(), sitemap()],
});
```

Semua aset publik, font, dan tautan di proyek ini sudah melalui helper
`src/utils/asset.ts` sehingga mendukung base path.

Lalu:

1. Buat `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

2. Di GitHub: **Settings → Pages → Build and deployment → Source: GitHub
   Actions**.
3. Push ke branch `main`.
4. Perbarui `public/robots.txt` dengan URL sitemap yang benar.

Catatan: dengan base path, sitemap akan berada di
`https://username.github.io/PortoAku/sitemap-index.xml`.

---

## 7. Checklist sebelum publikasi

- [ ] Ganti nama, bio, kampus, dan tautan sosial di `src/data/site.ts`.
- [ ] Ganti foto profil, gambar proyek, CV, poster 3D, dan OG image.
- [ ] Ganti model `public/models/model.glb`.
- [ ] Sesuaikan daftar proyek dan pengalaman di folder `src/content/`.
- [ ] Isi `.env` untuk formulir kontak.
- [ ] Ubah `site` di `astro.config.mjs` dan URL sitemap di `robots.txt`.
- [ ] Jalankan `npm run check` dan `npm run build`.
- [ ] Uji mode terang/gelap, menu mobile, dan formulir.
- [ ] Uji dengan keyboard dan aktifkan `prefers-reduced-motion`.
- [ ] Jalankan Lighthouse pada hasil build (`npm run preview`).

## 8. Catatan performa

- Font self-hosted, `font-display: swap`, dua font utama di-preload.
- Gambar profil dan proyek dioptimasi oleh `astro:assets` (WebP + srcset).
- Navbar adalah React island `client:load`; formulir kontak `client:visible`.
- `model-viewer` dimuat malas dari CDN dan punya fallback gambar.
- GSAP/ScrollTrigger dimuat sebagai modul dan dibersihkan dengan benar.
- Tidak ada Tailwind, Bootstrap, atau CSS-in-JS.

## 9. Troubleshooting

**Formulir menampilkan pesan "sedang tidak tersedia".**
Pastikan `.env` berisi `PUBLIC_WEB3FORMS_KEY` atau
`PUBLIC_FORMSPREE_ENDPOINT`, lalu restart server dev.

**Model 3D tidak muncul.**
Periksa `public/models/model.glb`, koneksi ke CDN jsDelivr, dan apakah browser
mendukung WebGL. Poster fallback akan tampil jika model gagal dimuat.

**Gambar proyek gagal di-build.**
Pastikan path `cover` di Markdown benar, misalnya
`../../assets/images/project-1.png`, dan file gambar benar-benar ada.

**Font tidak berubah setelah diganti.**
Ganti file di `public/fonts/` dan pastikan nama file di blok `@font-face`
(`src/styles/tokens.css`) sama. Hapus cache browser jika perlu.

**Deploy GitHub Pages menampilkan halaman kosong/aset 404.**
Set `base` sesuai nama repositori dan pastikan `site` memakai domain GitHub Pages
yang benar. Build ulang setelah mengubah konfigurasi.

---

## 10. Lisensi aset

- Font **Geist**, **Geist Mono**, dan **Source Serif 4** didistribusikan melalui
  paket `@fontsource-variable` dengan lisensi SIL Open Font License 1.1.
- Foto profil, gambar proyek, OG image, CV, dan model GLB di repositori ini
  adalah aset placeholder buatan sendiri — ganti dengan aset Anda sebelum
  publikasi.
- Kode proyek ini bebas Anda modifikasi untuk portofolio pribadi.
