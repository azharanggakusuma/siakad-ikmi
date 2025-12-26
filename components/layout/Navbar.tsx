"use client";

import React from "react";
import Tooltip from "@/components/shared/Tooltip";
import { Menu, Search, User, PanelLeftClose, PanelLeftOpen } from "lucide-react";
// Import tipe jika perlu, atau definisikan inline
import { UserSession } from "@/app/actions/auth";

type NavbarProps = {
  onOpenSidebar?: () => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  user?: UserSession | null; // Tambahkan prop user
};

export default function Navbar({ onOpenSidebar, onToggleCollapse, isCollapsed, user }: NavbarProps) {
  // Gunakan data user dari props, atau fallback default
  const displayName = user?.name || user?.username || "Pengguna";
  const displayRole = user?.role || "Mahasiswa";

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md print:hidden">
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

          {/* SEARCH BAR */}
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
        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/60 focus:outline-none focus:ring-0" aria-label="Cari">
            <Search className="h-5 w-5" />
          </button>

          <button type="button" className="group flex items-center gap-2 rounded-full p-1.5 transition-colors duration-200 hover:bg-slate-100/60 focus:outline-none focus:ring-0 active:ring-0">
            <div className="hidden sm:flex flex-col text-right leading-tight">
              {/* TAMPILKAN NAMA DINAMIS */}
              <span className="text-xs font-semibold text-slate-700 transition-colors duration-200 group-hover:text-slate-900">
                {displayName}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
                {displayRole}
              </span>
            </div>
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center transition-all duration-200 group-hover:from-white group-hover:to-slate-100 border border-slate-200 group-hover:border-slate-300">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}