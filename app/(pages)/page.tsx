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
};

/* ================= HELPER FUNCTIONS ================= */

// Menghitung IPK (Indeks Prestasi Kumulatif) untuk satu mahasiswa
function calculateIPK(transcript: TranscriptItem[]) {
  const totalSKS = transcript.reduce((acc, curr) => acc + curr.sks, 0);
  const totalNM = transcript.reduce((acc, curr) => acc + curr.nm, 0);
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

// Menghitung IPS (Indeks Prestasi Semester) untuk satu mahasiswa pada semester tertentu
function calculateStudentIPS(transcript: TranscriptItem[], semester: number) {
  const semesterItems = transcript.filter((t) => t.smt === semester);
  if (semesterItems.length === 0) return null; // Mahasiswa tidak mengambil semester ini

  const totalSKS = semesterItems.reduce((acc, curr) => acc + curr.sks, 0);
  const totalNM = semesterItems.reduce((acc, curr) => acc + curr.nm, 0);
  
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

// Menghitung Rata-rata IPS per Semester (Mean of IPS)
function calculateSemesterTrend(allStudents: StudentData[]) {
  // Cari semester maksimal yang ada datanya
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
    // Hitung tinggi bar untuk visualisasi (skala 4.0)
    const heightPercentage = Math.min((avgIPS / 4) * 100, 100);

    trendData.push({
      label: `Smt ${smt}`,
      val: Number(avgIPS.toFixed(2)),
      height: `${heightPercentage}%`,
    });
  }

  return trendData;
}

// Menghitung Distribusi Nilai (A, B, C, D, E)
function calculateGradeDistribution(allStudents: StudentData[]) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let totalGrades = 0;
  let totalAM = 0; // Total Angka Mutu untuk rata-rata global

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
    // 1. Total Mahasiswa
    const studentCount = students.length;

    // 2. Mata Kuliah (Unique Courses)
    const courseCount = coursesList.length;

    // 3. Rata-rata IPK Global (Rata-rata dari IPK setiap mahasiswa)
    let totalIPK = 0;
    students.forEach(s => {
      totalIPK += calculateIPK(s.transcript);
    });
    const avgIPK = studentCount > 0 ? (totalIPK / studentCount).toFixed(2) : "0.00";

    // 4. Kalkulasi Data Statistik & Distribusi
    const dist = calculateGradeDistribution(students);
    const trend = calculateSemesterTrend(students);

    // 5. Rata-rata Nilai Global (Average Grade Point)
    // Menggantikan "Transkrip Terbit" (Total) dengan "Rata-rata Nilai"
    const avgGradePoint = dist.totalGrades > 0 ? (dist.totalAM / dist.totalGrades).toFixed(2) : "0.00";

    return {
      statData: [
        { label: "Total Mahasiswa", value: studentCount.toLocaleString(), description: "Data Aktif", icon: <UsersIcon /> },
        { label: "Mata Kuliah", value: courseCount.toString(), description: "Kurikulum Aktif", icon: <BookIcon /> },
        { label: "Rata-rata Nilai", value: avgGradePoint, description: "Seluruh Mata Kuliah", icon: <FileTextIcon /> }, // Diganti dari Total ke Rata-rata
        { label: "Rata-rata IPK", value: avgIPK, description: "Seluruh Mahasiswa", icon: <TrendingUpIcon /> },
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
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Selamat datang kembali. Berikut adalah ringkasan performa akademik rata-rata saat ini.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:mt-6 md:mt-0">
          <button
            type="button"
            className="hidden md:inline-flex h-10 items-center gap-2 rounded-lg
                       border border-slate-200 bg-white px-4 text-sm font-medium
                       text-slate-700 hover:bg-slate-50 shadow-sm transition
                       focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <DownloadIcon className="h-4 w-4 text-slate-500" />
            Download Report
          </button>

          <Link
            href="/transkrip"
            className="inline-flex h-10 items-center gap-2 rounded-lg
                       bg-[#1B3F95] px-4 text-sm font-medium text-white
                       hover:bg-blue-800 shadow-sm shadow-blue-900/10 transition
                       focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <PrinterIcon className="h-4 w-4" />
            Cetak Nilai
          </Link>
        </div>
      </div>

      {/* ===== STAT GRID ===== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statData.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ===== GRAFIK GRID ===== */}
      <div className="grid gap-4 lg:grid-cols-7">
        
        {/* GRAFIK 1: TREN PERFORMA (Bar Chart) */}
        <section className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <header className="p-6 border-b border-slate-100">
            <h3 className="font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-blue-600" />
              Tren Rata-rata IPS Mahasiswa
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Rata-rata Indeks Prestasi Semester (IPS) kumulatif seluruh mahasiswa.
            </p>
          </header>

          <div className="p-6 flex-1 flex items-end justify-center">
            <SemesterBarChart data={trendData} />
          </div>
        </section>

        {/* GRAFIK 2: DISTRIBUSI NILAI (Donut Chart) */}
        <section className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <header className="p-6 border-b border-slate-100">
            <h3 className="font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <ChartPieIcon className="w-4 h-4 text-emerald-600" />
              Distribusi Indeks Nilai
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Proporsi perolehan nilai (A/B/C/D/E) dari total {gradeDistData.totalGrades} entri nilai.
            </p>
          </header>

          <div className="p-6 flex-1 flex flex-col items-center justify-center">
            <GradeDonutChart counts={gradeDistData.counts} total={gradeDistData.totalGrades} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-slate-600">{label}</h3>
        <span className="text-slate-400">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>
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
    <div className="w-full h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
      {data.map((item, idx) => (
        <div key={idx} className="group relative flex-1 flex flex-col items-center justify-end h-full">
          {/* Tooltip Hover */}
          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded mb-2 whitespace-nowrap z-10">
            Rata-rata IPS: {item.val}
          </div>
          
          {/* Bar */}
          <div 
            className="w-full max-w-[40px] bg-blue-100 rounded-t-lg relative overflow-hidden group-hover:bg-blue-200 transition-colors"
            style={{ height: item.height }}
          >
            {/* Inner Bar Fill animation */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#1B3F95] w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Label X-Axis */}
          <div className="mt-3 text-[10px] sm:text-xs font-medium text-slate-500 text-center">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- CUSTOM DONUT CHART COMPONENT ---
function GradeDonutChart({ counts, total }: { counts: { A: number; B: number; C: number; D: number; E: number }; total: number }) {
  if (total === 0) {
    return <div className="text-sm text-slate-400">Belum ada data nilai.</div>;
  }

  // Calculate percentages
  const pA = (counts.A / total) * 100;
  const pB = (counts.B / total) * 100;
  const pC = (counts.C / total) * 100;
  const pD = (counts.D / total) * 100;
  // const pE = (counts.E / total) * 100; // Sisa

  // Conic Gradient Calculation
  // A starts at 0%
  const stopA = pA;
  const stopB = stopA + pB;
  const stopC = stopB + pC;
  const stopD = stopC + pD;
  // E is the rest

  const gradient = `conic-gradient(
    #10B981 0% ${stopA}%, 
    #3B82F6 ${stopA}% ${stopB}%, 
    #F59E0B ${stopB}% ${stopC}%, 
    #EF4444 ${stopC}% ${stopD}%,
    #64748B ${stopD}% 100%
  )`;

  const legend = [
    { label: "A (Sangat Baik)", color: "bg-emerald-500", val: `${Math.round(pA)}%`, count: counts.A },
    { label: "B (Baik)", color: "bg-blue-500", val: `${Math.round(pB)}%`, count: counts.B },
    { label: "C (Cukup)", color: "bg-amber-500", val: `${Math.round(pC)}%`, count: counts.C },
    { label: "D/E (Kurang)", color: "bg-red-500", val: `${Math.round(100 - stopC)}%`, count: counts.D + counts.E },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Chart Circle */}
      <div className="relative w-48 h-48 rounded-full shadow-inner" style={{ background: gradient }}>
        {/* Center Hole (Donut) */}
        <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center flex-col shadow-sm">
          <span className="text-3xl font-bold text-slate-800">{total}</span>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Nilai</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 w-full px-4">
        {legend.map((l, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${l.color}`} />
              <span className="text-slate-600 font-medium text-xs sm:text-sm">{l.label}</span>
            </div>
            <span className="font-bold text-slate-800 text-xs sm:text-sm">{l.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ICONS ================= */

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V3" />
    </svg>
  );
}

function PrinterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12v8H6z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function FileTextIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className={props.className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function ChartPieIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}