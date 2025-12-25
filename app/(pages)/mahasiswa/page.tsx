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

// --- IMPORT CUSTOM COMPONENTS ---
import { DataTable, type Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";

// --- IMPORT DATA ---
import { students as initialData, type StudentData } from "@/lib/data";

// --- TYPES ---
interface StudentFormState {
  nim: string;
  nama: string;
  prodi: string;
  semester: number | string; // Bisa kosong saat input awal
  alamat: string;
}

export default function MahasiswaPage() {
  // --- STATE ---
  const [dataList, setDataList] = useState<StudentData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Disamakan dengan Mata Kuliah (default 5)

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentFormState>({
    nim: "", nama: "", prodi: "", semester: "", alamat: ""
  });

  // --- LOGIC SEARCH & PAGINATION ---
  const filteredData = dataList.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.profile.nama.toLowerCase().includes(query) ||
      student.profile.nim.toLowerCase().includes(query) ||
      student.profile.prodi.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- COLUMNS DEFINITION ---
  const columns: Column<StudentData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    {
      header: "NIM",
      accessorKey: "id", // id sama dengan nim di struktur data
      className: "w-[120px]",
      render: (row) => (
        <Badge variant="outline" className="font-mono font-normal bg-slate-50 text-slate-700">
          {row.profile.nim}
        </Badge>
      )
    },
    {
      header: "Nama Lengkap",
      render: (row) => <span className="font-semibold text-gray-800">{row.profile.nama}</span>
    },
    {
      header: "Program Studi",
      render: (row) => <span className="text-gray-600">{row.profile.prodi}</span>
    },
    {
      header: "Semester",
      className: "text-center w-[100px]",
      render: (row) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
          {row.profile.semester}
        </span>
      )
    },
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
            title="Edit Data"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
            title="Hapus Data"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // --- HANDLERS ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const handleOpenAdd = () => {
    setFormData({ nim: "", nama: "", prodi: "", semester: "", alamat: "" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (student: StudentData) => {
    setFormData({
      nim: student.profile.nim,
      nama: student.profile.nama,
      prodi: student.profile.prodi,
      semester: student.profile.semester,
      alamat: student.profile.alamat
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Hapus data mahasiswa dengan NIM ${id}?`)) {
      setDataList((prev) => prev.filter((item) => item.id !== id));
      // Reset page jika data terakhir di halaman tersebut dihapus
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!formData.nim || !formData.nama || !formData.prodi || formData.semester === "") {
      alert("Mohon lengkapi data wajib (NIM, Nama, Prodi, Semester).");
      return;
    }

    const newProfile = {
      nim: formData.nim,
      nama: formData.nama,
      prodi: formData.prodi,
      semester: Number(formData.semester),
      alamat: formData.alamat,
    };

    if (isEditing) {
      setDataList((prev) =>
        prev.map((item) => 
          item.id === formData.nim 
            ? { ...item, profile: newProfile } 
            : item
        )
      );
    } else {
      // Cek Duplikat NIM
      if (dataList.some((s) => s.id === formData.nim)) {
        alert("NIM sudah terdaftar!");
        return;
      }
      
      const newStudent: StudentData = {
        id: formData.nim,
        profile: newProfile,
        transcript: [] // Transcript kosong untuk data baru
      };
      
      setDataList((prev) => [newStudent, ...prev]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Data Mahasiswa" 
        breadcrumb={["SIAKAD", "Mahasiswa"]} 
      />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          
          {/* MENGGUNAKAN KOMPONEN DATATABLE (SAMA SEPERTI MATA KULIAH) */}
          <DataTable 
            data={currentData}
            columns={columns}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Cari Nama, NIM, atau Prodi..."
            
            onAdd={handleOpenAdd}
            addLabel="Tambah Mahasiswa"
            
            // Pagination Props
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredData.length}
          />

        </CardContent>
      </Card>

      {/* --- FORM MODAL (REUSABLE COMPONENT) --- */}
      <FormModal
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        title={isEditing ? "Edit Data Mahasiswa" : "Tambah Mahasiswa Baru"}
        description="Pastikan data mahasiswa yang dimasukkan sudah benar."
        onSubmit={handleSubmit}
        maxWidth="sm:max-w-[600px]"
      >
        <div className="grid gap-5 py-4">
          
          {/* Row 1: NIM & Semester */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="nim">NIM (Nomor Induk Mahasiswa)</Label>
              <Input 
                id="nim" 
                value={formData.nim} 
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })} 
                disabled={isEditing} // NIM tidak boleh diedit (Primary Key)
                placeholder="Contoh: 4121001" 
                required 
              />
            </div>
            <div className="grid gap-2 col-span-1">
              <Label htmlFor="semester">Semester</Label>
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

          {/* Row 2: Nama Lengkap */}
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

          {/* Row 3: Program Studi */}
          <div className="grid gap-2">
            <Label htmlFor="prodi">Program Studi</Label>
            <Select 
              value={formData.prodi} 
              onValueChange={(val) => setFormData({ ...formData, prodi: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Program Studi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teknik Informatika">Teknik Informatika</SelectItem>
                <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
                <SelectItem value="Manajemen Informatika">Manajemen Informatika</SelectItem>
                <SelectItem value="Komputerisasi Akuntansi">Komputerisasi Akuntansi</SelectItem>
                <SelectItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 4: Alamat */}
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

    </div>
  );
}