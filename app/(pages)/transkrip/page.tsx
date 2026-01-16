"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type Official, type TranscriptItem } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";

import PageHeader from "@/components/layout/PageHeader";
import ControlPanel from "@/components/features/document/ControlPanel";
import PrintableTranskrip from "@/components/features/transkrip/PrintableTranskrip";

// [UPDATE] Import Logic Terpusat
import { calculateIPK, calculateTotalSKSLulus, calculateTotalMutu } from "@/lib/grade-calculations";

export default function TranskripPage() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<Official | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed, user } = useLayout();

  const [totalPages, setTotalPages] = useState(1);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, activeOfficial] = await Promise.all([
           getStudents(),
           getActiveOfficial()
        ]);
        setStudentsData(data);
        setOfficial(activeOfficial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto Select for Student User
  useEffect(() => {
    if (studentsData.length > 0 && user?.role === "mahasiswa" && user?.student_id) {
       const myIndex = studentsData.findIndex((s) => s.id === user.student_id);
       if (myIndex !== -1) setSelectedIndex(myIndex); 
    }
  }, [studentsData, user]);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // Data Transkrip Bersih (Tanpa KRS kosong)
  const transcriptData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((item: TranscriptItem) => item.hm !== '-');
  }, [currentStudent]);

  // [UPDATE] Hitung Summary menggunakan Library (Deduplikasi Otomatis)
  const summaryData = useMemo(() => {
      if (!transcriptData) return { ipk: "0,00", totalSKS: 0, totalNM: 0 };
      
      const ipkVal = calculateIPK(transcriptData).replace('.', ',');
      const sksVal = calculateTotalSKSLulus(transcriptData);
      const mutuVal = calculateTotalMutu(transcriptData);

      return { ipk: ipkVal, totalSKS: sksVal, totalNM: mutuVal };
  }, [transcriptData]);


  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Transkrip Nilai" breadcrumb={["Beranda", "Transkrip"]} />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
      <PrintableTranskrip
        loading={loading}
        currentStudent={currentStudent}
        transcriptData={transcriptData}
        ipk={summaryData.ipk}
        totalSKS={summaryData.totalSKS}
        totalNM={summaryData.totalNM}
        signatureType={signatureType}
        signatureBase64={secureImage}
        official={official}
        isCollapsed={isCollapsed}
        setTotalPages={setTotalPages}
      />

        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          {!loading && (
            <ControlPanel
                students={studentsData}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                signatureType={signatureType}
                onSignatureChange={setSignatureType}
                onPrint={handlePrint}
                totalPages={totalPages}
                user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
}