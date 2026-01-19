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
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnMaintenance = nextUrl.pathname.startsWith("/maintenance");
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

      // --- MAINTENANCE MODE CHECK ---
      try {
        const { data: maintenanceSetting } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "maintenance_mode")
          .single();

        const isMaintenanceMode = maintenanceSetting?.value === true;

        // Jika Maintenance Mode Aktif
        if (isMaintenanceMode) {
          // 1. Cek apakah user adalah Admin
          if (userRole === 'admin') {
            // Admin BEBAS AKSES (Bypass maintenance sepenuhnya)
            // Lanjut ke logic berikutnya (misal logic login/RBAC)
          } else {
            // 2. User Biasa / Belum Login
            // - Perbolehkan akses ke halaman Maintenance
            if (isOnMaintenance) return true;
            // - Perbolehkan akses ke halaman Login (agar bisa login as admin/user)
            if (isOnLogin) return true;

            // - Selebihnya redirect ke halaman Maintenance
            return Response.redirect(new URL("/maintenance", nextUrl));
          }
        } else {
          // Jika Maintenance Mode Non-Aktif
          // Cegah user biasa mengakses halaman maintenance (redirect ke home)
          // Admin tetap boleh akses jika mau (misal untuk preview)
          if (isOnMaintenance && userRole !== 'admin') {
            return Response.redirect(new URL("/", nextUrl));
          }
        }

      } catch (err) {
        console.error("Maintenance Check Error:", err);
      }
      // --- END MAINTENANCE MODE CHECK ---

      // Logika Login Page
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Jika tidak login, jangan izinkan akses ke halaman lain (selain public/login/maintenance)
      if (!isLoggedIn) {
        return false;
      }

      // --- RBAC LOGIC MULAI ---
      try {
        // Ambil semua menu yang aktif
        const { data: menus, error } = await supabase
          .from("menus")
          .select("href, allowed_roles")
          .eq("is_active", true);

        if (!error && menus) {
          // Cari menu yang paling spesifik cocok dengan URL saat ini (Longest Prefix Match)
          // Contoh: URL "/mahasiswa/krs" harus match menu "/mahasiswa/krs" (jika ada), 
          // bukan hanya "/mahasiswa"

          // Urutkan berdasarkan panjang href (descending) agar match yang paling spesifik ketemu duluan
          // Filter hanya menu yang href-nya merupakan prefix dari currentPath
          // NOTE: Kita handle root "/" secara khusus agar tidak meng-capture semua path
          const matchedMenu = menus
            .filter(m => {
              if (m.href === "/") return currentPath === "/"; // Exact match untuk root
              return currentPath.startsWith(m.href);
            })
            .sort((a, b) => b.href.length - a.href.length)[0];

          if (matchedMenu) {
            // Cek apakah role user ada di allowed_roles
            // Asumsi allowed_roles adalah array string
            const hasAccess = matchedMenu.allowed_roles.includes(userRole);

            if (!hasAccess) {
              // Redirect ke halaman unauthorized atau home jika tidak berhak
              // Bisa juga return false untuk trigger signout/login, tapi redirect lebih mulus
              // Untuk sekarang kita return false (Access Denied) -> NextAuth akan redirect ke Login
              // Atau kita bisa redirect ke "/"
              return Response.redirect(new URL("/", nextUrl));
            }
          }
        }
      } catch (err) {
        console.error("RBAC Check Error:", err);
        // Fallback: Jika error database, izinkan saja (fail open) atau block (fail closed)?
        // Fail closed lebih aman, tapi bisa mengunci user jika DB down.
        // Disini kita biarkan lanjut dulu (fail open) untuk menghindari lockout masal saat error sementara,
        // TAPI karena di bawah ada "return true" jika loggedIn, maka logic defaultnya memang "allow unless restricted".
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