import type { NextAuthConfig } from "next-auth";
import { createAdminClient } from "@/lib/supabase/admin";

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
      expiresAt: Date.now() + MAX_AGE,
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
  session: {
    strategy: "jwt",
    maxAge: 1 * 60 * 60, // 1 Jam (3600 detik)
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const currentPath = nextUrl.pathname;
      const userRole = auth?.user?.role;

      const isPublicAsset =
        nextUrl.pathname.startsWith("/img") ||
        nextUrl.pathname.startsWith("/public") ||
        nextUrl.pathname.endsWith(".png") ||
        nextUrl.pathname.endsWith(".jpg") ||
        nextUrl.pathname.endsWith(".svg") ||
        nextUrl.pathname.endsWith(".ico");

      if (isPublicAsset) return true;

      const supabase = createAdminClient();

      // Logika Login Page
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Jika tidak login, jangan izinkan akses ke halaman lain
      if (!isLoggedIn) {
        return false;
      }

      // --- RBAC LOGIC MULAI ---
      try {
        const { data: menus, error } = await supabase
          .from("menus")
          .select("href, allowed_roles")
          .eq("is_active", true);

        if (!error && menus) {
          const matchedMenu = menus
            .filter(m => {
              if (m.href === "/") return currentPath === "/";
              return currentPath.startsWith(m.href);
            })
            .sort((a, b) => b.href.length - a.href.length)[0];

          if (matchedMenu) {
            const hasAccess = matchedMenu.allowed_roles.includes(userRole);
            if (!hasAccess) {
              return Response.redirect(new URL("/", nextUrl));
            }
          }
        }
      } catch (err) {
        console.error("RBAC Check Error:", err);
      }
      // --- RBAC LOGIC SELESAI ---

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
          expiresAt: Date.now() + MAX_AGE,
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