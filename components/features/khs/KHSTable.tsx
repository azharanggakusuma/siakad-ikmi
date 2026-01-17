"use client";

import React, { useMemo } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { TranscriptItem } from "@/lib/types";
import { Printer } from "lucide-react";

interface KHSTableProps {
  data: TranscriptItem[];
  loading?: boolean;
  onPrint?: () => void;
}

export default function KHSTable({ data, loading = false, onPrint }: KHSTableProps) {
  // Helper Helper warna badge nilai (sama seperti di StudentGradeView)
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A": return "bg-emerald-100 text-emerald-700 border-emerald-200/60";
      case "B": return "bg-blue-100 text-blue-700 border-blue-200/60";
      case "C": return "bg-yellow-100 text-yellow-700 border-yellow-200/60";
      case "D": return "bg-orange-100 text-orange-700 border-orange-200/60";
      case "E": return "bg-red-100 text-red-700 border-red-200/60";
      default: return "bg-slate-100 text-slate-700 border-slate-200/60";
    }
  };

  const columns: Column<TranscriptItem>[] = [
    {
      header: "No",
      className: "w-[50px] text-center",
      render: (_, index) => <div className="text-center text-slate-500 text-xs">{index + 1}</div>
    },
    {
      header: "Kode",
      className: "w-[100px]",
      render: (row) => <span className="font-mono text-slate-600 font-medium text-xs">{row.kode}</span>
    },
    {
      header: "Mata Kuliah",
      render: (row) => (
        <div className="font-medium text-slate-800 text-sm py-1">{row.matkul}</div>
      )
    },
    {
        header: "SKS",
        className: "text-center w-[60px]",
        render: (row) => <span className="text-slate-600 text-sm">{row.sks}</span>
    },
    {
        header: "Nilai (HM)",
        className: "text-center w-[100px]",
        render: (row) => (
           <div className="flex justify-center">
             <Badge variant="outline" className={`${getGradeBadge(row.hm)} w-7 h-7 p-0 flex items-center justify-center rounded-full text-xs font-bold shadow-none`}>
                {row.hm}
             </Badge>
           </div>
        )
    },
    {
        header: "Bobot (AM)",
        className: "text-center w-[100px]",
        render: (row) => <span className="font-semibold text-slate-600 text-sm">{row.am}</span>
    },
    {
        header: "Mutu (NM)",
        className: "text-center w-[100px]",
        render: (row) => <span className="font-semibold text-slate-600 text-sm">{row.nm}</span>
    }
  ];

  // State for search and pagination
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    return data.filter((item) =>
      item.matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <DataTable
      columns={columns}
      data={paginatedData}
      isLoading={loading}
      searchPlaceholder="Cari Mata Kuliah..."
      searchQuery={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      startIndex={startIndex}
      endIndex={endIndex}
      totalItems={filteredData.length}
      isSearchVisible={true}
      onAdd={onPrint}
      addLabel="Cetak KHS"
      addIcon={<Printer className="mr-2 h-4 w-4" />}
    />
  );
}
