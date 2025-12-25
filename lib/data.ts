import studentsDB from "./students.json";
import gradesDB from "./grades.json";

// =========================================
// 1. TYPE DEFINITIONS
// =========================================

export type CourseCategory = "Reguler" | "MBKM";

export interface TranscriptItem {
  no: number;
  kode: string;
  matkul: string;
  smt: number;
  sks: number;
  hm: string;
  am: number;
  nm: number;
  kategori: CourseCategory;
}

export interface StudentProfile {
  nim: string;
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
}

export interface StudentData {
  id: string; 
  profile: StudentProfile;
  transcript: TranscriptItem[];
}

// --- PERUBAHAN: Tambahkan 'export' di sini ---
export type CourseData = {
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory;
};

type RawGrade = {
  kode: string;
  hm: string;
  smt?: number;
};

// =========================================
// 2. MASTER DATA (DATABASE MATA KULIAH)
// =========================================

// --- PERUBAHAN: Tambahkan 'export' di sini ---
export const COURSES_DB: Record<string, CourseData> = {
  "MKWI-21012": { matkul: "Bahasa Inggris Dasar", sks: 2, smt_default: 1, kategori: "Reguler" },
  "MKWI-21013": { matkul: "Pengenalan Budaya Cirebon", sks: 2, smt_default: 1, kategori: "Reguler" },
  "MKD-0006":   { matkul: "Data Manajemen", sks: 3, smt_default: 1, kategori: "Reguler" },
  "MKWI-21014": { matkul: "Kalkulus", sks: 3, smt_default: 1, kategori: "Reguler" },
  "MKWI-21001": { matkul: "Algoritma dan Pemrograman Dasar", sks: 3, smt_default: 1, kategori: "Reguler" },
  "MKWN-21003": { matkul: "Pendidikan Agama", sks: 2, smt_default: 1, kategori: "Reguler" },
  "MKWI-21007": { matkul: "Dasar-Dasar Artificial Intelligence", sks: 3, smt_default: 1, kategori: "Reguler" },
  "MKWN-21001": { matkul: "Pancasila", sks: 2, smt_default: 1, kategori: "Reguler" },
  "MKWN-004":   { matkul: "Pendidikan Kewarganegaraan", sks: 2, smt_default: 2, kategori: "Reguler" },
  "SIW-2121":   { matkul: "Jaringan Komputer", sks: 3, smt_default: 2, kategori: "Reguler" },
  "MKD-0105":   { matkul: "Struktur Data", sks: 3, smt_default: 2, kategori: "Reguler" },
  "MKWI-21002": { matkul: "Algoritma dan Pemrograman Lanjut", sks: 4, smt_default: 2, kategori: "Reguler" },
  "SIW-2123":   { matkul: "Statistika", sks: 3, smt_default: 2, kategori: "Reguler" },
  "MKWI-21005": { matkul: "Aljabar Linear", sks: 3, smt_default: 2, kategori: "Reguler" },
  "MKWN-002":   { matkul: "Bahasa Indonesia", sks: 2, smt_default: 2, kategori: "Reguler" },
  "MDK-0303":   { matkul: "Matematika Diskrit", sks: 3, smt_default: 3, kategori: "Reguler" },
  "TDK-0304":   { matkul: "Jaringan Komputer Advanced", sks: 3, smt_default: 3, kategori: "Reguler" },
  "MDK-0305":   { matkul: "Pemrograman Web", sks: 3, smt_default: 3, kategori: "Reguler" },
  "MDK-0301":   { matkul: "Pemrograman SQL", sks: 4, smt_default: 3, kategori: "Reguler" },
  "MDK-0306":   { matkul: "Data Science", sks: 3, smt_default: 3, kategori: "Reguler" },
  "MDK-0302":   { matkul: "Rekayasa Perangkat Lunak", sks: 4, smt_default: 3, kategori: "Reguler" },
  "TDK-0406": { matkul: "Basis Data", sks: 3, smt_default: 4, kategori: "Reguler" },
  "MDK-0405": { matkul: "Internet of Thing", sks: 3, smt_default: 4, kategori: "Reguler" },
  "MDK-0404": { matkul: "Data Mining", sks: 4, smt_default: 4, kategori: "Reguler" },
  "TDK-0403": { matkul: "Metode Numerik", sks: 3, smt_default: 4, kategori: "Reguler" },
  "MDK-0402": { matkul: "Interaksi Manusia Komputer", sks: 3, smt_default: 4, kategori: "Reguler" },
  "TDK-0401": { matkul: "Jaringan Komputer Expert", sks: 4, smt_default: 4, kategori: "Reguler" },
  "MBKM-TI-04078": { matkul: "TP. Camping dan Trekking", sks: 3, smt_default: 4, kategori: "MBKM" },
  "MBKM-TI-04049": { matkul: "Modul Nusantara", sks: 4, smt_default: 4, kategori: "MBKM" },
  "MBKM-TI-04051": { matkul: "Pendidikan Anti Korupsi", sks: 3, smt_default: 4, kategori: "MBKM" },
  "MBKM-TI-04066": { matkul: "Semiotika", sks: 2, smt_default: 4, kategori: "MBKM" },
  "MBKM-TI-04017": { matkul: "Etika Bisnis Profesi", sks: 3, smt_default: 4, kategori: "MBKM" },
  "MBKM-TI-04073": { matkul: "Technopreneurship", sks: 3, smt_default: 4, kategori: "MBKM" },
  "MBKM-TI-04044": { matkul: "Media Pembelajaran", sks: 3, smt_default: 4, kategori: "MBKM" },
  "TKK-0501": { matkul: "Cloud Computing", sks: 4, smt_default: 5, kategori: "Reguler" },
  "MKK-0502": { matkul: "Keamanan Jaringan", sks: 4, smt_default: 5, kategori: "Reguler" },
  "TKK-0503": { matkul: "Text Mining", sks: 4, smt_default: 5, kategori: "Reguler" },
  "TKK-0504": { matkul: "Sistem Operasi", sks: 4, smt_default: 5, kategori: "Reguler" },
  "TKK-0505": { matkul: "Deep Learning Dasar", sks: 4, smt_default: 5, kategori: "Reguler" },
  "TKK-0601": { matkul: "Deep Learning Lanjut", sks: 4, smt_default: 6, kategori: "Reguler" },
  "TKK-0602": { matkul: "Manajemen Proyek Data Science", sks: 4, smt_default: 6, kategori: "Reguler" },
  "TKK-0603": { matkul: "Big Data Analytic", sks: 4, smt_default: 6, kategori: "Reguler" },
  "TKK-0604": { matkul: "Computer Vision", sks: 4, smt_default: 6, kategori: "Reguler" },
  "TKK-0605": { matkul: "Robotic", sks: 4, smt_default: 6, kategori: "Reguler" },
  "MKK-0705": { matkul: "IT Entrepreneur", sks: 2, smt_default: 7, kategori: "Reguler" },
  "MKK-0704": { matkul: "Etika Profesi", sks: 2, smt_default: 7, kategori: "Reguler" },
  "MKK-0703": { matkul: "Proposal Skripsi", sks: 2, smt_default: 7, kategori: "Reguler" },
  "MKK-0702": { matkul: "Literature Review", sks: 4, smt_default: 7, kategori: "Reguler" },
  "MKK-0701": { matkul: "Metode Penelitian", sks: 4, smt_default: 7, kategori: "Reguler" },
  "MKK-0802": { matkul: "Skripsi", sks: 6, smt_default: 8, kategori: "Reguler" },
  "MKK-0801": { matkul: "Sistematic Literature Review", sks: 4, smt_default: 8, kategori: "Reguler" },
};

