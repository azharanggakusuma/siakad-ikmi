"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal } from "@/components/shared/FormModal";
import { Loader2, Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useLayout } from "@/app/context/LayoutContext"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { getStudents, getStudyPrograms } from "@/app/actions/students"; 
import { getStudentCoursesForGrading, saveStudentGrades, getCoursesForSelect } from "@/app/actions/grades"; 
import { StudentData, StudyProgram } from "@/lib/types"; 
import { StudentGradeForm } from "@/components/features/nilai/StudentGradeForm";
import { StudentTable } from "@/components/features/nilai/StudentTable";
import { ImportNilaiDialog } from "@/components/features/nilai/ImportNilaiDialog";

interface AdminNilaiViewProps {
  initialStudents: StudentData[];
  initialPrograms: StudyProgram[];
}

export default function AdminNilaiView({ initialStudents, initialPrograms }: AdminNilaiViewProps) {
  const { user } = useLayout(); 

  // --- STATE ADMIN ---
  const [studentList, setStudentList] = useState<StudentData[]>(initialStudents);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>(initialPrograms); 
  const [allCourses, setAllCourses] = useState<any[]>([]); // New State
  const [isLoading, setIsLoading] = useState(false);

  // Modal State Admin
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [studentKrsCourses, setStudentKrsCourses] = useState<any[]>([]);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);

  // === FETCH DATA ADMIN ===
  const fetchAdminData = async () => {
    // setIsLoading(true); // No longer needed for initial load
    try {
      const [students, programs, courses] = await Promise.all([
        getStudents(),
        getStudyPrograms(),
        getCoursesForSelect()
      ]);
      
      setStudentList(students);
      setStudyPrograms(programs || []);
      setAllCourses(courses || []);
    } catch (error) {
      toast.error("Gagal Memuat Data", { description: "Terjadi kesalahan koneksi." });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Fetch for Courses (since not passed in props)
  useEffect(() => {
    const loadCourses = async () => {
        try {
            const courses = await getCoursesForSelect();
            setAllCourses(courses || []);
        } catch (error) {
            console.error("Failed to load courses");
        }
    };
    loadCourses();
  }, []);
  
  // useEffect removed

  // === HANDLERS ADMIN ===
  const handleOpenEdit = async (student: StudentData) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
    
    // Fetch mata kuliah KHUSUS dari KRS mahasiswa ini
    setIsFetchingCourses(true);
    setStudentKrsCourses([]); // Reset list
    try {
        const courses = await getStudentCoursesForGrading(student.id);
        setStudentKrsCourses(courses || []);
    } catch (error) {
        toast.error("Gagal memuat data KRS mahasiswa.");
    } finally {
        setIsFetchingCourses(false);
    }
  };

  const handleSaveGrades = async (studentId: string, grades: { course_id: string; hm: string }[]) => {
    await saveStudentGrades(studentId, grades);
    await fetchAdminData(); // Refresh data utama
  };

  return (
    <>
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <StudentTable 
            data={studentList}
            studyPrograms={studyPrograms} 
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            customActions={
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="h-10 w-10 p-0 md:w-auto md:px-4"
                        title="Export Data"
                        onClick={() => {
                            // Generate flattened data: Student + Course pair
                            const exportRows: any[] = [];
                            studentList.forEach(s => {
                                const prodi = s.profile.study_program?.nama || "-";
                                // Use transcript to get all courses (Grades + Approved KRS)
                                const courses = s.transcript || [];
                                
                                courses.forEach(c => {
                                    exportRows.push({
                                        "NIM": s.profile.nim,
                                        "Nama Mahasiswa": s.profile.nama,
                                        "Prodi": prodi,
                                        "Angkatan": s.profile.angkatan,
                                        "Kode MK": c.kode,
                                        "Nama MK": c.matkul,
                                        "Semester": c.smt,
                                        "Nilai Huruf": c.hm || "-"
                                    });
                                });
                            });

                            const ws = XLSX.utils.json_to_sheet(exportRows);

                            // Auto-fit columns
                            if (exportRows.length > 0) {
                                const keys = Object.keys(exportRows[0]);
                                const wscols = keys.map(key => {
                                    let max = key.length;
                                    exportRows.forEach(row => {
                                        const val = String(row[key] || "");
                                        if (val.length > max) max = val.length;
                                    });
                                    return { wch: max + 2 };
                                });
                                ws['!cols'] = wscols;
                            }

                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "Data Nilai Lengkap");
                            XLSX.writeFile(wb, "Data_Nilai_Mahasiswa.xlsx");
                        }}
                    >
                        <Download className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Export Data</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-10 w-10 p-0 md:w-auto md:px-4"
                        title="Import Data"
                        onClick={() => setIsImportOpen(true)}
                    >
                        <Upload className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Import Data</span>
                    </Button>
                </div>
            }
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title="Input Nilai Mahasiswa"
        description="Pastikan seluruh nilai telah terisi dengan benar sebelum disimpan."
        maxWidth="sm:max-w-4xl"
      >
        {selectedStudent && (
            isFetchingCourses ? (
                <Card className="flex flex-col h-[75vh] w-full border bg-background overflow-hidden shadow-sm">
                    {/* Header Skeleton */}
                    <div className="flex-none px-6 py-5 border-b bg-background flex justify-between items-start z-10">
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-48" /> {/* Nama */}
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-24 rounded-full" /> {/* NIM Badge */}
                                <Skeleton className="h-5 w-32" /> {/* Prodi */}
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-center pt-0.5 gap-1">
                            <Skeleton className="h-3 w-20" /> {/* Label Proyeksi */}
                            <div className="flex items-baseline gap-2">
                                <Skeleton className="h-8 w-16" /> {/* Nilai IPK */}
                                <Skeleton className="h-4 w-12" /> {/* SKS */}
                            </div>
                        </div>
                    </div>
                    
                    {/* Content Skeleton (Accordion Style) */}
                    <div className="flex-1 overflow-y-auto p-6 bg-muted/5 space-y-4">
                        {/* Semester 1 (Expanded) */}
                        <div className="border bg-background rounded-lg overflow-hidden shadow-sm">
                            {/* Trigger */}
                            <div className="px-5 py-4 flex items-center justify-between border-b">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-32" /> {/* Semester X */}
                                </div>
                                <Skeleton className="h-4 w-24" /> {/* Info Matkul */}
                            </div>
                            {/* Content Rows */}
                            <div className="divide-y divide-border">
                                {[1, 2, 3].map((k) => (
                                    <div key={k} className="flex items-center justify-between py-3 px-5">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-48" /> {/* Matkul Name */}
                                            <div className="flex gap-2">
                                                <Skeleton className="h-5 w-16 rounded-full" /> {/* Kode */}
                                                <Skeleton className="h-4 w-12" /> {/* SKS */}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-9 w-[70px]" /> {/* Select Box */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Semester 2 (Collapsed) */}
                        <div className="border bg-background rounded-lg overflow-hidden shadow-sm">
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        
                         {/* Semester 3 (Collapsed) */}
                         <div className="border bg-background rounded-lg overflow-hidden shadow-sm">
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>

                     {/* Footer Skeleton */}
                    <div className="flex-none p-4 border-t bg-background flex justify-end gap-2 z-10">
                        <Skeleton className="h-10 w-20" /> {/* Batal */}
                        <Skeleton className="h-10 w-28" /> {/* Simpan */}
                    </div>
                </Card>
            ) : (
                <StudentGradeForm 
                    student={selectedStudent}
                    allCourses={studentKrsCourses}
                    onSubmit={handleSaveGrades}
                    onCancel={() => setIsFormOpen(false)}
                />
            )
        )}
      </FormModal>

      <ImportNilaiDialog
        isOpen={isImportOpen}
        onClose={setIsImportOpen}
        onSuccess={fetchAdminData}
        students={studentList}
        courses={allCourses}
      />
    </>
  );
}
