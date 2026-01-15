import type { NextAuthConfig } from "next-auth";
import { createAdminClient } from "@/lib/supabase/admin"; // [UBAH] Gunakan admin client

// Waktu interval pengecekan ke database
const MAX_AGE = 15 * 60 * 1000; 

// Fungsi Helper: Cek status user ke Database Supabase
async function refreshAccessToken(token: any) {
  try {
    // [UBAH] Inisialisasi Admin Client
    const supabase = createAdminClient();

    // Cek apakah user masih aktif di DB
    const { data: user, error } = await supabase
      .from("users")
      .select("id, role, username, name, student_id, is_active")
      .eq("id", token.id)
      .single();

    // Jika user diblokir/tidak aktif/dihapus
    if (error || !user || user.is_active === false) {
      throw new Error("InactiveAccount");
    }

    // Jika aman, perbarui data token & perpanjang waktu cek
    return {
      ...token,
      role: user.role,
      name: user.name,
      username: user.username,
      student_id: user.student_id,
      expiresAt: Date.now() + MAX_AGE, // Reset timer 15 menit lagi
      error: null,
    };
  } catch (error) {
    // Jika gagal, tandai token ini error
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      
      const isPublicAsset = 
        nextUrl.pathname.startsWith("/img") || 
        nextUrl.pathname.startsWith("/public") ||
        nextUrl.pathname.endsWith(".png") ||
        nextUrl.pathname.endsWith(".jpg") ||
        nextUrl.pathname.endsWith(".svg") ||
        nextUrl.pathname.endsWith(".ico");

      if (isPublicAsset) return true;

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (isLoggedIn) {
        return true;
      }

      return false; 
    },
    async jwt({ token, user }) {
      // 1. Saat Login Pertama Kali
      if (user) {
        return {
          id: user.id,
          role: user.role,
          username: user.username,
          name: user.name,
          student_id: user.student_id,
          expiresAt: Date.now() + MAX_AGE, // Set waktu cek awal
        };
      }

      // 2. Jika Token Belum Waktunya Cek (Masih dalam 15 menit), kembalikan langsung
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // 3. Jika Sudah Waktunya, Cek ke Supabase (Refresh Logic)
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.student_id = token.student_id as string | null;
        
        if (token.error) {
          session.user.error = token.error as string;
        }
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;