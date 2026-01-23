# SIAKAD IKMI

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Active-blue?style=for-the-badge&logo=typescript)

**Sistem Informasi Akademik (SIAKAD) IKMI** adalah platform manajemen akademik modern yang dirancang untuk memfasilitasi interaksi antara mahasiswa, dosen, dan administrasi kampus. Dibangun dengan teknologi web terbaru untuk performa tinggi, keamanan terjamin, dan pengalaman pengguna yang intuitif.

## Fitur Utama

Aplikasi ini mencakup berbagai modul untuk mendukung operasional akademik:

*   **Autentikasi & Otorisasi**: Sistem login aman menggunakan **NextAuth v5** dengan role-based access control (Mahasiswa, Dosen, Admin).
*   **Dashboard Interaktif**: Ringkasan data akademik yang personal untuk setiap role.
*   **Kartu Rencana Studi (KRS)**: Modul pengisian dan validasi rencana studi mahasiswa.
*   **Kartu Hasil Studi (KHS)**: Laporan nilai dan performa akademik per semester.
*   **Kartu Tanda Mahasiswa (KTM)**: Cetak dan validasi kartu tanda mahasiswa digital.
*   **Transkrip Nilai**: Rekapitulasi seluruh nilai akademik mahasiswa.
*   **Manajemen Mahasiswa**: Pengelolaan biodata, status, dan riwayat akademik.
*   **Manajemen Dosen**: Profil dosen, jadwal mengajar, dan input nilai.
*   **Administrasi Akademik**: Pengelolaan Program Studi, Tahun Akademik, dan Pejabat Kampus.

## Teknologi (Tech Stack)

Proyek ini menggunakan stack teknologi **Modern Web** yang powerful:

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Auth**: [NextAuth.js v5](https://authjs.dev/) (Beta)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Validation**: Zod & React Hook Form
*   **Language**: TypeScript

## Memulai (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di komputer lokal Anda.

### Prasyarat

Pastikan Anda telah menginstal:
*   [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
*   Package manager: `npm`, `yarn`, `pnpm`, atau `bun`

### Instalasi

1.  **Clone repository**
    ```bash
    git clone https://github.com/azharanggakusuma/siakad-ikmi.git
    cd siakad-ikmi
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # atau
    bun install
    ```

3.  **Konfigurasi Environment Variables**
    Buat file `.env` di root project dan salin konfigurasi berikut. Isi dengan kredensial Supabase & Auth Anda.

    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

    # NextAuth Configuration
    AUTH_SECRET=your_generated_secret_key # Generate dengan `npx auth secret`
    ```

4.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```

    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Struktur Proyek

Berikut adalah gambaran umum struktur folder proyek:

```
siakad-ikmi/
├── app/                  # App Router
│   ├── (pages)/          # Route Groups (Dashboard, Mahasiswa, dll)
│   ├── actions/          # Server Actions
│   ├── api/              # API Routes
│   ├── context/          # React Context Providers
│   ├── login/            # Authentication Pages
│   ├── maintenance/      # Maintenance Pages
│   └── verify/           # Verification Pages
├── components/           # Reusable UI Components
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities & Libraries
├── public/               # Static Assets
├── scripts/              # Build & Setup Scripts
├── auth.ts               # NextAuth Configuration
└── proxy.ts              # Proxy Configuration
```

## Kontribusi

Kontribusi selalu diterima! Silakan buat *Pull Request* baru untuk fitur atau perbaikan bug.

---
Dikembangkan oleh Tim IT STMIK IKMI Cirebon.
