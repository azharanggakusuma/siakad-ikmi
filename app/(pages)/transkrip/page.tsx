"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type Official, type TranscriptItem } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";

import PageHeader from "@/components/layout/PageHeader";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import DocumentFooter from "@/components/features/document/DocumentFooter";
import StudentInfo from "@/components/features/document/StudentInfo";
import ControlPanel from "@/components/features/document/ControlPanel";
import GradeTable from "@/components/features/transkrip/GradeTable";

// [UPDATE] Import Logic Terpusat
import { calculateIPK, calculateTotalSKSLulus, calculateTotalMutu } from "@/lib/grade-calculations";

export default function TranskripPage() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<Official | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed, user } = useLayout();

  const paperRef = useRef<HTMLDivElement>(null);
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

  // Page Count Logic
  useEffect(() => {
    if (!paperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const pages = Math.ceil((entry.target.scrollHeight - 1) / 1122.5);
        setTotalPages(pages < 1 ? 1 : pages);
      }
    });
    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [currentStudent, transcriptData]);

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Transkrip Nilai" breadcrumb={["Beranda", "Transkrip"]} />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        <div className={`
            hidden xl:flex print:flex print:w-full print:justify-center
            shrink-0 justify-start w-full transition-all duration-300
            ${isCollapsed ? "xl:w-[210mm]" : "xl:w-[189mm]"}
            overflow-visible mb-0 
        `}>
          <div ref={paperRef} className={`
              bg-white p-8 shadow-2xl border border-gray-300 
              print:shadow-none print:border-none print:m-0 
              w-[210mm] min-h-[297mm] origin-top-left transform transition-transform duration-300
              ${isCollapsed ? "xl:scale-100" : "xl:scale-[0.9]"}
              print:scale-100
            `}>
             
             {loading ? (
              <div className="animate-pulse flex flex-col h-full space-y-4">
                 <Skeleton className="w-full h-32" />
                 <Skeleton className="w-full h-96" />
              </div>
            ) : !currentStudent ? (
              <div className="flex flex-col h-full items-center justify-center text-slate-400">
                <p>Data Transkrip Kosong</p>
              </div>
            ) : (
              <>
                 <DocumentHeader title="TRANSKRIP NILAI" />
                 <StudentInfo profile={currentStudent.profile} />
                 
                 {/* [UPDATE] Pass calculated Summary */}
                 <GradeTable 
                    data={transcriptData} 
                    mode="transkrip" 
                    ipk={summaryData.ipk}
                    totalSKS={summaryData.totalSKS}
                    totalNM={summaryData.totalNM}
                 />
                 
                 <DocumentFooter 
                    signatureType={signatureType} 
                    signatureBase64={secureImage} 
                    mode="transkrip" 
                    official={official}
                 />
              </>
            )}
          </div>
        </div>

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