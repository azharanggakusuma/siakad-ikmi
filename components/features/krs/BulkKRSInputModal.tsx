'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToastMessage } from '@/hooks/use-toast-message';
import { getStudentsWithoutKRS, createBulkKRS, getCoursesForAcademicYear } from '@/app/actions/krs-bulk';
import { getCourses } from '@/app/actions/courses';
import { Course } from '@/lib/types';
import { Loader2, UserPlus, User, CalendarDays, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { DataTable, type Column } from "@/components/ui/data-table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BulkKRSInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAcademicYearId: string;
  availableAcademicYears: any[];
}

export default function BulkKRSInputModal({
  isOpen,
  onClose,
  initialAcademicYearId,
  availableAcademicYears
}: BulkKRSInputModalProps) {
  const { showLoading, successAction, showError } = useToastMessage();

  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetSemester, setTargetSemester] = useState<number | null>(null);
  
  // Selection State (Period)
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(initialAcademicYearId);

  // Data State
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  
  // Selection State (Items)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  
  // Filter & Pagination State (Students)
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const itemsPerPage = 8; 

  // Filter & Pagination State (Courses)
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);

  // Initial Sync
  useEffect(() => {
    if (isOpen) {
      if (initialAcademicYearId && !selectedAcademicYearId) {
        setSelectedAcademicYearId(initialAcademicYearId);
      }
      // Reset Wizard on open
      setStep(1);
      setTargetSemester(null);
      setSelectedStudentIds(new Set());
      setSelectedCourseIds(new Set());
    }
  }, [isOpen, initialAcademicYearId]);

  // Fetch Data when Year Changes (Background)
  useEffect(() => {
    if (isOpen && selectedAcademicYearId) {
      loadData(selectedAcademicYearId);
    }
  }, [isOpen, selectedAcademicYearId]);

  const loadData = async (yearId: string) => {
    setLoadingMsg('Memuat data...');
    try {
      const [fetchedStudents, fetchedCourses] = await Promise.all([
        getStudentsWithoutKRS(yearId),
        getCoursesForAcademicYear(yearId)
      ]);
      setStudents(fetchedStudents);
      setCourses(fetchedCourses);
    } catch (error) {
      console.error(error);
      showError('Gagal memuat data', 'Terjadi kesalahan saat mengambil data.');
    } finally {
      setLoadingMsg('');
    }
  };

  // --- WIZARD HELPER LOGIC ---
  const currentAcademicYear = availableAcademicYears.find(y => y.id === selectedAcademicYearId);
  const isGanjil = currentAcademicYear?.semester.toLowerCase().includes('ganjil');
  
  // Generate valid semesters based on AY parity
  const availableSemesters = useMemo(() => {
      const semesterOptions = isGanjil ? [1, 3, 5, 7] : [2, 4, 6, 8];
      return semesterOptions;
  }, [isGanjil]);

  // Reset semester selection if AY changes and parity mismatches
  useEffect(() => {
    if (targetSemester && !availableSemesters.includes(targetSemester)) {
        setTargetSemester(null);
    }
  }, [availableSemesters, targetSemester]);

  // --- DATA FILTERING LOGIC (Applied only in Step 2 & 3) ---
  const filteredStudents = useMemo(() => {
    // Client-side filter: Match Student Semester to Target Semester
    let base = students;
    if (targetSemester) {
        base = base.filter(s => s.semester === targetSemester);
    }
    return base.filter(s => 
      s.nama.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.nim.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch, targetSemester]);

  const filteredCourses = useMemo(() => {
    // Client-side filter: Match Course Default Semester to Target Semester
    let base = courses;
    if (targetSemester) {
        base = base.filter(c => c.smt_default === targetSemester);
    }
    return base.filter(c => 
      c.matkul.toLowerCase().includes(courseSearch.toLowerCase()) || 
      c.kode.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courses, courseSearch, targetSemester]);


  // --- CROSS FILTERING (Reuse existing logic) ---
  const hasMbkmCourseSelected = useMemo(() => {
    return Array.from(selectedCourseIds).some(id => {
        const c = courses.find(course => course.id === id);
        return c?.kategori === 'MBKM';
    });
  }, [selectedCourseIds, courses]);

  const hasRegularStudentSelected = useMemo(() => {
    return Array.from(selectedStudentIds).some(id => {
        const s = students.find(student => student.id === id);
        return !s?.is_mbkm;
    });
  }, [selectedStudentIds, students]);


  // --- TABLE PAGINATION LOGIC ---
  const studentTotalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const studentStartIndex = (studentPage - 1) * itemsPerPage;
  const studentEndIndex = studentStartIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(studentStartIndex, studentEndIndex);

  const courseTotalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const courseStartIndex = (coursePage - 1) * itemsPerPage;
  const courseEndIndex = courseStartIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(courseStartIndex, courseEndIndex);

  // --- TABLE HANDLERS ---
  const toggleStudent = (id: string, allSelected: boolean = false) => {
    const newSet = new Set(selectedStudentIds);
    if(allSelected) {
        // Logic for bulk toggle is handled in render prop usually, but here helper
    }
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStudentIds(newSet);
  };

  const toggleCourse = (id: string) => {
    const newSet = new Set(selectedCourseIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCourseIds(newSet);
  };

  // --- COLUMNS DEFINITIONS ---
  const studentColumns: Column<any>[] = [
    {
        header: () => (
            <Checkbox 
                checked={
                    currentStudents.length > 0 && 
                    currentStudents.filter(s => !(hasMbkmCourseSelected && !s.is_mbkm)).every(s => selectedStudentIds.has(s.id))
                }
                onCheckedChange={(checked) => {
                    const newSet = new Set(selectedStudentIds);
                    currentStudents.forEach(s => {
                         if (hasMbkmCourseSelected && !s.is_mbkm) return;
                        if (checked) newSet.add(s.id);
                        else newSet.delete(s.id);
                    });
                    setSelectedStudentIds(newSet);
                }}
                disabled={hasMbkmCourseSelected && currentStudents.every(s => !s.is_mbkm)}
            />
        ),
        className: "w-[40px] text-center",
        render: (row) => {
            const isDisabled = hasMbkmCourseSelected && !row.is_mbkm;
            return (
                 <Checkbox 
                    checked={selectedStudentIds.has(row.id)}
                    onCheckedChange={() => toggleStudent(row.id)}
                    disabled={isDisabled}
                    className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                />
            );
        }
    },
    { header: "Mahasiswa", render: (row) => (
        <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                {row.avatar_url ? <Image src={row.avatar_url} alt={row.nama} fill className="object-cover" /> : <User className="h-4 w-4 text-slate-400" />}
            </div>
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                     <span className="font-semibold text-slate-800 text-sm">{row.nama}</span>
                     {row.is_mbkm && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-emerald-500 text-emerald-600">MBKM</Badge>}
                </div>
                <span className="text-xs text-muted-foreground font-mono">{row.nim}</span>
            </div>
        </div>
    )},
    { header: "Prodi", render: (row) => <span className="text-xs text-slate-500">{row.study_program?.nama}</span> }
  ];

  const courseColumns: Column<Course>[] = [
    {
        header: () => (
            <Checkbox 
                checked={currentCourses.length > 0 && currentCourses.filter(c => !(hasRegularStudentSelected && c.kategori === 'MBKM')).every(c => selectedCourseIds.has(c.id))}
                onCheckedChange={(checked) => {
                    const newSet = new Set(selectedCourseIds);
                    currentCourses.forEach(c => {
                        if (hasRegularStudentSelected && c.kategori === 'MBKM') return;
                        if (checked) newSet.add(c.id);
                        else newSet.delete(c.id);
                    });
                    setSelectedCourseIds(newSet);
                }}
                disabled={hasRegularStudentSelected && currentCourses.every(c => c.kategori === 'MBKM')}
            />
        ),
        className: "w-[40px] text-center",
        render: (row) => {
            const isDisabled = hasRegularStudentSelected && row.kategori === 'MBKM';
            return (
                <Checkbox checked={selectedCourseIds.has(row.id)} onCheckedChange={() => toggleCourse(row.id)} disabled={isDisabled} className={isDisabled ? "opacity-50" : ""}/>
            )
        }
    },
    { header: "Mata Kuliah", render: (row) => (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 text-sm">{row.matkul}</span>
                {row.kategori === 'MBKM' && <Badge className="text-[9px] h-4 bg-emerald-100 text-emerald-700">MBKM</Badge>}
            </div>
            <span className="text-xs text-slate-500 font-mono">{row.kode}</span>
        </div>
    )},
    { header: "SKS", className: "text-center w-[60px]", render: (row) => <Badge variant="secondary" className="font-mono text-[10px]">{row.sks}</Badge> }
  ];


  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (selectedStudentIds.size === 0 || selectedCourseIds.size === 0) return;
    const toastId = showLoading('Menyimpan KRS Kolektif...');
    try {
      await createBulkKRS({
        academicYearId: selectedAcademicYearId,
        studentIds: Array.from(selectedStudentIds),
        courseIds: Array.from(selectedCourseIds)
      });
      successAction('KRS Kolektif', 'create', toastId);
      onClose();
    } catch (error: any) {
      showError('Gagal menyimpan', error.message, toastId);
    }
  };

  const totalSKS = Array.from(selectedCourseIds).reduce((acc, cId) => acc + (courses.find(c => c.id === cId)?.sks || 0), 0);

  // --- RENDER STEPS ---
  
  // STEP 1: SELECT PERIOD & SEMESTER
  const renderStep1 = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-lg space-y-8">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Pilih Periode Akademik dan Semester</h2>
                <p className="text-slate-500">Tentukan Periode akademik dan semester untuk input KRS Kolektif.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <div className="space-y-3">
                    <Label>Periode Akademik</Label>
                    <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Tahun Akademik" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableAcademicYears.map(year => (
                                <SelectItem key={year.id} value={year.id}>{year.nama} ({year.semester})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label>Semester ({isGanjil ? 'Ganjil' : 'Genap'})</Label>
                    {availableAcademicYears.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                            {availableSemesters.map(smt => (
                                <div 
                                    key={smt}
                                    onClick={() => setTargetSemester(smt)}
                                    className={cn(
                                        "cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-primary/30 hover:bg-primary/5",
                                        targetSemester === smt ? "border-primary bg-primary/10 text-primary font-bold" : "border-slate-100 bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <span className="text-lg">{smt}</span>
                                    <span className="block text-[10px] uppercase text-muted-foreground font-normal">Smt</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-sm text-red-500">Data Tahun Akademik tidak tersedia.</div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );

  // STEP 2: TABLES
  // (Reusing the dual pane layout)
  const renderStep2 = () => (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Students */}
        <div className="flex-1 border-r border-slate-200 bg-white flex flex-col min-w-0 h-full overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold text-slate-800 mb-4 flex justify-between items-center">
                    <span>Mahasiswa Smt {targetSemester}</span>
                    <Badge variant="secondary">{filteredStudents.length}</Badge>
                </h3>
                <DataTable
                    data={currentStudents}
                    columns={studentColumns}
                    isLoading={!!loadingMsg}
                    searchQuery={studentSearch}
                    onSearchChange={(e) => { setStudentSearch(e.target.value); setStudentPage(1); }}
                    searchPlaceholder="Cari Nama / NIM..."
                    currentPage={studentPage}
                    totalPages={studentTotalPages}
                    onPageChange={setStudentPage}
                    startIndex={studentStartIndex}
                    endIndex={studentEndIndex}
                    totalItems={filteredStudents.length}
                />
            </div>
            <div className="p-3 border-t bg-slate-50 text-xs text-slate-500 text-center">
                {selectedStudentIds.size} mahasiswa dipilih
            </div>
        </div>

        {/* Right: Courses */}
        <div className="flex-[1.2] bg-slate-50/50 flex flex-col min-w-0 h-full overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto">
                 <h3 className="font-semibold text-slate-800 mb-4 flex justify-between items-center">
                    <span>Matkul Smt {targetSemester}</span>
                    <div className="flex gap-2 items-center">
                        <span className={totalSKS > 24 ? "text-red-600 font-bold text-sm" : "text-slate-700 text-sm"}>
                            Total: {totalSKS} SKS
                        </span>
                    </div>
                </h3>
                <DataTable
                    data={currentCourses}
                    columns={courseColumns}
                    isLoading={!!loadingMsg}
                    searchQuery={courseSearch}
                    onSearchChange={(e) => { setCourseSearch(e.target.value); setCoursePage(1); }}
                    searchPlaceholder="Cari Matkul..."
                    currentPage={coursePage}
                    totalPages={courseTotalPages}
                    onPageChange={setCoursePage}
                    startIndex={courseStartIndex}
                    endIndex={courseEndIndex}
                    totalItems={filteredCourses.length}
                />
            </div>
             <div className="p-3 border-t bg-white border-l text-xs text-slate-500 text-center">
                {selectedCourseIds.size} mata kuliah dipilih
            </div>
        </div>
    </div>
  );

  // STEP 3: CONFIRM
  const renderStep3 = () => (
     <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl border shadow-sm text-center space-y-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Konfirmasi Input Kolektif</h2>
                <p className="text-slate-500">Pastikan data berikut sudah benar sebelum menyimpan.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target</p>
                    <p className="text-lg font-bold text-slate-900">{selectedStudentIds.size} Mahasiswa</p>
                    <p className="text-sm text-slate-500">Semester {targetSemester}</p>
                </div>
                 <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kontrak</p>
                    <p className="text-lg font-bold text-slate-900">{selectedCourseIds.size} Mata Kuliah</p>
                    <p className="text-sm text-slate-500">Total {totalSKS} SKS</p>
                </div>
            </div>

            <div className="text-sm text-slate-500 bg-yellow-50 text-yellow-700 p-3 rounded-lg border border-yellow-100">
                Data KRS akan disimpan dengan status <strong>APPROVED</strong> secara otomatis.
            </div>
        </div>
    </div>
  );


  // --- MAIN RENDER ---
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0 relative flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="flex items-center gap-2">
            Input KRS Kolektif
            {step > 1 && <span className="font-normal text-slate-400">/ Langkah {step}</span>}
          </DialogTitle>
          
          {/* Step Indicator */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 text-sm text-slate-500">
             <span className={cn(step >= 1 ? "text-primary font-bold" : "")}>1. Periode</span>
             <ChevronRight className="w-4 h-4" />
             <span className={cn(step >= 2 ? "text-primary font-bold" : "")}>2. Seleksi</span>
             <ChevronRight className="w-4 h-4" />
             <span className={cn(step >= 3 ? "text-primary font-bold" : "")}>3. Konfirmasi</span>
          </div>
        </DialogHeader>

        {loadingMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-slate-500">{loadingMsg}</p>
          </div>
        ) : (
            <>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </>
        )}

        <DialogFooter className="p-4 border-t bg-white shrink-0">
             <div className="flex w-full items-center justify-between">
                <Button variant="ghost" onClick={onClose}>Batal</Button>
                
                <div className="flex gap-2">
                    {step > 1 && (
                        <Button variant="outline" onClick={() => setStep(s => s - 1 as any)}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    )}
                    
                    {step < 3 ? (
                        <Button 
                            onClick={() => setStep(s => s + 1 as any)} 
                            disabled={
                                (step === 1 && !targetSemester) ||
                                (step === 2 && (selectedStudentIds.size === 0 || selectedCourseIds.size === 0))
                            }
                        >
                            Lanjut
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                         <Button onClick={handleSubmit}>
                            Simpan Data
                        </Button>
                    )}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
