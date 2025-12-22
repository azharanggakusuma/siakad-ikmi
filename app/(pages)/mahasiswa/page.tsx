"use client";
import React from "react";
import Navbar from "../../../components/Navbar";

export default function MahasiswaPage() {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800">
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />
        <main className="p-8">
           {/* Area Kosong */}
           <div className="border-2 border-dashed border-gray-300 rounded-xl h-96 flex items-center justify-center text-gray-400">
             Halaman Data Mahasiswa (Segera Hadir)
           </div>
        </main>
      </div>
    </div>
  );
}