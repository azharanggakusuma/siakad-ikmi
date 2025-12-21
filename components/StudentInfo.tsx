import React from "react";
import { StudentProfile } from "../lib/data";

interface StudentInfoProps {
  profile: StudentProfile;
}

export default function StudentInfo({ profile }: StudentInfoProps) {
  return (
    <div className="mb-4 text-[11px] font-bold grid grid-cols-[120px_10px_1fr] gap-y-1 font-['Cambria']">
      <div className="font-bold">Nama Mahasiswa</div>
      <div className="font-bold">:</div>
      {/* Menggunakan data dari Props */}
      <div className="font-bold uppercase">{profile.nama}</div>

      <div className="font-bold">NIM</div>
      <div className="font-bold">:</div>
      <div className="font-normal">{profile.nim}</div>

      <div className="font-bold">Program Studi</div>
      <div className="font-bold">:</div>
      <div className="font-normal">{profile.prodi}</div>

      <div className="font-bold">Semester</div>
      <div className="font-bold">:</div>
      <div className="font-normal">{profile.semester}</div>
    </div>
  );
}