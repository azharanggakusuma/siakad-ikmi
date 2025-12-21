import React from "react";

export default function StudentInfo() {
  return (
    <div className="mb-4 text-[11px] font-bold grid grid-cols-[120px_10px_1fr] gap-y-1 ml-1">
      <div className="font-bold">Nama Mahasiswa</div>
      <div className="font-bold">:</div>
      <div className="font-bold uppercase">AZHARANGGA KUSUMA</div>

      <div className="font-bold">NIM</div>
      <div className="font-bold">:</div>
      <div className="font-normal">41226142</div>

      <div className="font-bold">Program Studi</div>
      <div className="font-bold">:</div>
      <div className="font-normal">Teknik Informatika (S1)</div>

      <div className="font-bold">Semester</div>
      <div className="font-bold">:</div>
      <div className="font-normal">7</div>
    </div>
  );
}