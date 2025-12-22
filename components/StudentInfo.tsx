import React from "react";
import { StudentProfile } from "../lib/data";

interface StudentInfoProps {
  profile: StudentProfile;
  displaySemester?: number; // Optional: untuk menimpa semester saat ini (dipakai di KHS)
}

export default function StudentInfo({ profile, displaySemester }: StudentInfoProps) {
  return (
    <div className="mb-4 text-[11px] font-bold grid grid-cols-[120px_10px_1fr] gap-y-1 font-['Cambria']">
      <div className="font-bold">Nama Mahasiswa</div>
      <div className="font-bold">:</div>
      <div className="font-bold uppercase">{profile.nama}</div>

      <div className="font-bold">NIM</div>
      <div className="font-bold">:</div>
      <div className="font-normal">{profile.nim}</div>

      <div className="font-bold">Program Studi</div>
      <div className="font-bold">:</div>
      <div className="font-normal">{profile.prodi}</div>

      <div className="font-bold">Semester</div>
      <div className="font-bold">:</div>
      {/* Jika displaySemester ada (dari KHS), pakai itu. Jika tidak, pakai profile.semester (Transkrip) */}
      <div className="font-normal">{displaySemester ?? profile.semester}</div>
    </div>
  );
}