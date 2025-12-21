import React from "react";

export default function AppFooter() {
  return (
    <footer className="w-full py-6 mt-10 border-t border-slate-300 bg-white print:hidden font-sans z-10">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-1">
        
        {/* Nama Sistem Utama */}
        <p className="text-sm font-bold text-slate-700 tracking-wide">
          SIAKAD STMIK IKMI CIREBON
        </p>
        
        {/* Keterangan Singkat */}
        <p className="text-[11px] text-slate-500 font-medium">
          Sistem Informasi Akademik &copy; {new Date().getFullYear()}
        </p>

      </div>
    </footer>
  );
}