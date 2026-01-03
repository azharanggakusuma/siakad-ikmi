"use client";

import React, { useState, useEffect } from "react";
import { useLayout } from "@/app/context/LayoutContext";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  CheckCircle2, PlusCircle, Trash2, Send, Lock, AlertTriangle, 
  Eye, XCircle, Search, User, FileText, Clock 
} from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";

// Actions & Types
import { 
  getStudentCourseOfferings, createKRS, deleteKRS, submitKRS, 
  getStudentsWithSubmittedKRS, getKRSByStudent, approveKRS, rejectKRS,
  CourseOffering 
} from "@/app/actions/krs";
import { getAcademicYears } from "@/app/actions/academic-years";
import { AcademicYear, KRS } from "@/lib/types";

// ============================================================================
// MAIN PAGE COMPONENT (SWITCHER)
// ============================================================================
export default function KRSPage() {
  const { user } = useLayout();

  // Loading State
  if (!user) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  // Render View based on Role
  return user.role === "mahasiswa" ? <StudentKRSView user={user} /> : <AdminKRSValidationView />;
}

// ============================================================================
// HELPER: STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400">-</span>;

  let styles = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200";
  let icon = <FileText className="mr-1.5 h-3 w-3" />;
  let label = "Draft";

  switch (status) {
    case "APPROVED":
      styles = "bg-green-600 hover:bg-green-700 text-white border-transparent";
      icon = <CheckCircle2 className="mr-1.5 h-3 w-3" />;
      label = "Disetujui";
      break;
    case "SUBMITTED":
      styles = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";
      icon = <Clock className="mr-1.5 h-3 w-3" />;
      label = "Diajukan";
      break;
    case "REJECTED":
      styles = "bg-red-50 text-red-700 hover:bg-red-100 border-red-200";
      icon = <XCircle className="mr-1.5 h-3 w-3" />;
      label = "Ditolak";
      break;
  }

  return (
    <Badge variant="outline" className={`font-medium px-2.5 py-0.5 ${styles}`}>
      {icon} {label}
    </Badge>
  );
}

