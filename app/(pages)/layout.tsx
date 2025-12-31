import React from "react";
import { redirect } from "next/navigation";
import ClientLayout from "./ClientLayout"; 
import { getSession } from "@/app/actions/auth";
// 1. Import fungsi untuk mengambil tahun akademik aktif
import { getActiveAcademicYear } from "@/app/actions/students";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  // 2. Ambil data Tahun Akademik yang aktif (is_active = true)
  const academicYear = await getActiveAcademicYear();

  if (!user) {
    redirect("/login");
  }

  return (
    // 3. Kirim data academicYear ke ClientLayout
    <ClientLayout user={user} academicYear={academicYear}>
      {children}
    </ClientLayout>
  );
}