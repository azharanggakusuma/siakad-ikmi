"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  CheckCircle2, Eye, XCircle, GraduationCap, CalendarDays, AlertCircle, ListTodo, BookOpen, Users
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { Skeleton } from "@/components/ui/skeleton";

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
        render: () => (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                Submitted
            </Badge>
        )
    },
    {
        header: "Aksi",
        className: "text-center w-[100px]", 
        render: (row) => (
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
        )
    }
  ];

  const totalSKS = studentKRS.reduce((acc, curr) => acc + (curr.course?.sks || 0), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-6">
      
      {/* --- Section Filter & Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Card Filter: Style Gradient Slate (Tetap) */}
        <Card className="md:col-span-8 border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-slate-700 to-slate-800">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <BookOpen size={120} />
            </div>
            
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white/80 font-medium text-sm mb-1">Panel Validasi</p>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Validasi KRS Mahasiswa
                        </h2>
                    </div>
                </div>
                
                <div className="mt-6 flex items-center gap-4">
                    <Select value={selectedYear} onValueChange={(val) => { setSelectedYear(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[240px] h-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-0">
                            <SelectValue placeholder="Pilih Tahun Akademik" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((ay) => (
                            <SelectItem key={ay.id} value={ay.id}>
                                {ay.nama} - {ay.semester}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md border border-white/10">
                         <CalendarDays className="w-4 h-4 text-white/80" />
                         <span className="text-sm font-medium">Filter Data</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card Summary Stats: UPDATE WARNA SOFT (Teal/Emerald) */}
        <Card className="md:col-span-4 border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-teal-600 to-emerald-600">
            {/* Dekorasi Background */}
            <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12">
                <ListTodo size={140} />
            </div>

            <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Users className="h-5 w-5 text-teal-50" />
                         </div>
                         <span className="text-sm font-medium text-teal-50">Antrean Validasi</span>
                    </div>
                    
                    <div>
                        <div className="text-4xl font-extrabold tracking-tight">
                            {isLoading ? "..." : filteredData.length}
                            <span className="text-lg font-normal text-teal-100 ml-2">Mahasiswa</span>
                        </div>
                        <p className="text-teal-50/80 text-xs mt-1">Menunggu persetujuan KRS Anda.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* --- Section Table --- */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
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

      {/* --- Detail Modal --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b bg-white z-10">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <DialogTitle className="text-xl font-bold text-slate-800">Validasi Rencana Studi</DialogTitle>
                    <DialogDescription className="mt-1">
                        Tinjau mata kuliah yang diajukan oleh mahasiswa.
                    </DialogDescription>
                </div>
                <Badge variant="outline" className="py-1 px-3 bg-slate-50 text-slate-600 border-slate-200 gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    TA {academicYears.find(y => y.id === selectedYear)?.nama}
                </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
            <div className="space-y-6">
                {/* Student Info Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mahasiswa</p>
                            <h3 className="font-bold text-lg text-slate-900">{selectedStudent?.nama}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                <span className="font-mono bg-slate-100 px-1.5 rounded">{selectedStudent?.nim}</span>
                                <span>•</span>
                                <span>{selectedStudent?.study_program?.jenjang} {selectedStudent?.study_program?.nama}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 pl-6 md:border-l border-slate-100">
                         <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Mata Kuliah</p>
                            <p className="text-2xl font-bold text-slate-800">{studentKRS.length}</p>
                         </div>
                         <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Total SKS</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-indigo-600">{totalSKS}</span>
                                <span className="text-xs text-slate-400 font-medium self-end mb-1.5">SKS</span>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Course List Detail */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h4 className="font-semibold text-slate-800 text-sm">Daftar Mata Kuliah</h4>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white hover:bg-white border-slate-100">
                                <TableHead className="w-[100px] font-semibold text-slate-700">Kode</TableHead>
                                <TableHead className="font-semibold text-slate-700">Mata Kuliah</TableHead>
                                <TableHead className="text-center w-[80px] font-semibold text-slate-700">SKS</TableHead>
                                <TableHead className="text-center w-[80px] font-semibold text-slate-700">Smt</TableHead>
                                <TableHead className="text-center w-[120px] font-semibold text-slate-700">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingDetail ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : studentKRS.map((k) => (
                                <TableRow key={k.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-mono text-xs text-slate-500">{k.course?.kode}</TableCell>
                                    <TableCell className="font-medium text-slate-900">{k.course?.matkul}</TableCell>
                                    <TableCell className="text-center text-slate-600">{k.course?.sks}</TableCell>
                                    <TableCell className="text-center text-muted-foreground">{k.course?.smt_default}</TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={k.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Warning/Note */}
                <div className="flex gap-3 p-4 rounded-lg bg-orange-50 text-orange-800 text-sm border border-orange-100 items-start">
                    <AlertCircle className="w-5 h-5 shrink-0 text-orange-600" />
                    <div>
                        <p className="font-semibold">Konfirmasi Validasi</p>
                        <p className="opacity-90 mt-0.5">
                            Pastikan total SKS tidak melebihi batas maksimal. Tindakan ini akan memperbarui status KRS mahasiswa secara permanen.
                        </p>
                    </div>
                </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-white gap-3 sm:gap-0">
            <div className="flex w-full justify-between items-center">
                <Button 
                    variant="ghost" 
                    onClick={() => setIsDetailOpen(false)}
                    className="text-slate-500 hover:text-slate-700"
                >
                    Batal
                </Button>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300" 
                        onClick={() => handleAction("REJECT")} 
                        disabled={isProcessing}
                    >
                        {isProcessing ? "..." : <><XCircle className="w-4 h-4 mr-2" /> Tolak</>}
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]" 
                        onClick={() => handleAction("APPROVE")} 
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Memproses..." : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui
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