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

// Digunakan untuk Payload API & State Form
export interface CourseFormValues {
  kode: string;
  matkul: string;
  sks: number | string;
  smt_default: number | string;
  kategori: CourseCategory | "";
}

// Alias untuk kompatibilitas dengan existing code
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

// Digunakan untuk Form Input & Update Mahasiswa
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
  hm: string;      // Huruf Mutu (A, B, C...)
  am: number;      // Angka Mutu (4, 3, 2...)
  nm: number;      // Nilai Mutu (am * sks)
  kategori?: CourseCategory; 
}

// Struktur Data Utama Dashboard Mahasiswa
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

// Payload untuk Create/Update User
export interface UserPayload {
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
}

// Digunakan di Form User
export interface UserFormValues {
  id?: string;
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
}

// Opsi dropdown saat memilih mahasiswa untuk ditautkan ke user
export interface StudentOption {
  id: number;
  nim: string;
  nama: string;
  is_taken: boolean;
}