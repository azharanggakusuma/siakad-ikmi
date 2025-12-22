"use client";

import React, { useState } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import GradeTable from "@/components/GradeTable";
import Footer from "@/components/Footer";

export default function TranskripPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentStudent = students[selectedIndex];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* TOOLBAR CONTROLS (Hanya tampil di Layar) */}
      <div className="w-full max-w-[210mm] bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1B3F95] shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mahasiswa</label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="bg-transparent font-bold text-gray-700 text-sm outline-none cursor-pointer p-0 w-full"
            >
              {students.map((student, index) => (
                <option key={student.id} value={index}>
                  {student.profile.nama} - {student.profile.nim}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B3F95] hover:bg-blue-900 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm active:translate-y-[1px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak PDF
        </button>
      </div>

      {/* KERTAS TRANSKRIP (Ukuran A4) */}
      <div className="bg-white p-12 shadow-lg border border-gray-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[210mm] min-h-[297mm] origin-top scale-[0.9] lg:scale-100">
        <Header />
        <StudentInfo profile={currentStudent.profile} />
        <GradeTable data={currentStudent.transcript} />
        <Footer />
      </div>
    </div>
  );
}