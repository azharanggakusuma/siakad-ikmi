import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <--- 1. Import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- KONFIGURASI SEO & METADATA ---
export const metadata: Metadata = {
  title: "SIAKAD STMIK IKMI Cirebon | Transkrip Nilai Digital",
  description: "Sistem Informasi Akademik STMIK IKMI Cirebon. Layanan cetak dan validasi transkrip nilai mahasiswa secara digital.",
  keywords: [
    "SIAKAD",
    "STMIK IKMI",
    "IKMI Cirebon",
    "Transkrip Nilai",
    "Akademik",
    "Kampus Cirebon",
    "Teknik Informatika",
    "Rekayasa Perangkat Lunak"
  ],
  authors: [{ name: "Bagian Administrasi Akademik (BAA) STMIK IKMI" }],
  creator: "STMIK IKMI Cirebon",
  publisher: "STMIK IKMI Cirebon",
  
  icons: {
    icon: "/img/logo-ikmi.png", 
    shortcut: "/img/logo-ikmi.png",
    apple: "/img/logo-ikmi.png",
  },

  openGraph: {
    title: "SIAKAD STMIK IKMI Cirebon",
    description: "Cetak Transkrip Nilai Mahasiswa & Layanan Akademik Digital.",
    url: "https://ikmi.ac.id",
    siteName: "SIAKAD IKMI",
    images: [
      {
        url: "/img/logo-ikmi.png",
        width: 800,
        height: 800,
        alt: "Logo STMIK IKMI Cirebon",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}