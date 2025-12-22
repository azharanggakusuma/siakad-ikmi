"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

type PageInfo = {
  title: string;
  breadcrumb: string[];
};

const ROUTES: Record<string, PageInfo> = {
  "/": { title: "Dashboard", breadcrumb: ["SIAKAD"] },
  "/transkrip": { title: "Transkrip Nilai", breadcrumb: ["SIAKAD", "Transkrip"] },
  "/mahasiswa": { title: "Data Mahasiswa", breadcrumb: ["SIAKAD", "Mahasiswa"] },
  "/matakuliah": { title: "Mata Kuliah", breadcrumb: ["SIAKAD", "Mata Kuliah"] },
  "/pengaturan": { title: "Pengaturan", breadcrumb: ["SIAKAD", "Pengaturan"] },
};

const DEFAULT_PAGE: PageInfo = {
  title: "Halaman",
  breadcrumb: ["SIAKAD"],
};

export default function Navbar() {
  const pathname = usePathname() || "/";

  const page = useMemo(() => ROUTES[pathname] ?? DEFAULT_PAGE, [pathname]);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 leading-none truncate">
            {page.title}
          </h1>

          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
            {page.breadcrumb.map((item, idx) => (
              <React.Fragment key={item}>
                <span className="truncate">{item}</span>
                {idx < page.breadcrumb.length - 1 && (
                  <span className="text-slate-300 shrink-0">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search (Desktop) */}
          <div className="hidden md:block">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400
                               transition-colors duration-200
                               group-focus-within:text-slate-500">
                <SearchIcon />
              </span>

              <input
                type="text"
                placeholder="Cari data..."
                className="w-52 lg:w-60 rounded-full bg-slate-100
                           py-2 pl-9 pr-4 text-xs text-slate-700
                           border border-transparent outline-none
                           transition-all duration-200
                           hover:bg-slate-100/70
                           focus:bg-white focus:border-slate-200 focus:ring-1 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* Search Icon (Mobile) */}
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full
                       text-slate-500 transition-colors
                       hover:bg-slate-100/60
                       focus:outline-none focus:ring-1 focus:ring-slate-200"
            aria-label="Cari"
          >
            <SearchIcon />
          </button>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />

          {/* User */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-1.5
                       transition-colors duration-200
                       hover:bg-slate-100/60
                       focus:outline-none focus:ring-1 focus:ring-slate-200"
          >
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-xs font-bold text-slate-700">
                Azharangga Kusuma
              </span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
                Administrator
              </span>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200
                            flex items-center justify-center">
              <UserIcon />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ================= ICONS ================= */

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  );
}
