"use client";

import React, { useState, useEffect } from "react";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Eye, XCircle, Search, User, CheckCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge"; // Import dari folder yang sama

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
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                        <CheckCircle className="h-5 w-5 text-slate-300" />
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validasi Kartu Rencana Studi</DialogTitle>
            <DialogDescription>Tinjau detail mata kuliah yang diajukan mahasiswa.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
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