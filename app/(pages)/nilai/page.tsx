// app/(pages)/nilai/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal } from "@/components/shared/FormModal";

// Imports
import { getStudents } from "@/app/actions/students";
import { getAllCourses, saveStudentGrades } from "@/app/actions/grades";
import { StudentData } from "@/lib/types";
import { StudentGradeForm } from "@/components/features/nilai/StudentGradeForm";
import { StudentTable } from "@/components/features/nilai/StudentTable";

export default function NilaiPage() {
  const [studentList, setStudentList] = useState<StudentData[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [students, courses] = await Promise.all([
        getStudents(),
        getAllCourses()
      ]);
      
      setStudentList(students);
      setCoursesList(courses || []);
    } catch (error) {
      toast.error("Gagal Memuat Data", { description: "Terjadi kesalahan koneksi." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === FILTERING ===
  const filteredData = useMemo(() => {
    return studentList.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.profile.nama.toLowerCase().includes(q) ||
        s.profile.nim.toLowerCase().includes(q) ||
        s.profile.prodi.toLowerCase().includes(q)
      );
    });
  }, [studentList, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === HANDLERS ===
  const handleOpenEdit = (student: StudentData) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleSaveGrades = async (studentId: number, grades: { course_id: number; hm: string }[]) => {
    await saveStudentGrades(studentId, grades);
    await fetchData(); 
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Nilai Mahasiswa" breadcrumb={["SIAKAD", "Nilai"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <StudentTable 
            data={currentData}
            isLoading={isLoading}
            startIndex={startIndex}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredData.length}
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