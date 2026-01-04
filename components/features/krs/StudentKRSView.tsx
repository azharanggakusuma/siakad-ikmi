"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Send, AlertTriangle, BookOpen, GraduationCap, PieChart, Printer
} from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { StatusBadge } from "./StatusBadge";

// Import DataTable
import { DataTable, type Column } from "@/components/ui/data-table";

// Import Dokumen Components
import DocumentHeader from "@/components/features/document/DocumentHeader";
import StudentInfo from "@/components/features/document/StudentInfo";
import DocumentFooter from "@/components/features/document/DocumentFooter";

import { 
  getStudentCourseOfferings, createKRS, deleteKRS, submitKRS, 
  CourseOffering 
} from "@/app/actions/krs";
import { getAcademicYears } from "@/app/actions/academic-years";
import { getActiveOfficial } from "@/app/actions/students"; 
import { AcademicYear, Official } from "@/lib/types";

export default function StudentKRSView({ user }: { user: any }) {
  const { successAction, showError, showLoading } = useToastMessage();

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [studentSemester, setStudentSemester] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Pejabat untuk Tanda Tangan
  const [official, setOfficial] = useState<Official | null>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null); // State Profil Mahasiswa

  // DataTable State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const studentId = user.student_id;
  const MAX_SKS = 24; 

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
      setStudentProfile(res.student_profile); // Simpan profil lengkap
    } catch (error: any) {
      showError("Gagal", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // === STATS ===
  const totalSKS = offerings.filter(c => c.is_taken).reduce((acc, curr) => acc + curr.sks, 0);
  const hasDraft = offerings.some(c => c.is_taken && c.krs_status === 'DRAFT');
  const krsGlobalStatus = offerings.find(c => c.is_taken)?.krs_status || "BELUM_AMBIL";
  const progressPercent = Math.min((totalSKS / MAX_SKS) * 100, 100);

  // Filter Mata Kuliah yang Diambil (Untuk Cetak)
  const takenCourses = useMemo(() => {
     return offerings.filter(c => c.is_taken);
  }, [offerings]);

  // Cari Nama Tahun Akademik + Semester (Ganjil/Genap)
  const selectedAcademicYearName = useMemo(() => {
      const ay = academicYears.find(y => y.id === selectedYear);
      return ay ? `${ay.nama} ${ay.semester}` : "";
  }, [academicYears, selectedYear]);

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

  const confirmSubmit = async () => {
    const toastId = showLoading("Mengajukan KRS...");
    try {
        await submitKRS(studentId, selectedYear);
        successAction("KRS", "update", toastId);
        await fetchData();
    } catch (e: any) { showError("Gagal", e.message, toastId); }
    finally { setIsSubmitOpen(false); }
  };
  
  const handlePrint = () => {
    window.print();
  };

  // Logic Filter & Pagination (Untuk Tampilan Web)
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

  // === DEFINISI KOLOM WEB ===
  const columns: Column<CourseOffering>[] = [
    {
      header: "Pilih",
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
        header: "Smt",
        className: "text-center w-[60px]",
        render: (row) => (
            <span className="text-sm font-medium text-slate-600">
                {row.smt_default}
            </span>
        )
    },
    {
        header: "SKS",
        className: "text-center w-[60px]",
        render: (row) => (
            <Badge variant="secondary" className="font-mono text-xs bg-white border border-slate-200 text-slate-600">
                {row.sks}
            </Badge>
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

  return (
    <>
    {/* --- CSS KHUSUS PRINT --- */}
    <style jsx global>{`
      @media print {
        @page {
          margin: 10mm;
          size: A4 portrait;
        }
        body * {
          visibility: hidden;
        }
        #print-area, #print-area * {
          visibility: visible;
        }
        #print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          padding: 0;
          background-color: white;
          z-index: 9999;
        }
      }
    `}</style>

    {/* --- LAYOUT PRINT (ID: #print-area) --- */}
    <div id="print-area" className="hidden print:block font-sans bg-white text-black p-6">
        <DocumentHeader title="KARTU RENCANA STUDI" />

        {/* Info Mahasiswa Dinamis + Periode */}
        <div className="mt-1 mb-4 px-2">
             <StudentInfo 
                profile={studentProfile || { 
                    nama: user?.name || "-",
                    nim: user?.username || "-", 
                    semester: studentSemester,
                    study_program: { nama: "-", jenjang: "-" } 
                }}
                displaySemester={studentSemester}
                periode={selectedAcademicYearName}
             />
        </div>

        {/* Tabel KRS Resmi (Style Compact Mirip KHS) */}
        <div className="w-full mb-6 px-1">
            <table className="w-full text-[9px] font-['Cambria'] border-collapse border border-black mb-2">
                <thead>
                    {/* Header: Biru Muda, Bold, Tinggi h-5 */}
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
                        /* Body: Teks Normal, Tinggi Rapat h-[13px] */
                        <tr key={course.id} className="text-center leading-none h-[13px]">
                            <td className="border border-black">{index + 1}</td>
                            <td className="border border-black">{course.kode}</td>
                            <td className="border border-black text-left pl-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">{course.matkul}</td>
                            <td className="border border-black">{course.sks}</td>
                            <td className="border border-black">{course.smt_default}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="border border-black p-4 text-center italic">
                                Belum ada mata kuliah yang diambil.
                            </td>
                        </tr>
                    )}
                </tbody>
                {takenCourses.length > 0 && (
                     <tfoot>
                        {/* Footer: Style Mirip KHS */}
                        <tr className="font-bold bg-white h-4 border-t border-black text-[9px]">
                            <td colSpan={3} className="border border-black px-2 text-left">Jumlah SKS yang diambil</td>
                            <td className="border border-black text-center">{totalSKS}</td>
                            <td className="border border-black bg-gray-100"></td>
                        </tr>
                     </tfoot>
                )}
            </table>
        </div>

        {/* Footer Tanda Tangan */}
        <div className="px-2">
            <DocumentFooter 
                signatureType="none" 
                signatureBase64={null}
                mode="krs" 
                official={official}
            />
        </div>
    </div>

    {/* --- LAYOUT WEB (Tampil di Layar) --- */}
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4 print:hidden">
      
      {/* 1. HEADER STATS & FILTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card Status Utama */}
        <Card className={`col-span-1 md:col-span-2 border-none shadow-md text-white overflow-hidden relative
            ${krsGlobalStatus === 'APPROVED' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 
              krsGlobalStatus === 'SUBMITTED' ? 'bg-gradient-to-br from-blue-800 to-blue-900' : 
              'bg-gradient-to-br from-slate-700 to-slate-800' }`}>
            
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <BookOpen size={120} />
            </div>
            
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white/80 font-medium text-sm mb-1">Status Pengisian KRS</p>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {krsGlobalStatus === 'APPROVED' ? "Disetujui Dosen" : 
                             krsGlobalStatus === 'SUBMITTED' ? "Menunggu Validasi" :
                             krsGlobalStatus === 'BELUM_AMBIL' ? "Belum Mengisi" : "Mode Draft"}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        {/* Tombol Cetak */}
                        {(krsGlobalStatus === 'SUBMITTED' || krsGlobalStatus === 'APPROVED') && (
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                                onClick={handlePrint}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak KRS
                            </Button>
                        )}
                        {krsGlobalStatus === 'DRAFT' && (
                            <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500 border-none">Action Needed</Badge>
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
                                <SelectItem key={ay.id} value={ay.id}>
                                  {ay.nama} - {ay.semester} {ay.is_active ? "(Aktif)" : ""}
                                </SelectItem>
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
            </CardContent>
        </Card>

        {/* Card Statistik SKS */}
        <Card className="border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-cyan-600 to-blue-600">
            <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12">
                <PieChart size={140} />
            </div>

            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center gap-2 text-cyan-50 mb-1">
                        <span className="text-sm font-medium">Total SKS Diambil</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight">{totalSKS}</span>
                        <span className="text-lg text-cyan-100 font-medium">/ {MAX_SKS} SKS</span>
                    </div>
                </div>
                
                <div className="mt-4">
                    <div className="w-full bg-black/20 rounded-full h-3 mb-3 overflow-hidden backdrop-blur-sm">
                        <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    
                    <p className="text-xs text-cyan-50/90 leading-relaxed font-medium">
                        {totalSKS < 10 ? "SKS masih sedikit. Maksimalkan jatah SKS Anda." : 
                             totalSKS > 20 ? "Beban studi tinggi. Semangat!" :
                             "Beban studi cukup optimal."}
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* 2. ALERT & ACTION BUTTON */}
      {hasDraft && (
           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-full text-amber-700 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm">Selesaikan Pengisian KRS</h4>
                    <p className="text-sm text-amber-800/80 mt-1 max-w-2xl">
                      Anda memiliki mata kuliah berstatus <strong>Draft</strong>. Harap ajukan segera agar dapat divalidasi oleh Dosen Wali.
                    </p>
                  </div>
              </div>
              <Button onClick={() => setIsSubmitOpen(true)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-sm border-0 font-medium">
                  <Send className="w-4 h-4 mr-2" /> Ajukan KRS
              </Button>
           </div>
      )}

      {/* Tabel Menggunakan DataTable */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-6">
            <DataTable
                data={currentData}
                columns={columns}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                }}
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

      <ConfirmModal isOpen={isSubmitOpen} onClose={setIsSubmitOpen} onConfirm={confirmSubmit}
        title="Ajukan KRS?" description="Setelah diajukan, KRS akan dikunci dan menunggu persetujuan Dosen Wali. Pastikan pilihan mata kuliah sudah benar." confirmLabel="Ajukan Sekarang" variant="default" />
    </div>
    </>
  );
}