// ============================================================================
// VIEW 1: MAHASISWA (Belanja SKS)
// ============================================================================
function StudentKRSView({ user }: { user: any }) {
  const { successAction, showError, showLoading } = useToastMessage();

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [studentSemester, setStudentSemester] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

  const studentId = user.student_id;

  // 1. Init Data
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

  // 2. Fetch Offerings
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

  // Logic SKS
  const totalSKS = offerings.filter(c => c.is_taken).reduce((acc, curr) => acc + curr.sks, 0);
  const hasDraft = offerings.some(c => c.is_taken && c.krs_status === 'DRAFT');

  // Handlers
  const handleAmbil = async (course: CourseOffering) => {
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

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Kartu Rencana Studi" breadcrumb={["Akademik", "KRS"]} />

      {/* HEADER CARD */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-white">
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Total SKS */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total SKS Diambil</p>
                        <div className="flex items-baseline gap-1">
                          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{totalSKS}</h2>
                          <span className="text-sm font-medium text-slate-500">SKS</span>
                        </div>
                    </div>
                </div>

                {/* Year Filter */}
                <div className="w-full md:w-auto">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-full md:w-[260px] h-10">
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
                </div>
            </div>

            {/* Notification Banner */}
            {hasDraft && (
                 <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-full text-amber-700 shrink-0">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-900 text-sm">Status Draft</h4>
                          <p className="text-sm text-amber-700/90 mt-0.5">
                            Mata kuliah Anda belum diajukan. Silakan klik tombol ajukan agar dapat divalidasi oleh Dosen Wali.
                          </p>
                        </div>
                    </div>
                    <Button onClick={() => setIsSubmitOpen(true)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-sm border-0">
                        <Send className="w-4 h-4 mr-2" /> Ajukan Sekarang
                    </Button>
                 </div>
            )}
        </CardContent>
      </Card>

      {/* COURSE TABLE */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardHeader className="bg-slate-50/40 border-b border-slate-100 py-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">Paket Semester {studentSemester}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Daftar mata kuliah yang ditawarkan sesuai semester Anda.</p>
              </div>
              <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 px-3 py-1">
                Semester {studentSemester}
              </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-[60px] text-center font-medium">#</TableHead>
                        <TableHead className="w-[120px] font-medium">Kode</TableHead>
                        <TableHead className="font-medium">Mata Kuliah</TableHead>
                        <TableHead className="text-center w-[100px] font-medium">SKS</TableHead>
                        <TableHead className="text-center w-[160px] font-medium">Status</TableHead>
                        <TableHead className="text-center w-[140px] font-medium">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Memuat data...</TableCell></TableRow>
                    ) : offerings.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Tidak ada mata kuliah ditawarkan.</TableCell></TableRow>
                    ) : (
                        offerings.map((c, i) => (
                            <TableRow key={c.id} className={`group transition-colors ${c.is_taken ? "bg-slate-50/60" : "hover:bg-slate-50"}`}>
                                <TableCell className="text-center text-muted-foreground font-medium">{i + 1}</TableCell>
                                <TableCell className="font-mono text-xs text-slate-600">{c.kode}</TableCell>
                                <TableCell>
                                    <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                                      {c.matkul}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{c.kategori || "Reguler"}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary" className="font-mono text-xs bg-white border border-slate-200 text-slate-600">
                                    {c.sks} SKS
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    {c.is_taken ? (
                                        <div className="flex justify-center">
                                          <StatusBadge status={c.krs_status} />
                                        </div>
                                    ) : <span className="text-xs text-slate-400 italic">Belum Diambil</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                    {c.is_taken ? (
                                        <Button variant="ghost" size="sm" className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3"
                                            disabled={c.krs_status !== 'DRAFT'} 
                                            onClick={() => { setItemToDelete({ id: c.krs_id!, name: c.matkul }); setIsDeleteOpen(true); }}>
                                            {c.krs_status !== 'DRAFT' ? 
                                              <span className="flex items-center text-slate-400 text-xs"><Lock className="w-3.5 h-3.5 mr-1" /> Terkunci</span> : 
                                              <span className="flex items-center"><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Batal</span>
                                            }
                                        </Button>
                                    ) : (
                                        <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-0 px-4" onClick={() => handleAmbil(c)}>
                                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Ambil
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* CONFIRM MODALS */}
      <ConfirmModal isOpen={isDeleteOpen} onClose={setIsDeleteOpen} onConfirm={confirmBatal}
        title="Batalkan Mata Kuliah?" description={`Apakah Anda yakin ingin membatalkan pengambilan mata kuliah ${itemToDelete?.name}?`} confirmLabel="Ya, Batalkan" variant="destructive" />

      <ConfirmModal isOpen={isSubmitOpen} onClose={setIsSubmitOpen} onConfirm={confirmSubmit}
        title="Ajukan KRS?" description="Setelah diajukan, KRS akan dikunci dan menunggu persetujuan Dosen Wali." confirmLabel="Ajukan Sekarang" variant="default" />
    </div>
  );
}

// ============================================================================
// VIEW 2: ADMIN & DOSEN (Validasi KRS)
// ============================================================================
function AdminKRSValidationView() {
  const { successAction, showError, showLoading } = useToastMessage();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentKRS, setStudentKRS] = useState<KRS[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Client-side Filtering
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
    try {
        const krs = await getKRSByStudent(mhs.id, selectedYear);
        setStudentKRS(krs);
    } catch (e) { showError("Error", "Gagal load detail"); }
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

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Validasi KRS" breadcrumb={["Akademik", "Validasi KRS"]} />

      {/* SEARCH & FILTER CARD */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             {/* Filter Tahun */}
            <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Tahun Akademik:</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full md:w-[240px] h-9">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {academicYears.map((ay) => (
                        <SelectItem key={ay.id} value={ay.id}>{ay.nama} - {ay.semester} {ay.is_active ? "(Aktif)" : ""}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Cari Nama, NIM, atau Prodi..." 
                    className="pl-9 h-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ANTREAN TABLE */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardHeader className="border-b bg-slate-50/40 py-4 px-6">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-1.5 rounded-md text-indigo-600">
                  <User className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-800">Antrean Validasi</CardTitle>
                <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 border-slate-200">
                  {filteredStudents.length} Mahasiswa
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[50px] text-center font-medium">#</TableHead>
                <TableHead className="w-[140px] font-medium">NIM</TableHead>
                <TableHead className="font-medium">Nama Mahasiswa</TableHead>
                <TableHead className="font-medium">Program Studi</TableHead>
                <TableHead className="text-center w-[120px] font-medium">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Memuat data pengajuan...</TableCell></TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-slate-300" />
                      </div>
                      <p>Tidak ada pengajuan KRS baru.</p>
                    </div>
                </TableCell></TableRow>
              ) : (
                filteredStudents.map((mhs, i) => (
                  <TableRow key={mhs.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-mono text-slate-600 font-medium">{mhs.nim}</TableCell>
                    <TableCell className="font-medium text-slate-900">{mhs.nama}</TableCell>
                    <TableCell className="text-slate-600">{mhs.study_program?.jenjang} - {mhs.study_program?.nama}</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" onClick={() => openDetail(mhs)} 
                        className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm font-medium">
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DETAIL MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validasi Kartu Rencana Studi</DialogTitle>
            <DialogDescription>Tinjau detail mata kuliah yang diajukan mahasiswa.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Info Box */}
            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col sm:flex-row justify-between gap-6 shadow-sm">
               <div>
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">Mahasiswa</p>
                  <p className="font-bold text-slate-800 text-lg">{selectedStudent?.nama}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-mono text-xs bg-white text-slate-600">{selectedStudent?.nim}</Badge>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-sm text-slate-600">{selectedStudent?.study_program?.nama}</span>
                  </div>
               </div>
               <div className="text-right flex flex-col items-end">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total Pengambilan</p>
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-slate-500 font-medium">{studentKRS.length} Matkul</span>
                     <Badge className="bg-indigo-600 hover:bg-indigo-700 text-sm px-3 py-1 h-8">
                        {studentKRS.reduce((acc, curr) => acc + (curr.course?.sks || 0), 0)} SKS
                     </Badge>
                  </div>
               </div>
            </div>

            {/* Table Detail */}
            <div className="border rounded-lg overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80 border-slate-100 hover:bg-slate-50/80">
                            <TableHead className="w-[100px] font-semibold text-slate-700">Kode</TableHead>
                            <TableHead className="font-semibold text-slate-700">Mata Kuliah</TableHead>
                            <TableHead className="text-center w-[80px] font-semibold text-slate-700">SKS</TableHead>
                            <TableHead className="text-center w-[80px] font-semibold text-slate-700">Smt</TableHead>
                            <TableHead className="text-center w-[120px] font-semibold text-slate-700">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {studentKRS.map((k) => (
                            <TableRow key={k.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-mono text-xs text-slate-600">{k.course?.kode}</TableCell>
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
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t mt-2">
            <Button 
                variant="outline" 
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 font-medium" 
                onClick={() => handleAction("REJECT")} 
                disabled={isProcessing}
            >
                <XCircle className="w-4 h-4 mr-2" /> Tolak Pengajuan
            </Button>
            <Button 
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm min-w-[160px] font-medium border-0" 
                onClick={() => handleAction("APPROVE")} 
                disabled={isProcessing}
            >
                {isProcessing ? "Memproses..." : (
                    <>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui (Approve)
                    </>
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}