"use client";

import React, { useState, useEffect, useMemo } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import Footer from "@/components/Footer";
import ControlPanel from "@/components/ControlPanel";
import KhsTable from "@/components/KhsTable"; 
import { getSignatureBase64 } from "@/app/actions/getSignature";

export default function KhsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [signatureType, setSignatureType] = useState<"basah" | "digital" | "none">("none");
  const [secureImage, setSecureImage] = useState<string | null>(null);

  const currentStudent = students[selectedIndex];

  // 1. Ambil list semester yang tersedia
  const availableSemesters = useMemo(() => {
    const smts = currentStudent.transcript.map((t) => t.smt);
    return [...new Set(smts)].sort((a, b) => a - b);
  }, [currentStudent]);

  // Reset semester ke 1 jika ganti mahasiswa
  useEffect(() => {
    if (availableSemesters.length > 0) {
      setSelectedSemester(availableSemesters[0]);
    }
  }, [selectedIndex, availableSemesters]);

  // Load Signature
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

  // --- HITUNG IPS & IPK ---
  
  // Data Semester Ini
  const semesterData = useMemo(() => {
    return currentStudent.transcript.filter((t) => t.smt === selectedSemester);
  }, [currentStudent, selectedSemester]);

  // Data Kumulatif
  const cumulativeData = useMemo(() => {
    return currentStudent.transcript.filter((t) => t.smt <= selectedSemester);
  }, [currentStudent, selectedSemester]);

  // Hitung IPS
  const ips = useMemo(() => {
    const totalSKS = semesterData.reduce((acc, row) => acc + row.sks, 0);
    const totalNM = semesterData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace('.', ',') : "0,00";
  }, [semesterData]);

  // Hitung IPK
  const ipk = useMemo(() => {
    const totalSKS = cumulativeData.reduce((acc, row) => acc + row.sks, 0);
    const totalNM = cumulativeData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace('.', ',') : "0,00";
  }, [cumulativeData]);


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 min-h-screen p-4 lg:p-8">
      {/* AREA KERTAS KHS */}
      <div className="flex-1 flex justify-center w-full lg:w-auto overflow-x-auto lg:overflow-visible">
        <div className="bg-white p-12 shadow-2xl border border-gray-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[210mm] min-h-[297mm] origin-top scale-[0.9] lg:scale-100 transition-transform duration-300">
          
          {/* JUDUL DINAMIS UNTUK KHS */}
          <Header title={`KARTU HASIL STUDI`} />
          
          <StudentInfo profile={currentStudent.profile} displaySemester={selectedSemester} />
          
          <KhsTable 
            data={semesterData} 
            ips={ips} 
            ipk={ipk} 
          />

          <Footer signatureType={signatureType} signatureBase64={secureImage} />
        </div>
      </div>

      {/* CONTROL PANEL */}
      <div className="w-full lg:w-80 shrink-0 print:hidden lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24">
        <ControlPanel
          students={students}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          signatureType={signatureType}
          onSignatureChange={setSignatureType}
          onPrint={handlePrint}
          showSemesterSelect={true}
          availableSemesters={availableSemesters}
          selectedSemester={selectedSemester}
          onSelectSemester={setSelectedSemester}
        />
      </div>
    </div>
  );
}