// components/features/nilai/StudentTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { StudentData, StudyProgram } from "@/lib/types";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface StudentTableProps {
  data: StudentData[];
  studyPrograms: StudyProgram[]; // Tambah props ini
  isLoading: boolean;
  onEdit: (student: StudentData) => void;
}

export function StudentTable({
  data,
  studyPrograms,
  isLoading,
  onEdit,
}: StudentTableProps) {
  
  // === STATE INTERNAL ===
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProdi, setFilterProdi] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === FILTERING LOGIC ===
  const filteredData = useMemo(() => {
    let result = data;

    // 1. Filter Pencarian
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.profile.nama.toLowerCase().includes(lowerQuery) ||
          student.profile.nim.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Filter Prodi (Perbaikan akses data)
    if (filterProdi !== "ALL") {
      result = result.filter((student) => student.profile.study_program?.nama === filterProdi);
    }

    return result;
  }, [data, searchQuery, filterProdi]);

  // === PAGINATION LOGIC ===
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === DEFINISI KOLOM ===
  const columns: Column<StudentData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>
    },
    {
      header: "NIM",
      className: "w-[120px]",
      render: (row) => <span className="font-mono font-medium">{row.profile.nim}</span>
    },
    {
      header: "Nama Mahasiswa",
      render: (row) => (
         <p className="font-semibold text-slate-800">{row.profile.nama}</p>
      )
    },
    {
      header: "Prodi",
      className: "w-[180px]",
      // Perbaikan: Ambil nama dari relasi
      render: (row) => <span className="text-slate-600 text-sm">{row.profile.study_program?.nama || "-"}</span>
    },
    {
      header: "Jenjang",
      className: "w-[100px] text-center",
      // Perbaikan: Ambil jenjang dari relasi
      render: (row) => <span className="text-slate-600 text-sm">{row.profile.study_program?.jenjang || "-"}</span>
    },
    {
      header: "Semester",
      className: "w-[100px] text-center",
      render: (row) => (
        <span className="font-medium text-slate-700">{row.profile.semester}</span>
      )
    },
    {
        header: "SKS Diambil",
        className: "w-[100px] text-center",
        render: (row) => {
            const totalSKS = row.transcript.reduce((acc, curr) => acc + curr.sks, 0);
            return <span className="font-medium">{totalSKS}</span>
        }
    },
    {
      header: "Aksi",
      className: "text-center w-[130px]",
      render: (row) => (
        <Button 
            size="sm" 
            className="h-8 w-full font-medium shadow-sm"
            onClick={() => onEdit(row)}
        >
            <PencilLine className="w-3.5 h-3.5 mr-2" />
            Kelola Nilai
        </Button>
      )
    }
  ];

  // === KONTEN FILTER DROPDOWN ===
  const filterContent = (
    <>
      <DropdownMenuLabel>Filter Program Studi</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup 
        value={filterProdi} 
        onValueChange={(v) => {
             setFilterProdi(v);
             setCurrentPage(1);
        }}
      >
        <DropdownMenuRadioItem value="ALL">Semua Prodi</DropdownMenuRadioItem>
        {/* Render dinamis dari props studyPrograms */}
        {studyPrograms.map((p) => (
            <DropdownMenuRadioItem key={p.id} value={p.nama}>
                {p.nama}
            </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );

  return (
    <DataTable
      data={currentData}
      columns={columns}
      isLoading={isLoading}
      
      searchQuery={searchQuery}
      onSearchChange={(e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      }}
      searchPlaceholder="Cari Nama Mahasiswa / NIM..."
      
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      startIndex={startIndex}
      endIndex={endIndex}
      totalItems={filteredData.length}
      
      filterContent={filterContent}
      isFilterActive={filterProdi !== "ALL"}
      onResetFilter={() => {
        setFilterProdi("ALL");
        setSearchQuery("");
        setCurrentPage(1);
      }}
    />
  );
}