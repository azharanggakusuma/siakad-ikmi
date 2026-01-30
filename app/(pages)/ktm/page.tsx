import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById, getAllStudentsForKtm } from "@/app/actions/students";
import { redirect } from "next/navigation";
import KtmClient from "./KtmClient";

export default async function KtmPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
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

  // Admin / Superuser / Staff View - Tampilkan semua mahasiswa
  // Logic disamakan dengan halaman KRS: jika bukan mahasiswa, dianggap admin/pengelola
  const students = await getAllStudentsForKtm();
  return <KtmClient students={students} />;
}
