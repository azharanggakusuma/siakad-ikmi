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
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const currentStudent = students[selectedIndex];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-8 min-h-screen">
      {/* AREA KERTAS TRANSKRIP */}
      {/* UPDATED: Margin negatif agresif untuk kompensasi scale */}
      {/* scale 0.4 menyisakan ruang kosong ~670px, jadi kita tarik mb-[-600px] */}
      <div className="flex-1 flex justify-center w-full lg:w-auto overflow-x-hidden lg:overflow-visible mb-[-600px] sm:mb-[-400px] md:mb-[-250px] lg:mb-0">
        <div className="bg-white p-8 sm:p-12 shadow-2xl border border-gray-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[210mm] min-h-[297mm] origin-top transform scale-[0.4] sm:scale-[0.6] md:scale-[0.75] lg:scale-100 transition-transform duration-300">
          
          <Header title="TRANSKRIP NILAI" />
          
          <StudentInfo profile={currentStudent.profile} />
          
          <GradeTable data={currentStudent.transcript} mode="transkrip" />

          <Footer 
            signatureType={signatureType} 
            signatureBase64={secureImage} 
            mode="transkrip"
          />
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-80 shrink-0 print:hidden lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 z-10 pb-10 lg:pb-0">
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