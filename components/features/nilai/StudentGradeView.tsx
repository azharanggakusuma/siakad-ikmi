// components/features/nilai/StudentGradeView.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, Trophy, Star, ScrollText } from "lucide-react";
import { getStudentGradeSummary } from "@/app/actions/grades";
import { useToastMessage } from "@/hooks/use-toast-message";

// Import DataTable Components
import { DataTable, type Column } from "@/components/ui/data-table";

export default function StudentGradeView({ user }: { user: any }) {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalSKS: 0, totalNM: 0, ipk: "0.00" });
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk DataTable
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { showError } = useToastMessage();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (user?.student_id) {
          const res = await getStudentGradeSummary(user.student_id);
          setData(res.grades);
          setSummary(res.summary);
        }
      } catch (error: any) {
        showError("Gagal", "Gagal memuat data nilai.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Helper warna badge nilai
  // [UPDATE] Hover effect dihapus (warna hover disamakan dengan background asli)
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A": return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "B": return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "C": return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      case "D": return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100";
      case "E": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      default: return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100";
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lower = searchQuery.toLowerCase();
    return data.filter(row => 
        row.matkul.toLowerCase().includes(lower) || 
        row.kode.toLowerCase().includes(lower)
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- COLUMN DEFINITION ---
  const columns: Column<any>[] = [
    {
      header: "No",
      className: "w-[50px] text-center",
      render: (_, index) => <div className="text-center text-slate-500 text-xs">{startIndex + index + 1}</div>
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
        header: "SMT",
        className: "text-center w-[60px]",
        render: (row) => <span className="text-slate-600 text-sm">{row.semester}</span>
    },
    {
        header: "Nilai (HM)",
        className: "text-center w-[100px]",
        render: (row) => (
           <div className="flex justify-center">
             <Badge variant="outline" className={`${getGradeBadge(row.hm)} w-8 h-8 flex items-center justify-center rounded-md font-bold shadow-sm`}>
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
        render: (row) => (
            <div className="flex justify-center">
                <span className="font-bold text-slate-700 text-sm bg-slate-100 px-2 py-1 rounded border border-slate-200 min-w-[30px] text-center">
                    {row.nm}
                </span>
            </div>
        )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* --- HEADER STATS (Layout Grid persis KRS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: IPK */}
        <Card className="col-span-1 md:col-span-2 border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-indigo-600 to-violet-800">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy size={140} />
          </div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32 opacity-25" />
                <Skeleton className="h-12 w-24 opacity-25" />
                <div className="flex gap-2"><Skeleton className="h-6 w-24 opacity-25" /></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                      <p className="text-indigo-100 font-medium text-sm mb-1">Indeks Prestasi Kumulatif</p>
                      <h2 className="text-5xl font-bold tracking-tight">{summary.ipk}</h2>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm shadow-inner border border-white/10">
                      <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium text-indigo-50 border border-white/10 backdrop-blur-sm">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Total Nilai Mutu: {summary.totalNM}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium text-indigo-50 border border-white/10 backdrop-blur-sm">
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>Total Mata Kuliah: {data.length}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: Total SKS */}
        <Card className="border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-pink-600 to-rose-600">
          <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12">
            <BookOpen size={140} />
          </div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            {isLoading ? (
               <div className="space-y-4">
                 <Skeleton className="h-4 w-32 opacity-25" />
                 <Skeleton className="h-10 w-16 opacity-25" />
                 <Skeleton className="h-2 w-full opacity-25 rounded-full" />
               </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2 text-pink-50 mb-1">
                    <span className="text-sm font-medium">Total SKS Lulus</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">{summary.totalSKS}</span>
                    <span className="text-lg text-pink-100 font-medium">SKS</span>
                  </div>
                </div>
                <div className="mt-4">
                   <div className="w-full bg-black/20 rounded-full h-2 mb-2 overflow-hidden backdrop-blur-sm">
                      <div className="h-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${Math.min((summary.totalSKS / 144) * 100, 100)}%` }} />
                   </div>
                   <p className="text-xs text-pink-50/90 font-medium mt-1">
                      {((summary.totalSKS / 144) * 100).toFixed(0)}% dari minimal 144 SKS
                   </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- TABEL NILAI (Dengan DataTable: Search & Pagination) --- */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-6">
            <DataTable
                data={currentData}
                columns={columns}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                searchPlaceholder="Cari Mata Kuliah atau Kode..."
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