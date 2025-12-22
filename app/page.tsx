"use client";

import React from "react";
// GUNAKAN @/ UNTUK IMPORT DARI ROOT FOLDER
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800">
      
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />
        
        {/* Placeholder Konten Dashboard */}
        <main className="p-8">
           <div className="bg-white rounded-xl p-10 border border-gray-200 shadow-sm text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang di SIAKAD</h2>
              <p className="text-gray-500">Silakan pilih menu di sebelah kiri untuk memulai.</p>
           </div>
        </main>
      </div>
    </div>
  );
}