"use server";

import { supabase } from "@/lib/supabase";
import { GradeData, GradeFormValues } from "@/lib/types";
import { revalidatePath } from "next/cache";

// --- FETCH DATA (dengan JOIN) ---
export async function getGrades(): Promise<GradeData[]> {
  const { data, error } = await supabase
    .from("grades")
    .select(`
      *,
      student:students (id, nim, nama, prodi),
      course:courses (id, kode, matkul, sks)
    `)
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);
  return data as GradeData[];
}

// --- Helper untuk Dropdown Form ---
export async function getStudentsForSelect() {
  const { data, error } = await supabase
    .from("students")
    .select("id, nim, nama")
    .order("nama", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getCoursesForSelect() {
  const { data, error } = await supabase
    .from("courses")
    .select("id, kode, matkul")
    .order("matkul", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

// --- CREATE ---
export async function createGrade(formData: GradeFormValues) {
  const { error } = await supabase.from("grades").insert({
    student_id: parseInt(formData.student_id),
    course_id: parseInt(formData.course_id),
    hm: formData.hm,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}

// --- UPDATE ---
export async function updateGrade(id: number | string, formData: GradeFormValues) {
  const { error } = await supabase
    .from("grades")
    .update({
      student_id: parseInt(formData.student_id),
      course_id: parseInt(formData.course_id),
      hm: formData.hm,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}

// --- DELETE ---
export async function deleteGrade(id: number | string) {
  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}