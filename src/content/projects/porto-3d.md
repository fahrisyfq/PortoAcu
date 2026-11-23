---
title: 'Porto 3D'
description: 'Eksperimen portofolio interaktif dengan model 3D ringan, animasi scroll, dan sistem tema gelap-terang.'
cover: '../../assets/images/project-5.png'
coverAlt: 'Pratinjau Porto 3D dengan ilustrasi kubus'
tags: ['Astro', 'GSAP', 'model-viewer', 'Web Components']
year: 2026
demoUrl: 'https://porto-3d.example.com'
repoUrl: 'https://github.com/fahrisyfq/porto-3d'
featured: true
draft: false
order: 5
---

Eksperimen yang kemudian menjadi dasar portofolio ini. Saya ingin membuktikan
bahwa elemen 3D tidak harus membuat halaman berat: model dimuat malas, hanya
aktif saat terlihat, dan selalu punya gambar fallback.

Animasi dibuat dengan GSAP dan ScrollTrigger, lalu dimatikan sepenuhnya ketika
pengguna memilih `prefers-reduced-motion`.
