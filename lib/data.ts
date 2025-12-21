// lib/data.ts

export interface TranscriptItem {
  no: number;
  kode: string;
  matkul: string;
  smt: number;
  sks: number;
  hm: string;
  am: number;
  nm: number;
}

// Interface baru untuk Profil Mahasiswa
export interface StudentProfile {
  nama: string;
  nim: string;
  prodi: string;
  semester: number;
}

// Interface gabungan (Profil + Transkrip)
export interface StudentData {
  id: string;
  profile: StudentProfile;
  transcript: TranscriptItem[];
}

// --- DATA 1: AZHARANGGA KUSUMA (Lengkap Smt 1-7) ---
const transcriptAzhar: TranscriptItem[] = [
  { no: 1, kode: "MKWI-21012", matkul: "Bahasa Inggris Dasar", smt: 1, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 2, kode: "MKWI-21013", matkul: "Pengenalan Budaya Cirebon", smt: 1, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 3, kode: "MKD-0006", matkul: "Data Manajemen", smt: 1, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 4, kode: "MKWI-21014", matkul: "Kalkulus", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 5, kode: "MKWI-21001", matkul: "Algoritma dan Pemrograman Dasar", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 6, kode: "MKWN-21003", matkul: "Pendidikan Agama", smt: 1, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 7, kode: "MKWI-21007", matkul: "Dasar Dasar Artificial Intelligence", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 8, kode: "MKWN-21001", matkul: "Pancasila", smt: 1, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 9, kode: "MKWN-004", matkul: "Pendidikan Kewarganegaraan", smt: 2, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 10, kode: "SIW-2121", matkul: "Jaringan Komputer", smt: 2, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 11, kode: "MKD-0105", matkul: "Struktur Data", smt: 2, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 12, kode: "MKWI-21002", matkul: "Algoritma Dan Pemrograman Lanjut", smt: 2, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 13, kode: "SIW-2123", matkul: "Statistika", smt: 2, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 14, kode: "MKWI-21005", matkul: "Aljabar Linear", smt: 2, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 15, kode: "MKWN-002", matkul: "Bahasa Indonesia", smt: 2, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 16, kode: "MDK-0303", matkul: "Matematika Diskrit", smt: 3, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 17, kode: "TDK-0304", matkul: "Jaringan Komputer Advanced", smt: 3, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 18, kode: "MDK-0305", matkul: "Pemrograman Web", smt: 3, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 19, kode: "MDK-0301", matkul: "Pemrograman SQL", smt: 3, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 20, kode: "MDK-0306", matkul: "Data Science", smt: 3, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 21, kode: "MDK-0302", matkul: "Rekayasa Perangkat Lunak", smt: 3, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 22, kode: "MBKM-TI-04078", matkul: "TP. Camping dan Trekking", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 23, kode: "MBKM-TI-04049", matkul: "Modul Nusantara", smt: 4, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 24, kode: "MBKM-TI-04051", matkul: "Pendidikan Anti Korupsi", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 25, kode: "MBKM-TI-04066", matkul: "Semiotika", smt: 4, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 26, kode: "MBKM-TI-04017", matkul: "Etika Bisnis Profesi", smt: 4, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 27, kode: "MBKM-TI-04073", matkul: "Technopreneurship", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 28, kode: "MBKM-TI-04044", matkul: "Media Pembelajaran", smt: 4, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 29, kode: "TKK-0501", matkul: "Cloud Computing", smt: 5, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 30, kode: "MKK-0502", matkul: "Keamanan Jaringan", smt: 5, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 31, kode: "TKK-0503", matkul: "Text Mining", smt: 5, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 32, kode: "TKK-0504", matkul: "Sistem Operasi", smt: 5, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 33, kode: "TKK-0505", matkul: "Deep Learning Dasar", smt: 5, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 34, kode: "TKK-0601", matkul: "Deep Learning Lanjut", smt: 6, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 35, kode: "TKK-0602", matkul: "Manajemen Proyek Data Science", smt: 6, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 36, kode: "TKK-0603", matkul: "Big Data Analytic", smt: 6, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 37, kode: "TKK-0604", matkul: "Computer Vision", smt: 6, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 38, kode: "TKK-0605", matkul: "Robotic", smt: 6, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 39, kode: "MKK-0705", matkul: "IT Enterpreuneur", smt: 7, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 40, kode: "MKK-0704", matkul: "Etika Profesi", smt: 7, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 41, kode: "MKK-0703", matkul: "Proposal Skripsi", smt: 7, sks: 2, hm: "C", am: 2, nm: 4 },
  { no: 42, kode: "MKK-0702", matkul: "Literature Review", smt: 7, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 43, kode: "MKK-0701", matkul: "Metode Penelitian", smt: 7, sks: 4, hm: "B", am: 3, nm: 12 },
];

