// lib/types.ts

// =========================================
// GLOBAL & SHARED
// =========================================
export type Role = "admin" | "dosen" | "mahasiswa";
export type CourseCategory = "Reguler" | "MBKM";

export interface StudyProgram {
  id: string;
  kode: string;
  nama: string;
  jenjang: string;
}

export interface StudyProgramFormValues {
  kode: string;
  nama: string;
  jenjang: string;
}

export interface AcademicYear {
  id: string;
  nama: string;
  semester: string;
  is_active: boolean;
}

export interface AcademicYearFormValues {
  nama: string;
  semester: string;
  is_active: boolean;
}

// Interface untuk Pejabat (Official)
export interface Official {
  id: string;
  nama: string;
  nidn: string | null;
  jabatan: string;
  is_active: boolean;
}

// =========================================
// COURSE (MATA KULIAH)
// =========================================
export interface Course {
  id: string;
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
  id: string;
  nim: string;
  nama: string;
  alamat: string;
  semester: number;
  study_program_id: string | null;
  study_program?: StudyProgram | null;
  is_active: boolean;
}

export interface StudentFormValues {
  nim: string;
  nama: string;
  semester: string | number;
  alamat: string;
  study_program_id: string;
  is_active: boolean;
}

// =========================================
// TRANSCRIPT & GRADES
// =========================================
export interface TranscriptItem {
  no: number;
  course_id?: string;
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
  student_id?: string | null;
  is_active: boolean;
}

export interface UserPayload {
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: string | null;
  is_active?: boolean;
}

export interface UserFormValues {
  id?: string;
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: string | null;
  is_active: boolean;
}

export interface StudentOption {
  id: string;
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
  id: string;
  student_id: string;
  course_id: string;
  hm: string; 
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
  id: string;
  label: string;
  href: string;
  icon: string;
  section: string;
  parent_id?: string | null;
  parent?: { label: string } | null;
  allowed_roles: string[];
  sequence: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuFormValues {
  id?: string;
  label: string;
  href: string;
  icon: string;
  section: string;
  parent_id?: string | null;
  allowed_roles: string[];
  sequence: number | string;
  is_active: boolean;
}

// =========================================
// KRS (KARTU RENCANA STUDI)
// =========================================

export type KRSStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface KRS {
  id: string;
  student_id: string;
  course_id: string;
  academic_year_id: string;
  status: KRSStatus;
  
  // Nilai (Optional, diisi di akhir semester)
  grade_letter?: string | null; // A, B, C, dst
  grade_point?: number | null;  // 4.00, 3.00, dst
  
  created_at?: string;
  updated_at?: string;

  // Data Relasi (Untuk ditampilkan di UI)
  student?: {
    nim: string;
    nama: string;
    study_program?: {
      nama: string;
      jenjang: string;
    };
  } | null;
  
  course?: {
    kode: string;
    matkul: string;
    sks: number;
    smt_default: number;
  } | null;

  academic_year?: {
    nama: string;
    semester: string;
  } | null;
}

// Tipe untuk Form Input / Payload saat Create
export interface KRSFormValues {
  student_id: string;
  course_id: string;
  academic_year_id: string;
  status?: KRSStatus;
}