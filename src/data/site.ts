export type SocialIcon = 'github' | 'linkedin' | 'mail' | 'instagram';

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
  handle: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface SkillLayer {
  layer: string;
  label: string;
  technologies: string[];
  note: string;
}

export const site = {
  name: 'Fahri Ahmad Syafiq',
  firstName: 'Fahri',
  initials: 'FAS',
  role: 'Mahasiswa Teknik Elektro',
  secondaryRole: 'Teknologi Rekayasa Komputer',
  tagline:
    'Belajar merancang sistem dan antarmuka yang rapi, cepat, dan manusiawi — satu semester pada satu waktu.',
  shortBio:
    'Saya mahasiswa Jurusan Teknik Elektro, Program Studi Teknologi Rekayasa Komputer di Politeknik Negeri Semarang. Saya menikmati perpaduan antara perangkat keras, perangkat lunak, dan antarmuka yang aksesibel.',
  bio: [
    'Saat ini saya menempuh semester 1 di Jurusan Teknik Elektro, Program Studi Teknologi Rekayasa Komputer, Politeknik Negeri Semarang. Ketertarikan saya pada teknologi dimulai dari rasa penasaran: bagaimana perangkat keras dan perangkat lunak bisa bekerja bersama untuk menyelesaikan masalah sehari-hari.',
    'Saya sedang membangun dasar di bidang pemrograman, elektronika, dan sistem komputer, sambil merapikan kemampuan web dengan Astro, React, dan TypeScript. Di luar kelas, saya senang mengerjakan proyek kecil dan mempelajari hal baru lewat praktik langsung.',
  ],
  email: 'fahriahmad@example.com',
  location: 'Semarang, Indonesia',
  campus: 'Politeknik Negeri Semarang',
  department: 'Teknik Elektro',
  major: 'Teknologi Rekayasa Komputer',
  semester: 'Semester 1',
  status: 'Terbuka untuk magang',
  availability: 'Terbuka untuk magang front-end, proyek freelance, dan kolaborasi riset.',
  website: 'https://portofolio.example.com',
  cvUrl: '/cv.pdf',
  socials: [
    {
      label: 'GitHub',
      href: 'https://github.com/fahrisyfq',
      icon: 'github',
      handle: '@fahrisyfq',
    },
    {
      label: 'Email',
      href: 'mailto:fahriahmad@example.com',
      icon: 'mail',
      handle: 'fahriahmad@example.com',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/fahrisyfq',
      icon: 'instagram',
      handle: '@fahrisyfq',
    },
  ] satisfies SocialLink[],
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ] satisfies NavItem[],
  stats: [
    { value: 5, suffix: '+', label: 'Proyek selesai' },
    { value: 3, suffix: ' thn', label: 'Belajar web' },
    { value: 4, suffix: '', label: 'Organisasi & magang' },
    { value: 8, suffix: '+', label: 'Sertifikat & lomba' },
  ] satisfies Stat[],
} as const;

export const skills: SkillLayer[] = [
  {
    layer: 'Frontend',
    label: 'Antarmuka & interaksi',
    technologies: ['Astro', 'React 18', 'TypeScript', 'JavaScript (ES2023)', 'HTML5', 'GSAP'],
    note: 'Membangun halaman statis cepat dengan pulau interaktif yang tepat guna.',
  },
  {
    layer: 'Styling',
    label: 'Sistem desain & layout',
    technologies: ['Vanilla CSS', 'CSS Custom Properties', 'Container Queries', 'Flexbox', 'CSS Grid'],
    note: 'Design token, tipografi fluid, dan komponen yang konsisten lintas breakpoint.',
  },
  {
    layer: 'Backend & Data',
    label: 'API dan basis data',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'REST API', 'Supabase'],
    note: 'Cukup nyaman untuk membangun API kecil dan menghubungkan data ke antarmuka.',
  },
  {
    layer: 'Tools & 3D',
    label: 'Alat kerja sehari-hari',
    technologies: ['Git', 'GitHub Actions', 'Vite', 'Figma', 'model-viewer', 'Blender (dasar)'],
    note: 'Alur kerja yang rapi: dari Figma, versi kode, sampai deploy otomatis.',
  },
  {
    layer: 'Sedang Dipelajari',
    label: 'Rencana berikutnya',
    technologies: ['Three.js', 'Playwright', 'Docker', 'Astro DB', 'Motion Design'],
    note: 'Dipelajari sambil membangun proyek nyata, bukan sekadar menonton tutorial.',
  },
];
