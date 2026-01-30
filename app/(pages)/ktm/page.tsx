import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById, getAllStudentsForKtm } from "@/app/actions/students";
import { redirect } from "next/navigation";
import KtmClient from "./KtmClient";
import KtmAdminClient from "./KtmAdminClient";

export default async function KtmPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Admin View - Tampilkan semua mahasiswa
  if (session.role === "admin") {
    const students = await getAllStudentsForKtm();
    return <KtmAdminClient students={students} />;
  }

  // Mahasiswa View - Tampilkan KTM pribadi
  if (session.role === "mahasiswa") {
    if (!session.student_id) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-500">Data mahasiswa tidak ditemukan untuk akun ini.</p>
        </div>
      );
    }

    const student = await getStudentById(session.student_id);
    return <KtmClient student={student} />;
  }

  // Role lain tidak memiliki akses
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-500">Halaman ini hanya dapat diakses oleh mahasiswa atau admin.</p>
    </div>
  );
}

