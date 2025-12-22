"use client";

import React, { useState } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import GradeTable from "@/components/GradeTable";
import Footer from "@/components/Footer";
import ControlPanel from "@/components/ControlPanel";
import { useSignature } from "@/hooks/useSignature";

export default function TranskripPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Menggunakan Custom Hook
  const { signatureType, setSignatureType, secureImage } = useSignature("none");

  const currentStudent = students[selectedIndex];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 min-h-screen p-4 lg:p-8">
      {/* AREA KERTAS TRANSKRIP */}
      <div className="flex-1 flex justify-center w-full lg:w-auto overflow-x-auto lg:overflow-visible">
        <div className="bg-white p-12 shadow-2xl border border-gray-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[210mm] min-h-[297mm] origin-top scale-[0.9] lg:scale-100 transition-transform duration-300">
          
          <Header title="TRANSKRIP NILAI" />
          
          <StudentInfo profile={currentStudent.profile} />
          
          {/* Mode default GradeTable adalah "transkrip" */}
          <GradeTable data={currentStudent.transcript} mode="transkrip" />

          {/* Mode transkrip menampilkan keterangan SMT */}
          <Footer 
            signatureType={signatureType} 
            signatureBase64={secureImage} 
            mode="transkrip"
          />
        </div>
      </div>

      <div className="w-full lg:w-80 shrink-0 print:hidden lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24">
        <ControlPanel
          students={students}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          signatureType={signatureType}
          onSignatureChange={setSignatureType}
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
}