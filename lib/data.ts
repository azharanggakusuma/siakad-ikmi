// lib/data.ts

// =========================================
// 1. TYPE DEFINITIONS
// =========================================

export interface TranscriptItem {
  no: number;
  kode: string;
  matkul: string;
  smt: number;
  sks: number;
  hm: string; // Huruf Mutu (A, B, C...)
  am: number; // Angka Mutu (4, 3, 2...)
  nm: number; // Nilai Mutu (am x sks)
}

export interface StudentProfile {
  nama: string;
  nim: string;
  prodi: string;
  semester: number;
}

export interface StudentData {
  id: string;
  profile: StudentProfile;
  transcript: TranscriptItem[];
}

// Tipe data untuk Master Mata Kuliah (Database MK)
type CourseData = {
  matkul: string;
  sks: number;
  smt_default: number; // Semester standar MK ini diambil
};

// Tipe data input ringkas (hanya butuh Kode & Nilai)
type RawGrade = {
  kode: string;
  hm: string;
  smt?: number; // Opsional: jika mahasiswa ambil di semester beda (misal SP/mengulang)
};

// =========================================
// 2. MASTER DATA (DATABASE MATA KULIAH)
// =========================================
// Tambahkan semua mata kuliah di sini.
// Format: "KODE_MK": { matkul: "Nama MK", sks: 2, smt_default: 1 }

const COURSES_DB: Record<string, CourseData> = {
  // --- SEMESTER 1 ---
  "MKWI-21012": { matkul: "Bahasa Inggris Dasar", sks: 2, smt_default: 1 },
  "MKWI-21013": { matkul: "Pengenalan Budaya Cirebon", sks: 2, smt_default: 1 },
  "MKD-0006":   { matkul: "Data Manajemen", sks: 3, smt_default: 1 },
  "MKWI-21014": { matkul: "Kalkulus", sks: 3, smt_default: 1 },
  "MKWI-21001": { matkul: "Algoritma dan Pemrograman Dasar", sks: 3, smt_default: 1 },
  "MKWN-21003": { matkul: "Pendidikan Agama", sks: 2, smt_default: 1 },
  "MKWI-21007": { matkul: "Dasar-Dasar Artificial Intelligence", sks: 3, smt_default: 1 },
  "MKWN-21001": { matkul: "Pancasila", sks: 2, smt_default: 1 },

  // --- SEMESTER 2 ---
  "MKWN-004":   { matkul: "Pendidikan Kewarganegaraan", sks: 2, smt_default: 2 },
  "SIW-2121":   { matkul: "Jaringan Komputer", sks: 3, smt_default: 2 },
  "MKD-0105":   { matkul: "Struktur Data", sks: 3, smt_default: 2 },
  "MKWI-21002": { matkul: "Algoritma dan Pemrograman Lanjut", sks: 4, smt_default: 2 },
  "SIW-2123":   { matkul: "Statistika", sks: 3, smt_default: 2 },
  "MKWI-21005": { matkul: "Aljabar Linear", sks: 3, smt_default: 2 },
  "MKWN-002":   { matkul: "Bahasa Indonesia", sks: 2, smt_default: 2 },

  // --- SEMESTER 3 ---
  "MDK-0303":   { matkul: "Matematika Diskrit", sks: 3, smt_default: 3 },
  "TDK-0304":   { matkul: "Jaringan Komputer Advanced", sks: 3, smt_default: 3 },
  "MDK-0305":   { matkul: "Pemrograman Web", sks: 3, smt_default: 3 },
  "MDK-0301":   { matkul: "Pemrograman SQL", sks: 4, smt_default: 3 },
  "MDK-0306":   { matkul: "Data Science", sks: 3, smt_default: 3 },
  "MDK-0302":   { matkul: "Rekayasa Perangkat Lunak", sks: 4, smt_default: 3 },

  // --- SEMESTER 4 (REGULER / ASLI KAMPUS) ---
  "TDK-0406": { matkul: "Basis Data", sks: 3, smt_default: 4 },
  "MDK-0405": { matkul: "Internet of Thing", sks: 3, smt_default: 4 },
  "MDK-0404": { matkul: "Data Mining", sks: 4, smt_default: 4 },
  "TDK-0403": { matkul: "Metode Numerik", sks: 3, smt_default: 4 },
  "MDK-0402": { matkul: "Interaksi Manusia Komputer", sks: 3, smt_default: 4 },
  "TDK-0401": { matkul: "Jaringan Komputer Expert", sks: 4, smt_default: 4 },

  // --- SEMESTER 4 (KHUSUS MBKM / LUAR KAMPUS) ---
  "MBKM-TI-04078": { matkul: "TP. Camping dan Trekking", sks: 3, smt_default: 4 },
  "MBKM-TI-04049": { matkul: "Modul Nusantara", sks: 4, smt_default: 4 },
  "MBKM-TI-04051": { matkul: "Pendidikan Anti Korupsi", sks: 3, smt_default: 4 },
  "MBKM-TI-04066": { matkul: "Semiotika", sks: 2, smt_default: 4 },
  "MBKM-TI-04017": { matkul: "Etika Bisnis Profesi", sks: 3, smt_default: 4 },
  "MBKM-TI-04073": { matkul: "Technopreneurship", sks: 3, smt_default: 4 },
  "MBKM-TI-04044": { matkul: "Media Pembelajaran", sks: 3, smt_default: 4 },

  // --- SEMESTER 5 ---
  "TKK-0501": { matkul: "Cloud Computing", sks: 4, smt_default: 5 },
  "MKK-0502": { matkul: "Keamanan Jaringan", sks: 4, smt_default: 5 },
  "TKK-0503": { matkul: "Text Mining", sks: 4, smt_default: 5 },
  "TKK-0504": { matkul: "Sistem Operasi", sks: 4, smt_default: 5 },
  "TKK-0505": { matkul: "Deep Learning Dasar", sks: 4, smt_default: 5 },

  // --- SEMESTER 6 ---
  "TKK-0601": { matkul: "Deep Learning Lanjut", sks: 4, smt_default: 6 },
  "TKK-0602": { matkul: "Manajemen Proyek Data Science", sks: 4, smt_default: 6 },
  "TKK-0603": { matkul: "Big Data Analytic", sks: 4, smt_default: 6 },
  "TKK-0604": { matkul: "Computer Vision", sks: 4, smt_default: 6 },
  "TKK-0605": { matkul: "Robotic", sks: 4, smt_default: 6 },

  // --- SEMESTER 7 ---
  "MKK-0705": { matkul: "IT Entrepreneur", sks: 2, smt_default: 7 },
  "MKK-0704": { matkul: "Etika Profesi", sks: 2, smt_default: 7 },
  "MKK-0703": { matkul: "Proposal Skripsi", sks: 2, smt_default: 7 },
  "MKK-0702": { matkul: "Literature Review", sks: 4, smt_default: 7 },
  "MKK-0701": { matkul: "Metode Penelitian", sks: 4, smt_default: 7 },
};

