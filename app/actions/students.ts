'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { StudentData, TranscriptItem, StudentFormValues } from "@/lib/types";

// Internal Interface untuk Response DB (Mapping hasil join)
interface DBResponseStudent {
  id: number;
  nim: string;
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
  grades: {
    id: number;
    hm: string;
    courses: {
      id: number;
      kode: string;
      matkul: string;
      sks: number;
      smt_default: number;
    } | null;
  }[];
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
  const students = data as unknown as DBResponseStudent[];

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

export async function createStudent(values: StudentFormValues) {
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

export async function updateStudent(id: string | number, values: StudentFormValues) {
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