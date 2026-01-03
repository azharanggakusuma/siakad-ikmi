"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message"; // Menggunakan Hook
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import Tooltip from "@/components/shared/Tooltip";
import { CourseForm } from "@/components/features/matakuliah/CourseForm";
import { type Course as CourseData, type CourseFormValues, type CourseCategory } from "@/lib/types";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/app/actions/courses";

export default function MataKuliahPage() {
  // Init Hook
  const { successAction, confirmDeleteMessage, showError } = useToastMessage();

  const [courses, setCourses] = useState<CourseData[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | CourseCategory>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>(""); // State untuk nama MK yang akan dihapus
  const [formData, setFormData] = useState<CourseFormValues | undefined>(undefined);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error(error);
      showError(
        "Gagal Memuat Data",
        "Terjadi kendala saat mengambil data mata kuliah. Silakan coba muat ulang halaman."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchSearch = 
        course.matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.kode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "ALL" || course.kategori === categoryFilter;
      const matchSemester = semesterFilter === "ALL" || course.smt_default.toString() === semesterFilter;
      
      return matchSearch && matchCategory && matchSemester;
    });
  }, [courses, searchQuery, categoryFilter, semesterFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage; 
  const currentData = filteredCourses.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(undefined);
    setSelectedId(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: CourseData) => {
    setSelectedId(course.id); 
    setFormData({
      kode: course.kode,
      matkul: course.matkul,
      sks: course.sks,
      smt_default: course.smt_default,
      kategori: course.kategori as CourseCategory 
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Mengubah handle delete untuk menyimpan nama juga
  const handleDelete = (course: CourseData) => {
    setSelectedId(course.id);
    setDeleteName(course.matkul);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      try {
        await deleteCourse(selectedId);
        successAction("Mata Kuliah", "delete");
        
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
        await fetchData();
      } catch (error: any) {
        showError("Gagal Menghapus", error.message);
      }
    }
    setIsDeleteOpen(false);
  };

  const handleFormSubmit = async (values: CourseFormValues) => {
    try {
      if (isEditing && selectedId) {
        await updateCourse(selectedId, values);
        successAction("Mata Kuliah", "update");
      } else {
        await createCourse(values);
        successAction("Mata Kuliah", "create");
      }
      await fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Gagal Menyimpan", error.message);
    }
  };

  // --- COLUMNS ---
  const columns: Column<CourseData>[] = [
    { 
      header: "#", 
      className: "w-[50px] text-center", 
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span> 
    },
    { 
      header: "Kode MK", 
      accessorKey: "kode", 
      className: "font-medium" 
    },
    { 
      header: "Mata Kuliah", 
      className: "max-w-[250px]",
      render: (row) => <Tooltip content={row.matkul} position="top"><div className="truncate text-gray-700 font-medium cursor-default">{row.matkul}</div></Tooltip>
    },
    { 
      header: "SKS", 
      accessorKey: "sks", 
      className: "text-center w-[100px] text-gray-700" 
    },
    { 
      header: "Semester", 
      accessorKey: "smt_default", 
      className: "text-center w-[100px] text-gray-700" 
    },
    {
      header: "Kategori",
      accessorKey: "kategori",
      className: "w-[150px]",
      render: (row) => <Badge variant="outline" className="font-normal border-gray-300 text-gray-600">{row.kategori}</Badge>
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={() => handleDelete(row)} // Pass row object
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const filterContent = (
    <>
      <DropdownMenuLabel>Kategori</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as any); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="Reguler">Reguler</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="MBKM">MBKM</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Semester</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={semesterFilter} onValueChange={(v) => { setSemesterFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <DropdownMenuRadioItem key={i} value={i.toString()}>Semester {i}</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup>
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Mata Kuliah" breadcrumb={["Beranda", "Mata Kuliah"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable 
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Matkul..."
            onAdd={handleOpenAdd}
            filterContent={filterContent}
            isFilterActive={categoryFilter !== "ALL" || semesterFilter !== "ALL"}
            onResetFilter={() => { setCategoryFilter("ALL"); setSemesterFilter("ALL"); setSearchQuery(""); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex} 
            totalItems={filteredCourses.length}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        title={isEditing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
        description={isEditing ? `Edit data ${formData?.matkul}` : "Lengkapi detail mata kuliah di bawah ini."}
        maxWidth="sm:max-w-[600px]"
      >
        <CourseForm
            key={isEditing && selectedId ? `edit-${selectedId}` : "create-new"} 
            initialData={formData}
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
        />
      </FormModal>

      <ConfirmModal 
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Mata Kuliah?"
        description={confirmDeleteMessage("Mata Kuliah", deleteName)}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}