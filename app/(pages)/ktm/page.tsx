import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById } from "@/app/actions/students";
import { redirect } from "next/navigation";
import KtmClient from "./KtmClient";

export default async function KtmPage() {
  const session = await getSession();

  if (!session || !session.student_id) {
    // Jika bukan mahasiswa atau tidak memiliki student_id, redirect atau tampilkan error
    // Sebaiknya redirect ke dashboard jika akses ilegal, tapi karena ini menu, mungkin user admin mau cek?
    // Tapi sesuaikan dengan req "khusus mahasiswa"
    if (session?.role !== "mahasiswa") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-slate-500">Halaman ini khusus untuk mahasiswa.</p>
            </div>
        )
    }
    // Jika mahasiswa tapi tidak ada student_id (error data)
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-red-500">Data mahasiswa tidak ditemukan untuk akun ini.</p>
        </div>
    )
  }

  const student = await getStudentById(session.student_id);

  return <KtmClient student={student} />;
}