// --- DATA 2: BUDI SANTOSO (Lengkap Smt 1-4) ---
const transcriptBudi: TranscriptItem[] = [
  // Semester 1
  { no: 1, kode: "MKWI-21012", matkul: "Bahasa Inggris Dasar", smt: 1, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 2, kode: "MKWI-21013", matkul: "Pengenalan Budaya Cirebon", smt: 1, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 3, kode: "MKD-0006", matkul: "Data Manajemen", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 4, kode: "MKWI-21014", matkul: "Kalkulus", smt: 1, sks: 3, hm: "C", am: 2, nm: 6 },
  { no: 5, kode: "MKWI-21001", matkul: "Algoritma dan Pemrograman Dasar", smt: 1, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 6, kode: "MKWN-21003", matkul: "Pendidikan Agama", smt: 1, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 7, kode: "MKWI-21007", matkul: "Dasar Dasar Artificial Intelligence", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 8, kode: "MKWN-21001", matkul: "Pancasila", smt: 1, sks: 2, hm: "A", am: 4, nm: 8 },
  
  // Semester 2
  { no: 9, kode: "MKWN-004", matkul: "Pendidikan Kewarganegaraan", smt: 2, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 10, kode: "SIW-2121", matkul: "Jaringan Komputer", smt: 2, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 11, kode: "MKD-0105", matkul: "Struktur Data", smt: 2, sks: 3, hm: "C", am: 2, nm: 6 },
  { no: 12, kode: "MKWI-21002", matkul: "Algoritma Dan Pemrograman Lanjut", smt: 2, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 13, kode: "SIW-2123", matkul: "Statistika", smt: 2, sks: 3, hm: "C", am: 2, nm: 6 },
  { no: 14, kode: "MKWI-21005", matkul: "Aljabar Linear", smt: 2, sks: 3, hm: "C", am: 2, nm: 6 },
  { no: 15, kode: "MKWN-002", matkul: "Bahasa Indonesia", smt: 2, sks: 2, hm: "A", am: 4, nm: 8 },

  // Semester 3
  { no: 16, kode: "MDK-0303", matkul: "Matematika Diskrit", smt: 3, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 17, kode: "TDK-0304", matkul: "Jaringan Komputer Advanced", smt: 3, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 18, kode: "MDK-0305", matkul: "Pemrograman Web", smt: 3, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 19, kode: "MDK-0301", matkul: "Pemrograman SQL", smt: 3, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 20, kode: "MDK-0306", matkul: "Data Science", smt: 3, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 21, kode: "MDK-0302", matkul: "Rekayasa Perangkat Lunak", smt: 3, sks: 4, hm: "B", am: 3, nm: 12 },

  // Semester 4
  { no: 22, kode: "MBKM-TI-04078", matkul: "TP. Camping dan Trekking", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 23, kode: "MBKM-TI-04049", matkul: "Modul Nusantara", smt: 4, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 24, kode: "MBKM-TI-04051", matkul: "Pendidikan Anti Korupsi", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 25, kode: "MBKM-TI-04066", matkul: "Semiotika", smt: 4, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 26, kode: "MBKM-TI-04017", matkul: "Etika Bisnis Profesi", smt: 4, sks: 3, hm: "B", am: 3, nm: 9 },
];

// Export Array Mahasiswa (Kumpulan Data)
export const students: StudentData[] = [
  {
    id: "azhar",
    profile: {
      nama: "AZHARANGGA KUSUMA",
      nim: "41226142",
      prodi: "Teknik Informatika (S1)",
      semester: 7,
    },
    transcript: transcriptAzhar,
  },
  {
    id: "budi",
    profile: {
      nama: "BUDI SANTOSO",
      nim: "41226155",
      prodi: "Teknik Informatika (S1)",
      semester: 4,
    },
    transcript: transcriptBudi,
  },
];