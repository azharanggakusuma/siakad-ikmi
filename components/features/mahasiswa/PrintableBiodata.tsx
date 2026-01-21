import React from "react";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import { StudentData } from "@/lib/types";
import { User } from "lucide-react";

interface PrintableBiodataProps {
  student: StudentData | null;
}

export default function PrintableBiodata({ student }: PrintableBiodataProps) {
  if (!student) return null;

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div id="print-area" className="hidden print:block font-sans bg-white text-black p-8">
      {/* Container Utama Tanpa Border */}
      <div className="min-h-[90vh] relative flex flex-col">
        <div className="flex-1 p-2 flex flex-col">
            
            <DocumentHeader title="" />
            
            <div className="text-center mt-1 mb-6">
                <h1 className="font-bold text-xl uppercase tracking-wider font-['Cambria']">BIODATA MAHASISWA</h1>
            </div>

            <div className="flex gap-8 items-start">
                 {/* FOTO - 3x4 Proporsi */}
                <div className="w-[150px] h-[200px] border border-black bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {student.profile.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                            src={student.profile.avatar_url} 
                            alt={student.profile.nama} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                             <span className="text-[10px] uppercase font-semibold">PAS FOTO 3X4</span>
                        </div>
                    )}
                </div>

                {/* TABEL DATA */}
                <div className="flex-1">
                    <table className="w-full text-base font-['Cambria']">
                        <tbody className="align-top leading-[2]">
                            <tr>
                                <td className="w-[200px]">Nama Lengkap</td>
                                <td className="w-[20px] text-center">:</td>
                                <td className="font-bold">{student.profile.nama.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>Nomor Induk Mahasiswa (NIM)</td>
                                <td className="text-center">:</td>
                                <td className="font-mono tracking-wide">{student.profile.nim}</td>
                            </tr>
                            <tr>
                                <td>Program Studi</td>
                                <td className="text-center">:</td>
                                <td>{student.profile.study_program?.nama || "-"}</td>
                            </tr>
                            <tr>
                                <td>Jenjang Pendidikan</td>
                                <td className="text-center">:</td>
                                <td>{student.profile.study_program?.jenjang || "-"}</td>
                            </tr>
                            <tr>
                                <td>Semester / Angkatan</td>
                                <td className="text-center">:</td>
                                <td>{student.profile.semester} / {student.profile.angkatan}</td>
                            </tr>
                            <tr>
                                <td>Status Akademik</td>
                                <td className="text-center">:</td>
                                <td>{student.profile.is_active ? "AKTIF" : "TIDAK AKTIF"}</td>
                            </tr>
                            <tr>
                                <td>Alamat</td>
                                <td className="text-center">:</td>
                                <td className="leading-normal pt-2">{student.profile.alamat || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TANDA TANGAN */}
            <div className="flex justify-end mt-12 mb-6">
                <div className="text-center w-[250px] font-['Cambria']">
                    <p className="mb-1">Cirebon, {currentDate}</p>
                    <p className="mb-24">Mahasiswa Yang Bersangkutan,</p>
                    <p className="font-bold underline uppercase">{student.profile.nama}</p>
                    <p className="text-sm">NIM. {student.profile.nim}</p>
                </div>
            </div>



        </div>
      </div>
    </div>
  );
}
