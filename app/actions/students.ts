'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { StudentData, TranscriptItem, StudentFormValues, StudyProgram, AcademicYear, Official } from "@/lib/types";

// Internal Interface untuk Response DB
interface DBResponseStudent {
  id: string;
  nim: string;
  nama: string;
  alamat: string;
  angkatan: number; // [Updated] Wajib ada
  study_program_id: string | null;
  is_active: boolean;
  study_programs: StudyProgram | null;
  grades: {
    id: string;
    hm: string;
    courses: {
      id: string;
      kode: string;
      matkul: string;
      sks: number;
      smt_default: number;
    } | null;
  }[];
}

const getAM = (hm: string): number => {
  const map: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  return map[hm] || 0;
};

// --- HELPER CALCULATE SEMESTER ---
const calculateSemester = (angkatan: number | null, activeYear: { nama: string, semester: string } | null): number => {
  if (!angkatan || !activeYear) return 1; // Default
  
  const currentStartYear = parseInt(activeYear.nama.split('/')[0]);
  if (isNaN(currentStartYear)) return 1;

  const yearDiff = currentStartYear - angkatan;
  let sem = yearDiff * 2;

  if (activeYear.semester === 'Ganjil') {
    sem += 1;
  } else if (activeYear.semester === 'Genap') {
    sem += 2;
  }

  return sem > 0 ? sem : 1;
};

// --- HELPER ERROR HANDLING ---
const handleDbError = (error: any, context: string) => {
  console.error(`[DB_ERROR] ${context}:`, error);

  if (error.code === '23505') {
    if (error.message?.includes('nim')) {
        throw new Error("NIM tersebut sudah terdaftar. Silakan gunakan NIM lain.");
    }
    throw new Error("Data duplikat terdeteksi dalam sistem.");
  }

  if (error.code === '23503') {
    throw new Error("Data tidak dapat dihapus atau diubah karena sedang digunakan oleh data lain.");
  }

  throw new Error("Gagal memproses data. Terjadi kendala di server.");
};

// --- READ OPERATIONS ---

export async function getStudyPrograms(): Promise<StudyProgram[]> {
  const { data, error } = await supabase
    .from('study_programs')
    .select('*')
    .order('nama', { ascending: true });
  
  if (error) return [];
  return data as StudyProgram[];
}

export async function getActiveAcademicYear(): Promise<AcademicYear | null> {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') console.error("Error fetching active academic year:", error.message);
    return null;
  }
  return data as AcademicYear;
}

export async function getActiveOfficial(): Promise<Official | null> {
  const { data, error } = await supabase
    .from('officials')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') console.error("Error fetching active official:", error.message);
    return null;
  }
  return data as Official;
}

export async function getStudents(): Promise<StudentData[]> {
  // 1. Ambil Tahun Akademik Aktif
  const activeYear = await getActiveAcademicYear();

  // 2. Ambil Data Mahasiswa (Tanpa kolom semester)
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      study_programs (
        id, kode, nama, jenjang
      ),
      grades (
        id, hm,
        courses (
          id, kode, matkul, sks, smt_default
        )
      )
    `)
    .order('nama', { ascending: true });

  if (error) {
    console.error("Error fetching students:", error.message);
    return [];
  }

  if (!data) return [];

  const students = data as unknown as DBResponseStudent[];

  return students.map((s) => {
    // Hitung semester dinamis
    const dynamicSemester = calculateSemester(s.angkatan, activeYear);

    const transcript: TranscriptItem[] = (s.grades || [])
      .map((g, index) => {
        const course = g.courses;
        const am = getAM(g.hm);
        const sks = course?.sks || 0;
        const nm = am * sks;

        return {
          no: index + 1,
          course_id: course?.id,
          kode: course?.kode || "CODE",
          matkul: course?.matkul || "Unknown",
          smt: course?.smt_default || 1,
          sks: sks,
          hm: g.hm,
          am: am,
          nm: nm
        };
      })
      .sort((a, b) => a.smt - b.smt || a.kode.localeCompare(b.kode));

    return {
      id: s.id,
      profile: {
        id: s.id,
        nim: s.nim,
        nama: s.nama,
        alamat: s.alamat,
        angkatan: s.angkatan || 0,
        semester: dynamicSemester, // Masukkan hasil hitungan ke property 'semester'
        study_program_id: s.study_program_id,
        study_program: s.study_programs,
        is_active: s.is_active ?? true
      },
      transcript: transcript
    };
  });
}

// --- CRUD OPERATIONS ---

export async function createStudent(values: StudentFormValues) {
  // [Updated] Insert angkatan, hapus semester
  const { error } = await supabase.from('students').insert([{
    nim: values.nim,
    nama: values.nama,
    angkatan: Number(values.angkatan), 
    alamat: values.alamat,
    study_program_id: values.study_program_id || null, 
    is_active: values.is_active 
  }]);
  
  if (error) handleDbError(error, "createStudent");
  
  revalidatePath('/mahasiswa'); 
}

export async function updateStudent(id: string, values: StudentFormValues) {
  // [Updated] Update angkatan, hapus semester
  const { error } = await supabase.from('students').update({
    nim: values.nim,
    nama: values.nama,
    angkatan: Number(values.angkatan),
    alamat: values.alamat,
    study_program_id: values.study_program_id || null,
    is_active: values.is_active
  }).eq('id', id);

  if (error) handleDbError(error, "updateStudent");
  
  revalidatePath('/mahasiswa');
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  
  if (error) handleDbError(error, "deleteStudent");
  
  revalidatePath('/mahasiswa');
}