"use client";

import React, { useState, useEffect } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import GradeTable from "@/components/GradeTable";
import Footer from "@/components/Footer";
import ControlPanel from "@/components/ControlPanel";
import { getSignatureBase64 } from "@/app/actions/getSignature";

export default function TranskripPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [signatureType, setSignatureType] = useState<"basah" | "digital" | "none">("none");
  const [secureImage, setSecureImage] = useState<string | null>(null);

  const currentStudent = students[selectedIndex];

  useEffect(() => {
    const fetchSignature = async () => {
      if (signatureType === "none") {
        setSecureImage(null);
        return;
      }
      const base64Data = await getSignatureBase64(signatureType);
      setSecureImage(base64Data);
    };
    fetchSignature();
  }, [signatureType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 min-h-screen p-4 lg:p-8">
      {/* AREA KERTAS TRANSKRIP (FULL) */}
      <div className="flex-1 flex justify-center w-full lg:w-auto overflow-x-auto lg:overflow-visible">
        <div className="bg-white p-12 shadow-2xl border border-gray-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[210mm] min-h-[297mm] origin-top scale-[0.9] lg:scale-100 transition-transform duration-300">
          
          {/* ✅ JUDUL DISESUAIKAN PERMINTAAN */}
          <Header title="TRANSKRIP NILAI" />
          
          <StudentInfo profile={currentStudent.profile} />
          
          {/* Menampilkan SEMUA data transcript (kumulatif) */}
          <GradeTable data={currentStudent.transcript} />

          <Footer signatureType={signatureType} signatureBase64={secureImage} />
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