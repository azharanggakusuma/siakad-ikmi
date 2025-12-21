"use client";

import React, { useState } from "react";
import { students } from "../lib/data";
import Header from "../components/Header";
import StudentInfo from "../components/StudentInfo";
import GradeTable from "../components/GradeTable";
import Footer from "../components/Footer";

export default function TranskripPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentStudent = students[selectedIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-['Cambria'] text-black flex flex-col items-center print:p-0 print:bg-white print:block">
      
      {/* --- UI SWITCHER (RESPONSIF) --- */}
      {/* Hidden saat print. Pada mobile jadi flex-col (atas-bawah), desktop flex-row (sebelahan) */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-300 w-full max-w-[210mm] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full">
          <label htmlFor="student-select" className="font-bold font-sans text-sm whitespace-nowrap">
            Pilih Mahasiswa:
          </label>
          <select
            id="student-select"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 font-sans text-sm w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {students.map((student, index) => (
              <option key={student.id} value={index}>
                {student.profile.nama} - {student.profile.nim}
              </option>
            ))}
          </select>
        </div>
        
        <p className="text-xs text-gray-500 font-sans italic text-right w-full md:w-auto">
          *Menu ini tidak akan tercetak.
        </p>
      </div>

      {/* --- WRAPPER DOKUMEN SCROLLABLE --- */}
      {/* overflow-x-auto: Agar di HP bisa digeser kiri-kanan tanpa merusak layout A4.
          w-full: Mengambil lebar penuh layar HP.
          flex justify-center: Agar di layar besar (Desktop) kertas tetap di tengah.
      */}
      <div className="w-full overflow-x-auto pb-8 print:pb-0 print:overflow-visible flex justify-start md:justify-center">
        
        {/* --- KERTAS A4 --- */}
        {/* min-w-[210mm]: Memaksa lebar tetap A4 (21cm) agar layout tabel tidak hancur di HP.
            print:w-full: Saat print, reset lebar agar pas kertas printer.
        */}
        <div className="min-w-[210mm] w-[210mm] min-h-[297mm] bg-white p-8 shadow-lg relative print:shadow-none print:w-full print:m-0 mx-auto">
          <Header />
          <StudentInfo profile={currentStudent.profile} />
          <GradeTable data={currentStudent.transcript} />
          <Footer />
        </div>

      </div>
    </div>
  );
}