"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Kartu Selamat Datang */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang, Admin!</h2>
        <p className="text-gray-500 text-sm">
          Gunakan menu di sebelah kiri untuk mengelola data transkrip, mahasiswa, dan mata kuliah.
        </p>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Mahasiswa</span>
          <span className="text-3xl font-bold text-gray-800">120</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mata Kuliah</span>
          <span className="text-3xl font-bold text-gray-800">45</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transkrip Dicetak</span>
          <span className="text-3xl font-bold text-gray-800">312</span>
        </div>
      </div>

      {/* Area Placeholder */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="border-2 border-dashed border-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-400">
          Statistik Aktivitas Terbaru (Segera Hadir)
        </div>
      </div>
    </div>
  );
}