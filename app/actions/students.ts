'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// --- EXPORT TYPES (Agar bisa diimport di page lain) ---
export interface TranscriptItem {
  no: number;
  course_id: number;
  kode: string;
  matkul: string;
  smt: number;
  sks: number;
  hm: string;
  am: number;
  nm: number;
}

export interface StudentProfile {
  id: number;
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

// Internal Interface untuk Response DB
interface Course {
  id: number;
  kode: string;
  matkul: string;
  sks: number;
  smt_default: number;
}

interface Grade {
  id: number;
  hm: string;
  courses: Course | null;
}

interface StudentResponse {
  id: number;
  nim: string;
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
  grades: Grade[];
}

// Helper konversi nilai huruf ke angka
const getAM = (hm: string): number => {
  const map: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  return map[hm] || 0;
};

export async function getStudents(): Promise<StudentData[]> {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
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
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching students:", error.message);
    return [];
  }

  // Casting data dari DB ke tipe internal
  const students = data as unknown as StudentResponse[];

  // Mapping ke tipe StudentData yang bersih
  return students.map((s) => {
    const transcript: TranscriptItem[] = (s.grades || [])
      .map((g, index) => {
        const course = g.courses;
        const am = getAM(g.hm);
        const sks = course?.sks || 0;
        const nm = am * sks;

        return {
          no: index + 1,
          course_id: course?.id || 0,
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
      id: String(s.id),
      profile: {
        id: s.id,
        nim: s.nim,
        nama: s.nama,
        alamat: s.alamat,
        prodi: s.prodi,
        jenjang: s.jenjang,
        semester: s.semester
      },
      transcript: transcript
    };
  });
}

// --- CRUD OPERATIONS ---

interface StudentValues {
  nim: string;
  nama: string;
  prodi: string;
  jenjang: string;
  semester: number | string;
  alamat: string;
}

export async function createStudent(values: StudentValues) {
  const { error } = await supabase.from('students').insert([{
    nim: values.nim,
    nama: values.nama,
    prodi: values.prodi,
    jenjang: values.jenjang,
    semester: Number(values.semester),
    alamat: values.alamat
  }]);
  
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa'); 
}

export async function updateStudent(id: string | number, values: StudentValues) {
  const { error } = await supabase.from('students').update({
    nim: values.nim,
    nama: values.nama,
    prodi: values.prodi,
    jenjang: values.jenjang,
    semester: Number(values.semester),
    alamat: values.alamat
  }).eq('id', Number(id));

  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}

export async function deleteStudent(id: string | number) {
  const { error } = await supabase.from('students').delete().eq('id', Number(id));
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}