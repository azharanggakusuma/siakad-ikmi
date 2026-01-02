import React from "react";
import { redirect } from "next/navigation";
import ClientLayout from "./ClientLayout"; 
import { getSession } from "@/app/actions/auth";
import { getActiveAcademicYear } from "@/app/actions/students";
import { getMenus } from "@/app/actions/menus"; 

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  // Ambil data Tahun Akademik yang aktif
  const academicYear = await getActiveAcademicYear();

  // Ambil semua menu dari database
  const allMenus = await getMenus();

  if (!user) {
    redirect("/login");
  }

  // Filter menu berdasarkan role user dan status aktif
  const userMenus = allMenus.filter((menu) => {
    // Cek apakah menu aktif
    if (!menu.is_active) return false;
    
    // Tambahkan fallback '|| ""' untuk memastikan nilainya string
    return menu.allowed_roles.includes(user.role || "");
  });

  return (
    <ClientLayout user={user} academicYear={academicYear} menus={userMenus}>
      {children}
    </ClientLayout>
  );
}