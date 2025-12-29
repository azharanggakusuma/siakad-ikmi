// lib/types.ts

// =========================================
// GLOBAL & SHARED
// =========================================
export type Role = "admin" | "dosen" | "mahasiswa";
export type CourseCategory = "Reguler" | "MBKM";

// =========================================
// COURSE (MATA KULIAH)
// =========================================
export interface Course {
  id: number;
  kode: string;
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory | string;
}

export interface CourseFormValues {
  kode: string;
  matkul: string;
  sks: number | string;
  smt_default: number | string;
  kategori: CourseCategory | "";
}

export type CoursePayload = CourseFormValues; 

// =========================================
// STUDENT (MAHASISWA)
// =========================================
export interface StudentProfile {
  id: number;
  nim: string;
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
}

export interface StudentFormValues {
  nim: string;
  nama: string;
  prodi: string;
  jenjang: string;
  semester: string | number;
  alamat: string;
}

// =========================================
// TRANSCRIPT & GRADES
// =========================================
export interface TranscriptItem {
  no: number;
  course_id?: number;
  kode: string;
  matkul: string;
  smt: number;
  sks: number;
  hm: string;
  am: number;
  nm: number;
  kategori?: CourseCategory; 
}

export interface StudentData {
  id: string; 
  profile: StudentProfile;
  transcript: TranscriptItem[];
}

// =========================================
// USERS (PENGGUNA)
// =========================================
export interface UserData {
  id: string;
  name: string;
  username: string;
  role: Role | string;
  student_id?: number | null;
}

export interface UserPayload {
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
}

export interface UserFormValues {
  id?: string;
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
}

export interface StudentOption {
  id: number;
  nim: string;
  nama: string;
  is_taken: boolean;
}

// =========================================
// SETTINGS (PENGATURAN)
// =========================================
export interface UserProfile {
  name: string;
  username: string;
  role: string;
  alamat?: string;
  password?: string;
}

// --- Grades / Nilai ---
export type Grade = {
  id: number;
  student_id: number;
  course_id: number;
  hm: string; // Huruf Mutu
};

// Tipe data untuk ditampilkan di Tabel (Join result)
export type GradeData = Grade & {
  student: {
    nim: string;
    nama: string;
    prodi: string;
  };
  course: {
    kode: string;
    matkul: string;
    sks: number;
  };
};

export type GradeFormValues = {
  student_id: string; // Menggunakan string untuk value select
  course_id: string;
  hm: string;
};