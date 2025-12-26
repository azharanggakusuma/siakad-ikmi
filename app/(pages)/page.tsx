"use client";

import React, { useMemo } from "react";
import { students, coursesList } from "@/lib/data";
import { 
  calculateIPK, 
  calculateSemesterTrend, 
  calculateGradeDistribution 
} from "@/lib/dashboard-helper";

// Import Components
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { SemesterBarChart } from "@/components/features/dashboard/SemesterBarChart";
import { GradeDonutChart } from "@/components/features/dashboard/GradeDonutChart";
import { UsersIcon, LibraryIcon, AwardIcon, TrendingUpIcon } from "@/components/features/dashboard/DashboardIcons";

export default function DashboardPage() {
  
  const { statData, trendData, gradeDistData } = useMemo(() => {
    const studentCount = students.length;
    const courseCount = coursesList.length;

    let totalIPK = 0;
    students.forEach(s => {
      totalIPK += calculateIPK(s.transcript);
    });
    const avgIPK = studentCount > 0 ? (totalIPK / studentCount).toFixed(2) : "0.00";

    const dist = calculateGradeDistribution(students);
    const trend = calculateSemesterTrend(students);
    const avgGradePoint = dist.totalGrades > 0 ? (dist.totalAM / dist.totalGrades).toFixed(2) : "0.00";

    return {
      statData: [
        { 
          label: "Total Mahasiswa", 
          value: studentCount.toLocaleString(), 
          description: "Mahasiswa Aktif", 
          icon: <UsersIcon className="w-6 h-6" />, 
          themeColor: "chart-1" as const 
        },
        { 
          label: "Total Mata Kuliah", 
          value: courseCount.toString(), 
          description: "Kurikulum Berjalan", 
          icon: <LibraryIcon className="w-6 h-6" />, 
          themeColor: "chart-2" as const 
        },
        { 
          label: "Rata-rata Nilai", 
          value: avgGradePoint, 
          description: "Skala Indeks 4.00", 
          icon: <AwardIcon className="w-6 h-6" />, 
          themeColor: "chart-3" as const 
        },
        { 
          label: "Rata-rata IPK", 
          value: avgIPK, 
          description: "Performa Angkatan", 
          icon: <TrendingUpIcon className="w-6 h-6" />, 
          themeColor: "chart-4" as const 
        },
      ],
      trendData: trend,
      gradeDistData: dist,
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <DashboardHeader />

      {/* ===== STAT GRID ===== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statData.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ===== GRAFIK GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-7">
        <SemesterBarChart data={trendData} />
        <GradeDonutChart counts={gradeDistData.counts} total={gradeDistData.totalGrades} />
      </div>
    </div>
  );
}