// =========================================
// 3. HELPER FUNCTIONS (LOGIC OTOMATIS)
// =========================================

// Konversi Huruf Mutu (A, B..) ke Angka Mutu (4, 3..)
function getAm(hm: string): number {
  const map: Record<string, number> = {
    "A": 4, "A-": 3.75,
    "B+": 3.5, "B": 3, "B-": 2.75,
    "C+": 2.5, "C": 2, "D": 1, "E": 0
  };
  return map[hm] ?? 0;
}

// Fungsi pembantu untuk membuat Data Mahasiswa
function createStudent(
  id: string,
  profile: StudentProfile,
  rawGrades: RawGrade[]
): StudentData {
  
  const transcript: TranscriptItem[] = rawGrades.map((g, index) => {
    const course = COURSES_DB[g.kode];
    
    // Error handling jika kode MK salah ketik/tidak ada di DB
    if (!course) {
      console.warn(`[WARNING] Mata Kuliah dengan kode ${g.kode} tidak ditemukan di COURSES_DB.`);
      return {
        no: index + 1,
        kode: g.kode,
        matkul: "UNKNOWN COURSE",
        smt: g.smt || 0,
        sks: 0,
        hm: g.hm,
        am: 0,
        nm: 0
      };
    }

    const am = getAm(g.hm);
    
    return {
      no: index + 1,
      kode: g.kode,
      matkul: course.matkul,
      smt: g.smt || course.smt_default, // Pakai semester default jika tidak di-override
      sks: course.sks,
      hm: g.hm,
      am: am,
      nm: am * course.sks // Hitung NM otomatis
    };
  });

  return { id, profile, transcript };
}

// =========================================
// 4. DATA MAHASISWA (INPUT DATA DI SINI)
// =========================================

