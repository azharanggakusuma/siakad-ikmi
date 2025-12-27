"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import users from "@/lib/users.json";

export type UserSession = {
  username: string;
  name?: string; 
  role?: string;
};

export async function authenticate(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const username = data.username as string;

    // Cari nama user untuk pesan sapaan
    const userFound = users.find((u) => u.username === username);
    const name = userFound?.name || "Pengguna";

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
  
  // Mapping session NextAuth kembali ke struktur UserSession aplikasi Anda
  return {
    // HAPUS @ts-expect-error DI SINI
    username: session.user.username || "",
    name: session.user.name || "",
    // HAPUS @ts-expect-error DI SINI
    role: session.user.role || "mahasiswa",
  };
}