"use client";

import React, { useState } from "react";
import { students } from "../lib/data";

// UI Components
import Sidebar from "../components/Sidebar"; // Gunakan komponen Sidebar baru
import Navbar from "../components/Navbar";
import AppFooter from "../components/AppFooter";

// Document Components
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
    // Container Utama: Flex Row (Kiri Sidebar, Kanan Konten)
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      
      {/* 1. SIDEBAR (Kiri) - Hanya tampil di layar besar (lg) */}
      <div className="hidden lg:block print:hidden">
        <Sidebar 
          students={students}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onPrint={handlePrint}
        />
      </div>

      {/* 2. MAIN CONTENT (Kanan) */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible">
        
        {/* Navbar (Header Dashboard) */}
        <div className="sticky top-0 z-10 print:hidden">
           <Navbar />
        </div>

        {/* Area Kerja Utama (Preview Transkrip) */}
        <main className="flex-1 p-8 flex justify-center items-start print:p-0">
          
          {/* Wrapper Kertas */}
          <div className="bg-white p-12 shadow-md border border-gray-200 print:shadow-none print:border-none print:p-0 w-[210mm] min-h-[297mm] transition-transform origin-top scale-[0.9] lg:scale-100">
             {/* Isi Dokumen */}
            <Header />
            <StudentInfo profile={currentStudent.profile} />
            <GradeTable data={currentStudent.transcript} />
            <Footer />
          </div>

        </main>

        {/* Footer Aplikasi */}
        <div className="print:hidden">
          <AppFooter />
        </div>

      </div>

      {/* Kontrol Mobile (Jika dibuka di HP, Sidebar hilang, muncul kontrol ini) */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50 print:hidden">
        <button 
           onClick={handlePrint}
           className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        </button>
      </div>

    </div>
  );
}