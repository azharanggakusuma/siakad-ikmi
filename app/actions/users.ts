"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserData, UserPayload, StudentOption, LecturerOption } from "@/lib/types";

const supabaseAdmin = createAdminClient();

// --- HELPER ERROR HANDLING ---
const handleDbError = (error: any, context: string) => {
  console.error(`[DB_ERROR] ${context}:`, error);

  if (error.code === '23505') {
    if (error.message?.includes('username')) {
      throw new Error("Username tersebut sudah digunakan. Silakan pilih username lain.");
    }
    throw new Error("Data duplikat terdeteksi dalam sistem.");
  }

  if (error.code === '23503') {
    throw new Error("User tidak dapat dihapus karena data ini terhubung dengan data lain.");
  }

  throw new Error("Gagal memproses data. Terjadi kendala di server.");
};

// === GET USERS ===
export async function getUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, username, role, student_id, lecturer_id, is_active, avatar_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }
  return data as UserData[];
}

// === HELPER: GET STUDENTS FOR SELECTION ===
export async function getStudentsForSelection(excludeUserId?: string) {
  const { data: students, error } = await supabaseAdmin
    .from("students")
    .select("id, nim, nama")
    .order("nim", { ascending: true });

  if (error || !students) return [];

  let query = supabaseAdmin.from("users").select("student_id").not("student_id", "is", null);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data: usedUsers } = await query;
  const usedStudentIds = new Set(usedUsers?.map((u) => u.student_id));

  return students.map((s) => ({
    id: s.id,
    nim: s.nim,
    nama: s.nama,
    is_taken: usedStudentIds.has(s.id),
  })) as StudentOption[];
}

// === HELPER: GET LECTURERS FOR SELECTION ===
export async function getLecturersForSelection(excludeUserId?: string) {
  const { data: lecturers, error } = await supabaseAdmin
    .from("lecturers")
    .select("id, nidn, nama")
    .order("nama", { ascending: true });

  if (error || !lecturers) return [];

  let query = supabaseAdmin.from("users").select("lecturer_id").not("lecturer_id", "is", null);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data: usedUsers } = await query;
  const usedLecturerIds = new Set(usedUsers?.map((u) => u.lecturer_id));

  return lecturers.map((l) => ({
    id: l.id,
    nidn: l.nidn || "-",
    nama: l.nama,
    is_taken: usedLecturerIds.has(l.id),
  })) as LecturerOption[];
}

// === CREATE USER ===
export async function createUser(values: UserPayload) {
  const { name, username, password, role, student_id, lecturer_id, is_active } = values;

  if (!password) throw new Error("Password wajib diisi untuk user baru.");

  const targetStudentId = (role === "mahasiswa" && student_id) ? student_id : null;
  const targetLecturerId = (role === "dosen" && lecturer_id) ? lecturer_id : null;

  if (targetStudentId) {
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("student_id", targetStudentId)
      .single();

    if (existingUser) {
      throw new Error("Mahasiswa ini sudah memiliki akun. Satu mahasiswa hanya boleh punya satu akun.");
    }
  }

  if (targetLecturerId) {
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("lecturer_id", targetLecturerId)
      .single();

    if (existingUser) {
      throw new Error("Dosen ini sudah memiliki akun. Satu dosen hanya boleh punya satu akun.");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const payload: Partial<UserPayload> = {
    name,
    username,
    password: hashedPassword,
    role: role || "mahasiswa",
    student_id: targetStudentId,
    lecturer_id: targetLecturerId,
    is_active: is_active ?? true
  };

  const { error } = await supabaseAdmin.from("users").insert([payload]);

  if (error) handleDbError(error, "createUser");

  revalidatePath("/users");
}

// === UPDATE USER ===
export async function updateUser(id: string, values: UserPayload) {
  const { name, username, password, role, student_id, lecturer_id, is_active } = values;

  const targetStudentId = (role === "mahasiswa" && student_id) ? student_id : null;
  const targetLecturerId = (role === "dosen" && lecturer_id) ? lecturer_id : null;

  if (targetStudentId) {
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("student_id", targetStudentId)
      .neq("id", id)
      .single();

    if (existingUser) {
      throw new Error("Mahasiswa ini sudah memiliki akun lain. Silakan pilih mahasiswa yang belum terdaftar.");
    }
  }

  if (targetLecturerId) {
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("lecturer_id", targetLecturerId)
      .neq("id", id)
      .single();

    if (existingUser) {
      throw new Error("Dosen ini sudah memiliki akun lain. Silakan pilih dosen yang belum terdaftar.");
    }
  }

  const updates: Partial<UserPayload> = {
    name,
    username,
    role,
    student_id: targetStudentId,
    lecturer_id: targetLecturerId,
    is_active: is_active
  };

  if (password && password.trim() !== "") {
    updates.password = await bcrypt.hash(password, 10);
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", id);

  if (error) handleDbError(error, "updateUser");

  revalidatePath("/users");
}

// === DELETE USER ===
export async function deleteUser(id: string) {
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) handleDbError(error, "deleteUser");
  revalidatePath("/users");
}