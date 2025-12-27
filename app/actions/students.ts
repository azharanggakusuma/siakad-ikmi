'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// --- AMBIL DATA (READ) ---
export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error("Gagal ambil mahasiswa:", error);
    return [];
  }

  return data.map((s) => ({
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
    transcript: [] 
  }));
}

// --- TAMBAH DATA (CREATE) ---
export async function createStudent(values: any) {
  const { error } = await supabase
    .from('students')
    .insert([{
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

// --- UPDATE DATA ---
export async function updateStudent(id: string | number, values: any) {
  const { error } = await supabase
    .from('students')
    .update({
      nim: values.nim,
      nama: values.nama,
      prodi: values.prodi,
      jenjang: values.jenjang,
      semester: Number(values.semester),
      alamat: values.alamat
    })
    .eq('id', Number(id));

  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}

// --- HAPUS DATA (DELETE) ---
export async function deleteStudent(id: string | number) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', Number(id));

  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}