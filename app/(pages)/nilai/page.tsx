"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

// Imports fitur baru
import { GradeForm } from "@/components/features/nilai/GradeForm";
import { type GradeData, type GradeFormValues } from "@/lib/types";
import { 
  getGrades, 
  createGrade, 
  updateGrade, 
  deleteGrade,
  getStudentsForSelect,
  getCoursesForSelect
} from "@/app/actions/grades";

export default function NilaiPage() {
  const [dataList, setDataList] = useState<GradeData[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<GradeFormValues | undefined>(undefined);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch semua data secara paralel agar cepat
      const [grades, students, courses] = await Promise.all([
        getGrades(),
        getStudentsForSelect(),
        getCoursesForSelect()
      ]);
      
      setDataList(grades);
      setStudentsList(students || []);
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
    return dataList.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.student.nama.toLowerCase().includes(q) ||
        item.student.nim.toLowerCase().includes(q) ||
        item.course.matkul.toLowerCase().includes(q)
      );
    });
  }, [dataList, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === HANDLERS ===
  const handleOpenAdd = () => {
    setFormData(undefined);
    setSelectedId(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: GradeData) => {
    setSelectedId(item.id);
    setFormData({
      student_id: item.student_id.toString(),
      course_id: item.course_id.toString(),
      hm: item.hm,
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: GradeFormValues) => {
    try {
      if (isEditing && selectedId) {
        await updateGrade(selectedId, values);
        toast.success("Berhasil Update", { description: "Data nilai berhasil diperbarui." });
      } else {
        await createGrade(values);
        toast.success("Berhasil Tambah", { description: "Nilai berhasil ditambahkan." });
      }
      await fetchData();
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error("Gagal Menyimpan", { description: error.message });
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        await deleteGrade(selectedId);
        toast.success("Berhasil Hapus", { description: "Data nilai telah dihapus." });
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        }
        await fetchData();
      } catch (error: any) {
        toast.error("Gagal Hapus", { description: error.message });
      }
    }
    setIsDeleteOpen(false);
  };

  // === COLUMNS DEFINITION ===
  const columns: Column<GradeData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>
    },
    {
      header: "NIM",
      className: "w-[100px]",
      render: (row) => <span className="font-mono font-medium">{row.student.nim}</span>
    },
    {
      header: "Nama Mahasiswa",
      render: (row) => (
        <div>
           <p className="font-semibold text-slate-800">{row.student.nama}</p>
           <p className="text-xs text-slate-500">{row.student.prodi}</p>
        </div>
      )
    },
    {
      header: "Mata Kuliah",
      render: (row) => (
        <div>
           <p className="font-medium text-slate-700">{row.course.matkul}</p>
           <p className="text-xs text-slate-500">{row.course.kode} • {row.course.sks} SKS</p>
        </div>
      )
    },
    {
      header: "Nilai",
      className: "text-center w-[80px]",
      render: (row) => {
        // Styling badge berdasarkan nilai
        let colorClass = "bg-slate-100 text-slate-700";
        if(row.hm === "A") colorClass = "bg-green-100 text-green-700 border-green-200";
        else if(row.hm === "B") colorClass = "bg-blue-100 text-blue-700 border-blue-200";
        else if(row.hm === "C") colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
        else if(row.hm === "D" || row.hm === "E") colorClass = "bg-red-100 text-red-700 border-red-200";
        
        return <Badge variant="outline" className={`${colorClass} font-bold`}>{row.hm}</Badge>;
      }
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="icon" className="text-yellow-600 hover:bg-yellow-50 h-8 w-8" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 h-8 w-8" onClick={() => { setSelectedId(row.id); setIsDeleteOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Input Nilai Mahasiswa" breadcrumb={["SIAKAD", "Nilai"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Mahasiswa atau Matkul..."
            onAdd={handleOpenAdd}
            addLabel="Input Nilai"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredData.length}
          />
        </CardContent>
      </Card>

      {/* Modal Form (Add/Edit) */}
      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title={isEditing ? "Edit Nilai" : "Input Nilai Baru"}
        description={isEditing ? "Ubah data nilai mahasiswa." : "Masukkan nilai untuk mahasiswa."}
        maxWidth="sm:max-w-[500px]"
      >
        <GradeForm
          key={isEditing && selectedId ? `edit-${selectedId}` : "add-new"}
          initialData={formData}
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          studentsList={studentsList}
          coursesList={coursesList}
        />
      </FormModal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Nilai?"
        description="Data nilai ini akan dihapus permanen. Apakah Anda yakin?"
        confirmLabel="Ya, Hapus"
        variant="destructive"
      />
    </div>
  );
}