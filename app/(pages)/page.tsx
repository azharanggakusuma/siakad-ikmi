"use client";

import React from "react";
import Link from "next/link";

/* ================= TYPES ================= */

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

/* ================= DATA ================= */

const STATS: StatCardProps[] = [
  { label: "Total Mahasiswa", value: "1,284", description: "+20 dari bulan lalu", icon: <UsersIcon /> },
  { label: "Mata Kuliah", value: "86", description: "Kurikulum Aktif", icon: <BookIcon /> },
  { label: "Transkrip Terbit", value: "3,124", description: "+12% peningkatan", icon: <FileTextIcon /> },
  { label: "Rata-rata IPK", value: "3.42", description: "Skala 4.00", icon: <TrendingUpIcon /> },
];

/* ================= PAGE ================= */

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Selamat datang kembali. Berikut adalah ringkasan sistem Anda hari ini.
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
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ===== GRAFIK GRID ===== */}
      <div className="grid gap-4 lg:grid-cols-7">
        
        {/* GRAFIK 1: TREN PERFORMA (Bar Chart) - Menggantikan Aktivitas */}
        <section className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <header className="p-6 border-b border-slate-100">
            <h3 className="font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-blue-600" />
              Tren Rata-rata IPK Mahasiswa
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Performa akademik mahasiswa per semester tahun ini.
            </p>
          </header>

          <div className="p-6 flex-1 flex items-end justify-center">
            {/* Custom Simple Bar Chart */}
            <SemesterBarChart />
          </div>
        </section>

        {/* GRAFIK 2: DISTRIBUSI NILAI (Donut Chart) - Menggantikan Pintasan */}
        <section className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <header className="p-6 border-b border-slate-100">
            <h3 className="font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <ChartPieIcon className="w-4 h-4 text-emerald-600" />
              Distribusi Indeks Nilai
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Persentase perolehan nilai (A/B/C/D).
            </p>
          </header>

          <div className="p-6 flex-1 flex flex-col items-center justify-center">
            {/* Custom Simple Donut Chart */}
            <GradeDonutChart />
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
function SemesterBarChart() {
  // Data Dummy: Semester 1 s.d 6
  const data = [
    { label: "Smt 1", val: 3.1, height: "65%" },
    { label: "Smt 2", val: 3.3, height: "72%" },
    { label: "Smt 3", val: 3.4, height: "78%" },
    { label: "Smt 4", val: 3.2, height: "70%" },
    { label: "Smt 5", val: 3.6, height: "85%" },
    { label: "Smt 6", val: 3.8, height: "92%" },
  ];

  return (
    <div className="w-full h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
      {data.map((item, idx) => (
        <div key={idx} className="group relative flex-1 flex flex-col items-center justify-end h-full">
          {/* Tooltip Hover */}
          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded mb-2">
            IPK: {item.val}
          </div>
          
          {/* Bar */}
          <div 
            className="w-full max-w-[40px] bg-blue-100 rounded-t-lg relative overflow-hidden group-hover:bg-blue-200 transition-colors"
            style={{ height: item.height }}
          >
            {/* Inner Bar Fill animation or solid */}
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
function GradeDonutChart() {
  // Data Persentase: A=45%, B=30%, C=15%, D/E=10%
  // Conic Gradient Calculation:
  // A (0% - 45%) -> #10B981
  // B (45% - 75%) -> #3B82F6
  // C (75% - 90%) -> #F59E0B
  // D (90% - 100%) -> #EF4444

  const gradient = `conic-gradient(
    #10B981 0% 45%, 
    #3B82F6 45% 75%, 
    #F59E0B 75% 90%, 
    #EF4444 90% 100%
  )`;

  const legend = [
    { label: "Nilai A (Sangat Baik)", color: "bg-emerald-500", val: "45%" },
    { label: "Nilai B (Baik)", color: "bg-blue-500", val: "30%" },
    { label: "Nilai C (Cukup)", color: "bg-amber-500", val: "15%" },
    { label: "Nilai D/E (Kurang)", color: "bg-red-500", val: "10%" },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Chart Circle */}
      <div className="relative w-48 h-48 rounded-full shadow-inner" style={{ background: gradient }}>
        {/* Center Hole (Donut) */}
        <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center flex-col shadow-sm">
          <span className="text-3xl font-bold text-slate-800">86</span>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total MK</span>
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