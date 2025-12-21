"use client"; // WAJIB: Menandakan ini adalah Client Component

import React, { useState } from "react";
import { students } from "../lib/data"; // Import data students
import Header from "../components/Header";
import StudentInfo from "../components/StudentInfo";
import GradeTable from "../components/GradeTable";
import Footer from "../components/Footer";

export default function TranskripPage() {
  // State untuk menyimpan index mahasiswa yang dipilih (Default: 0 / Azharangga)
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ambil data mahasiswa berdasarkan index yang dipilih
  const currentStudent = students[selectedIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-['Cambria'] text-black flex flex-col items-center print:p-0 print:bg-white print:block">
      
      {/* --- UI SWITCHER (GAK AKAN KECETAK) --- */}
      {/* Class 'print:hidden' menyembunyikan elemen ini saat di-print */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-300 w-[210mm] flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <label htmlFor="student-select" className="font-bold font-sans text-sm">
            Pilih Mahasiswa:
          </label>
          <select
            id="student-select"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 font-sans text-sm"
          >
            {students.map((student, index) => (
              <option key={student.id} value={index}>
                {student.profile.nama} - {student.profile.nim}
              </option>
            ))}
          </select>
        </div>
        
        <p className="text-xs text-gray-500 font-sans italic">
          *Menu ini tidak akan muncul saat dicetak.
        </p>
      </div>

      {/* --- KERTAS A4 --- */}
      <div className="w-[210mm] min-h-[297mm] bg-white p-8 shadow-lg relative print:shadow-none print:w-full print:m-0 mx-auto">
        <Header />
        
        {/* Data Profil Dinamis */}
        <StudentInfo profile={currentStudent.profile} />
        
        {/* Data Nilai Dinamis */}
        <GradeTable data={currentStudent.transcript} />
        
        <Footer />
      </div>

    </div>
  );
}