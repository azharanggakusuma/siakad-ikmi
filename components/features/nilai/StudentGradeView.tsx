// components/features/nilai/StudentGradeView.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, Trophy, ScrollText } from "lucide-react";
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

  // Konfigurasi batas
  const MIN_SKS_LULUS = 144;
  const MAX_IPK = "4.00";

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

  // Persentase kelulusan
  const progressPercent = Math.min((summary.totalSKS / MIN_SKS_LULUS) * 100, 100);

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
        header: "SMT",
        className: "text-center w-[60px]",
        render: (row) => <span className="text-slate-600 text-sm">{row.semester}</span>
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
        // UPDATE: Hapus badge, gunakan teks biasa (semibold) agar sama seperti kolom Bobot
        render: (row) => <span className="font-semibold text-slate-600 text-sm">{row.nm}</span>
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 mt-4">
      
      {/* --- HEADER STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">  
        
        {/* CARD 1: IPK */}
        <Card className="col-span-1 md:col-span-2 border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-blue-800 to-blue-900">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy size={120} />
          </div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            {isLoading ? (
              <div className="flex flex-col justify-between h-full gap-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32 opacity-25" />
                        <Skeleton className="h-8 w-48 opacity-25" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Skeleton className="h-10 w-[240px] opacity-25" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                      <p className="text-blue-100 font-medium text-sm mb-1">Indeks Prestasi Kumulatif</p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-extrabold tracking-tight">{summary.ipk}</h2>
                        <span className="text-lg text-blue-200 font-medium">/ {MAX_IPK}</span>
                      </div>
                  </div>

                </div>
                
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md border border-white/10 backdrop-blur-sm">
                    <GraduationCap className="w-4 h-4 text-blue-50" />
                    <span className="text-sm font-medium text-blue-50">Total Nilai Mutu: {summary.totalNM}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md border border-white/10 backdrop-blur-sm">
                    <ScrollText className="w-4 h-4 text-blue-50" />
                    <span className="text-sm font-medium text-blue-50">Total Mata Kuliah: {data.length}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: Total SKS */}
        <Card className="border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-cyan-600 to-blue-600">
          <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12">
            <BookOpen size={140} />
          </div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            {isLoading ? (
               <div className="space-y-6">
                 <div className="space-y-3">
                     <Skeleton className="h-4 w-32 opacity-25" />
                     <div className="flex items-baseline gap-2">
                        <Skeleton className="h-10 w-16 opacity-25" />
                        <Skeleton className="h-6 w-12 opacity-25" />
                     </div>
                 </div>
                 <div className="space-y-2">
                    <Skeleton className="h-3 w-full opacity-25 rounded-full" />
                    <Skeleton className="h-3 w-3/4 opacity-25 rounded-full" />
                 </div>
               </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2 text-cyan-50 mb-1">
                    <span className="text-sm font-medium">Total SKS Lulus</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">{summary.totalSKS}</span>
                    <span className="text-lg text-cyan-100 font-medium">/ {MIN_SKS_LULUS} SKS</span>
                  </div>
                </div>
                <div className="mt-4">
                   <div className="w-full bg-black/20 rounded-full h-3 mb-3 overflow-hidden backdrop-blur-sm">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progressPercent}%` }} />
                   </div>
                   <p className="text-xs text-cyan-50/90 leading-relaxed font-medium">
                      {progressPercent.toFixed(0)}% dari minimal {MIN_SKS_LULUS} SKS untuk kelulusan Sarjana.
                   </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- TABEL NILAI --- */}
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