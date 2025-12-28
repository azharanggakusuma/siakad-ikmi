"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // Menggunakan bcryptjs

export type UserSession = {
  username: string;
  name?: string; 
  role?: string;
};

export async function authenticate(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const username = data.username as string;
    let name = "Pengguna";

    // Cek nama user untuk feedback UI (opsional)
    const { data: userFound } = await supabase
      .from("users")
      .select("name")
      .eq("username", username)
      .single();

    if (userFound?.name) {
      name = userFound.name;
    }

    await signIn("credentials", { ...data, redirect: false });
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

export async function getUserSettings(username: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) return null;
  let alamat = "";

  if (user.role === "mahasiswa") {
    const { data: student } = await supabase
      .from("students")
      .select("alamat")
      .eq("nim", username)
      .single();
    if (student) alamat = student.alamat;
  }

  return { ...user, alamat };
}

// === FUNGSI UPDATE USER ===
export async function updateUserSettings(
  currentUsername: string, 
  payload: any,
  oldPasswordForVerification?: string // Parameter baru untuk verifikasi
) {
  const { nama, password, alamat, role, username: newUsername } = payload;

  const updates: any = {};
  if (nama) updates.name = nama;
  
  // LOGIKA HASHING: Verifikasi password lama sebelum update password baru
  if (password) {
    // 1. Pastikan password lama dikirim
    if (!oldPasswordForVerification) {
      throw new Error("Password lama diperlukan untuk verifikasi.");
    }

    // 2. Ambil hash password saat ini dari database
    const { data: userRecord, error: fetchError } = await supabase
      .from("users")
      .select("password")
      .eq("username", currentUsername)
      .single();

    if (fetchError || !userRecord) {
      throw new Error("Gagal memverifikasi user.");
    }

    // 3. Bandingkan Password Lama Inputan vs Database Hash
    const isMatch = await bcrypt.compare(oldPasswordForVerification, userRecord.password);

    if (!isMatch) {
      throw new Error("Kata sandi saat ini salah."); 
    }

    // 4. Jika cocok, hash password baru dan masukkan ke updates
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.password = hashedPassword;
  } 
  
  if (newUsername) updates.username = newUsername; // Update Username

  // 1. Update tabel USERS
  const { error: userError } = await supabase
    .from("users")
    .update(updates)
    .eq("username", currentUsername); // Cari pakai username LAMA

  if (userError) throw new Error(userError.message);

  // 2. Update tabel STUDENTS (Jika Mahasiswa)
  if (role === "mahasiswa") {
    const studentUpdates: any = {};
    if (alamat !== undefined) studentUpdates.alamat = alamat;
    if (nama) studentUpdates.nama = nama;
    if (newUsername) studentUpdates.nim = newUsername; // Sinkronkan NIM

    const { error: studentError } = await supabase
      .from("students")
      .update(studentUpdates)
      .eq("nim", currentUsername); // Cari pakai NIM LAMA

    if (studentError) console.error("Gagal update tabel student:", studentError.message);
  }

  revalidatePath("/pengaturan");
  return { success: true };
}