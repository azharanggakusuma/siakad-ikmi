// lib/types.ts

// =========================================
// GLOBAL & SHARED
// =========================================
export type Role = "admin" | "dosen" | "mahasiswa";
export type CourseCategory = "Reguler" | "MBKM";

export interface StudyProgram {
  id: number;
  kode: string;
  nama: string;
  jenjang: string;
}

export interface AcademicYear {
  id: number;
  nama: string;
  semester: string;
  is_active: boolean;
}

// Interface baru untuk Pejabat (Official)
export interface Official {
  id: number;
  nama: string;
  nidn: string | null;
  jabatan: string;
  is_active: boolean;
}

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
  semester: number;
  study_program_id: number | null;
  study_program?: StudyProgram | null;
  is_active: boolean; // [BARU]
}

export interface StudentFormValues {
  nim: string;
  nama: string;
  semester: string | number;
  alamat: string;
  study_program_id: string; 
  is_active: boolean; // [BARU]
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
  is_active: boolean; // [BARU]
}

export interface UserPayload {
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
  is_active?: boolean; // [BARU]
}

export interface UserFormValues {
  id?: string;
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
  is_active: boolean; // [BARU]
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

export type GradeData = Grade & {
  student: {
    nim: string;
    nama: string;
    study_program?: {
        nama: string;
        jenjang: string;
    };
  };
  course: {
    kode: string;
    matkul: string;
    sks: number;
  };
};

export type GradeFormValues = {
  student_id: string; 
  course_id: string;
  hm: string;
};

// =========================================
// MENUS (MANAJEMEN MENU)
// =========================================
export interface Menu {
  id: number;
  label: string;
  href: string;
  icon: string;
  section: string;
  allowed_roles: string[];
  sequence: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuFormValues {
  id?: number;
  label: string;
  href: string;
  icon: string;
  section: string;
  allowed_roles: string[];
  sequence: number | string;
  is_active: boolean;
}