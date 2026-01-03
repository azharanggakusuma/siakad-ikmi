'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { StudentData, TranscriptItem, StudentFormValues, StudyProgram, AcademicYear, Official } from "@/lib/types";

// Internal Interface untuk Response DB (Mapping hasil join)
interface DBResponseStudent {
  id: string; // UUID
  nim: string;
  nama: string;
  alamat: string;
  semester: number;
  study_program_id: string | null; // UUID
  is_active: boolean;
  study_programs: StudyProgram | null;
  grades: {
    id: string; // UUID
    hm: string;
    courses: {
      id: string; // UUID
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
    console.error("Error fetching active academic year:", error.message);
    return null;
  }
  return data as AcademicYear;
}

// Fungsi BARU: Ambil Pejabat Aktif
export async function getActiveOfficial(): Promise<Official | null> {
  const { data, error } = await supabase
    .from('officials')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error("Error fetching active official:", error.message);
    return null;
  }
  return data as Official;
}

export async function getStudents(): Promise<StudentData[]> {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      study_programs (
        id,
        kode,
        nama,
        jenjang
      ),
      grades (
        id,
        hm,
        courses (
          id,
          kode,
          matkul,
          sks,
          smt_default
        )
      )
    `)
    .order('nama', { ascending: true }); // Ubah order by nama karena UUID tidak urut

  if (error) {
    console.error("Error fetching students:", error.message);
    return [];
  }

  if (!data) return [];

  const students = data as unknown as DBResponseStudent[];

  return students.map((s) => {
    const transcript: TranscriptItem[] = (s.grades || [])
      .map((g, index) => {
        const course = g.courses;
        const am = getAM(g.hm);
        const sks = course?.sks || 0;
        const nm = am * sks;

        return {
          no: index + 1,
          course_id: course?.id, // UUID string
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
      id: s.id, // UUID string
      profile: {
        id: s.id,
        nim: s.nim,
        nama: s.nama,
        alamat: s.alamat,
        semester: s.semester,
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
  // Hapus Number() pada study_program_id karena sekarang UUID
  const { error } = await supabase.from('students').insert([{
    nim: values.nim,
    nama: values.nama,
    semester: Number(values.semester), // Semester tetap integer
    alamat: values.alamat,
    study_program_id: values.study_program_id || null, 
    is_active: values.is_active 
  }]);
  
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa'); 
}

export async function updateStudent(id: string, values: StudentFormValues) {
  // id string, study_program_id string
  const { error } = await supabase.from('students').update({
    nim: values.nim,
    nama: values.nama,
    semester: Number(values.semester),
    alamat: values.alamat,
    study_program_id: values.study_program_id || null,
    is_active: values.is_active
  }).eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}