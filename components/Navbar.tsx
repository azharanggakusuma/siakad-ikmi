"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const getPageInfo = (path: string) => {
    switch (path) {
      case "/":
        return { title: "Dashboard Overview", breadcrumb: "SIAKAD" };
      case "/transkrip":
        return { title: "Transkrip Nilai", breadcrumb: "SIAKAD / Transkrip" };
      case "/mahasiswa":
        return { title: "Data Mahasiswa", breadcrumb: "SIAKAD / Mahasiswa" };
      case "/matakuliah":
        return { title: "Mata Kuliah", breadcrumb: "SIAKAD / Mata Kuliah" };
      case "/pengaturan":
        return { title: "Pengaturan", breadcrumb: "SIAKAD / Pengaturan" };
      default:
        return { title: "Halaman", breadcrumb: "SIAKAD" };
    }
  };

  const { title, breadcrumb } = getPageInfo(pathname || "/");

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 print:hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* KIRI: Judul & Breadcrumb */}
        <div className="flex flex-col min-w-[200px]">
          <h1 className="text-lg font-semibold text-slate-800 leading-none">
            {title}
          </h1>
          <span className="text-[11px] text-slate-400 mt-1">
            {breadcrumb}
          </span>
        </div>

        {/* TENGAH: Search Bar (Tanpa garis, Ikon di kiri) */}
        <div className="hidden md:flex flex-1 justify-center px-10">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text"
              placeholder="Cari sesuatu..." 
              className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-slate-200 transition-all outline-none text-slate-700" 
            />
          </div>
        </div>

        {/* KANAN: Notifikasi & Akun */}
        <div className="flex items-center">
          
          {/* Notifikasi */}
          <div className="flex items-center px-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>

          {/* Garis Pembatas Pendek (Centered) */}
          <div className="h-7 w-px bg-slate-200 self-center mx-1"></div>

          {/* User Profile */}
          <div className="flex items-center pl-4">
            <div className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-lg cursor-pointer transition-colors border border-transparent">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-700 leading-none">Baaqiel A</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase font-medium tracking-tighter">Administrator</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}