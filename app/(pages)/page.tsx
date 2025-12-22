"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-muted-foreground text-slate-500">
            Selamat datang kembali. Berikut adalah ringkasan sistem Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 shadow-sm">
            Download Report
          </button>
          <a href="/transkrip" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#1B3F95] text-white px-4 py-2 hover:bg-blue-800 shadow-sm shadow-blue-900/10">
            Cetak Nilai
          </a>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ShadcnStatCard label="Total Mahasiswa" value="1,284" description="+20 dari bulan lalu" icon={<UsersIcon />} />
        <ShadcnStatCard label="Mata Kuliah" value="86" description="Kurikulum Aktif" icon={<BookIcon />} />
        <ShadcnStatCard label="Transkrip Terbit" value="3,124" description="+12% peningkatan" icon={<FileTextIcon />} />
        <ShadcnStatCard label="Rata-rata IPK" value="3.42" description="Skala 4.00" icon={<TrendingUpIcon />} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity Table - Span 4 */}
        <div className="md:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Aktivitas Terkini</h3>
            <p className="text-sm text-slate-500 mt-2">Daftar pencetakan transkrip terbaru oleh administrator.</p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-8">
              <ActivityItem name="Azharangga Kusuma" nim="181253xx" action="Mencetak Transkrip" time="Baru saja" />
              <ActivityItem name="Budi Setiadi" nim="181254xx" action="Mencetak Transkrip" time="2 menit lalu" />
              <ActivityItem name="Siti Halimah" nim="191250xx" action="Update Data" time="1 jam lalu" />
              <ActivityItem name="Dedi Kurniawan" nim="181251xx" action="Mencetak Transkrip" time="3 jam lalu" />
            </div>
          </div>
        </div>

        {/* Quick Action / Card - Span 3 */}
        <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Pintasan Sistem</h3>
            <p className="text-sm text-slate-500 mt-2">Akses cepat ke fitur-fitur utama.</p>
            <div className="grid gap-2 mt-4">
              <button className="flex items-center gap-3 w-full rounded-lg border border-slate-100 p-3 text-sm font-medium hover:bg-slate-50 transition-all text-slate-700">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Manajemen Mahasiswa
              </button>
              <button className="flex items-center gap-3 w-full rounded-lg border border-slate-100 p-3 text-sm font-medium hover:bg-slate-50 transition-all text-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Input Nilai Kolektif
              </button>
              <button className="flex items-center gap-3 w-full rounded-lg border border-slate-100 p-3 text-sm font-medium hover:bg-slate-50 transition-all text-slate-700">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                Laporan Semester
              </button>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Status Server: Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen Stat Card ala shadcn
function ShadcnStatCard({ label, value, description, icon }: any) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium tracking-tight text-slate-600">{label}</h3>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 font-medium mt-1">{description}</p>
      </div>
    </div>
  );
}

// Sub-komponen Activity Item
function ActivityItem({ name, nim, action, time }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#1B3F95]">
          {name.charAt(0)}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">{nim} • {action}</p>
        </div>
      </div>
      <div className="text-xs font-medium text-slate-400">{time}</div>
    </div>
  );
}

// ICONS (Simple SVG)
const UsersIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BookIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const FileTextIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TrendingUpIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;