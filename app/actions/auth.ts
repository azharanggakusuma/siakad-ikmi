"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import users from "@/lib/users.json"; // Import data user untuk ambil nama

export type UserSession = {
  username: string;
  name?: string; 
  role?: string;
};

export async function authenticate(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const username = data.username as string;

    // Cari nama user untuk pesan sapaan (hanya visual)
    const userFound = users.find((u) => u.username === username);
    const name = userFound?.name || "Pengguna";

    // Lakukan Login
    await signIn("credentials", { 
      ...data, 
      redirect: false 
    });
    
    // Kembalikan success: true BESERTA nama user
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
    // @ts-expect-error property custom
    username: session.user.username || "",
    name: session.user.name || "",
    // @ts-expect-error property custom
    role: session.user.role || "mahasiswa",
  };
}