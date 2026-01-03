// app/actions/grades.ts
"use server";

import { supabase } from "@/lib/supabase";
import { GradeData, GradeFormValues } from "@/lib/types";
import { revalidatePath } from "next/cache";

// --- FETCH DATA ---

// 1. Ambil semua grades (Masih dipakai jika butuh raw data)
export async function getGrades(): Promise<GradeData[]> {
  const { data, error } = await supabase
    .from("grades")
    .select(`
      *,
      student:students (
        id, 
        nim, 
        nama, 
        study_program:study_programs (
           nama,
           jenjang
        )
      ),
      course:courses (id, kode, matkul, sks)
    `)
    // Hapus order by id (UUID), ganti timestamp jika ada, atau default
    .order("hm", { ascending: true }); 

  if (error) throw new Error(error.message);
  return data as unknown as GradeData[];
}

// 2. Ambil List Mata Kuliah LENGKAP untuk Form Bertingkat
export async function getAllCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("id, kode, matkul, sks, smt_default")
    .order("smt_default", { ascending: true })
    .order("matkul", { ascending: true });
    
  if (error) throw new Error(error.message);
  return data;
}

// 3. Helper Select (Legacy)
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

// --- BATCH SAVE OPERATION (Fitur Baru) ---
export async function saveStudentGrades(
  studentId: string, // UUID
  grades: { course_id: string, hm: string }[] // UUID
) {
  for (const item of grades) {
    const { data: existing } = await supabase
      .from("grades")
      .select("id")
      .eq("student_id", studentId)
      .eq("course_id", item.course_id)
      .single();

    if (existing) {
      await supabase
        .from("grades")
        .update({ hm: item.hm })
        .eq("id", existing.id);
    } else {
      if (item.hm) {
        await supabase
          .from("grades")
          .insert({
            student_id: studentId,
            course_id: item.course_id,
            hm: item.hm
          });
      }
    }
  }

  revalidatePath("/nilai");
  revalidatePath("/mahasiswa"); 
}

// --- CRUD SINGLE (Legacy) ---
export async function createGrade(formData: GradeFormValues) {
  // Hapus parseInt
  const { error } = await supabase.from("grades").insert({
    student_id: formData.student_id,
    course_id: formData.course_id,
    hm: formData.hm,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}

export async function updateGrade(id: string, formData: GradeFormValues) {
  const { error } = await supabase
    .from("grades")
    .update({
      student_id: formData.student_id,
      course_id: formData.course_id,
      hm: formData.hm,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}

export async function deleteGrade(id: string) {
  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}