"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { validateStudentKrs } from "@/app/actions/krs"; // Import Validasi

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
import KrsLock from "@/components/shared/KrsLock"; // Komponen Kunci

export default function KhsPage() {
  // State Data
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<Official | null>(null);

  // State Gatekeeper KRS
  const [isKrsValid, setIsKrsValid] = useState<boolean>(true); // Default true (allow history)

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed, user } = useLayout();
  
  const paperRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // === 1. CEK STATUS KRS (Tanpa Blocking Halaman Penuh) ===
  useEffect(() => {
    const checkAccess = async () => {
      if (user?.role === "mahasiswa" && user.student_id) {
        const check = await validateStudentKrs(user.student_id);
        // Kita simpan statusnya: TRUE jika sudah KRS/Approved, FALSE jika belum.
        setIsKrsValid(check.allowed);
      }
    };
    if (user) checkAccess();
  }, [user]);

  // === 2. FETCH DATA UTAMA ===
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

  // === 3. AUTO-SELECT MAHASISWA JIKA LOGIN SEBAGAI MAHASISWA ===
  useEffect(() => {
    if (studentsData.length > 0 && user?.role === "mahasiswa" && user?.student_id) {
       // Cari index mahasiswa tersebut di array data
       const myIndex = studentsData.findIndex((s) => s.id === user.student_id);
       if (myIndex !== -1) {
          setSelectedIndex(myIndex); 
       }
    }
  }, [studentsData, user]);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // Helper untuk hitung halaman kertas (Print)
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

  // === LOGIC SEMESTER & LOCK ===

  // 1. List Semester: Gabungan dari Transkrip + Semester Aktif Mahasiswa
  const availableSemesters = useMemo<number[]>(() => {
    if (!currentStudent) return [];
    
    // Ambil semester dari transkrip (history)
    const transcriptSmts = currentStudent.transcript?.map((t: TranscriptItem) => Number(t.smt)) || [];
    const uniqueSmts = new Set(transcriptSmts);

    // Pastikan Semester Aktif (Profil) masuk dalam list, 
    // agar mahasiswa bisa "mengklik" semester sekarang meskipun belum ada nilai
    if (currentStudent.profile?.semester) {
        uniqueSmts.add(currentStudent.profile.semester);
    }

    return Array.from(uniqueSmts).sort((a, b) => a - b);
  }, [currentStudent]);

  // 2. Default Select: Pilih semester terakhir (biasanya semester aktif)
  useEffect(() => {
    if (availableSemesters.length > 0) {
        // Jika user belum memilih manual (atau saat load awal), set ke semester paling besar
        if (!availableSemesters.includes(selectedSemester)) {
            setSelectedSemester(availableSemesters[availableSemesters.length - 1]);
        }
    }
  }, [availableSemesters]); // Hapus deps berlebih

  // 3. Filter Data Nilai Sesuai Semester Pilihan
  const semesterData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) === selectedSemester);
  }, [currentStudent, selectedSemester]);

  // Hitung IPK/IPS
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


  // === 4. PENENTU KUNCI ===
  // Terkunci JIKA:
  // - Semester yang dipilih == Semester Aktif Mahasiswa
  // - DAN Status KRS (isKrsValid) == False
  // - DAN User adalah Mahasiswa
  const isLocked = useMemo(() => {
      if (user?.role !== "mahasiswa") return false;
      const studentCurrentSemester = currentStudent?.profile?.semester;
      return (selectedSemester === studentCurrentSemester) && !isKrsValid;
  }, [user, selectedSemester, currentStudent, isKrsValid]);


  // === RENDER VIEW ===

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["Beranda", "KHS"]} />
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
              print:scale-100 relative
            `}>
            
            {loading ? (
              <div className="animate-pulse flex flex-col h-full space-y-8">
                 <Skeleton className="w-full h-32" />
                 <Skeleton className="w-full h-12" />
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
                
                {/* === AREA KONTEN UTAMA DENGAN LOGIC LOCK === */}
                {/* FIX: Hapus min-h-[400px] jika tidak terkunci agar footer naik */}
                <div className={isLocked ? "min-h-[400px]" : ""}>
                    {isLocked ? (
                        <div className="mt-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-8 flex items-center justify-center h-[400px]">
                            <div className="scale-90 transform">
                                <KrsLock 
                                    title={`Semester ${selectedSemester} Terkunci`}
                                    message="Anda belum menyelesaikan administrasi KRS untuk semester ini. Silakan selesaikan terlebih dahulu untuk melihat hasil studi." 
                                />
                            </div>
                        </div>
                    ) : (
                        <GradeTable mode="khs" data={semesterData} ips={ips} ipk={ipk} />
                    )}
                </div>
                
                {/* Footer Tanda Tangan (Hidden jika terkunci) */}
                {!isLocked && (
                    <DocumentFooter 
                        signatureType={signatureType} 
                        signatureBase64={secureImage} 
                        mode="khs"
                        official={official} 
                    />
                )}
              </>
            )}
          </div>
        </div>

        {/* SIDEBAR CONTROL */}
        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-[240px] w-full rounded-xl" />
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
                disablePrint={isLocked}
                
                // [PENTING] Kirim prop user ke sini untuk pengecekan role
                user={user} 
            />
          )}
        </div>
      </div>
    </div>
  );
}