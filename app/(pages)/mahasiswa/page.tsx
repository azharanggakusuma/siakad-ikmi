"use client";

import React, { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message"; 
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"; 
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
import { StudentForm } from "@/components/features/mahasiswa/StudentForm";
import { type StudentData, type StudentFormValues, type StudyProgram } from "@/lib/types";
import { getStudents, getStudyPrograms, createStudent, updateStudent, deleteStudent } from "@/app/actions/students";

export default function MahasiswaPage() {
  // [UPDATE] Ambil 'showError' untuk pesan custom
  const { successAction, confirmDeleteMessage, showError } = useToastMessage();

  const [dataList, setDataList] = useState<StudentData[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [prodiFilter, setProdiFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>(""); 
  const [formData, setFormData] = useState<StudentFormValues | undefined>(undefined);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [students, programs] = await Promise.all([
        getStudents(),
        getStudyPrograms()
      ]);
      setDataList(students);
      setStudyPrograms(programs);
    } catch (error) {
      console.error("Load Error:", error);
      // [UPDATE] Pesan Custom untuk Error Load
      showError(
        "Gagal Memuat Data",
        "Mohon maaf, sistem gagal memuat data mahasiswa. Silakan periksa koneksi internet Anda dan coba muat ulang halaman."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return dataList.filter((student) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        student.profile.nama.toLowerCase().includes(query) ||
        student.profile.nim.toLowerCase().includes(query);
      
      const matchProdi = prodiFilter === "ALL" || student.profile.study_program?.nama === prodiFilter;
      const matchSemester = semesterFilter === "ALL" || String(student.profile.semester) === semesterFilter;
      
      return matchSearch && matchProdi && matchSemester;
    });
  }, [dataList, searchQuery, prodiFilter, semesterFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(undefined);
    setSelectedId(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: StudentData) => {
    setSelectedId(student.id); 
    setFormData({
      nim: student.profile.nim,
      nama: student.profile.nama,
      study_program_id: student.profile.study_program_id ? String(student.profile.study_program_id) : "",
      semester: student.profile.semester,
      alamat: student.profile.alamat,
      is_active: student.profile.is_active 
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: StudentFormValues) => {
    try {
      if (isEditing && selectedId) {
        await updateStudent(selectedId, values);
        successAction("Mahasiswa", "update");
      } else {
        await createStudent(values);
        successAction("Mahasiswa", "create");
      }
      await fetchData(); 
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Save Error:", error);
      // [UPDATE] Pesan Custom untuk Error Save (Create/Update)
      // Menghandle kemungkinan duplikat data atau validasi
      const desc = error.message.includes("unique") 
        ? "NIM tersebut sudah terdaftar di sistem. Mohon gunakan NIM lain."
        : "Mohon maaf, data mahasiswa gagal disimpan. Pastikan semua input sudah benar atau coba lagi beberapa saat lagi.";
        
      showError("Gagal Menyimpan", desc);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        await deleteStudent(selectedId);
        successAction("Mahasiswa", "delete");
        
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        }
        await fetchData();
      } catch (error: any) {
        console.error("Delete Error:", error);
        // [UPDATE] Pesan Custom untuk Error Delete
        // Menjelaskan alasan kenapa tidak bisa dihapus (biasanya constraint foreign key)
        showError(
          "Gagal Menghapus", 
          "Data mahasiswa tidak dapat dihapus karena kemungkinan masih memiliki riwayat akademik (KRS/Nilai) atau tagihan aktif."
        );
      }
    }
    setIsDeleteOpen(false);
  };

  // --- COLUMNS ---
  const columns: Column<StudentData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    {
      header: "NIM",
      className: "w-[120px]",
      render: (row) => <span className="font-mono font-medium text-gray-700">{row.profile.nim}</span>
    },
    { 
      header: "Nama Lengkap", 
      render: (row) => <span className="font-semibold text-gray-800">{row.profile.nama}</span>
    },
    { 
      header: "Program Studi", 
      className: "w-[100px]",
      render: (row) => (
        <span className="text-gray-600">
          {row.profile.study_program ? row.profile.study_program.nama : "-"}
        </span>
      )
    },
    {
      header: "Jenjang",
      className: "text-center w-[100px]",
      render: (row) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-700">
          {row.profile.study_program ? row.profile.study_program.jenjang : "-"}
        </Badge>
      )
    },
    { 
      header: "Semester", 
      className: "text-center w-[80px]", 
      render: (row) => row.profile.semester 
    },
    {
        header: "Status",
        className: "text-center w-[120px]",
        render: (row) => (
          <Badge 
            variant={row.profile.is_active ? "default" : "destructive"} 
            className={`font-normal ${row.profile.is_active ? "bg-green-600" : ""}`}
          >
            {row.profile.is_active ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {row.profile.is_active ? "Aktif" : "Non-Aktif"}
          </Badge>
        )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="icon" className="text-yellow-600 hover:bg-yellow-50 h-8 w-8" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-600 hover:bg-red-50 h-8 w-8" 
            onClick={() => { 
                setSelectedId(row.id); 
                setDeleteName(row.profile.nama); 
                setIsDeleteOpen(true); 
            }}
          >
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
        {studyPrograms.map(p => (
           <DropdownMenuRadioItem key={p.id} value={p.nama}>{p.nama}</DropdownMenuRadioItem>
        ))}
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
      <PageHeader title="Data Mahasiswa" breadcrumb={["Beranda", "Mahasiswa"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
        title={isEditing ? "Edit Data Mahasiswa" : "Tambah Data Mahasiswa"}
        description={isEditing ? `Perbarui data mahasiswa atas nama ${formData?.nama}.` : "Lengkapi form di bawah untuk menambah data mahasiswa."}
        maxWidth="sm:max-w-[600px]"
      >
        <StudentForm 
            key={isEditing && selectedId ? `edit-${selectedId}` : "add-new"}
            initialData={formData}
            studyPrograms={studyPrograms} 
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Data Mahasiswa?"
        description={confirmDeleteMessage("Mahasiswa", deleteName)}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}