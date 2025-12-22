"use client";
import React from "react";

export default function PengaturanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pengaturan Sistem</h2>
        <div className="border-2 border-dashed border-gray-200 rounded-xl h-96 flex items-center justify-center text-gray-400">
          Konfigurasi profil kampus dan tanda tangan pejabat.
        </div>
      </div>
    </div>
  );
}