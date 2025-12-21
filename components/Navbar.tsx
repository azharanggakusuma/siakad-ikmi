import React from "react";

export default function Navbar() {
  return (
    <nav className="bg-[#1B3F95] text-white shadow-lg print:hidden sticky top-0 z-50 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo & Judul */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full p-1.5 shadow-sm">
            <img
              src="/img/logo-ikmi.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-wide">
              SIAKAD STMIK IKMI
            </h1>
            <p className="text-[10px] text-blue-100 font-light opacity-90">
              Sistem Informasi Akademik
            </p>
          </div>
        </div>

        {/* Versi Aplikasi */}
        {/* Menggunakan font-mono agar angka terlihat teknis */}
        <div className="text-xs font-mono font-medium text-blue-200 bg-blue-900/40 px-3 py-1.5 rounded-md hidden md:block border border-blue-700/50 tracking-wider">
          v1.0.0
        </div>
      </div>
    </nav>
  );
}