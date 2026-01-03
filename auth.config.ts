import type { NextAuthConfig } from "next-auth";

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
    // Callback JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.name = user.name;
        token.student_id = user.student_id; // [BARU] Simpan ke Token
      }
      return token;
    },
    // Callback Session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.student_id = token.student_id as string | null; // [BARU] Simpan ke Session
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;