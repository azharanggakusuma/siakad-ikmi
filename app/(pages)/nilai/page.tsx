"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal } from "@/components/shared/FormModal";

// Imports
import { getStudents, getStudyPrograms } from "@/app/actions/students"; // Import getStudyPrograms
import { getAllCourses, saveStudentGrades } from "@/app/actions/grades";
import { StudentData, StudyProgram } from "@/lib/types"; // Import type
import { StudentGradeForm } from "@/components/features/nilai/StudentGradeForm";
import { StudentTable } from "@/components/features/nilai/StudentTable";

export default function NilaiPage() {
  const [studentList, setStudentList] = useState<StudentData[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]); // State baru
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [students, courses, programs] = await Promise.all([
        getStudents(),
        getAllCourses(),
        getStudyPrograms() // Ambil data prodi
      ]);
      
      setStudentList(students);
      setCoursesList(courses || []);
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
  const handleOpenEdit = (student: StudentData) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleSaveGrades = async (studentId: number, grades: { course_id: number; hm: string }[]) => {
    await saveStudentGrades(studentId, grades);
    await fetchData(); 
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Data Mahasiswa" breadcrumb={["SIAKAD", "Nilai"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <StudentTable 
            data={studentList}
            studyPrograms={studyPrograms} // Pass data ke table
            isLoading={isLoading}
            onEdit={handleOpenEdit}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title="Kelola Nilai Mahasiswa"
        description="Input atau update nilai mata kuliah mahasiswa."
        maxWidth="sm:max-w-[600px]"
      >
        {selectedStudent && (
            <StudentGradeForm 
                student={selectedStudent}
                allCourses={coursesList}
                onSubmit={handleSaveGrades}
                onCancel={() => setIsFormOpen(false)}
            />
        )}
      </FormModal>
    </div>
  );
}