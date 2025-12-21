"use client";

import React, { useState } from "react";
import { students } from "../lib/data";

// Import Komponen UI Aplikasi
import Navbar from "../components/Navbar";
import ControlPanel from "../components/ControlPanel";
import AppFooter from "../components/AppFooter"; // <--- Import Baru

// Import Komponen Dokumen Surat
import Header from "../components/Header";
import StudentInfo from "../components/StudentInfo";
import GradeTable from "../components/GradeTable";
import Footer from "../components/Footer";

export default function TranskripPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentStudent = students[selectedIndex];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-200 font-sans text-gray-800 flex flex-col print:bg-white print:block">
      
      {/* 1. Navbar Aplikasi */}
      <Navbar />

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col items-center py-8 px-4 gap-6 print:p-0">
        
        {/* 2. Control Panel */}
        <ControlPanel 
          students={students}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onPrint={handlePrint}
        />

        {/* 3. Preview Kertas A4 */}
        <div className="w-full flex justify-center overflow-x-auto pb-4 px-4 md:px-0 print:pb-0 print:overflow-visible print:px-0 print:block">
          <div className="flex-shrink-0 w-[210mm] min-h-[297mm] bg-white p-8 shadow-2xl border border-gray-200 print:shadow-none print:border-none print:w-full print:m-0 font-['Cambria'] text-black relative">
            
            {/* Isi Dokumen Transkrip */}
            <Header />
            <StudentInfo profile={currentStudent.profile} />
            <GradeTable data={currentStudent.transcript} />
            <Footer />

          </div>
        </div>

      </main>

      {/* 4. Footer Aplikasi (Baru) */}
      <AppFooter />

    </div>
  );
}