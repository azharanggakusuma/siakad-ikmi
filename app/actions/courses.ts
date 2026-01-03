'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Course, CoursePayload } from "@/lib/types";

// --- HELPER ERROR HANDLING ---
const handleDbError = (error: any, context: string) => {
  // 1. Log Error Asli di SERVER Console
  console.error(`[DB_ERROR] ${context}:`, error);

  // 2. Cek Kode Error Postgres
  // Code 23505: Unique Violation (Data Kembar)
  if (error.code === '23505') {
    if (error.message?.includes('kode')) {
        throw new Error("Kode Mata Kuliah tersebut sudah ada. Harap gunakan kode lain.");
    }
    throw new Error("Data duplikat terdeteksi dalam sistem.");
  }

  // Code 23503: Foreign Key Violation (Data Terpakai)
  if (error.code === '23503') {
    throw new Error("Mata kuliah tidak dapat dihapus karena sudah diambil oleh mahasiswa atau memiliki data nilai.");
  }

  // 3. Fallback Error Umum
  throw new Error("Gagal memproses data. Terjadi kendala di server.");
};

// Ambil semua mata kuliah
export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('matkul', { ascending: true });

  if (error) {
    console.error("Error fetching courses:", error.message);
    return [];
  }
  return data as Course[];
}

// Tambah mata kuliah baru
export async function createCourse(values: CoursePayload) {
  const { error } = await supabase
    .from('courses')
    .insert([{
      kode: values.kode,
      matkul: values.matkul,
      sks: Number(values.sks),
      smt_default: Number(values.smt_default),
      kategori: values.kategori
    }]);

  if (error) handleDbError(error, "createCourse");
  
  revalidatePath('/matakuliah');
}

// Update mata kuliah
export async function updateCourse(id: string, values: CoursePayload) {
  const { error } = await supabase
    .from('courses')
    .update({
      kode: values.kode,
      matkul: values.matkul,
      sks: Number(values.sks),
      smt_default: Number(values.smt_default),
      kategori: values.kategori
    })
    .eq('id', id);

  if (error) handleDbError(error, "updateCourse");
  
  revalidatePath('/matakuliah');
}

// Hapus mata kuliah
export async function deleteCourse(id: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) handleDbError(error, "deleteCourse");
  
  revalidatePath('/matakuliah');
}