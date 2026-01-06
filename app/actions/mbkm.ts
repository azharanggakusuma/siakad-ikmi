'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { StudentMBKM, StudentMBKMFormValues } from "@/lib/types";

// 1. Get All MBKM Students (Filter by Academic Year Optional)
export async function getMbkmStudents() {
  const { data, error } = await supabase
    .from('student_mbkm')
    .select(`
      *,
      student:students (
        id, nim, nama, 
        study_program:study_programs(nama, jenjang)
      ),
      academic_year:academic_years (
        id, nama, semester
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching MBKM:", error);
    return [];
  }
  return data as StudentMBKM[];
}

// 2. Create
export async function createMbkmStudent(values: StudentMBKMFormValues) {
  // Cek duplikasi
  const { data: existing } = await supabase
    .from('student_mbkm')
    .select('id')
    .eq('student_id', values.student_id)
    .eq('academic_year_id', values.academic_year_id)
    .single();

  if (existing) {
    throw new Error("Mahasiswa ini sudah terdaftar MBKM di semester tersebut.");
  }

  const { error } = await supabase.from('student_mbkm').insert([{
    student_id: values.student_id,
    academic_year_id: values.academic_year_id,
    jenis_mbkm: values.jenis_mbkm,
    mitra: values.mitra,
    keterangan: values.keterangan
  }]);

  if (error) throw new Error("Gagal menambahkan data MBKM.");
  revalidatePath('/mbkm');
}

// 3. Update
export async function updateMbkmStudent(id: string, values: StudentMBKMFormValues) {
  const { error } = await supabase
    .from('student_mbkm')
    .update({
      student_id: values.student_id,
      academic_year_id: values.academic_year_id,
      jenis_mbkm: values.jenis_mbkm,
      mitra: values.mitra,
      keterangan: values.keterangan,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw new Error("Gagal mengupdate data MBKM.");
  revalidatePath('/mbkm');
}

// 4. Delete
export async function deleteMbkmStudent(id: string) {
  const { error } = await supabase.from('student_mbkm').delete().eq('id', id);
  if (error) throw new Error("Gagal menghapus data MBKM.");
  revalidatePath('/mbkm');
}