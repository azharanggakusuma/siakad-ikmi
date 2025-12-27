"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
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
import { toast } from "sonner";

import { CourseForm, type CourseFormValues } from "@/components/features/matakuliah/CourseForm";

// Import tipe data saja
import { type CourseData, type CourseCategory } from "@/lib/data";
// Import Server Actions
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/app/actions/courses";

export default function MataKuliahPage() {
  const [courses, setCourses] = useState<CourseData[]>([]); // Data dari DB
  const [isLoading, setIsLoading] = useState(true); // Status Loading

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | CourseCategory>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State Edit & Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CourseFormValues | undefined>(undefined);

  // === 1. FETCH DATA DARI SUPABASE ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      toast.error("Gagal memuat data", { description: "Cek koneksi internet Anda." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC FILTER ---
  const filteredCourses = courses.filter((course) => {
    const matchSearch = 
      course.matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.kode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || course.kategori === categoryFilter;
    const matchSemester = semesterFilter === "ALL" || course.smt_default.toString() === semesterFilter;
    return matchSearch && matchCategory && matchSemester;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredCourses.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(undefined);
    setEditId(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: CourseData) => {
    setEditId(course.id);
    setFormData({
      kode: course.kode,
      matkul: course.matkul,
      sks: course.sks,
      smt_default: course.smt_default,
      kategori: course.kategori
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // === 2. HAPUS DATA KE DATABASE ===
  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteCourse(deleteId);
        toast.success("Berhasil Dihapus", { description: "Data mata kuliah telah dihapus." });
        
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
        await fetchData();

      } catch (error: any) {
        toast.error("Gagal Hapus", { description: error.message });
      }
    }
    setIsDeleteOpen(false);
  };

  // === 3. SIMPAN / UPDATE KE DATABASE ===
  const handleFormSubmit = async (values: CourseFormValues) => {
    if (!values.kode || !values.matkul) {
      toast.error("Gagal Menyimpan", { description: "Mohon lengkapi semua data mata kuliah." });
      return;
    }

    try {
      if (isEditing && editId) {
        // Update
        await updateCourse(editId, values);
        toast.success("Data Diperbarui", { description: `Mata kuliah ${values.matkul} berhasil diupdate.` });
      } else {
        // Create
        await createCourse(values);
        toast.success("Berhasil Ditambahkan", { description: `Mata kuliah baru ${values.matkul} telah disimpan.` });
      }
      
      await fetchData();
      setIsDialogOpen(false);

    } catch (error: any) {
      toast.error("Terjadi Kesalahan", { description: error.message });
    }
  };

  // --- COLUMNS ---
  const columns: Column<CourseData>[] = [
    { header: "#", className: "w-[50px] text-center", render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span> },
    { header: "Kode MK", accessorKey: "kode", className: "font-medium" },
    { 
      header: "Mata Kuliah", 
      className: "max-w-[250px]",
      render: (row) => <Tooltip content={row.matkul} position="top"><div className="truncate text-gray-700 font-medium cursor-default">{row.matkul}</div></Tooltip>
    },
    { header: "SKS", accessorKey: "sks", className: "text-center w-[100px] text-gray-700" },
    { header: "Semester", accessorKey: "smt_default", className: "text-center w-[100px] text-gray-700" },
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" onClick={() => handleOpenEdit(row)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(row.id)}><Trash2 className="h-4 w-4" /></Button>
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
      <PageHeader title="Mata Kuliah" breadcrumb={["SIAKAD", "Mata Kuliah"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable 
            data={currentData}
            columns={columns}
            // Aktifkan Skeleton Loading
            isLoading={isLoading}

            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
        description="Lengkapi detail mata kuliah di bawah ini."
        maxWidth="sm:max-w-[600px]"
      >
        <CourseForm
            key={isEditing && editId ? `edit-${editId}` : "create-new"} 
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
        description={`Apakah Anda yakin ingin menghapus data ini?`}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}