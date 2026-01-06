"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Components & Actions
import { MbkmForm } from "@/components/features/mbkm/MbkmForm";
import { getMbkmStudents, createMbkmStudent, updateMbkmStudent, deleteMbkmStudent } from "@/app/actions/mbkm";
import { getStudents } from "@/app/actions/students";
import { getAcademicYears } from "@/app/actions/academic-years";
import { StudentMBKM, StudentData, AcademicYear, StudentMBKMFormValues } from "@/lib/types";

export default function MbkmPage() {
  // Hook Custom untuk Toast & Loading
  const { successAction, confirmDeleteMessage, showError, showLoading } = useToastMessage();

  const [dataList, setDataList] = useState<StudentMBKM[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("ALL"); // Filter Jenis MBKM
  const [periodeFilter, setPeriodeFilter] = useState<string>("ALL"); // Filter Periode
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const [formData, setFormData] = useState<StudentMBKMFormValues | undefined>(undefined);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [mbkmData, studentData, yearData] = await Promise.all([
        getMbkmStudents(),
        getStudents(),
        getAcademicYears(),
      ]);
      setDataList(mbkmData);
      setStudents(studentData);
      setAcademicYears(yearData);
    } catch (error) {
      console.error(error);
      showError("Gagal Memuat Data", "Terjadi kendala saat mengambil data MBKM.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      // Search by NIM, Nama, atau Mitra
      const query = searchQuery.toLowerCase();
      const matchSearch =
        (item.student?.nim || "").toLowerCase().includes(query) ||
        (item.student?.nama || "").toLowerCase().includes(query) ||
        item.mitra.toLowerCase().includes(query);

      const matchJenis = jenisFilter === "ALL" || item.jenis_mbkm === jenisFilter;
      const matchPeriode = periodeFilter === "ALL" || item.academic_year?.nama === periodeFilter;

      return matchSearch && matchJenis && matchPeriode;
    });
  }, [dataList, searchQuery, jenisFilter, periodeFilter]);

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
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: StudentMBKM) => {
    setSelectedId(item.id);
    setFormData({
      student_id: item.student_id,
      academic_year_id: item.academic_year_id,
      jenis_mbkm: item.jenis_mbkm,
      mitra: item.mitra,
      keterangan: item.keterangan || ""
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: StudentMBKM) => {
    setSelectedId(item.id);
    setDeleteName(item.student?.nama || "Mahasiswa");
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (values: StudentMBKMFormValues) => {
    const toastId = showLoading("Menyimpan data...");
    try {
      if (isEditing && selectedId) {
        await updateMbkmStudent(selectedId, values);
        successAction("Data MBKM", "update", toastId);
      } else {
        await createMbkmStudent(values);
        successAction("Data MBKM", "create", toastId);
      }
      await fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Gagal Menyimpan", error.message, toastId);
    }
  };

  const confirmDelete = async () => {
    if (selectedId) {
      const toastId = showLoading("Menghapus data...");
      try {
        await deleteMbkmStudent(selectedId);
        successAction("Data MBKM", "delete", toastId);
        
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
        await fetchData();
      } catch (error: any) {
        showError("Gagal Menghapus", error.message, toastId);
      }
    }
    setIsDeleteOpen(false);
  };

  // --- COLUMNS ---
  const columns: Column<StudentMBKM>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    {
      header: "Mahasiswa",
      className: "min-w-[200px]",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{row.student?.nama}</span>
          <span className="text-xs text-muted-foreground font-mono">{row.student?.nim}</span>
        </div>
      )
    },
    {
      header: "Periode",
      className: "w-[150px]",
      render: (row) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 whitespace-nowrap">
          {row.academic_year?.nama} ({row.academic_year?.semester})
        </Badge>
      )
    },
    {
      header: "Program MBKM",
      accessorKey: "jenis_mbkm",
      className: "min-w-[180px] font-medium text-gray-700"
    },
    {
      header: "Mitra",
      accessorKey: "mitra",
      className: "min-w-[150px] text-gray-600"
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
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // --- FILTER DROPDOWN CONTENT ---
  const filterContent = (
    <>
      <DropdownMenuLabel>Periode Akademik</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={periodeFilter} onValueChange={(v) => { setPeriodeFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {academicYears.map((ay) => (
           <DropdownMenuRadioItem key={ay.id} value={ay.nama}>{ay.nama}</DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuLabel>Jenis MBKM</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={jenisFilter} onValueChange={(v) => { setJenisFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {[
          "Magang Bersertifikat", "Studi Independen", "Kampus Mengajar", 
          "Pertukaran Mahasiswa", "Wirausaha Merdeka", "Penelitian", "KKN Tematik"
        ].map((j) => (
            <DropdownMenuRadioItem key={j} value={j}>{j}</DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Mahasiswa MBKM" breadcrumb={["Akademik", "MBKM"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable 
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Nama, NIM, atau Mitra..."
            onAdd={handleOpenAdd}
            addLabel="Tambah MBKM"
            filterContent={filterContent}
            isFilterActive={jenisFilter !== "ALL" || periodeFilter !== "ALL"}
            onResetFilter={() => { setJenisFilter("ALL"); setPeriodeFilter("ALL"); setSearchQuery(""); }}
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
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        title={isEditing ? "Edit Data MBKM" : "Tambah Data MBKM"}
        description={isEditing ? "Perbarui informasi program MBKM mahasiswa." : "Daftarkan mahasiswa baru ke program MBKM."}
        maxWidth="sm:max-w-[550px]"
      >
        <MbkmForm
            key={isEditing && selectedId ? `edit-${selectedId}` : "create-new"} 
            initialData={formData}
            students={students}
            academicYears={academicYears}
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
        />
      </FormModal>

      <ConfirmModal 
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Data MBKM?"
        description={confirmDeleteMessage("Data MBKM", deleteName)}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}