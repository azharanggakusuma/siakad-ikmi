import React from "react";
import { redirect } from "next/navigation";
import ClientLayout from "./ClientLayout"; 
import { getSession } from "@/app/actions/auth";
import { getActiveAcademicYear } from "@/app/actions/students";
import { getMenus } from "@/app/actions/menus"; 
import { validateStudentKrs } from "@/app/actions/krs";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  // ... (existing checks) ...
  if (!user || user.error === "RefreshAccessTokenError") {
    redirect("/login");
  }

  // Ambil data Tahun Akademik yang aktif
  const academicYear = await getActiveAcademicYear();

  // Ambil semua menu dari database
  const allMenus = await getMenus();

  // Filter menu berdasarkan role user dan status aktif
  const userMenus = allMenus.filter((menu) => {
    if (!menu.is_active) return false;
    if (user.role === "superuser") return true;
    return menu.allowed_roles.includes(user.role || "");
  });

  // Logika Banner KRS untuk Mahasiswa
  let showKrsBanner = false;
  if (user.role === "mahasiswa" && user.student_id) {
    const krsCheck = await validateStudentKrs(user.student_id);
    // Jika allowed = false dan reason = "no_krs", berarti belum submit
    if (!krsCheck.allowed && krsCheck.reason === "no_krs") {
      showKrsBanner = true;
    }
  }

  return (
    <ClientLayout 
      user={user} 
      academicYear={academicYear} 
      menus={userMenus}
      showKrsBanner={showKrsBanner}
    >
      {children}
    </ClientLayout>
  );
}