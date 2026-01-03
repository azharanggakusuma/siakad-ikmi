"use client";

import React, { useState, useEffect } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, PlusCircle, Trash2, Send, Lock, AlertTriangle } from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { StatusBadge } from "./StatusBadge"; // Import dari folder yang sama

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
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

  const studentId = user.student_id;

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

  const totalSKS = offerings.filter(c => c.is_taken).reduce((acc, curr) => acc + curr.sks, 0);
  const hasDraft = offerings.some(c => c.is_taken && c.krs_status === 'DRAFT');

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
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-white">
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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

      <ConfirmModal isOpen={isDeleteOpen} onClose={setIsDeleteOpen} onConfirm={confirmBatal}
        title="Batalkan Mata Kuliah?" description={`Apakah Anda yakin ingin membatalkan pengambilan mata kuliah ${itemToDelete?.name}?`} confirmLabel="Ya, Batalkan" variant="destructive" />

      <ConfirmModal isOpen={isSubmitOpen} onClose={setIsSubmitOpen} onConfirm={confirmSubmit}
        title="Ajukan KRS?" description="Setelah diajukan, KRS akan dikunci dan menunggu persetujuan Dosen Wali." confirmLabel="Ajukan Sekarang" variant="default" />
    </div>
  );
}