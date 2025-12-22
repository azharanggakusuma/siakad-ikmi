"use client";

import React, { useState, useEffect } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import GradeTable from "@/components/GradeTable";
import Footer from "@/components/Footer";
// Import Server Action
import { getSignatureBase64 } from "@/app/actions/getSignature";

export default function TranskripPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [signatureType, setSignatureType] = useState<"basah" | "digital" | "none">("none");
  
  // State baru untuk menyimpan data gambar aman (Base64)
  const [secureImage, setSecureImage] = useState<string | null>(null);
  
  const currentStudent = students[selectedIndex];

  // Efek untuk memuat gambar aman saat tipe tanda tangan berubah
  useEffect(() => {
    const fetchSignature = async () => {
      if (signatureType === "none") {
        setSecureImage(null);
        return;
      }

      // Panggil Server Action
      const base64Data = await getSignatureBase64(signatureType);
      setSecureImage(base64Data);
    };

    fetchSignature();
  }, [signatureType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* TOOLBAR CONTROLS (Control Panel) */}
      <div className="w-full max-w-[210mm] bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          
          {/* Selektor Mahasiswa */}
          <div className="flex items-center gap-3 flex-1 sm:flex-initial">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1B3F95] shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mahasiswa</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="bg-transparent font-bold text-gray-700 text-sm outline-none cursor-pointer p-0 w-full min-w-[150px]"
              >
                {students.map((student, index) => (
                  <option key={student.id} value={index}>
                    {student.profile.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

          {/* Selektor Tanda Tangan */}
          <div className="flex items-center gap-3 flex-1 sm:flex-initial">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tanda Tangan</label>
              <select
                value={signatureType}
                onChange={(e) => setSignatureType(e.target.value as "basah" | "digital" | "none")}
                className="bg-transparent font-bold text-gray-700 text-sm outline-none cursor-pointer p-0 w-full min-w-[120px]"
              >
                <option value="none">Tanpa Tanda Tangan</option>
                <option value="basah">Basah (Kaprodi)</option>
                <option value="digital">Digital (QR)</option>
              </select>
            </div>
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

      {/* KERTAS TRANSKRIP */}
      <div className="bg-white p-12 shadow-lg border border-gray-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[210mm] min-h-[297mm] origin-top scale-[0.9] lg:scale-100">
        <Header />
        <StudentInfo profile={currentStudent.profile} />
        <GradeTable data={currentStudent.transcript} />
        {/* Pass data secureImage ke Footer */}
        <Footer signatureType={signatureType} signatureBase64={secureImage} />
      </div>
    </div>
  );
}