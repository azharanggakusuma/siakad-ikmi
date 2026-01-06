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
    .order("hm", { ascending: true }); 

  if (error) throw new Error(error.message);
  return data as unknown as GradeData[];
}

// 2. [UPDATE] Ambil Mata Kuliah HANYA dari KRS yang Disetujui
export async function getStudentCoursesForGrading(studentId: string) {
  try {
    // A. Ambil Course ID hanya dari tabel KRS dengan status APPROVED
    const { data: krsList, error: krsError } = await supabase
      .from("krs")
      .select("course_id")
      .eq("student_id", studentId)
      .eq("status", "APPROVED"); // Filter ketat: Harus KRS Approved

    if (krsError) throw krsError;
    
    // Jika tidak ada KRS, kembalikan array kosong
    if (!krsList || krsList.length === 0) return [];

    // Ambil ID unik (mencegah duplikasi jika ada error data)
    const courseIds = Array.from(new Set(krsList.map((k) => k.course_id)));

    // B. Fetch Detail Mata Kuliah berdasarkan ID dari KRS tadi
    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("id, kode, matkul, sks, smt_default")
      .in("id", courseIds)
      .order("smt_default", { ascending: true })
      .order("matkul", { ascending: true });

    if (courseError) throw courseError;

    return courses;
  } catch (error: any) {
    console.error("Error fetching student grading courses:", error.message);
    return [];
  }
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

// --- BATCH SAVE OPERATION ---
export async function saveStudentGrades(
  studentId: string, 
  grades: { course_id: string, hm: string }[] 
) {
  // Loop setiap nilai yang dikirim dan simpan ke tabel GRADES
  // (Walaupun sumbernya dari KRS, simpannya tetap ke grades)
  for (const item of grades) {
    const { data: existing } = await supabase
      .from("grades")
      .select("id")
      .eq("student_id", studentId)
      .eq("course_id", item.course_id)
      .single();

    if (existing) {
      // Update jika sudah ada
      await supabase
        .from("grades")
        .update({ hm: item.hm })
        .eq("id", existing.id);
    } else {
      // Insert jika belum ada
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