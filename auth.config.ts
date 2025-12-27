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
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        // Langsung assign saja tanpa @ts-expect-error
        // Jika nanti muncul error merah (Property does not exist),
        // solusinya ada di langkah nomor 2 di bawah.
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.sub = user.id;
      }
      return token;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;