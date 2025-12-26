"use client";

import React, { useState } from "react";
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

// Import list yang baru (Array)
import { coursesList, type CourseData, type CourseCategory } from "@/lib/data";

export default function MataKuliahPage() {
  const [courses, setCourses] = useState<CourseData[]>(coursesList);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | CourseCategory>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State Edit & Delete menggunakan ID (Number/String)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CourseFormValues | undefined>(undefined);

  // --- LOGIC FILTER ---
  const filteredCourses = courses.filter((course) => {
    const matchSearch = 
      course.matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.kode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || course.kategori === categoryFilter;
    const matchSemester = semesterFilter === "ALL" || course.smt_default.toString() === semesterFilter;
    return matchSearch && matchCategory && matchSemester;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
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

  const confirmDelete = () => {
    if (deleteId) {
      setCourses((prev) => prev.filter((item) => item.id !== deleteId));
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      toast.success("Berhasil Dihapus", { description: "Data mata kuliah telah dihapus." });
    }
    setIsDeleteOpen(false);
  };

  const handleFormSubmit = (values: CourseFormValues) => {
    // Validasi Kelengkapan
    if (!values.kode || !values.matkul || values.sks === "" || values.smt_default === "" || values.kategori === "") {
      toast.error("Gagal Menyimpan", { description: "Mohon lengkapi semua data mata kuliah." });
      return;
    }

    if (isEditing && editId) {
      // --- LOGIC UPDATE ---
      
      // Cek Duplikasi Kode MK (Kecuali punya sendiri)
      const isDuplicate = courses.some(
        (c) => c.kode === values.kode && c.id !== editId
      );
      if (isDuplicate) {
        toast.error("Gagal Update", { description: `Kode MK ${values.kode} sudah digunakan!` });
        return;
      }

      setCourses((prev) => prev.map((item) => {
        if (item.id === editId) {
          return {
            ...item,
            kode: values.kode,
            matkul: values.matkul,
            sks: Number(values.sks),
            smt_default: Number(values.smt_default),
            kategori: values.kategori as CourseCategory,
          };
        }
        return item;
      }));
      toast.success("Data Diperbarui", { description: `Mata kuliah ${values.matkul} berhasil diupdate.` });

    } else {
      // --- LOGIC CREATE ---

      // Cek Duplikasi Kode MK
      if (courses.some((c) => c.kode === values.kode)) {
        toast.error("Gagal Menambahkan", { description: `Kode MK ${values.kode} sudah terdaftar!` });
        return;
      }

      // Generate Auto-Increment ID
      const maxId = courses.reduce((max, item) => Math.max(max, item.id), 0);
      const newId = maxId + 1;

      const newCourse: CourseData = {
        id: newId,
        kode: values.kode,
        matkul: values.matkul,
        sks: Number(values.sks),
        smt_default: Number(values.smt_default),
        kategori: values.kategori as CourseCategory,
      };

      setCourses((prev) => [...prev, newCourse]);
      toast.success("Berhasil Ditambahkan", { description: `Mata kuliah baru ${values.matkul} telah disimpan.` });
    }
    setIsDialogOpen(false);
  };

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