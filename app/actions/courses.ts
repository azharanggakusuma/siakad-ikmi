'use server'

import { createClient } from "@/lib/supabase/server"; 
import { revalidatePath } from "next/cache";
import { Course, CoursePayload } from "@/lib/types";

// --- HELPER ERROR HANDLING ---
const handleDbError = (error: any, context: string) => {
  console.error(`[DB_ERROR] ${context}:`, error);

  if (error.code === '23505') {
    if (error.message?.includes('kode')) {
        throw new Error("Kode Mata Kuliah tersebut sudah ada. Harap gunakan kode lain.");
    }
    throw new Error("Data duplikat terdeteksi dalam sistem.");
  }

  if (error.code === '23503') {
    throw new Error("Mata kuliah tidak dapat dihapus karena sudah diambil oleh mahasiswa atau memiliki data nilai.");
  }

  throw new Error("Gagal memproses data. Terjadi kendala di server.");
};

// Ambil semua mata kuliah
export async function getCourses() {
  const supabase = await createClient(); 
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
  const supabase = await createClient(); 
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
  const supabase = await createClient(); 
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
  const supabase = await createClient(); 
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) handleDbError(error, "deleteCourse");
  
  revalidatePath('/matakuliah');
}