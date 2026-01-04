"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
    CheckCircle2, PlusCircle, Trash2, Send, Lock, AlertTriangle, 
    BookOpen, GraduationCap, Info 
} from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { StatusBadge } from "./StatusBadge";

// [UPDATE] Import DataTable
import { DataTable, type Column } from "@/components/ui/data-table";

import { 
  getStudentCourseOfferings, createKRS, deleteKRS, submitKRS, 
  CourseOffering 
} from "@/app/actions/krs";
import { getAcademicYears } from "@/app/actions/academic-years";
import { AcademicYear } from "@/lib/types";

export default function StudentKRSView({ user }: { user: any }) {
  const { successAction, showError, showLoading } = useToastMessage();

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [studentSemester, setStudentSemester] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // [UPDATE] DataTable State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

  const studentId = user.student_id;
  const MAX_SKS = 24; 

  useEffect(() => {
    async function init() {
      try {
        const years = await getAcademicYears();
        const active = years.find(y => y.is_active);
        setAcademicYears(years);
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

  // === ACTIONS ===
  const handleAmbil = async (course: CourseOffering) => {
    if (totalSKS + course.sks > MAX_SKS) {
        showError("Batas SKS", `Tidak dapat mengambil mata kuliah. SKS akan melebihi batas (${MAX_SKS}).`);
        return;
    }
    const toastId = showLoading(`Mengambil ${course.matkul}...`);
    try {
        await createKRS({ student_id: studentId, academic_year_id: selectedYear, course_id: course.id });
        successAction("Mata Kuliah", "create", toastId);
        await fetchData(); 
    } catch (e: any) { showError("Gagal", e.message, toastId); }
  };

  const confirmBatal = async () => {
    if (!itemToDelete) return;
    const toastId = showLoading("Membatalkan...");
    try {
        await deleteKRS(itemToDelete.id);
        successAction("Mata Kuliah", "delete", toastId);
        await fetchData();
    } catch (e: any) { showError("Gagal", e.message, toastId); }
    finally { setIsDeleteOpen(false); }
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

  // [UPDATE] Logic Filter & Pagination
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

  // [UPDATE] Definisi Kolom
  const columns: Column<CourseOffering>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>,
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
            <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                {row.matkul}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{row.kategori || "Reguler"}</div>
        </div>
      )
    },
    {
        header: "SKS",
        className: "text-center w-[80px]",
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
    },
    {
        header: "Aksi",
        className: "text-center w-[120px]",
        render: (row) => {
            if (row.is_taken) {
                return (
                    <Button variant="ghost" size="sm" className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 w-full"
                        disabled={row.krs_status !== 'DRAFT'} 
                        onClick={() => { setItemToDelete({ id: row.krs_id!, name: row.matkul }); setIsDeleteOpen(true); }}>
                        {row.krs_status !== 'DRAFT' ? 
                            <span className="flex items-center text-slate-400 text-xs"><Lock className="w-3 h-3 mr-1" /> Locked</span> : 
                            <span className="flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Batal</span>
                        }
                    </Button>
                );
            }
            return (
                <Button size="sm" variant="outline" 
                    className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 w-full" 
                    onClick={() => handleAmbil(row)}>
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Ambil
                </Button>
            );
        }
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4">
      
      {/* 1. HEADER STATS & FILTER (Tidak Diubah) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Status Utama */}
        <Card className={`col-span-1 md:col-span-2 border-none shadow-md text-white overflow-hidden relative
            ${krsGlobalStatus === 'APPROVED' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 
              krsGlobalStatus === 'SUBMITTED' ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 
              'bg-gradient-to-br from-slate-700 to-slate-800' }`}>
            {/* Dekorasi Background */}
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
                    {krsGlobalStatus === 'DRAFT' && (
                        <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500">Action Needed</Badge>
                    )}
                </div>
                
                <div className="mt-6 flex items-center gap-4">
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
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Total SKS
                    </span>
                    <span className="text-2xl font-bold text-slate-800">
                        {totalSKS} <span className="text-base font-medium text-slate-400">/ {MAX_SKS}</span>
                    </span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out 
                            ${totalSKS >= MAX_SKS ? 'bg-rose-500' : 'bg-indigo-600'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600 leading-relaxed">
                            {totalSKS < 10 ? "SKS Anda masih sedikit. Ambil mata kuliah wajib semester ini." : 
                             totalSKS > 20 ? "Beban studi cukup tinggi, pastikan Anda mampu." :
                             "Beban studi Anda sudah optimal."}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* 2. ALERT & ACTION BUTTON */}
      {hasDraft && (
           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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

      {/* [UPDATE] Tabel Menggunakan DataTable */}
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

      <ConfirmModal isOpen={isDeleteOpen} onClose={setIsDeleteOpen} onConfirm={confirmBatal}
        title="Batalkan Mata Kuliah?" description={`Apakah Anda yakin ingin membatalkan pengambilan mata kuliah ${itemToDelete?.name}?`} confirmLabel="Ya, Batalkan" variant="destructive" />

      <ConfirmModal isOpen={isSubmitOpen} onClose={setIsSubmitOpen} onConfirm={confirmSubmit}
        title="Ajukan KRS?" description="Setelah diajukan, KRS akan dikunci dan menunggu persetujuan Dosen Wali. Pastikan pilihan mata kuliah sudah benar." confirmLabel="Ajukan Sekarang" variant="default" />
    </div>
  );
}