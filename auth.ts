import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import users from "@/lib/users.json";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials;

        // Logika pencarian user (sama seperti logika manual sebelumnya)
        const user = users.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          // Return objek user untuk sesi
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