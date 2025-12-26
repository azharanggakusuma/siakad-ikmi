import studentsDB from "./students.json";
import gradesDB from "./grades.json";
import coursesDB from "./courses.json";

// =========================================
// 1. TYPE DEFINITIONS
// =========================================

export type CourseCategory = "Reguler" | "MBKM";

// Data Mata Kuliah sekarang punya ID
export interface CourseData {
  id: number;      // New: ID System
  kode: string;    // Data yang bisa diedit
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory;
}

export interface RawGrade {
  kode: string;
  hm: string;
  smt?: number;
}

export interface RawStudentProfile {
  id: number;      
  nim: string;     
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
}

export interface StudentProfile extends RawStudentProfile {}

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

export interface StudentData {
  id: string; 
  profile: StudentProfile;
  transcript: TranscriptItem[];
}

// =========================================
// 2. CONSTANTS & MAPPINGS
// =========================================

// --- PENTING: Konversi Array Courses ke Object Lookup ---
// Agar kita bisa mencari detail mata kuliah berdasarkan "kode" dengan cepat (O(1))
const COURSES_LOOKUP = (coursesDB as CourseData[]).reduce((acc, course) => {
  acc[course.kode] = course;
  return acc;
}, {} as Record<string, CourseData>);

const GRADE_POINTS: Record<string, number> = {
  "A": 4, "B": 3, "C": 2, "D": 1, "E": 0
};

const PRODI_FULL_NAMES: Record<string, string> = {
  "TI": "Teknik Informatika",
  "SI": "Sistem Informasi",
  "MI": "Manajemen Informatika",
  "KA": "Komputerisasi Akuntansi",
  "RPL": "Rekayasa Perangkat Lunak"
};

// =========================================
// 3. HELPER FUNCTIONS
// =========================================

function getAm(hm: string): number {
  return GRADE_POINTS[hm] ?? 0;
}

function createStudentData(rawStudent: RawStudentProfile): StudentData {
  const fullProdi = PRODI_FULL_NAMES[rawStudent.prodi] || rawStudent.prodi;

  const profile: StudentProfile = {
    ...rawStudent,
    prodi: fullProdi
  };

  const allGrades = gradesDB as Record<string, RawGrade[]>;
  const rawGrades = allGrades[rawStudent.nim] || [];

  const transcript: TranscriptItem[] = rawGrades.map((g, index) => {
    // Lookup ke Object yang sudah kita buat
    const course = COURSES_LOOKUP[g.kode];

    if (!course) {
      return {
        no: index + 1, kode: g.kode, matkul: "UNKNOWN", smt: g.smt || 0,
        sks: 0, hm: g.hm, am: 0, nm: 0, kategori: "Reguler"
      };
    }

    const am = getAm(g.hm);
    return {
      no: index + 1,
      kode: g.kode,
      matkul: course.matkul,
      smt: g.smt || course.smt_default,
      sks: course.sks,
      hm: g.hm,
      am: am,
      nm: am * course.sks,
      kategori: course.kategori
    };
  });

  return { 
    id: rawStudent.id.toString(),
    profile, 
    transcript 
  };
}

// =========================================
// 4. MAIN EXPORTS
// =========================================

export function getStudentById(id: string | number): StudentData | null {
  const targetId = Number(id);
  const rawStudent = studentsDB.find((s) => s.id === targetId);
  if (!rawStudent) return null;
  return createStudentData(rawStudent);
}

export const students: StudentData[] = studentsDB.map((s) => createStudentData(s));

// Export raw courses array untuk halaman Mata Kuliah
export const coursesList: CourseData[] = coursesDB as CourseData[];