// =========================================
// 3. HELPER FUNCTIONS
// =========================================

// --- UPDATED: Penilaian hanya A, B, C, D, E ---
function getAm(hm: string): number {
  const map: Record<string, number> = {
    "A": 4, 
    "B": 3, 
    "C": 2, 
    "D": 1, 
    "E": 0
  };
  // Jika ada input selain A-E, default ke 0 (E)
  return map[hm] ?? 0;
}

// Map Singkatan ke Nama Lengkap
const PRODI_FULL_NAMES: Record<string, string> = {
  "TI": "Teknik Informatika",
  "SI": "Sistem Informasi",
  "MI": "Manajemen Informatika",
  "KA": "Komputerisasi Akuntansi",
  "RPL": "Rekayasa Perangkat Lunak"
};

function createStudent(
  rawProfile: any,
  rawGrades: RawGrade[]
): StudentData {
  
  // Normalisasi Prodi (Ubah singkatan ke nama lengkap)
  const fullProdi = PRODI_FULL_NAMES[rawProfile.prodi] || rawProfile.prodi;

  // Buat Profile dengan Default Jenjang S1
  const profile: StudentProfile = {
    nim: rawProfile.nim,
    nama: rawProfile.nama,
    alamat: rawProfile.alamat,
    prodi: fullProdi,
    jenjang: rawProfile.jenjang,
    semester: rawProfile.semester
  };

  const transcript: TranscriptItem[] = rawGrades.map((g, index) => {
    const course = COURSES_DB[g.kode];
    if (!course) {
      return {
        no: index + 1, kode: g.kode, matkul: "UNKNOWN", smt: g.smt || 0,
        sks: 0, hm: g.hm, am: 0, nm: 0, kategori: "Reguler"
      };
    }
    const am = getAm(g.hm);
    return {
      no: index + 1, kode: g.kode, matkul: course.matkul,
      smt: g.smt || course.smt_default, sks: course.sks,
      hm: g.hm, am: am, nm: am * course.sks, kategori: course.kategori
    };
  });

  return { 
    id: profile.nim,
    profile, 
    transcript 
  };
}

// =========================================
// 4. DATA MAHASISWA
// =========================================

const allGrades = gradesDB as Record<string, RawGrade[]>;

export const students: StudentData[] = studentsDB.map((student) => {
  const grades = allGrades[student.nim] || [];
  return createStudent(student, grades);
});