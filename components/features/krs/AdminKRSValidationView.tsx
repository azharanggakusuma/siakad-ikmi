"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { 
  CheckCircle2, Eye, XCircle, GraduationCap, CalendarDays, AlertCircle, ListTodo, BookOpen, Users, Lock, ChevronRight, FileText, LayoutDashboard
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Import DataTable dan Column
import { DataTable, type Column } from "@/components/ui/data-table";

import { 
  getStudentsWithSubmittedKRS, getKRSByStudent, approveKRS, rejectKRS 
} from "@/app/actions/krs";
import { getAcademicYears } from "@/app/actions/academic-years";
import { AcademicYear, KRS } from "@/lib/types";

export default function AdminKRSValidationView() {
  const { successAction, showError, showLoading } = useToastMessage();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk DataTable
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentKRS, setStudentKRS] = useState<KRS[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    async function init() {
        try {
            const years = await getAcademicYears();
            const active = years.find((y) => y.is_active);
            setAcademicYears(years);
            if (active) setSelectedYear(active.id);
            else if (years.length > 0) setSelectedYear(years[0].id);
        } catch(e) { console.error(e); }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    fetchStudents();
  }, [selectedYear]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentsWithSubmittedKRS(selectedYear);
      setStudents(data);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  // Logic Filtering & Pagination
  const filteredData = useMemo(() => {
    if (!searchQuery) return students;
    const lower = searchQuery.toLowerCase();
    return students.filter(s => 
        s.nama.toLowerCase().includes(lower) || 
        s.nim.toLowerCase().includes(lower) ||
        s.study_program?.nama?.toLowerCase().includes(lower)
    );
  }, [students, searchQuery]);

  const pendingCount = useMemo(() => {
    return students.filter(s => s.status === 'SUBMITTED').length;
  }, [students]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === ACTIONS ===
  const openDetail = async (mhs: any) => {
    setSelectedStudent(mhs);
    setIsDetailOpen(true);
    setStudentKRS([]);
    setIsLoadingDetail(true);
    try {
        const krs = await getKRSByStudent(mhs.id, selectedYear);
        setStudentKRS(krs);
    } catch (e) { showError("Error", "Gagal load detail"); }
    finally { setIsLoadingDetail(false); }
  };

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedStudent) return;
    const toastId = showLoading(action === "APPROVE" ? "Menyetujui KRS..." : "Menolak KRS...");
    setIsProcessing(true);
    try {
        if (action === "APPROVE") await approveKRS(selectedStudent.id, selectedYear);
        else await rejectKRS(selectedStudent.id, selectedYear);
        
        successAction("KRS", "update", toastId);
        setIsDetailOpen(false);
        fetchStudents();
    } catch (e: any) { showError("Gagal", e.message, toastId); }
    finally { setIsProcessing(false); }
  };

  // Definisi Kolom DataTable
  const columns: Column<any>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>,
    },
    {
      header: "Mahasiswa",
      render: (row) => (
        <div>
            <p className="font-medium text-slate-900 text-sm">{row.nama}</p>
            <p className="text-xs text-slate-500 font-mono">{row.nim}</p>
        </div>
      ),
    },
    {
        header: "Program Studi",
        render: (row) => (
            <span className="text-sm text-slate-700">
                {row.study_program?.nama} ({row.study_program?.jenjang})
            </span>
        )
    },
    {
        header: "Semester",
        className: "text-center w-[80px]",
        render: (row) => (
            <div className="text-center font-medium text-slate-700">
                {row.semester}
            </div>
        )
    },
    {
        header: "Status",
        className: "text-center w-[120px]",
        render: (row) => (
            <div className="flex justify-center scale-90">
                <StatusBadge status={row.status} />
            </div>
        )
    },
    {
        header: "Aksi",
        className: "text-center w-[100px]", 
        render: (row) => {
            const isLocked = row.status !== 'SUBMITTED';

            if (isLocked) {
                return (
                    <div className="flex justify-center">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 cursor-not-allowed hover:bg-transparent hover:text-slate-500"
                            title="Sudah Diproses"
                            onClick={(e) => e.preventDefault()}
                        >
                            <Lock className="w-4 h-4" />
                        </Button>
                    </div>
                );
            }

            return (
                <div className="flex justify-center">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDetail(row)} 
                        className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                        title="Tinjau KRS"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            );
        }
    }
  ];

  const totalSKS = studentKRS.reduce((acc, curr) => acc + (curr.course?.sks || 0), 0);
  const currentAcademicYearName = academicYears.find(y => y.id === selectedYear)?.nama;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-6">
      
      {/* --- Section Filter & Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Card Filter */}
        <Card className="md:col-span-8 border-none shadow-md text-white overflow-hidden relative bg-slate-900">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-white"><BookOpen size={150} /></div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
            
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                {isLoading ? (
                    <div className="flex flex-col justify-between h-full gap-6">
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-32 bg-white/20" />
                             <Skeleton className="h-8 w-64 bg-white/20" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-[240px] bg-white/20" />
                            <Skeleton className="h-10 w-32 bg-white/20 hidden sm:block" />
                        </div>
                    </div>
                ) : (
                    <>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-200 border-0 backdrop-blur-sm">Admin Panel</Badge>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Validasi KRS Mahasiswa</h2>
                            <p className="text-slate-400 text-sm mt-1">Kelola persetujuan rencana studi mahasiswa untuk semester aktif.</p>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Select value={selectedYear} onValueChange={(val) => { setSelectedYear(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[240px] h-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 focus:ring-indigo-500/50 hover:bg-white/10 transition-colors">
                                <SelectValue placeholder="Pilih Tahun Akademik" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((ay) => (
                                <SelectItem key={ay.id} value={ay.id}>TA {ay.nama} - {ay.semester}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-md border border-white/10 text-slate-300">
                            <CalendarDays className="w-4 h-4" />
                            <span className="text-sm font-medium">Semester {academicYears.find(y => y.id === selectedYear)?.semester || '-'}</span>
                        </div>
                    </div>
                    </>
                )}
            </CardContent>
        </Card>

        {/* Card Summary Stats */}
        <Card className="md:col-span-4 border-none shadow-md text-slate-900 overflow-hidden relative bg-white">
            <div className="absolute -bottom-6 -right-6 opacity-5 rotate-12"><ListTodo size={140} /></div>
            <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                 {isLoading ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-lg" /><Skeleton className="h-4 w-24" /></div>
                        <div className="space-y-2"><Skeleton className="h-10 w-16" /><Skeleton className="h-3 w-32" /></div>
                    </div>
                 ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 rounded-xl"><Users className="h-5 w-5 text-indigo-600" /></div>
                                <span className="text-sm font-semibold text-slate-600">Antrean Validasi</span>
                             </div>
                             <Badge className={pendingCount > 0 ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : "bg-green-100 text-green-700 hover:bg-green-100"}>
                                {pendingCount > 0 ? "Perlu Tindakan" : "Selesai"}
                             </Badge>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold tracking-tight text-slate-900">{pendingCount}</span>
                                <span className="text-sm font-medium text-slate-500">Mahasiswa</span>
                            </div>
                            <p className="text-slate-400 text-xs mt-2">Menunggu persetujuan KRS untuk Tahun Akademik {currentAcademicYearName}.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full justify-between group border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                            onClick={() => document.getElementById('krs-table')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Lihat Daftar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                 )}
            </CardContent>
        </Card>
      </div>

      {/* --- Section Table --- */}
      <Card id="krs-table" className="border-none shadow-sm ring-1 ring-gray-200 bg-white">
        <CardContent className="p-6">
            <DataTable
                data={currentData}
                columns={columns}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                searchPlaceholder="Cari Nama, NIM, atau Prodi..."
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredData.length}
            />
        </CardContent>
      </Card>

      {/* --- Detail Modal Redesigned --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="p-0 gap-0 w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden bg-slate-50/50 flex flex-col border-0 shadow-2xl">
            {/* Header / Hero Section */}
            <div className="relative bg-slate-900 text-white shrink-0 overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                    <GraduationCap size={200} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent pointer-events-none" />

                <div className="relative z-10 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                        {/* Student Info - No Profile Picture */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="border-white/20 text-indigo-100 bg-indigo-500/20 hover:bg-indigo-500/20 backdrop-blur-sm">
                                    Semester {selectedStudent?.semester}
                                </Badge>
                                <span className="text-white/40 text-sm">|</span>
                                <span className="text-sm font-mono text-white/70">{selectedStudent?.nim}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">{selectedStudent?.nama}</h2>
                            <div className="text-sm text-slate-300 mt-1">
                                {selectedStudent?.study_program?.jenjang} {selectedStudent?.study_program?.nama}
                            </div>
                        </div>

                        {/* Quick Stats in Header */}
                        <div className="flex gap-3 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-none bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 px-4 text-center min-w-[100px]">
                                <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">Total SKS</p>
                                <p className={cn(
                                    "text-2xl font-bold", 
                                    totalSKS > 24 ? "text-red-300" : "text-white"
                                )}>{totalSKS}</p>
                            </div>
                             <div className="flex-1 sm:flex-none bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 px-4 text-center min-w-[100px]">
                                <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">Matkul</p>
                                <p className="text-2xl font-bold text-white">{studentKRS.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-white relative">
                <div className="p-6 pb-24 sm:pb-6 space-y-6">
                    
                    {/* Warning if SKS overload */}
                    {totalSKS > 24 && (
                        <div className="flex gap-3 p-4 rounded-xl bg-red-50 text-red-900 border border-red-100 items-start shadow-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm">Peringatan Kelebihan SKS</p>
                                <p className="text-sm opacity-90 mt-1">
                                    Mahasiswa ini mengambil <strong>{totalSKS} SKS</strong>, yang melebihi batas wajar (biasanya 24 SKS). Mohon tinjau dengan seksama sebelum menyetujui.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                                <h4 className="font-semibold text-slate-800 text-sm">Rencana Studi Diajukan</h4>
                            </div>
                            <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded border">
                                TA {currentAcademicYearName}
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-white hover:bg-white border-b-slate-100">
                                        <TableHead className="w-[50px] text-center font-semibold text-slate-600 text-xs uppercase tracking-wider bg-slate-50/50">No</TableHead>
                                        <TableHead className="w-[100px] font-semibold text-slate-600 text-xs uppercase tracking-wider bg-slate-50/50">Kode</TableHead>
                                        <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider bg-slate-50/50">Mata Kuliah</TableHead>
                                        <TableHead className="text-center w-[80px] font-semibold text-slate-600 text-xs uppercase tracking-wider bg-slate-50/50">SKS</TableHead>
                                        <TableHead className="text-center w-[80px] font-semibold text-slate-600 text-xs uppercase tracking-wider bg-slate-50/50">Smt</TableHead>
                                        <TableHead className="text-center w-[140px] font-semibold text-slate-600 text-xs uppercase tracking-wider bg-slate-50/50">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingDetail ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : studentKRS.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                    <FileText className="w-10 h-10 opacity-20" />
                                                    <p>Tidak ada data mata kuliah</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        studentKRS.map((k, idx) => (
                                        <TableRow key={k.id} className="hover:bg-slate-50 transition-colors group">
                                            <TableCell className="text-center text-xs text-slate-400">{idx + 1}</TableCell>
                                            <TableCell className="font-mono text-xs font-medium text-slate-600">{k.course?.kode}</TableCell>
                                            <TableCell className="font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">{k.course?.matkul}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-0 font-mono font-normal">
                                                    {k.course?.sks}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-xs text-muted-foreground">{k.course?.smt_default}</TableCell>
                                            <TableCell className="text-center">
                                                <StatusBadge status={k.status} />
                                            </TableCell>
                                        </TableRow>
                                    )))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end items-center gap-6 text-sm">
                            <span className="text-slate-500">Total Beban Studi:</span>
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-slate-900 text-lg">{totalSKS}</span>
                                <span className="text-xs text-slate-500">SKS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <DialogFooter className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20">
                <div className="flex w-full flex-col-reverse sm:flex-row justify-between items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsDetailOpen(false)}
                        className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            className="flex-1 sm:flex-none border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300" 
                            onClick={() => handleAction("REJECT")} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? "..." : <><XCircle className="w-4 h-4 mr-2" /> Tolak Ajuan</>}
                        </Button>
                        <Button 
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" 
                            onClick={() => handleAction("APPROVE")} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Memproses..." : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui KRS
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}