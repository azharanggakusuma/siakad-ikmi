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
        nextUrl.pathname.endsWith(".svg");

      if (isPublicAsset) return true;

      if (isOnLogin) {
        // Jika sudah login tapi buka /login, redirect ke dashboard
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Default: Harus login untuk akses halaman lain
      return isLoggedIn;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        // Mapping data dari token ke session client-side
        // @ts-expect-error property custom
        session.user.role = token.role;
        // @ts-expect-error property custom
        session.user.username = token.username;
        // @ts-expect-error property custom
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Simpan data user ke token saat login awal
        // @ts-expect-error property custom
        token.role = user.role;
        // @ts-expect-error property custom
        token.username = user.username;
        token.sub = user.id;
      }
      return token;
    },
  },
  providers: [], // Diisi di auth.ts
} satisfies NextAuthConfig;