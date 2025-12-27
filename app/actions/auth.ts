"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type UserSession = {
  username: string;
  name?: string; 
  role?: string;
};

// ... (authenticate, logout, getSession TETAP SAMA seperti sebelumnya) ...

export async function authenticate(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const username = data.username as string;

    let name = "Pengguna";

    const { data: userFound } = await supabase
      .from("users")
      .select("name")
      .eq("username", username)
      .single();

    if (userFound?.name) {
      name = userFound.name;
    }

    await signIn("credentials", { 
      ...data, 
      redirect: false 
    });
    
    return { success: true, name: name };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Username atau Password salah." };
        default:
          return { success: false, error: "Terjadi kesalahan sistem." };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function getSession(): Promise<UserSession | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    username: (session.user as any).username || "",
    name: session.user.name || "",
    role: (session.user as any).role || "mahasiswa",
  };
}

// === BARU: Ambil Data Lengkap User dari Tabel 'users' ===
export async function getUserSettings(username: string) {
  // 1. Ambil data akun (Nama, Password, Role) dari tabel 'users'
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) return null;

  let alamat = "";

  // 2. Jika mahasiswa, ambil 'alamat' dari tabel 'students'
  if (user.role === "mahasiswa") {
    const { data: student } = await supabase
      .from("students")
      .select("alamat")
      .eq("nim", username) // Asumsi username == NIM
      .single();
    
    if (student) {
      alamat = student.alamat;
    }
  }

  return {
    ...user,
    alamat, // Gabungkan alamat ke data user
  };
}

// === BARU: Update Data User ke Tabel 'users' ===
export async function updateUserSettings(username: string, payload: any) {
  const { nama, password, alamat, role } = payload;

  // 1. Update Tabel USERS (Nama & Password)
  const updates: any = {};
  if (nama) updates.name = nama;
  if (password) updates.password = password; // Simpan password baru

  const { error: userError } = await supabase
    .from("users")
    .update(updates)
    .eq("username", username);

  if (userError) throw new Error(userError.message);

  // 2. Update Tabel STUDENTS (Hanya Alamat & Nama agar sinkron)
  if (role === "mahasiswa") {
    const studentUpdates: any = {};
    if (alamat !== undefined) studentUpdates.alamat = alamat;
    if (nama) studentUpdates.nama = nama;

    const { error: studentError } = await supabase
      .from("students")
      .update(studentUpdates)
      .eq("nim", username);

    if (studentError) console.error("Gagal update tabel student:", studentError.message);
  }

  revalidatePath("/pengaturan");
  return { success: true };
}