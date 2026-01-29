import React from "react";
import { StudentProfile } from "@/lib/types";

interface StudentInfoProps {
  profile: StudentProfile;
  displaySemester?: number; 
  periode?: string; // [BARU] Props optional untuk Periode Akademik
}

export default function StudentInfo({ profile, displaySemester, periode }: StudentInfoProps) {
  // Ambil data dari relasi jika ada
  const prodiNama = profile.study_program?.nama || "-";
  const prodiJenjang = profile.study_program?.jenjang || "";

  return (
    <div className="mb-4 text-[11px] font-bold grid grid-cols-[120px_10px_1fr] gap-y-1 font-caladea">
      <div className="font-bold">Nama Mahasiswa</div><div className="font-bold">:</div><div className="font-bold uppercase">{profile.nama.toUpperCase()}</div>
      
      <div className="font-bold">NIM</div><div className="font-bold">:</div><div className="font-normal">{profile.nim}</div>
      
      <div className="font-bold">Program Studi</div><div className="font-bold">:</div>
      <div className="font-normal">
        {prodiNama} {prodiJenjang ? `(${prodiJenjang})` : ""}
      </div>
      
      <div className="font-bold">Semester</div><div className="font-bold">:</div><div className="font-normal">{displaySemester ?? profile.semester}</div>

      {periode && (
        <>
          <div className="font-bold">Periode Akademik</div>
          <div className="font-bold">:</div>
          <div className="font-normal">{periode}</div>
        </>
      )}
    </div>
  );
}