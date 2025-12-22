"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const getPageInfo = (path: string) => {
    switch (path) {
      case "/": return { title: "Dashboard Overview", breadcrumb: "SIAKAD" };
      case "/transkrip": return { title: "Transkrip Nilai", breadcrumb: "SIAKAD / Transkrip" };
      case "/mahasiswa": return { title: "Data Mahasiswa", breadcrumb: "SIAKAD / Mahasiswa" };
      case "/matakuliah": return { title: "Mata Kuliah", breadcrumb: "SIAKAD / Mata Kuliah" };
      case "/pengaturan": return { title: "Pengaturan", breadcrumb: "SIAKAD / Pengaturan" };
      default: return { title: "Halaman", breadcrumb: "SIAKAD" };
    }
  };

  const { title, breadcrumb } = getPageInfo(pathname || "/");

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-lg font-bold text-slate-800 leading-none tracking-tight">{title}</h1>
          <span className="text-[10px] font-medium text-slate-400 mt-1.5 uppercase tracking-widest">{breadcrumb}</span>
        </div>

        <div className="flex items-center h-full">
          <div className="flex items-center px-6 h-full">
            <div className="relative group hidden md:block">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input type="text" placeholder="Cari data..." className="w-48 lg:w-56 bg-slate-100 border border-transparent rounded-full py-1.5 pl-9 pr-4 text-xs focus:bg-white focus:border-blue-200 transition-all outline-none text-slate-700 shadow-inner" />
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-200 self-center"></div>

          <div className="flex items-center pl-6 h-full">
            <div className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pl-2 pr-3 rounded-full cursor-pointer transition-all group">
              <div className="flex flex-col text-right leading-tight hidden sm:flex">
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Azharangga Kusuma</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Administrator</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-200 shadow-sm transition-all">
                <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}