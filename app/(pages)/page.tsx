"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { students, coursesList, StudentData, TranscriptItem } from "../../lib/data";

/* ================= TYPES ================= */

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  colorTheme: "blue" | "purple" | "amber" | "emerald"; // Tema warna untuk kartu
};

/* ================= HELPER FUNCTIONS ================= */

// Menghitung IPK (Indeks Prestasi Kumulatif)
function calculateIPK(transcript: TranscriptItem[]) {
  const totalSKS = transcript.reduce((acc, curr) => acc + curr.sks, 0);
  const totalNM = transcript.reduce((acc, curr) => acc + curr.nm, 0);
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

// Menghitung IPS (Indeks Prestasi Semester)
function calculateStudentIPS(transcript: TranscriptItem[], semester: number) {
  const semesterItems = transcript.filter((t) => t.smt === semester);
  if (semesterItems.length === 0) return null;

  const totalSKS = semesterItems.reduce((acc, curr) => acc + curr.sks, 0);
  const totalNM = semesterItems.reduce((acc, curr) => acc + curr.nm, 0);
  
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

// Menghitung Tren Rata-rata IPS per Semester
function calculateSemesterTrend(allStudents: StudentData[]) {
  let maxSmt = 0;
  allStudents.forEach(s => {
    s.transcript.forEach(t => {
      if (t.smt > maxSmt) maxSmt = t.smt;
    });
  });

  const trendData = [];

  for (let smt = 1; smt <= maxSmt; smt++) {
    let totalIPS = 0;
    let countStudent = 0;

    allStudents.forEach((student) => {
      const ips = calculateStudentIPS(student.transcript, smt);
      if (ips !== null) {
        totalIPS += ips;
        countStudent++;
      }
    });

    const avgIPS = countStudent > 0 ? totalIPS / countStudent : 0;
    const heightPercentage = Math.min((avgIPS / 4) * 100, 100);

    trendData.push({
      label: `Smt ${smt}`,
      val: Number(avgIPS.toFixed(2)),
      height: `${heightPercentage}%`,
    });
  }

  return trendData;
}

// Menghitung Distribusi Nilai
function calculateGradeDistribution(allStudents: StudentData[]) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let totalGrades = 0;
  let totalAM = 0;

  allStudents.forEach((student) => {
    student.transcript.forEach((item) => {
      const grade = item.hm as keyof typeof counts;
      if (counts[grade] !== undefined) {
        counts[grade]++;
        totalGrades++;
        totalAM += item.am;
      }
    });
  });

  return { counts, totalGrades, totalAM };
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  
  // --- CALCULATE REAL DATA ---
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
          colorTheme: "blue" as const 
        },
        { 
          label: "Total Mata Kuliah", 
          value: courseCount.toString(), 
          description: "Kurikulum Berjalan", 
          icon: <LibraryIcon className="w-6 h-6" />, 
          colorTheme: "purple" as const 
        },
        { 
          label: "Rata-rata Nilai", 
          value: avgGradePoint, 
          description: "Skala Indeks 4.00", 
          icon: <AwardIcon className="w-6 h-6" />, 
          colorTheme: "amber" as const 
        },
        { 
          label: "Rata-rata IPK", 
          value: avgIPK, 
          description: "Performa Angkatan", 
          icon: <TrendingUpIcon className="w-6 h-6" />, 
          colorTheme: "emerald" as const 
        },
      ],
      trendData: trend,
      gradeDistData: dist,
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Akademik
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan performa akademik dan statistik data terkini.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:mt-6 md:mt-0">
          <Link
            href="/transkrip"
            className="inline-flex h-10 items-center gap-2 rounded-lg
                       bg-[#1B3F95] px-4 text-sm font-medium text-white
                       hover:bg-blue-800 shadow-sm shadow-blue-900/10 transition
                       focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <PrinterIcon className="h-4 w-4" />
            Cetak Transkrip
          </Link>
        </div>
      </div>

      {/* ===== STAT GRID (UPDATED) ===== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statData.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ===== GRAFIK GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* GRAFIK 1: TREN PERFORMA */}
        <section className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
          <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-blue-600" />
              Tren Rata-rata IPS Mahasiswa
            </h3>
          </header>

          <div className="p-6 flex-1 flex items-end justify-center min-h-[300px]">
            <SemesterBarChart data={trendData} />
          </div>
        </section>

        {/* GRAFIK 2: DISTRIBUSI NILAI */}
        <section className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
          <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <ChartPieIcon className="w-4 h-4 text-emerald-600" />
              Distribusi Nilai Mata Kuliah
            </h3>
          </header>

          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <GradeDonutChart counts={gradeDistData.counts} total={gradeDistData.totalGrades} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, description, icon, colorTheme }: StatCardProps) {
  // Mapping warna background dan text berdasarkan tema
  const themeStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-violet-50 text-violet-600 border-violet-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  const currentTheme = themeStyles[colorTheme];

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
            {description}
          </p>
        </div>
        
        {/* Icon Container with Color Theme */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${currentTheme} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// --- CUSTOM BAR CHART COMPONENT ---
function SemesterBarChart({ data }: { data: { label: string; val: number; height: string }[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-slate-400">Belum ada data nilai per semester.</div>;
  }

  return (
    <div className="w-full h-full flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2">
      {data.map((item, idx) => (
        <div key={idx} className="group relative flex-1 flex flex-col items-center justify-end h-full">
          {/* Tooltip Hover */}
          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap z-10">
            IPS: <span className="text-blue-200">{item.val}</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
          
          {/* Bar Container */}
          <div 
            className="w-full max-w-[48px] bg-slate-100 rounded-t-xl relative overflow-hidden group-hover:shadow-lg transition-all"
            style={{ height: item.height }}
          >
            {/* Bar Fill */}
            <div className="absolute bottom-0 left-0 right-0 bg-blue-600 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-blue-700 to-blue-500" />
          </div>

          {/* Label X-Axis */}
          <div className="mt-4 text-[10px] sm:text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors text-center uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- CUSTOM DONUT CHART COMPONENT ---
function GradeDonutChart({ counts, total }: { counts: { A: number; B: number; C: number; D: number; E: number }; total: number }) {
  if (total === 0) return <div className="text-sm text-slate-400">Belum ada data nilai.</div>;

  const pA = (counts.A / total) * 100;
  const pB = (counts.B / total) * 100;
  const pC = (counts.C / total) * 100;
  const pD = (counts.D / total) * 100;
  
  const stopA = pA;
  const stopB = stopA + pB;
  const stopC = stopB + pC;
  const stopD = stopC + pD;

  const gradient = `conic-gradient(
    #10B981 0% ${stopA}%, 
    #3B82F6 ${stopA}% ${stopB}%, 
    #F59E0B ${stopB}% ${stopC}%, 
    #EF4444 ${stopC}% ${stopD}%,
    #64748B ${stopD}% 100%
  )`;

  const legend = [
    { label: "A (Sangat Baik)", color: "bg-emerald-500", val: `${Math.round(pA)}%` },
    { label: "B (Baik)", color: "bg-blue-500", val: `${Math.round(pB)}%` },
    { label: "C (Cukup)", color: "bg-amber-500", val: `${Math.round(pC)}%` },
    { label: "D/E (Kurang)", color: "bg-red-500", val: `${Math.round(100 - stopC)}%` },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-52 h-52 rounded-full shadow-lg border-4 border-white" style={{ background: gradient }}>
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
          <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{total}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Total Nilai</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-4 w-full px-4">
        {legend.map((l, i) => (
          <div key={i} className="flex items-center justify-between text-sm group cursor-default">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${l.color} ring-2 ring-white shadow-sm group-hover:scale-125 transition-transform`} />
              <span className="text-slate-600 font-medium text-xs sm:text-sm group-hover:text-slate-900 transition-colors">{l.label}</span>
            </div>
            <span className="font-bold text-slate-800 text-xs sm:text-sm">{l.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ICONS (REFINED) ================= */

function PrinterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LibraryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 6 4 14" />
      <path d="M12 6v14" />
      <path d="M8 8v12" />
      <path d="M4 4v16" />
    </svg>
  );
}

function AwardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ChartPieIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}