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

type ActivityItemProps = {
  name: string;
  nim: string;
  action: string;
  time: string;
};

/* ================= DATA ================= */

const STATS: StatCardProps[] = [
  { label: "Total Mahasiswa", value: "1,284", description: "+20 dari bulan lalu", icon: <UsersIcon /> },
  { label: "Mata Kuliah", value: "86", description: "Kurikulum Aktif", icon: <BookIcon /> },
  { label: "Transkrip Terbit", value: "3,124", description: "+12% peningkatan", icon: <FileTextIcon /> },
  { label: "Rata-rata IPK", value: "3.42", description: "Skala 4.00", icon: <TrendingUpIcon /> },
];

const ACTIVITIES: ActivityItemProps[] = [
  { name: "Azharangga Kusuma", nim: "181253xx", action: "Mencetak Transkrip", time: "Baru saja" },
  { name: "Budi Setiadi", nim: "181254xx", action: "Mencetak Transkrip", time: "2 menit lalu" },
  { name: "Siti Halimah", nim: "191250xx", action: "Update Data", time: "1 jam lalu" },
  { name: "Dedi Kurniawan", nim: "181251xx", action: "Mencetak Transkrip", time: "3 jam lalu" },
];

const QUICK_ACTIONS = [
  { label: "Manajemen Mahasiswa", href: "/mahasiswa", dotClass: "bg-blue-500" },
  { label: "Input Nilai Kolektif", href: "/transkrip", dotClass: "bg-emerald-500" },
  { label: "Laporan Semester", href: "/pengaturan", dotClass: "bg-orange-500" },
] as const;

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

        {/* Tombol – diturunkan sedikit */}
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

      {/* ===== MAIN GRID ===== */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Aktivitas */}
        <section className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="p-6 pb-4">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Aktivitas Terkini
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Daftar aktivitas terbaru oleh administrator.
            </p>
          </header>

          <div className="px-6 pb-6 divide-y divide-slate-100">
            {ACTIVITIES.map((a, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <ActivityItem {...a} />
              </div>
            ))}
          </div>
        </section>

        {/* Pintasan */}
        <section className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="p-6">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Pintasan Sistem
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Akses cepat ke fitur utama.
            </p>

            <div className="mt-4 grid gap-2">
              {QUICK_ACTIONS.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className="flex items-center justify-between rounded-lg border border-slate-100
                             p-3 text-sm font-medium text-slate-700
                             hover:bg-slate-50 transition
                             focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${q.dotClass}`} />
                    {q.label}
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/60 rounded-b-xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">
                Status Server: Online
              </span>
            </div>
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

function ActivityItem({ name, nim, action, time }: ActivityItemProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200
                        flex items-center justify-center text-xs font-bold text-[#1B3F95]">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {nim} • {action}
          </p>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-400">{time}</span>
    </div>
  );
}

/* ================= ICONS ================= */

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

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
function TrendingUpIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