// --- DATA 1: AZHARANGGA KUSUMA ---
const azhar = createStudent(
  "azhar",
  {
    nama: "AZHARANGGA KUSUMA",
    nim: "41226142",
    prodi: "Teknik Informatika (S1)",
    semester: 7,
  },
  [
    // Semester 1
    { kode: "MKWI-21012", hm: "A" },
    { kode: "MKWI-21013", hm: "A" },
    { kode: "MKD-0006",   hm: "A" },
    { kode: "MKWI-21014", hm: "B" },
    { kode: "MKWI-21001", hm: "B" },
    { kode: "MKWN-21003", hm: "B" },
    { kode: "MKWI-21007", hm: "B" },
    { kode: "MKWN-21001", hm: "B" },

    // Semester 2
    { kode: "MKWN-004",   hm: "B" },
    { kode: "SIW-2121",   hm: "A" },
    { kode: "MKD-0105",   hm: "B" },
    { kode: "MKWI-21002", hm: "B" },
    { kode: "SIW-2123",   hm: "B" },
    { kode: "MKWI-21005", hm: "B" },
    { kode: "MKWN-002",   hm: "A" },

    // Semester 3
    { kode: "MDK-0303", hm: "B" },
    { kode: "TDK-0304", hm: "A" },
    { kode: "MDK-0305", hm: "A" },
    { kode: "MDK-0301", hm: "B" },
    { kode: "MDK-0306", hm: "B" },
    { kode: "MDK-0302", hm: "B" },

    // Semester 4
    { kode: "MBKM-TI-04078", hm: "A" },
    { kode: "MBKM-TI-04049", hm: "A" },
    { kode: "MBKM-TI-04051", hm: "A" },
    { kode: "MBKM-TI-04066", hm: "B" },
    { kode: "MBKM-TI-04017", hm: "B" },
    { kode: "MBKM-TI-04073", hm: "A" },
    { kode: "MBKM-TI-04044", hm: "B" },

    // Semester 5
    { kode: "TKK-0501", hm: "A" },
    { kode: "MKK-0502", hm: "B" },
    { kode: "TKK-0503", hm: "A" },
    { kode: "TKK-0504", hm: "B" },
    { kode: "TKK-0505", hm: "A" },

    // Semester 6
    { kode: "TKK-0601", hm: "B" },
    { kode: "TKK-0602", hm: "A" },
    { kode: "TKK-0603", hm: "B" },
    { kode: "TKK-0604", hm: "A" },
    { kode: "TKK-0605", hm: "A" },

    // Semester 7
    { kode: "MKK-0705", hm: "B" },
    { kode: "MKK-0704", hm: "B" },
    { kode: "MKK-0703", hm: "C" },
    { kode: "MKK-0702", hm: "A" },
    { kode: "MKK-0701", hm: "B" },
  ]
);

// --- DATA 2: BUDI SANTOSO ---
const budi = createStudent(
  "budi",
  {
    nama: "JOHN DOE",
    nim: "41226155",
    prodi: "Teknik Informatika (S1)",
    semester: 4,
  },
  [
    // Smt 1
    { kode: "MKWI-21012", hm: "A" },
    { kode: "MKWI-21013", hm: "B" },
    { kode: "MKD-0006",   hm: "B" },
    { kode: "MKWI-21014", hm: "C" },
    { kode: "MKWI-21001", hm: "A" },
    { kode: "MKWN-21003", hm: "A" },
    { kode: "MKWI-21007", hm: "B" },
    { kode: "MKWN-21001", hm: "A" },

    // Smt 2
    { kode: "MKWN-004",   hm: "B" },
    { kode: "SIW-2121",   hm: "B" },
    { kode: "MKD-0105",   hm: "C" },
    { kode: "MKWI-21002", hm: "B" },
    { kode: "SIW-2123",   hm: "C" },
    { kode: "MKWI-21005", hm: "C" },
    { kode: "MKWN-002",   hm: "A" },

    // Smt 3
    { kode: "MDK-0303", hm: "B" },
    { kode: "TDK-0304", hm: "B" },
    { kode: "MDK-0305", hm: "A" },
    { kode: "MDK-0301", hm: "A" },
    { kode: "MDK-0306", hm: "B" },
    { kode: "MDK-0302", hm: "B" },

    // Smt 4
    { kode: "TDK-0406", hm: "A" },
    { kode: "MDK-0405", hm: "B" },
    { kode: "MDK-0404", hm: "B" },
    { kode: "TDK-0403", hm: "B" },
    { kode: "MDK-0402", hm: "B" },
    { kode: "TDK-0401", hm: "A" },
  ]
);

// EXPORT ARRAY UTAMA
export const students: StudentData[] = [azhar, budi];