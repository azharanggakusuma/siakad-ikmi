"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { useSignature } from "@/hooks/useSignature"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; 
import { Label } from "@/components/ui/label"; 
import { 
    Send, AlertTriangle, BookOpen, GraduationCap, PieChart, Printer, Loader2, RotateCcw
} from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { StatusBadge } from "./StatusBadge";
import { Skeleton } from "@/components/ui/skeleton"; 

// Import DataTable
import { DataTable, type Column } from "@/components/ui/data-table";

// Import Dokumen Components
import DocumentHeader from "@/components/features/document/DocumentHeader";
import StudentInfo from "@/components/features/document/StudentInfo";
import DocumentFooter from "@/components/features/document/DocumentFooter";

import { 
  getStudentCourseOfferings, createKRS, deleteKRS, submitKRS, resetKRS,
  CourseOffering 
} from "@/app/actions/krs";
import { getAcademicYears } from "@/app/actions/academic-years";
import { getActiveOfficial } from "@/app/actions/students"; 
import { AcademicYear, Official } from "@/lib/types";

export default function StudentKRSView({ user }: { user: any }) {
  const { successAction, showError, showLoading, dismiss } = useToastMessage();

  // Hook Signature dengan isLoading
  const { signatureType, setSignatureType, secureImage, isLoading: isSigLoading } = useSignature("none");

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [studentSemester, setStudentSemester] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [official, setOfficial] = useState<Official | null>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const studentId = user.student_id;
  const MAX_SKS = 24; 

  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (isSigLoading) {
        if (!toastIdRef.current) {
            toastIdRef.current = showLoading("Menyiapkan dokumen...");
        }
    } else {
        if (toastIdRef.current) {
            dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSigLoading]);

  // === INIT DATA ===
  useEffect(() => {
    async function init() {
      try {
        const [years, activeOfficial] = await Promise.all([
             getAcademicYears(),
             getActiveOfficial()
        ]);
        
        const active = years.find(y => y.is_active);
        setAcademicYears(years);
        setOfficial(activeOfficial);

        if (active) setSelectedYear(active.id);
        else if (years.length > 0) setSelectedYear(years[0].id);
      } catch (e) { console.error(e); }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedYear || !studentId) return;
    fetchData();
  }, [selectedYear, studentId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getStudentCourseOfferings(studentId, selectedYear);
      setOfferings(res.offerings);
      setStudentSemester(res.student_semester);
      setStudentProfile(res.student_profile);
    } catch (error: any) {
      showError("Gagal", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // === STATS & DATA ===
  const totalSKS = offerings.filter(c => c.is_taken).reduce((acc, curr) => acc + curr.sks, 0);
  const hasDraft = offerings.some(c => c.is_taken && c.krs_status === 'DRAFT');
  
  const krsGlobalStatus = offerings.find(c => c.is_taken)?.krs_status || "NOT_TAKEN";
  
  const progressPercent = Math.min((totalSKS / MAX_SKS) * 100, 100);

  const takenCourses = useMemo(() => {
     return offerings.filter(c => c.is_taken);
  }, [offerings]);

  const selectedAcademicYearName = useMemo(() => {
      const ay = academicYears.find(y => y.id === selectedYear);
      return ay ? `${ay.nama} ${ay.semester}` : "";
  }, [academicYears, selectedYear]);

  // Filter & Pagination
  const filteredData = useMemo(() => {
    if (!searchQuery) return offerings;
    const lower = searchQuery.toLowerCase();
    return offerings.filter(c => 
        c.matkul.toLowerCase().includes(lower) || 
        c.kode.toLowerCase().includes(lower)
    );
  }, [offerings, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- LOGIC SELECT ALL ---
  const editableRows = useMemo(() => {
    return currentData.filter(row => {
        const isLocked = row.is_taken && row.krs_status !== 'DRAFT';
        return !isLocked;
    });
  }, [currentData]);

  const isAllTaken = editableRows.length > 0 && editableRows.every(row => row.is_taken);
  
  // === ACTIONS ===
  const handleToggleCourse = async (course: CourseOffering, isChecked: boolean) => {
    if (isChecked) {
        if (totalSKS + course.sks > MAX_SKS) {
            showError("Batas SKS", `Gagal mengambil mata kuliah. Total SKS akan melebihi batas (${MAX_SKS}).`);
            return;
        }
        const toastId = showLoading(`Mengambil ${course.matkul}...`);
        try {
            await createKRS({ student_id: studentId, academic_year_id: selectedYear, course_id: course.id });
            successAction("Mata Kuliah", "create", toastId);
            await fetchData(); 
        } catch (e: any) { showError("Gagal", e.message, toastId); }
    } else {
        if (!course.krs_id) return;
        const toastId = showLoading(`Membatalkan ${course.matkul}...`);
        try {
            await deleteKRS(course.krs_id);
            successAction("Mata Kuliah", "delete", toastId);
            await fetchData();
        } catch (e: any) { showError("Gagal", e.message, toastId); }
    }
  };

  const handleSelectAll = async () => {
    if (isLoading || editableRows.length === 0) return;

    if (isAllTaken) {
        const toastId = showLoading("Melepas mata kuliah...");
        try {
            const promises = editableRows
                .filter(row => row.krs_id)
                .map(row => deleteKRS(row.krs_id!));
            await Promise.all(promises);
            successAction("KRS", "delete", toastId);
            await fetchData();
        } catch (e: any) { showError("Gagal", e.message, toastId); }
    } else {
        const toTake = editableRows.filter(row => !row.is_taken);
        const sKsToAdd = toTake.reduce((sum, row) => sum + row.sks, 0);
        
        if (totalSKS + sKsToAdd > MAX_SKS) {
            showError("Batas SKS", `Total SKS akan menjadi ${totalSKS + sKsToAdd}. Batas maksimal adalah ${MAX_SKS}.`);
            return;
        }

        const toastId = showLoading("Mengambil mata kuliah...");
        try {
             const promises = toTake.map(row => 
                createKRS({ student_id: studentId, academic_year_id: selectedYear, course_id: row.id })
             );
             await Promise.all(promises);
             successAction("KRS", "create", toastId);
             await fetchData();
        } catch(e: any) { showError("Gagal", e.message, toastId); }
    }
  };

  const confirmSubmit = async () => {
    const toastId = showLoading("Mengajukan KRS...");
    try {
        await submitKRS(studentId, selectedYear);
        successAction("KRS", "update", toastId);
        await fetchData();
    } catch (e: any) { showError("Gagal", e.message, toastId); }
    finally { setIsSubmitOpen(false); }
  };

  const handleReset = async () => {
    const toastId = showLoading("Mereset KRS...");
    try {
        await resetKRS(studentId, selectedYear);
        successAction("KRS", "delete", toastId);
        await fetchData();
    } catch (e: any) { showError("Gagal", e.message, toastId); }
    finally { setIsResetOpen(false); }
  };
  
  const handlePrintProcess = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => {
        window.print();
    }, 300);
  };

  // === COLUMNS DEFINITION ===
  const columns: Column<CourseOffering>[] = [
    {
      header: () => (
          <div className="flex justify-center">
            <Checkbox 
                checked={isAllTaken}
                onCheckedChange={handleSelectAll}
                disabled={isLoading || editableRows.length === 0}
                aria-label="Pilih Semua"
                title={isAllTaken ? "Batalkan pilihan di halaman ini" : "Pilih semua di halaman ini"}
                className="data-[state=checked]:bg-blue-800 data-[state=checked]:border-blue-800"
            />
          </div>
      ),
      className: "w-[50px] text-center",
      render: (row) => {
        const isLocked = row.is_taken && row.krs_status !== 'DRAFT';
        return (
            <div className="flex justify-center">
                <Checkbox 
                    checked={row.is_taken}
                    disabled={isLocked || isLoading}
                    onCheckedChange={(checked) => handleToggleCourse(row, checked as boolean)}
                    className="data-[state=checked]:bg-blue-800 data-[state=checked]:border-blue-800"
                />
            </div>
        );
      },
    },
    {
      header: "Kode",
      className: "w-[100px]",
      render: (row) => <span className="font-mono text-slate-600">{row.kode}</span>
    },
    {
      header: "Mata Kuliah",
      render: (row) => (
        <div>
            <div className="font-semibold text-sm text-slate-800">
                {row.matkul}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{row.kategori || "Reguler"}</div>
        </div>
      )
    },
    {
        header: "SKS",
        className: "text-center w-[60px]",
        render: (row) => (
            <span className="text-sm font-medium text-slate-600">
                {row.sks}
            </span>
        )
    },
    {
        header: "Semester",
        className: "text-center w-[60px]",
        render: (row) => (
            <span className="text-sm font-medium text-slate-600">
                {row.smt_default}
            </span>
        )
    },
    {
        header: "Status",
        className: "text-center w-[140px]",
        render: (row) => (
            row.is_taken ? (
                <div className="flex justify-center scale-90">
                    <StatusBadge status={row.krs_status} />
                </div>
            ) : <span className="text-xs text-slate-400 italic">-</span>
        )
    }
  ];

  const isPrintButtonDisabled = isSigLoading || (signatureType !== 'none' && !secureImage);

  return (
    <>
    {/* --- CSS KHUSUS PRINT --- */}
    <style jsx global>{`
      @media print {
        @page { margin: 10mm; size: A4 portrait; }
        body * { visibility: hidden; }
        #print-area, #print-area * { visibility: visible; }
        #print-area {
          position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background-color: white; z-index: 9999;
        }
      }
    `}</style>

    {/* --- LAYOUT PRINT --- */}
    <div id="print-area" className="hidden print:block font-sans bg-white text-black p-8">
        <DocumentHeader title="KARTU RENCANA STUDI" />
        <div className="mt-1 mb-4 px-2">
             <StudentInfo 
                profile={studentProfile || { 
                    nama: user?.name || "-", nim: user?.username || "-", 
                    semester: studentSemester, study_program: { nama: "-", jenjang: "-" } 
                }}
                displaySemester={studentSemester}
                periode={selectedAcademicYearName}
             />
        </div>

        <div className="w-full mb-6 px-1">
            <table className="w-full text-[9px] font-['Cambria'] border-collapse border border-black mb-2">
                <thead>
                    <tr className="bg-[#D9EAF7] text-center font-bold h-5 border-b border-black">
                        <th className="border border-black w-6">No</th>
                        <th className="border border-black w-24">Kode MK</th>
                        <th className="border border-black text-left pl-2">Mata Kuliah</th>
                        <th className="border border-black w-10">SKS</th>
                        <th className="border border-black w-10">SMT</th>
                    </tr>
                </thead>
                <tbody className="font-normal">
                    {takenCourses.length > 0 ? takenCourses.map((course, index) => (
                        <tr key={course.id} className="text-center leading-none h-[13px]">
                            <td className="border border-black">{index + 1}</td>
                            <td className="border border-black">{course.kode}</td>
                            <td className="border border-black text-left pl-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">{course.matkul}</td>
                            <td className="border border-black">{course.sks}</td>
                            <td className="border border-black">{course.smt_default}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="border border-black p-4 text-center italic">Belum ada mata kuliah yang diambil.</td>
                        </tr>
                    )}
                </tbody>
                {takenCourses.length > 0 && (
                     <tfoot>
                        <tr className="font-bold bg-white h-4 border-t border-black text-[9px]">
                            <td colSpan={3} className="border border-black px-2 text-left">Jumlah SKS yang diambil</td>
                            <td className="border border-black text-center">{totalSKS}</td>
                            <td className="border border-black bg-gray-100"></td>
                        </tr>
                     </tfoot>
                )}
            </table>
        </div>
        <div className="px-2">
            <DocumentFooter signatureType={signatureType} signatureBase64={secureImage} mode="krs" official={official} />
        </div>
    </div>

    {/* --- LAYOUT WEB --- */}
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4 print:hidden">
      
      {/* 1. HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: STATUS KRS */}
        <Card className={`col-span-1 md:col-span-2 border-none shadow-md text-white overflow-hidden relative
            ${krsGlobalStatus === 'APPROVED' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 
              krsGlobalStatus === 'SUBMITTED' ? 'bg-gradient-to-br from-blue-800 to-blue-900' : 
              krsGlobalStatus === 'REJECTED' ? 'bg-gradient-to-br from-red-600 to-rose-700' : 
              'bg-gradient-to-br from-slate-700 to-slate-800' }`}>
            
            <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={120} /></div>
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                {isLoading ? (
                    // LOADING SKELETON CARD 1
                    <div className="flex flex-col justify-between h-full gap-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32 bg-white/20" />
                                <Skeleton className="h-8 w-48 bg-white/20" />
                            </div>
                            <Skeleton className="h-9 w-24 bg-white/20" />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Skeleton className="h-10 w-[240px] bg-white/20" />
                            <Skeleton className="h-10 w-32 bg-white/20" />
                        </div>
                    </div>
                ) : (
                    // CONTENT CARD 1
                    <>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/80 font-medium text-sm mb-1">Status Pengisian KRS</p>
                            <h2 className="text-3xl font-bold tracking-tight">
                                {krsGlobalStatus === 'APPROVED' ? "Disetujui Dosen" : 
                                 krsGlobalStatus === 'SUBMITTED' ? "Menunggu Validasi" :
                                 krsGlobalStatus === 'REJECTED' ? "KRS Ditolak" :
                                 krsGlobalStatus === 'NOT_TAKEN' ? "Belum Mengisi" : "Mode Draf"}
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            {krsGlobalStatus === 'REJECTED' && (
                                <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                                    onClick={() => setIsResetOpen(true)}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Isi Ulang
                                </Button>
                            )}
                            {(krsGlobalStatus === 'SUBMITTED' || krsGlobalStatus === 'APPROVED') && (
                                <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                                    onClick={() => setIsPrintModalOpen(true)}>
                                    <Printer className="w-4 h-4 mr-2" /> Cetak KRS
                                </Button>
                            )}
                            {krsGlobalStatus === 'DRAFT' && (
                                <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500 border-none">Perlu Tindakan</Badge>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[240px] h-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-0">
                                <SelectValue placeholder="Pilih Tahun Akademik" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((ay) => (
                                    <SelectItem key={ay.id} value={ay.id}>{ay.nama} - {ay.semester} {ay.is_active ? "(Aktif)" : ""}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {studentSemester > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md border border-white/10">
                                <GraduationCap className="w-4 h-4 text-white/80" />
                                <span className="text-sm font-medium">Semester {studentSemester}</span>
                            </div>
                        )}
                    </div>
                    </>
                )}
            </CardContent>
        </Card>

        {/* CARD 2: TOTAL SKS */}
        <Card className="border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-cyan-600 to-blue-600">
            <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12"><PieChart size={140} /></div>
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                {isLoading ? (
                    // LOADING SKELETON CARD 2
                    <div className="space-y-6">
                        <div className="space-y-3">
                             <Skeleton className="h-4 w-32 bg-white/20" />
                             <div className="flex items-baseline gap-2">
                                <Skeleton className="h-10 w-16 bg-white/20" />
                                <Skeleton className="h-6 w-12 bg-white/20" />
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full bg-white/20 rounded-full" />
                            <Skeleton className="h-3 w-3/4 bg-white/20 rounded-full" />
                        </div>
                    </div>
                ) : (
                    // CONTENT CARD 2
                    <>
                    <div>
                        <div className="flex items-center gap-2 text-cyan-50 mb-1"><span className="text-sm font-medium">Total SKS Diambil</span></div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold tracking-tight">{totalSKS}</span>
                            <span className="text-lg text-cyan-100 font-medium">/ {MAX_SKS} SKS</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-black/20 rounded-full h-3 mb-3 overflow-hidden backdrop-blur-sm">
                            <div className="h-full rounded-full transition-all duration-1000 ease-out bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="text-xs text-cyan-50/90 leading-relaxed font-medium">
                            {totalSKS < 10 ? "SKS masih sedikit. Maksimalkan jatah SKS Anda." : totalSKS > 20 ? "Beban studi tinggi. Semangat!" : "Beban studi cukup optimal."}
                        </p>
                    </div>
                    </>
                )}
            </CardContent>
        </Card>
      </div>

      {/* 2. ALERT & ACTION BUTTON */}
      {!isLoading && hasDraft && (
           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-full text-amber-700 shrink-0"><AlertTriangle className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm">Selesaikan Pengisian KRS</h4>
                    <p className="text-sm text-amber-800/80 mt-1 max-w-2xl">Anda memiliki mata kuliah berstatus <strong>Draf</strong>. Harap ajukan segera.</p>
                  </div>
              </div>
              <Button onClick={() => setIsSubmitOpen(true)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-sm border-0 font-medium">
                  <Send className="w-4 h-4 mr-2" /> Ajukan KRS
              </Button>
           </div>
      )}

      {/* TABLE */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-6">
            <DataTable
                data={currentData}
                columns={columns}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                searchPlaceholder="Cari Matkul atau Kode..."
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredData.length}
            />
        </CardContent>
      </Card>

      {/* MODAL PRINT OPTIONS */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
            <DialogHeader><DialogTitle>Opsi Cetak KRS</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Pilih Jenis Tanda Tangan</Label>
                    <Select value={signatureType} onValueChange={(val: any) => setSignatureType(val)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Tanda Tangan" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Tanpa Tanda Tangan</SelectItem>
                            <SelectItem value="basah">Tanda Tangan Basah</SelectItem>
                            <SelectItem value="digital">Tanda Tangan Digital (QR)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>Batal</Button>
                <Button onClick={handlePrintProcess} disabled={isPrintButtonDisabled}>
                    {isSigLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memuat...</> : <><Printer className="w-4 h-4 mr-2" /> Cetak PDF</>}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal isOpen={isSubmitOpen} onClose={setIsSubmitOpen} onConfirm={confirmSubmit}
        title="Ajukan KRS?" description="Setelah diajukan, KRS akan dikunci dan menunggu persetujuan Dosen Wali." confirmLabel="Ajukan Sekarang" variant="default" />
      
      {/* MODAL RESET (Isi Ulang) */}
      <ConfirmModal isOpen={isResetOpen} onClose={setIsResetOpen} onConfirm={handleReset}
        title="Isi Ulang KRS?" description="Tindakan ini akan menghapus semua pilihan mata kuliah Anda untuk semester ini. Anda harus memilih ulang dari awal. Lanjutkan?" confirmLabel="Ya, Reset Data" variant="destructive" />
    </div>
    </>
  );
}