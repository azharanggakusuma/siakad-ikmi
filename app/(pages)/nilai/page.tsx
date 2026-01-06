// app/(pages)/nilai/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal } from "@/components/shared/FormModal";
import { Loader2 } from "lucide-react";

// Imports
import { getStudents, getStudyPrograms } from "@/app/actions/students"; 
import { getStudentCoursesForGrading, saveStudentGrades } from "@/app/actions/grades"; 
import { StudentData, StudyProgram } from "@/lib/types"; 
import { StudentGradeForm } from "@/components/features/nilai/StudentGradeForm";
import { StudentTable } from "@/components/features/nilai/StudentTable";

export default function NilaiPage() {
  const [studentList, setStudentList] = useState<StudentData[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  
  // State untuk menyimpan mata kuliah hasil fetch KRS
  const [studentKrsCourses, setStudentKrsCourses] = useState<any[]>([]);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);

  // === FETCH DATA UTAMA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [students, programs] = await Promise.all([
        getStudents(),
        getStudyPrograms() 
      ]);
      
      setStudentList(students);
      setStudyPrograms(programs || []);
    } catch (error) {
      toast.error("Gagal Memuat Data", { description: "Terjadi kesalahan koneksi." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === HANDLERS ===
  const handleOpenEdit = async (student: StudentData) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
    
    // Fetch mata kuliah KHUSUS dari KRS mahasiswa ini
    setIsFetchingCourses(true);
    setStudentKrsCourses([]); // Reset list dulu
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
    await fetchData(); // Refresh data utama agar tabel terupdate
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Nilai Mahasiswa" breadcrumb={["Beranda", "Nilai"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <StudentTable 
            data={studentList}
            studyPrograms={studyPrograms} 
            isLoading={isLoading}
            onEdit={handleOpenEdit}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title="Input Nilai (Berdasarkan KRS)"
        description="Mata kuliah yang muncul adalah yang diambil dalam KRS (Status Approved)."
        maxWidth="sm:max-w-[600px]"
      >
        {selectedStudent && (
            isFetchingCourses ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Memeriksa data KRS...</p>
                </div>
            ) : (
                <StudentGradeForm 
                    student={selectedStudent}
                    allCourses={studentKrsCourses} // List matkul dari KRS
                    onSubmit={handleSaveGrades}
                    onCancel={() => setIsFormOpen(false)}
                />
            )
        )}
      </FormModal>
    </div>
  );
}