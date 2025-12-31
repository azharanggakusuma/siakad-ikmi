// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js"; 
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials;

        // 1. Inisialisasi Supabase Client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Ambil data user
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (error || !user) {
          return null;
        }

        // [LOGIKA BARU] 3. Cek Status Aktif
        // Jika status false, LEMPAR ERROR agar bisa ditangkap sebagai pesan khusus
        if (user.is_active === false) {
           throw new Error("InactiveAccount");
        }

        // 4. Cek Password
        const passwordsMatch = await bcrypt.compare(
          password as string, 
          user.password
        );

        if (passwordsMatch) {
          return {
            id: String(user.id),
            name: user.name,
            username: user.username,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
});