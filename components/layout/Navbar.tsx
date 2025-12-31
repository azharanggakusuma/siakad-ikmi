"use client";

import React from "react";
import Link from "next/link";
import Tooltip from "@/components/shared/Tooltip";
import { 
  Menu, 
  Search, 
  User, 
  PanelLeftClose, 
  PanelLeftOpen,
  LogOut,       
  Settings,
  CalendarDays
} from "lucide-react";
import { UserSession, logout } from "@/app/actions/auth";
// 1. Import tipe data
import { AcademicYear } from "@/lib/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavbarProps = {
  onOpenSidebar?: () => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  user?: UserSession | null;
  // 2. Tambahkan props baru (opsional karena bisa null)
  academicYearData?: AcademicYear | null;
};

export default function Navbar({ 
  onOpenSidebar, 
  onToggleCollapse, 
  isCollapsed, 
  user,
  academicYearData // Terima props
}: NavbarProps) {
  const displayName = user?.name || user?.username || "Pengguna";
  const displayRole = user?.role || "Mahasiswa";
  
  // 3. Logic: Jika data ada, gabungkan nama + semester. Jika tidak, pakai fallback.
  // Format: "2024/2025" + " " + "Ganjil" -> "2024/2025 Ganjil"
  const academicYear = academicYearData 
    ? `${academicYearData.nama} ${academicYearData.semester}` 
    : "TA Belum Diatur";

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md print:hidden border-b border-slate-200/60">
      <div className="w-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* === LEFT SECTION === */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100/60 transition focus:outline-none focus:ring-0"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Toggle Sidebar Desktop */}
          <Tooltip 
            content={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} 
            position="right"
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100/60 transition focus:outline-none focus:ring-0"
            >
              {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          </Tooltip>

          {/* SEARCH BAR (Tetap sama) */}
          <div className="hidden md:block ml-2">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Cari data..."
                className="w-52 lg:w-60 rounded-full bg-slate-100 py-2 pl-9 pr-4 text-xs text-slate-700 border border-transparent outline-none transition-all duration-200 hover:bg-slate-100/70 focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* === RIGHT SECTION === */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* [DYNAMIC] INFO TAHUN AKADEMIK */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 mr-2">
             <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
             <span className="text-xs font-medium text-slate-600">
               {academicYear}
             </span>
          </div>

          {/* Mobile Search Button */}
          <button type="button" className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/60 focus:outline-none focus:ring-0" aria-label="Cari">
            <Search className="h-5 w-5" />
          </button>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="group flex items-center gap-2 rounded-full p-1 transition-colors duration-200 hover:bg-slate-100/60 focus:outline-none focus:ring-0 active:ring-0">
                <div className="hidden sm:flex flex-col text-right leading-tight mr-1">
                  <span className="text-xs font-semibold text-slate-700 transition-colors duration-200 group-hover:text-slate-900">
                    {displayName}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
                    {displayRole}
                  </span>
                </div>
                <div className="relative w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-slate-300 transition-all">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              
              {/* Info TA untuk Mobile User (di dalam dropdown) */}
              <div className="md:hidden px-2 py-2 text-xs text-slate-500 border-b border-slate-100 mb-1 bg-slate-50/50">
                 <span className="font-medium">TA: {academicYear}</span>
              </div>

              <DropdownMenuSeparator className="md:hidden" />
              
              <DropdownMenuItem asChild>
                <Link href="/pengaturan" className="cursor-pointer w-full flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Pengaturan</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => logout()} 
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}