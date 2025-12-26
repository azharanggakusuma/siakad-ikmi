"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
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
import { StudentForm, type StudentFormValues } from "@/components/features/mahasiswa/StudentForm";

import { students as initialData, type StudentData, type StudentProfile } from "@/lib/data";

export default function MahasiswaPage() {
  const [dataList, setDataList] = useState<StudentData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [prodiFilter, setProdiFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State untuk Delete & Edit
  // ID di sini adalah ID System (1, 2, dst), BUKAN NIM.
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null); 
  
  const [formData, setFormData] = useState<StudentFormValues | undefined>(undefined);

  // --- LOGIC FILTER ---
  const filteredData = useMemo(() => {
    return dataList.filter((student) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        student.profile.nama.toLowerCase().includes(query) ||
        student.profile.nim.toLowerCase().includes(query);
      const matchProdi = prodiFilter === "ALL" || student.profile.prodi === prodiFilter;
      const matchSemester = semesterFilter === "ALL" || student.profile.semester.toString() === semesterFilter;
      return matchSearch && matchProdi && matchSemester;
    });
  }, [dataList, searchQuery, prodiFilter, semesterFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(undefined);
    setEditId(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: StudentData) => {
    // Kita simpan ID System (1, 2...) untuk referensi update
    setEditId(student.id); 
    setFormData({
      nim: student.profile.nim,
      nama: student.profile.nama,
      prodi: student.profile.prodi,
      jenjang: student.profile.jenjang,
      semester: student.profile.semester,
      alamat: student.profile.alamat,
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: StudentFormValues) => {
    // 1. Validasi Input Dasar
    if (!values.nim || !values.nama || !values.prodi || !values.jenjang || values.semester === "") {
      toast.error("Gagal menyimpan", { description: "Data wajib belum lengkap." });
      return;
    }

    if (isEditing && editId) {
      // --- LOGIC UPDATE ---
      
      // Cek Duplikasi NIM saat Edit (Kecuali punya diri sendiri)
      const isDuplicate = dataList.some(
        (s) => s.profile.nim === values.nim && s.id !== editId
      );

      if (isDuplicate) {
        toast.error("Gagal Update", { description: `NIM ${values.nim} sudah digunakan mahasiswa lain.` });
        return;
      }

      setDataList((prev) => prev.map((item) => {
        if (item.id === editId) {
          const updatedProfile: StudentProfile = {
             ...item.profile,
             ...values,
             semester: Number(values.semester),
             id: Number(editId) // ID System tetap sama
          };
          // Update data, termasuk NIM jika berubah
          return { ...item, profile: updatedProfile };
        }
        return item;
      }));
      toast.success("Berhasil Update", { description: `Data ${values.nama} diperbarui.` });

    } else {
      // --- LOGIC CREATE ---
      
      // Cek Duplikasi NIM Baru
      if (dataList.some((s) => s.profile.nim === values.nim)) {
        toast.error("Gagal", { description: "NIM sudah terdaftar." });
        return;
      }

      // Generate ID Baru (Auto Increment Manual)
      const maxId = dataList.reduce((max, item) => Math.max(max, Number(item.id)), 0);
      const newId = maxId + 1;

      const newProfile: StudentProfile = {
        id: newId,
        ...values,
        semester: Number(values.semester),
      };

      const newStudent: StudentData = {
        id: newId.toString(),
        profile: newProfile,
        transcript: [] 
      };

      setDataList((prev) => [newStudent, ...prev]);
      toast.success("Berhasil", { description: `Mahasiswa ${values.nama} ditambahkan.` });
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      // Hapus berdasarkan ID System, bukan NIM
      setDataList((prev) => prev.filter((item) => item.id !== deleteId));
      if (currentData.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
      toast.success("Dihapus", { description: "Data mahasiswa dihapus permanen." });
    }
    setIsDeleteOpen(false);
  };

  // --- COLUMNS ---
  const columns: Column<StudentData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_: StudentData, index: number) => (
        <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
      )
    },
    {
      header: "NIM",
      // accessorKey dihapus agar tidak error, kita pakai render
      className: "w-[120px]",
      render: (row: StudentData) => (
        <span className="font-mono font-medium text-gray-700">{row.profile.nim}</span>
      )
    },
    { 
      header: "Nama Lengkap", 
      render: (row: StudentData) => (
        <span className="font-semibold text-gray-800">{row.profile.nama}</span>
      ) 
    },
    { 
      header: "Program Studi", 
      render: (row: StudentData) => (
        <span className="text-gray-600">{row.profile.prodi}</span>
      ) 
    },
    {
      header: "Jenjang",
      className: "text-center w-[80px]",
      render: (row: StudentData) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-700">{row.profile.jenjang}</Badge>
      )
    },
    { 
      header: "Semester", 
      className: "text-center w-[60px]", 
      render: (row: StudentData) => row.profile.semester 
    },
    {
      header: "Alamat",
      className: "max-w-[250px]", 
      render: (row: StudentData) => (
        <Tooltip content={row.profile.alamat} position="top">
          <div className="truncate text-gray-600 cursor-default">
            {row.profile.alamat}
          </div>
        </Tooltip>
      )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row: StudentData) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="icon" className="text-yellow-600 hover:bg-yellow-50 h-8 w-8" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 h-8 w-8" onClick={() => { setDeleteId(row.id); setIsDeleteOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const filterContent = (
    <>
      <DropdownMenuLabel>Program Studi</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={prodiFilter} onValueChange={(v) => { setProdiFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="Teknik Informatika">Teknik Informatika</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="Sistem Informasi">Sistem Informasi</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="Manajemen Informatika">Manajemen Informatika</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="Komputerisasi Akuntansi">Komputerisasi Akuntansi</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</DropdownMenuRadioItem>
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
      <PageHeader title="Data Mahasiswa" breadcrumb={["SIAKAD", "Mahasiswa"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable
            data={currentData}
            columns={columns}
            searchQuery={searchQuery}
            onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Nama atau NIM..."
            onAdd={handleOpenAdd}
            addLabel="Tambah Data"
            filterContent={filterContent}
            isFilterActive={prodiFilter !== "ALL" || semesterFilter !== "ALL"}
            onResetFilter={() => { setProdiFilter("ALL"); setSemesterFilter("ALL"); setSearchQuery(""); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredData.length}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title={isEditing ? "Edit Data Mahasiswa" : "Tambah Mahasiswa Baru"}
        description={isEditing ? `Edit data untuk NIM ${formData?.nim}` : "Pastikan data mahasiswa yang dimasukkan sudah benar."}
        maxWidth="sm:max-w-[600px]"
      >
        <StudentForm 
            // Menggunakan editId (ID System) sebagai key untuk re-render saat ganti mode
            key={isEditing && editId ? `edit-${editId}` : "add-new"}
            initialData={formData}
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Data?"
        description={`Yakin hapus data mahasiswa ini?`}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}