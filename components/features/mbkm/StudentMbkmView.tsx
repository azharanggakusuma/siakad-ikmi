"use client";

  /* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { BookOpen } from "lucide-react";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { getMbkmStudents } from "@/app/actions/mbkm";
import { StudentMBKM } from "@/lib/types";
import { useLayout } from "@/app/context/LayoutContext";

interface StudentMbkmViewProps {
  initialData: StudentMBKM[];
}

export default function StudentMbkmView({ initialData }: StudentMbkmViewProps) {
  const { user } = useLayout();
  const [dataList, setDataList] = useState<StudentMBKM[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("ALL");
  const [periodeFilter, setPeriodeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === FETCH DATA (REMOVED) ===
  // initialData passed from Server Component

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      const query = searchQuery.toLowerCase();
      // Search by Mitra or Jenis MBKM or Lokasi
      const matchSearch =
        item.mitra.toLowerCase().includes(query) ||
        item.jenis_mbkm.toLowerCase().includes(query) ||
        (item.lokasi || "").toLowerCase().includes(query);

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

  // Derive unique values for filters from existing data
  const uniquePeriods = useMemo(() => {
    const periods = dataList.map(item => item.academic_year?.nama).filter(Boolean) as string[];
    return Array.from(new Set(periods)).sort().reverse();
  }, [dataList]);

  const uniqueTypes = useMemo(() => {
      const types = dataList.map(item => item.jenis_mbkm).filter(Boolean);
      return Array.from(new Set(types)).sort();
  }, [dataList]);

  // --- COLUMNS ---
  const columns: Column<StudentMBKM>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
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
        header: "Lokasi",
        accessorKey: "lokasi",
        className: "min-w-[150px] text-gray-600",
        render: (row) => row.lokasi || "-"
      },
  ];

  // --- FILTER DROPDOWN CONTENT ---
  const filterContent = (
    <>
      <DropdownMenuLabel>Periode Akademik</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={periodeFilter} onValueChange={(v) => { setPeriodeFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {uniquePeriods.map((p) => (
           <DropdownMenuRadioItem key={p} value={p}>{p}</DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuLabel>Jenis MBKM</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={jenisFilter} onValueChange={(v) => { setJenisFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {uniqueTypes.map((t) => (
            <DropdownMenuRadioItem key={t} value={t}>{t}</DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );

  // --- EMPTY STATE ---
  if (!isLoading && dataList.length === 0) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* SIMPLE ELEGANT EMPTY STATE */}
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Program MBKM</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                    Anda belum terdaftar dalam program MBKM pada periode akademik ini.
                    Data akan muncul di sini setelah Anda mendaftar dan disetujui.
                </p>
            </div>
        </div>
      );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* TABLE DATA */}
        <Card className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-4 sm:p-6">
                <DataTable 
                data={currentData}
                columns={columns}
                isLoading={isLoading}
                
                // Search & Filter
                searchQuery={searchQuery}
                onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                searchPlaceholder="Cari Mitra atau Program..."
                isSearchVisible={true}
                
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
    </div>
  );
}
