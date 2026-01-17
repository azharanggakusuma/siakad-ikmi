"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type Official, type TranscriptItem } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import ControlPanel from "@/components/features/document/ControlPanel";
import PrintableTranskrip from "@/components/features/transkrip/PrintableTranskrip";
import { calculateIPK, calculateTotalSKSLulus, calculateTotalMutu } from "@/lib/grade-calculations";

export default function AdminTranskripView() {
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

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // Data Transkrip Bersih (Tanpa KRS kosong)
  const transcriptData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((item: TranscriptItem) => item.hm !== '-');
  }, [currentStudent]);

  // Hitung Summary
  const summaryData = useMemo(() => {
      if (!transcriptData) return { ipk: "0,00", totalSKS: 0, totalNM: 0 };
      
      const ipkVal = calculateIPK(transcriptData).replace('.', ',');
      const sksVal = calculateTotalSKSLulus(transcriptData);
      const mutuVal = calculateTotalMutu(transcriptData);

      return { ipk: ipkVal, totalSKS: sksVal, totalNM: mutuVal };
  }, [transcriptData]);

  const handlePrint = () => window.print();

  return (
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
  );
}
