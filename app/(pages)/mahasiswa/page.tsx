"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Pencil, Trash2 } from "lucide-react";

// --- IMPORT KOMPONEN UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// --- IMPORT CUSTOM COMPONENTS ---
import { DataTable, type Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import Tooltip from "@/components/Tooltip"; // Import Tooltip

// --- IMPORT DATA ---
import { students as initialData, type StudentData } from "@/lib/data";

// --- TYPES ---
interface StudentFormState {
  nim: string;
  nama: string;
  prodi: string;
  jenjang: string;
  semester: number | string;
  alamat: string;
}

export default function MahasiswaPage() {
  // --- STATE DATA ---
  const [dataList, setDataList] = useState<StudentData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  
  // FILTER STATE
  const [prodiFilter, setProdiFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // MODAL STATE (FORM)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initial State Form
  const [formData, setFormData] = useState<StudentFormState>({
    nim: "", nama: "", prodi: "", jenjang: "", semester: "", alamat: ""
  });

  // MODAL STATE (DELETE)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- LOGIC FILTER ---
  const filteredData = dataList.filter((student) => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      student.profile.nama.toLowerCase().includes(query) ||
      student.profile.nim.toLowerCase().includes(query);
    
    const matchProdi = prodiFilter === "ALL" || student.profile.prodi === prodiFilter;
    const matchSemester = semesterFilter === "ALL" || student.profile.semester.toString() === semesterFilter;
    
    return matchSearch && matchProdi && matchSemester;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const handleOpenAdd = () => {
    setFormData({ nim: "", nama: "", prodi: "", jenjang: "", semester: "", alamat: "" });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: StudentData) => {
    setFormData({
      nim: student.profile.nim,
      nama: student.profile.nama,
      prodi: student.profile.prodi,
      jenjang: student.profile.jenjang,
      semester: student.profile.semester,
      alamat: student.profile.alamat
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim || !formData.nama || !formData.prodi || !formData.jenjang || formData.semester === "") {
      alert("Mohon lengkapi data wajib (termasuk Jenjang)."); return;
    }
    const newProfile = {
      nim: formData.nim,
      nama: formData.nama,
      prodi: formData.prodi,
      jenjang: formData.jenjang,
      semester: Number(formData.semester),
      alamat: formData.alamat,
    };

    if (isEditing) {
      setDataList((prev) => prev.map((item) => item.id === formData.nim ? { ...item, profile: newProfile } : item));
    } else {
      if (dataList.some((s) => s.id === formData.nim)) { alert("NIM sudah terdaftar!"); return; }
      setDataList((prev) => [{ id: formData.nim, profile: newProfile, transcript: [] }, ...prev]);
    }
    setIsFormOpen(false);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setDataList((prev) => prev.filter((item) => item.id !== deleteId));
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  // --- COLUMNS ---
  const columns: Column<StudentData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    
    // --- KOLOM NIM ---
    {
      header: "NIM",
      accessorKey: "id",
      className: "w-[120px]",
      render: (row) => (
        <span className="font-mono font-medium text-gray-700">
          {row.profile.nim}
        </span>
      )
    },
    // -----------------

    { header: "Nama Lengkap", render: (row) => <span className="font-semibold text-gray-800">{row.profile.nama}</span> },
    { header: "Program Studi", render: (row) => <span className="text-gray-600">{row.profile.prodi}</span> },
    
    // --- KOLOM JENJANG ---
    {
      header: "Jenjang",
      className: "text-center w-[80px]",
      render: (row) => (
         <Badge variant="outline" className="font-mono font-normal bg-slate-50 text-slate-700">
            {row.profile.jenjang}
         </Badge>
      )
    },
    // ---------------------

    { 
      header: "Semester", 
      className: "text-center w-[100px] text-gray-700", 
      render: (row) => row.profile.semester 
    },
    
    // --- KOLOM ALAMAT ---
    {
      header: "Alamat",
      className: "max-w-[250px]", 
      render: (row) => (
        <Tooltip content={row.profile.alamat} position="top">
          <div className="truncate text-gray-600 cursor-default">
            {row.profile.alamat}
          </div>
        </Tooltip>
      )
    },
    // --------------------

    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            onClick={() => handleOpenEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => openDeleteModal(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // --- FILTER CONTENT ---
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
            onSearchChange={handleSearchChange}
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

      {/* MODAL FORM */}
      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title={isEditing ? "Edit Data Mahasiswa" : "Tambah Mahasiswa Baru"}
        description="Pastikan data mahasiswa yang dimasukkan sudah benar."
        onSubmit={handleSubmit}
        maxWidth="sm:max-w-[600px]"
      >
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="grid gap-2 col-span-3">
              <Label htmlFor="nim">NIM</Label>
              <Input 
                id="nim" 
                value={formData.nim} 
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })} 
                disabled={isEditing} 
                placeholder="Contoh: 4121001" 
                required 
              />
            </div>
            <div className="grid gap-2 col-span-1">
              <Label htmlFor="semester">Smt</Label>
              <Input 
                id="semester" 
                type="number" 
                min={1} 
                max={14} 
                value={formData.semester} 
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })} 
                placeholder="1" 
                required 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input 
              id="nama" 
              value={formData.nama} 
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })} 
              placeholder="Contoh: Budi Santoso" 
              required 
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
             <div className="grid gap-2 col-span-3">
                <Label htmlFor="prodi">Program Studi</Label>
                <Select value={formData.prodi} onValueChange={(val) => setFormData({ ...formData, prodi: val })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Program Studi" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teknik Informatika">Teknik Informatika</SelectItem>
                    <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
                    <SelectItem value="Manajemen Informatika">Manajemen Informatika</SelectItem>
                    <SelectItem value="Komputerisasi Akuntansi">Komputerisasi Akuntansi</SelectItem>
                    <SelectItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             
             {/* --- UPDATE BAGIAN JENJANG DI SINI --- */}
             <div className="grid gap-2 col-span-1">
                <Label htmlFor="jenjang">Jenjang</Label>
                <Select value={formData.jenjang} onValueChange={(val) => setFormData({ ...formData, jenjang: val })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D3">D3</SelectItem>
                    <SelectItem value="S1">S1</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             {/* ------------------------------------ */}

          </div>

          <div className="grid gap-2">
            <Label htmlFor="alamat">Alamat Domisili</Label>
            <Input 
              id="alamat" 
              value={formData.alamat} 
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} 
              placeholder="Contoh: Jl. Perjuangan No. 1, Cirebon" 
            />
          </div>
        </div>
      </FormModal>

      {/* MODAL KONFIRMASI DELETE */}
      <ConfirmModal 
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Data Mahasiswa?"
        description={`Apakah Anda yakin ingin menghapus data mahasiswa dengan NIM ${deleteId}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />

    </div>
  );
}