"use client";

import React, { useMemo, useState, useEffect } from "react";
import { type StudentData } from "@/lib/types";
// [!code fix] Gunakan useLayout, bukan useLayoutContext
import { useLayout } from "@/app/context/LayoutContext"; 
import {
  calculateIPK,
  calculateSemesterTrend,
  calculateGradeDistribution,
  calculateTotalSKS,
  getCurrentSemester,
} from "@/lib/dashboard-helper";

import { getStudents } from "@/app/actions/students";
import { getCourses } from "@/app/actions/courses";

import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { SemesterBarChart } from "@/components/features/dashboard/SemesterBarChart";
import { GradeDonutChart } from "@/components/features/dashboard/GradeDonutChart";
import {
  UsersIcon,
  LibraryIcon,
  AwardIcon,
  TrendingUpIcon,
} from "@/components/features/dashboard/DashboardIcons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardPage() {
  // [!code fix] Ambil user dari useLayout()
  const { user } = useLayout(); 
  
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [courseCount, setCourseCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          getStudents(),
          getCourses(),
        ]);

        setStudentData(studentsRes as unknown as StudentData[]);
        setCourseCount(coursesRes ? coursesRes.length : 0);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        toast.error("Gagal memuat data dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const { statData, trendData, gradeDistData } = useMemo(() => {
    if (isLoading) {
      return {
        statData: [],
        trendData: [],
        gradeDistData: {
          counts: { A: 0, B: 0, C: 0, D: 0, E: 0 },
          totalGrades: 0,
          totalAM: 0,
        },
      };
    }

    // [!code fix] Definisikan tipe array secara eksplisit untuk menghindari error implicit any
    let stats: {
      label: string;
      value: string;
      description: string;
      icon: React.ReactNode;
      themeColor: "chart-1" | "chart-2" | "chart-3" | "chart-4";
    }[] = [];

    let trend: { label: string; val: number; height: string }[] = [];
    
    let dist = { counts: { A: 0, B: 0, C: 0, D: 0, E: 0 }, totalGrades: 0, totalAM: 0 };

    const isMahasiswa = user?.role === "mahasiswa";
    const currentUsername = user?.username;

    if (isMahasiswa && currentUsername) {
      // --- VIEW MAHASISWA (PERSONAL) ---
      // [!code fix] Akses nim via s.profile.nim sesuai tipe StudentData
      const myData = studentData.find((s) => s.profile.nim === currentUsername);
      
      if (myData) {
        const myIPK = calculateIPK(myData.transcript).toFixed(2);
        const totalSKS = calculateTotalSKS(myData.transcript);
        const currentSmt = getCurrentSemester(myData.transcript);
        const totalMK = myData.transcript.length;

        stats = [
          {
            label: "Indeks Prestasi Kumulatif",
            value: myIPK,
            description: "Skala Indeks 4.00",
            icon: <AwardIcon className="w-6 h-6" />,
            themeColor: "chart-1",
          },
          {
            label: "Total SKS",
            value: totalSKS.toString(),
            description: "SKS Diambil",
            icon: <LibraryIcon className="w-6 h-6" />,
            themeColor: "chart-2",
          },
          {
            label: "Total Mata Kuliah",
            value: totalMK.toString(),
            description: "Mata Kuliah Diambil",
            icon: <TrendingUpIcon className="w-6 h-6" />,
            themeColor: "chart-3",
          },
          {
            label: "Semester Berjalan",
            value: `${currentSmt}`,
            description: "Status Akademik",
            icon: <UsersIcon className="w-6 h-6" />, 
            themeColor: "chart-4",
          },
        ];

        trend = calculateSemesterTrend([myData]); 
        dist = calculateGradeDistribution([myData]);
      } else {
        stats = [
            { label: "Data Tidak Ditemukan", value: "-", description: "Hubungi Admin", icon: <UsersIcon className="w-6 h-6"/>, themeColor: "chart-1" },
        ];
      }
    } else {
      // --- VIEW ADMIN / DOSEN (GLOBAL) ---
      const currentStudentCount = studentData.length;
      let totalIPK = 0;

      studentData.forEach((s) => {
        totalIPK += calculateIPK(s.transcript);
      });

      const avgIPK =
        currentStudentCount > 0
          ? (totalIPK / currentStudentCount).toFixed(2)
          : "0.00";
      
      dist = calculateGradeDistribution(studentData);
      trend = calculateSemesterTrend(studentData);
      const avgGradePoint =
        dist.totalGrades > 0
          ? (dist.totalAM / dist.totalGrades).toFixed(2)
          : "0.00";

      stats = [
        {
          label: "Total Mahasiswa",
          value: currentStudentCount.toLocaleString(),
          description: "Mahasiswa Aktif",
          icon: <UsersIcon className="w-6 h-6" />,
          themeColor: "chart-1",
        },
        {
          label: "Total Mata Kuliah",
          value: courseCount.toString(),
          description: "Kurikulum Berjalan",
          icon: <LibraryIcon className="w-6 h-6" />,
          themeColor: "chart-2",
        },
        {
          label: "Rata-rata Nilai",
          value: avgGradePoint,
          description: "Skala Indeks 4.00",
          icon: <AwardIcon className="w-6 h-6" />,
          themeColor: "chart-3",
        },
        {
          label: "Rata-rata IPK",
          value: avgIPK,
          description: "Performa Angkatan",
          icon: <TrendingUpIcon className="w-6 h-6" />,
          themeColor: "chart-4",
        },
      ];
    }

    return {
      statData: stats,
      trendData: trend,
      gradeDistData: dist,
    };
  }, [studentData, courseCount, isLoading, user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardHeader />

      {/* ===== STAT GRID ===== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-start justify-between h-[130px]"
              >
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            ))
          : statData.map((s, idx) => <StatCard key={idx} {...s} />)}
      </div>

      {/* ===== GRAFIK GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-7">
        {isLoading ? (
          <>
            <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-sm flex flex-col h-[450px] overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-muted/40">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="p-6 flex-1 flex items-end justify-between gap-4">
                {[40, 70, 50, 80, 60, 90, 55, 75].map((h, idx) => (
                  <Skeleton
                    key={idx}
                    className="w-full rounded-t-xl"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 rounded-xl border border-border bg-card shadow-sm flex flex-col h-[450px] overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-muted/40">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="p-6 flex-1 flex flex-col items-center justify-center">
                <Skeleton className="h-52 w-52 rounded-full mb-8" />
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full px-4">
                  {[1, 2, 3, 4].map((_, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center"
                    >
                      <div className="flex gap-2 items-center">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <SemesterBarChart data={trendData} />
            <GradeDonutChart
              counts={gradeDistData.counts}
              total={gradeDistData.totalGrades}
            />
          </>
        )}
      </div>
    </div>
  );
}