"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getStudents } from "@/app/actions/students";
// PERBAIKAN IMPORT: Ambil type dari lib/types
import { type StudentData, type TranscriptItem } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";

import PageHeader from "@/components/layout/PageHeader";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import DocumentFooter from "@/components/features/document/DocumentFooter";
import StudentInfo from "@/components/features/document/StudentInfo";
import ControlPanel from "@/components/features/document/ControlPanel";
import GradeTable from "@/components/features/transkrip/GradeTable";

export default function KhsPage() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();
  
  const paperRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudents();
        setStudentsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

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
  }, [currentStudent, selectedSemester]);

  // Logic Semesters
  const availableSemesters = useMemo<number[]>(() => {
    if (!currentStudent?.transcript) return [];
    
    // Explicit Type Casting untuk menghindari error 'unknown'
    const smts = currentStudent.transcript.map((t: TranscriptItem) => Number(t.smt));
    
    return Array.from(new Set(smts)).sort((a: number, b: number) => a - b);
  }, [currentStudent]);

  useEffect(() => {
    if (availableSemesters.length > 0) {
      if (!availableSemesters.includes(selectedSemester)) {
        setSelectedSemester(availableSemesters[0]);
      }
    }
  }, [selectedIndex, availableSemesters, selectedSemester]);

  const semesterData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) === selectedSemester);
  }, [currentStudent, selectedSemester]);

  const cumulativeData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) <= selectedSemester);
  }, [currentStudent, selectedSemester]);

  const ips = useMemo(() => {
    const totalSKS = semesterData.reduce((acc: number, row: TranscriptItem) => acc + row.sks, 0);
    const totalNM = semesterData.reduce((acc: number, row: TranscriptItem) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace(".", ",") : "0,00";
  }, [semesterData]);

  const ipk = useMemo(() => {
    const totalSKS = cumulativeData.reduce((acc: number, row: TranscriptItem) => acc + row.sks, 0);
    const totalNM = cumulativeData.reduce((acc: number, row: TranscriptItem) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace(".", ",") : "0,00";
  }, [cumulativeData]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["SIAKAD", "KHS"]} />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        {/* AREA KERTAS */}
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
              <div className="animate-pulse flex flex-col h-full">
                 <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-[80px] h-[80px]" /> 
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="w-[250px] h-[78px]" />
                </div>
                <div className="space-y-4 mt-4">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-40 w-full" />
                </div>
              </div>
            ) : !currentStudent ? (
              <div className="flex flex-col h-full items-center justify-center text-slate-400">
                <p>Data Mahasiswa Tidak Ditemukan</p>
              </div>
            ) : (
              <>
                <DocumentHeader title="KARTU HASIL STUDI" />
                <StudentInfo profile={currentStudent.profile} displaySemester={selectedSemester} />
                <GradeTable mode="khs" data={semesterData} ips={ips} ipk={ipk} />
                <DocumentFooter signatureType={signatureType} signatureBase64={secureImage} mode="khs" />
              </>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-[240px] w-full rounded-xl" />
                <Skeleton className="h-[120px] w-full rounded-xl" />
             </div>
          ) : (
            <ControlPanel
                students={studentsData}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                signatureType={signatureType}
                onSignatureChange={setSignatureType}
                onPrint={() => window.print()}
                showSemesterSelect={true}
                availableSemesters={availableSemesters}
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
                totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
}