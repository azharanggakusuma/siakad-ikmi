"use server";

import users from "@/lib/users.json";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Tipe data User (sesuaikan dengan isi users.json Anda)
export type UserSession = {
  username: string;
  name?: string; 
  role?: string;
};

export async function authenticate(formData: FormData) {
  // Simulasi delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "Username dan Password wajib diisi." };
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // === 1. SET COOKIE SESSION ===
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return { success: true, user: userWithoutPassword };
  }

  return { success: false, error: "Username atau Password salah." };
}

// === 2. FUNGSI LOGOUT ===
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

// === 3. FUNGSI GET SESSION ===
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  
  try {
    return JSON.parse(session);
  } catch (error) {
    return null;
  }
}