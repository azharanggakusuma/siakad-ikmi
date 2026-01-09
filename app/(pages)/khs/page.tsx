"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type TranscriptItem, type Official } from "@/lib/types";
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
import { calculateIPS, calculateIPK } from "@/lib/grade-calculations";

export default function KhsPage() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<Official | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed, user } = useLayout();
  
  const paperRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // === FETCH DATA ===
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

  // Auto-select mahasiswa login
  useEffect(() => {
    if (studentsData.length > 0 && user?.role === "mahasiswa" && user?.student_id) {
       const myIndex = studentsData.findIndex((s) => s.id === user.student_id);
       if (myIndex !== -1) setSelectedIndex(myIndex); 
    }
  }, [studentsData, user]);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // Observer Halaman Kertas
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

  // === LOGIC SEMESTER ===
  const availableSemesters = useMemo<number[]>(() => {
    if (!currentStudent) return [];
    const currentSem = currentStudent.profile?.semester || 1;
    const transcriptSmts = currentStudent.transcript?.map((t: TranscriptItem) => Number(t.smt)) || [];
    const maxDataSem = Math.max(0, ...transcriptSmts);
    const limit = Math.max(currentSem, maxDataSem);
    return Array.from({ length: limit }, (_, i) => i + 1);
  }, [currentStudent]);

  useEffect(() => {
    if (availableSemesters.length > 0) {
        if (!availableSemesters.includes(selectedSemester)) {
            setSelectedSemester(availableSemesters[availableSemesters.length - 1]);
        }
    }
  }, [availableSemesters]);

  // Data Semester Ini
  const semesterData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) === selectedSemester);
  }, [currentStudent, selectedSemester]);

  // Data Kumulatif (Sampai Semester Ini)
  const cumulativeData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) <= selectedSemester && t.hm !== '-');
  }, [currentStudent, selectedSemester]);

  // [UPDATE] Menggunakan Fungsi Terpusat
  const ips = useMemo(() => {
    return calculateIPS(currentStudent?.transcript || [], selectedSemester).replace('.', ',');
  }, [currentStudent, selectedSemester]);

  const ipk = useMemo(() => {
    return calculateIPK(cumulativeData).replace('.', ',');
  }, [cumulativeData]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["Beranda", "KHS"]} />
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
              print:scale-100 relative
            `}>
            
            {loading ? (
              <div className="animate-pulse flex flex-col h-full space-y-8">
                 <Skeleton className="w-full h-32" />
                 <Skeleton className="w-full h-64" />
              </div>
            ) : !currentStudent ? (
              <div className="flex flex-col h-full items-center justify-center text-slate-400">
                <p>Data Mahasiswa Tidak Ditemukan</p>
              </div>
            ) : (
              <>
                <DocumentHeader title="KARTU HASIL STUDI" />
                <StudentInfo profile={currentStudent.profile} displaySemester={selectedSemester} />
                
                <div className="mt-4">
                    {/* Pass calculated IPK & IPS */}
                    <GradeTable 
                        mode="khs" 
                        data={semesterData} 
                        ips={ips} 
                        ipk={ipk} 
                    />
                </div>
                
                <DocumentFooter 
                    signatureType={signatureType} 
                    signatureBase64={secureImage} 
                    mode="khs"
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
                onPrint={() => window.print()}
                showSemesterSelect={true}
                availableSemesters={availableSemesters}
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
                totalPages={totalPages}
                user={user} 
            />
          )}
        </div>
      </div>
    </div>
  );
}