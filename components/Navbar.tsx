import React from "react";

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 sticky top-0 z-30 print:hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* KIRI: Judul Halaman (Pengganti Logo) */}
        <div className="flex flex-col">
           <h1 className="text-xl font-bold text-gray-800">
             Transkrip Nilai
           </h1>
           <span className="text-xs text-gray-500">
             SIAKAD &gt; Akademik &gt; Transkrip
           </span>
        </div>

        {/* KANAN: User Profile Kecil */}
        <div className="flex items-center gap-4">
           {/* Contoh Status User */}
           <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-700">Administrator</span>
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Online</span>
           </div>
           
           {/* Avatar Bulat */}
           <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-gray-500 overflow-hidden">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
           </div>
        </div>

      </div>
    </nav>
  );
}