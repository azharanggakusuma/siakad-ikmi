"use client";

import React, { useMemo, useState, useEffect } from "react";
// PERBAIKAN: Import dari types, bukan data
import { type StudentData } from "@/lib/types";
import {
  calculateIPK,
  calculateSemesterTrend,
  calculateGradeDistribution,
} from "@/lib/dashboard-helper";

// Import Server Actions
import { getStudents } from "@/app/actions/students";
import { getCourses } from "@/app/actions/courses";

// Import Components
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

        // Casting agar sesuai dengan tipe data
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

    const currentStudentCount = studentData.length;
    let totalIPK = 0;

    studentData.forEach((s) => {
      totalIPK += calculateIPK(s.transcript);
    });

    const avgIPK =
      currentStudentCount > 0
        ? (totalIPK / currentStudentCount).toFixed(2)
        : "0.00";
    const dist = calculateGradeDistribution(studentData);
    const trend = calculateSemesterTrend(studentData);
    const avgGradePoint =
      dist.totalGrades > 0
        ? (dist.totalAM / dist.totalGrades).toFixed(2)
        : "0.00";

    return {
      statData: [
        {
          label: "Total Mahasiswa",
          value: currentStudentCount.toLocaleString(),
          description: "Mahasiswa Aktif",
          icon: <UsersIcon className="w-6 h-6" />,
          themeColor: "chart-1" as const,
        },
        {
          label: "Total Mata Kuliah",
          value: courseCount.toString(),
          description: "Kurikulum Berjalan",
          icon: <LibraryIcon className="w-6 h-6" />,
          themeColor: "chart-2" as const,
        },
        {
          label: "Rata-rata Nilai",
          value: avgGradePoint,
          description: "Skala Indeks 4.00",
          icon: <AwardIcon className="w-6 h-6" />,
          themeColor: "chart-3" as const,
        },
        {
          label: "Rata-rata IPK",
          value: avgIPK,
          description: "Performa Angkatan",
          icon: <TrendingUpIcon className="w-6 h-6" />,
          themeColor: "chart-4" as const,
        },
      ],
      trendData: trend,
      gradeDistData: dist,
    };
  }, [studentData, courseCount, isLoading]);

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
          : statData.map((s) => <StatCard key={s.label} {...s} />)}
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