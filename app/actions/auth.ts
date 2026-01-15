"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { createClient } from "@/lib/supabase/server"; 
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; 

export type UserSession = {
  username: string;
  name?: string; 
  role: string;
  student_id?: string | null; 
  error?: string;
  avatar_url?: string | null;
};

// --- Fungsi Verifikasi Turnstile ---
async function verifyTurnstile(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn("Peringatan: TURNSTILE_SECRET_KEY tidak ditemukan.");
    return false; 
  }

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  try {
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (e) {
    console.error("Turnstile verification error:", e);
    return false;
  }
}

export async function authenticate(formData: FormData) {
  try {
    // --- Logika Verifikasi Captcha ---
    const token = formData.get("cf-turnstile-response") as string;
    
    if (!token) {
      return { success: false, error: "CaptchaRequired" };
    }

    const isHuman = await verifyTurnstile(token);
    if (!isHuman) {
      return { success: false, error: "CaptchaFailed" };
    }
    // ----------------------------------------

    const data = Object.fromEntries(formData);
    
    // Hapus field token agar tidak mengganggu proses login credential
    delete data["cf-turnstile-response"];

    const username = data.username as string;
    let name = "Pengguna";

    // Inisialisasi Supabase Client per-request
    const supabase = await createClient();

    // Cek nama user untuk feedback UI
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
      const cause = error.cause as any;
      if (cause?.err?.message === "InactiveAccount" || error.message.includes("InactiveAccount")) {
        return { success: false, error: "InactiveAccount" };
      }

      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "CredentialsSignin" };
        case "CallbackRouteError":
           if (cause?.err?.message === "InactiveAccount") {
              return { success: false, error: "InactiveAccount" };
           }
           return { success: false, error: "CallbackError" };
        default:
          return { success: false, error: "SystemError" };
      }
    }
    
    if ((error as Error).message.includes("InactiveAccount")) {
        return { success: false, error: "InactiveAccount" };
    }

    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

// === INI FUNGSI YANG HILANG SEBELUMNYA ===
export async function getSession(): Promise<UserSession | null> {
  const session = await auth();
  if (!session?.user) return null;
  
  // Inisialisasi Supabase Client
  const supabase = await createClient();

  // Fetch ulang data user untuk mendapatkan avatar terbaru
  const { data: userData } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("username", session.user.username)
    .single();

  return {
    username: session.user.username || "",
    name: session.user.name || "",
    role: session.user.role || "mahasiswa",
    student_id: session.user.student_id || null,
    avatar_url: userData?.avatar_url || null, 
    error: session.user.error, 
  };
}

export async function getUserSettings(username: string) {
  // Inisialisasi Supabase Client
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) return null;
  let alamat = "";

  if (user.role === "mahasiswa") {
    // Menggunakan instance supabase yang sama
    const { data: student } = await supabase
      .from("students")
      .select("alamat")
      .eq("nim", username)
      .single();
    if (student) alamat = student.alamat;
  }

  return { ...user, alamat };
}

export async function updateUserSettings(
  currentUsername: string, 
  payload: any,
  oldPasswordForVerification?: string 
) {
  // Inisialisasi Supabase Client
  const supabase = await createClient();

  const { nama, password, alamat, role, username: newUsername, avatar_url } = payload;

  const updates: any = {};
  if (nama) updates.name = nama;
  
  if (avatar_url !== undefined) {
    updates.avatar_url = avatar_url;
  }

  if (password) {
    if (!oldPasswordForVerification) {
      throw new Error("Password lama diperlukan untuk verifikasi.");
    }

    const { data: userRecord, error: fetchError } = await supabase
      .from("users")
      .select("password")
      .eq("username", currentUsername)
      .single();

    if (fetchError || !userRecord) {
      throw new Error("Gagal memverifikasi user.");
    }

    const isMatch = await bcrypt.compare(oldPasswordForVerification, userRecord.password);

    if (!isMatch) {
      throw new Error("Kata sandi saat ini salah."); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    updates.password = hashedPassword;
  } 
  
  if (newUsername) updates.username = newUsername;

  const { error: userError } = await supabase
    .from("users")
    .update(updates)
    .eq("username", currentUsername);

  if (userError) throw new Error(userError.message);

  if (role === "mahasiswa") {
    const studentUpdates: any = {};
    if (alamat !== undefined) studentUpdates.alamat = alamat;
    if (nama) studentUpdates.nama = nama;
    if (newUsername) studentUpdates.nim = newUsername; 

    const { error: studentError } = await supabase
      .from("students")
      .update(studentUpdates)
      .eq("nim", currentUsername); 

    if (studentError) console.error("Gagal update tabel student:", studentError.message);
  }

  revalidatePath("/pengaturan");
  revalidatePath("/", "layout"); 
  return { success: true };
}