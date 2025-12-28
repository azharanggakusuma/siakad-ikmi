import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Di Next.js 16, gunakan named export 'proxy' alih-alih default export
export const proxy = auth;

export const config = {
  // Matcher untuk mengecualikan file statis dan API internal
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};