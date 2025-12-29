"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// --- KONFIGURASI SUPABASE ADMIN ---
// Service Role Key diperlukan untuk manajemen user (bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --- TYPES ---
export interface UserData {
  id: string;
  name: string;
  username: string;
  role: "admin" | "dosen" | "mahasiswa" | string;
  student_id?: number | null;
}

export interface UserPayload {
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
}

export interface StudentOption {
  id: number;
  nim: string;
  nama: string;
  is_taken: boolean;
}

// === GET USERS ===
export async function getUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, username, role, student_id")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }
  return data as UserData[];
}

// === HELPER: GET STUDENTS FOR SELECTION ===
export async function getStudentsForSelection(excludeUserId?: string) {
  // 1. Ambil data mahasiswa
  const { data: students, error } = await supabaseAdmin
    .from("students")
    .select("id, nim, nama")
    .order("nim", { ascending: true });

  if (error || !students) return [];

  // 2. Cek student_id yang sudah terpakai di tabel users
  let query = supabaseAdmin.from("users").select("student_id").not("student_id", "is", null);
  
  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data: usedUsers } = await query;
  const usedStudentIds = new Set(usedUsers?.map((u) => u.student_id));

  // 3. Map status 'is_taken'
  return students.map((s) => ({
    id: s.id,
    nim: s.nim,
    nama: s.nama,
    is_taken: usedStudentIds.has(s.id),
  })) as StudentOption[];
}

// === CREATE USER ===
export async function createUser(values: UserPayload) {
  const { name, username, password, role, student_id } = values;

  // Validasi password wajib ada saat create
  if (!password) throw new Error("Password wajib diisi untuk user baru.");

  const hashedPassword = await bcrypt.hash(password, 10);

  const payload: Partial<UserPayload> = {
    name,
    username,
    password: hashedPassword,
    role: role || "mahasiswa",
    student_id: (role === "mahasiswa" && student_id) ? Number(student_id) : null
  };

  const { error } = await supabaseAdmin.from("users").insert([payload]);

  if (error) {
    if (error.code === "23505") throw new Error("Username sudah digunakan.");
    throw new Error(error.message);
  }

  revalidatePath("/users");
}

// === UPDATE USER ===
export async function updateUser(id: string, values: UserPayload) {
  const { name, username, password, role, student_id } = values;

  const updates: Partial<UserPayload> = {
    name,
    username,
    role,
    // Jika role bukan mahasiswa, hapus relasi student_id
    student_id: (role === "mahasiswa" && student_id) ? Number(student_id) : null
  };

  // Hanya update password jika diisi
  if (password && password.trim() !== "") {
    updates.password = await bcrypt.hash(password, 10);
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/users");
}

// === DELETE USER ===
export async function deleteUser(id: string) {
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/users");
}