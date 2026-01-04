"use client";

import React, { useState, useEffect } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  CheckCircle2, Eye, XCircle, Search, User, CheckCircle, 
  ListTodo, GraduationCap, CalendarDays, AlertCircle 
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Separator } from "@/components/ui/separator";

import { 
  getStudentsWithSubmittedKRS, getKRSByStudent, approveKRS, rejectKRS 
} from "@/app/actions/krs";
import { getAcademicYears } from "@/app/actions/academic-years";
import { AcademicYear, KRS } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminKRSValidationView() {
  const { successAction, showError, showLoading } = useToastMessage();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if(!searchQuery) {
        setFilteredStudents(students);
    } else {
        const lower = searchQuery.toLowerCase();
        const filtered = students.filter(s => 
            s.nama.toLowerCase().includes(lower) || 
            s.nim.toLowerCase().includes(lower) ||
            s.study_program?.nama?.toLowerCase().includes(lower)
        );
        setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentsWithSubmittedKRS(selectedYear);
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

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

  // Helper untuk statistik
  const totalSKS = studentKRS.reduce((acc, curr) => acc + (curr.course?.sks || 0), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-6">
      
      {/* --- Section Filter & Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Card Filter */}
        <Card className="md:col-span-8 shadow-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-800">Filter Data</CardTitle>
                <CardDescription>Pilih tahun akademik untuk melihat pengajuan.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                    <div className="flex-1 w-full space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun Akademik</label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((ay) => (
                                <SelectItem key={ay.id} value={ay.id}>
                                    {ay.nama} - {ay.semester} {ay.is_active && "(Aktif)"}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-[2] w-full space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pencarian</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Cari Nama, NIM, atau Prodi..." 
                                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card Summary Stats */}
        <Card className="md:col-span-4 bg-indigo-600 text-white border-indigo-600 shadow-md flex flex-col justify-center">
            <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 opacity-90">
                        <ListTodo className="h-4 w-4" />
                        <span className="text-sm font-medium">Antrean Validasi</span>
                    </div>
                    <div className="text-4xl font-bold tracking-tight">
                        {isLoading ? "..." : filteredStudents.length}
                    </div>
                    <p className="text-indigo-100 text-sm">Mahasiswa menunggu persetujuan</p>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* --- Section Table --- */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="p-1 bg-slate-50/50 border-b border-slate-100"></div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[60px] text-center font-semibold text-slate-600">No</TableHead>
                <TableHead className="w-[250px] font-semibold text-slate-600">Mahasiswa</TableHead>
                <TableHead className="font-semibold text-slate-600">Program Studi</TableHead>
                <TableHead className="text-center w-[120px] font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-600">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                ))
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                <CheckCircle className="h-8 w-8 text-green-500/50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-slate-900">Semua Beres!</p>
                                <p className="text-sm text-slate-500">Tidak ada pengajuan KRS yang perlu divalidasi saat ini.</p>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((mhs, i) => (
                  <TableRow key={mhs.id} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="text-center text-muted-foreground font-mono text-xs">{i + 1}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">{mhs.nama}</p>
                                <p className="text-xs text-slate-500 font-mono">{mhs.nim}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-700">{mhs.study_program?.nama}</span>
                            <span className="text-xs text-slate-400">{mhs.study_program?.jenjang}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                            Submitted
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button size="sm" onClick={() => openDetail(mhs)} 
                        className="h-8 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all">
                        <Eye className="w-3.5 h-3.5 mr-2" /> Tinjau
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
                    Tahun Akademik {academicYears.find(y => y.id === selectedYear)?.nama}
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

                {/* Course List */}
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
                
                {/* Warning/Note (Optional) */}
                <div className="flex gap-3 p-4 rounded-lg bg-orange-50 text-orange-800 text-sm border border-orange-100 items-start">
                    <AlertCircle className="w-5 h-5 shrink-0 text-orange-600" />
                    <div>
                        <p className="font-semibold">Konfirmasi Validasi</p>
                        <p className="opacity-90 mt-0.5">
                            Pastikan total SKS tidak melebihi batas maksimal yang diizinkan untuk mahasiswa ini (biasanya 24 SKS).
                            Tindakan ini akan memperbarui status KRS mahasiswa secara permanen.
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