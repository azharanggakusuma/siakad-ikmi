import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { getMaintenanceStatus, canBypassMaintenance } from "@/lib/maintenance";

const { auth } = NextAuth(authConfig);

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const userRole = req.auth?.user?.role;

  // Daftar path yang dikecualikan dari pengecekan maintenance
  const excludedPaths = ["/login", "/api", "/_next", "/img", "/public"];
  const isExcluded = excludedPaths.some((path) => pathname.startsWith(path));

  // Cek status maintenance sekali untuk dipakai di beberapa kondisi
  const isMaintenanceActive = !isExcluded ? await getMaintenanceStatus() : false;

  // Proteksi halaman /maintenance: redirect ke root jika maintenance tidak aktif
  if (pathname === "/maintenance" && !isMaintenanceActive) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Jika bukan path yang dikecualikan dan bukan /maintenance, cek maintenance mode
  if (!isExcluded && pathname !== "/maintenance") {
    // Admin bisa bypass maintenance
    if (!canBypassMaintenance(userRole) && isMaintenanceActive) {
      // Rewrite URL agar tetap sama tapi konten maintenance yang ditampilkan
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
});

export const config = {
  // Matcher untuk mengecualikan file statis dan API internal
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
