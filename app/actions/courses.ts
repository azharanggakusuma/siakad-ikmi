'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Course, CoursePayload } from "@/lib/types";

// Ambil semua mata kuliah
export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('id', { ascending: true });

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

  if (error) throw new Error(error.message);
  revalidatePath('/matakuliah');
}

// Update mata kuliah
export async function updateCourse(id: number, values: CoursePayload) {
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

  if (error) throw new Error(error.message);
  revalidatePath('/matakuliah');
}

// Hapus mata kuliah
export async function deleteCourse(id: number) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/matakuliah');
}