"use client";

import React, { useMemo, useState, useEffect } from "react";
import { type StudentData } from "@/lib/types";
import { useLayout } from "@/app/context/LayoutContext";

// [UPDATE] Import dari Centralized Logic
import {
  calculateIPK,
  calculateTotalSKSLulus,
  calculateSemesterTrend,
} from "@/lib/grade-calculations";
import { calculateGradeDistribution } from "@/lib/dashboard-helper"; // Grade distribution masih oke pakai helper lama atau pindahkan jika mau

import { getStudents } from "@/app/actions/students";
import { getCourses } from "@/app/actions/courses";

import {
  UsersIcon,
  LibraryIcon,
  AwardIcon,
  TrendingUpIcon,
} from "@/components/features/dashboard/DashboardIcons";

import { 
  Activity,    
  CalendarDays  
} from "lucide-react";

import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { SemesterLineChart } from "@/components/features/dashboard/SemesterLineChart"; 
import { GradeDonutChart } from "@/components/features/dashboard/GradeDonutChart";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardPage() {
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

        setStudentData(studentsRes as StudentData[]);
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
      const myData = studentData.find((s) => s.profile.nim === currentUsername);
      
      if (myData) {
        // [UPDATE] GUNAKAN LOGIKA TERPUSAT
        const myIPK = calculateIPK(myData.transcript);
        const totalSKS = calculateTotalSKSLulus(myData.transcript);
        trend = calculateSemesterTrend(myData.transcript);
        // --------------------------------

        const currentSmt = myData.profile.semester; 
        const totalMK = myData.transcript.length;

        // Logika Deskripsi SKS
        const jenjang = myData.profile.study_program?.jenjang || "S1";
        const targetSKS = jenjang.includes("D3") ? 108 : 144;
        const sisaSKS = targetSKS - totalSKS;

        let deskripsiSKS = "";
        if (sisaSKS > 0) {
            deskripsiSKS = `${sisaSKS} SKS lagi untuk Lulus.`;
        } else {
            deskripsiSKS = "Syarat SKS Terpenuhi"; 
        }

        stats = [
          {
            label: "Total IPK",
            value: myIPK, // String fixed(2)
            description: "Skala Indeks 4.00", 
            icon: <AwardIcon className="w-6 h-6" />,
            themeColor: "chart-1",
          },
          {
            label: "Total SKS Lulus",
            value: totalSKS.toString(),
            description: deskripsiSKS,
            icon: <Activity className="w-6 h-6" />, 
            themeColor: "chart-2",
          },
          {
            label: "Mata Kuliah",
            value: totalMK.toString(),
            description: "Akumulasi Mata Kuliah Diambil", 
            icon: <LibraryIcon className="w-6 h-6" />,
            themeColor: "chart-3",
          },
          {
            label: "Semester",
            value: `${currentSmt}`,
            description: "Periode Akademik Aktif", 
            icon: <CalendarDays className="w-6 h-6" />,
            themeColor: "chart-4",
          },
        ];

        dist = calculateGradeDistribution([myData]);
      } else {
        stats = [
            { label: "Data Tidak Ditemukan", value: "-", description: "Hubungi Bagian Akademik", icon: <UsersIcon className="w-6 h-6"/>, themeColor: "chart-1" },
        ];
      }
    } else {
      // === TAMPILAN ADMIN/DOSEN ===
      const currentStudentCount = studentData.length;
      let totalIPK = 0;

      // Hitung rata-rata IPK seluruh mahasiswa
      studentData.forEach((s) => {
        totalIPK += parseFloat(calculateIPK(s.transcript));
      });

      const avgIPK =
        currentStudentCount > 0
          ? (totalIPK / currentStudentCount).toFixed(2)
          : "0.00";
      
      dist = calculateGradeDistribution(studentData);
      // Untuk trend admin, bisa pakai logika rata-rata (opsional, disederhanakan disini)
      // trend = ... 
      
      const avgGradePoint =
        dist.totalGrades > 0
          ? (dist.totalAM / dist.totalGrades).toFixed(2)
          : "0.00";

      stats = [
        {
          label: "Total Mahasiswa",
          value: currentStudentCount.toLocaleString(),
          description: "Mahasiswa Terdaftar",
          icon: <UsersIcon className="w-6 h-6" />, 
          themeColor: "chart-1",
        },
        {
          label: "Total Mata Kuliah",
          value: courseCount.toString(),
          description: "MK Dalam Kurikulum",
          icon: <LibraryIcon className="w-6 h-6" />, 
          themeColor: "chart-2",
        },
        {
          label: "Rata-rata Nilai Mutu",
          value: avgGradePoint,
          description: "Standar Mutu Akademik",
          icon: <AwardIcon className="w-6 h-6" />, 
          themeColor: "chart-3",
        },
        {
          label: "Rata-rata IPK",
          value: avgIPK,
          description: "Rata-rata Mahasiswa",
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

      <div className="grid gap-6 lg:grid-cols-7">
         {/* Chart Section (Sama seperti sebelumnya) */}
         <SemesterLineChart 
            data={trendData} 
            title={user?.role === "mahasiswa" ? "Tren IPS Setiap Semester" : "Grafik Semester"} 
          />
          <GradeDonutChart
            counts={gradeDistData.counts}
            total={gradeDistData.totalGrades}
          />
      </div>
    </div>
  );
}