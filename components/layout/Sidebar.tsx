"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Tooltip from "@/components/shared/Tooltip";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  FileSpreadsheet, 
  Mail, 
  Settings, 
  UserCog, 
  LogOut, 
  X,
  Star,
  ClipboardList,
} from "lucide-react";
// Import logout action
import { logout } from "@/app/actions/auth";

type SidebarProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
  isCollapsed?: boolean;
};

export default function Sidebar({ open, setOpen, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  // Update handleLogout menjadi async dan panggil server action
  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* OVERLAY (Mobile Only) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-[98] lg:hidden"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[99] 
          bg-white border-r border-slate-200 
          flex flex-col
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen
          print:hidden
          w-64
          ${isCollapsed ? "lg:w-[80px]" : "lg:w-64"}
        `}
      >
        {/* === HEADER BRAND === */}
        <div className={`
            h-16 flex items-center bg-white transition-all duration-300 relative overflow-hidden shrink-0
            pl-6 pr-4
            ${isCollapsed ? "lg:pr-0" : ""}
        `}>
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative w-8 h-8 shrink-0">
               <Image src="/img/logo-ikmi.png" alt="Logo" fill className="object-contain" />
            </div>
            
            {/* Teks Brand */}
            <div className={`
                flex flex-col min-w-0 whitespace-nowrap transition-all duration-300 origin-left
                opacity-100 scale-100 translate-x-0 w-auto
                ${isCollapsed ? "lg:opacity-0 lg:scale-90 lg:translate-x-[-10px] lg:w-0" : ""}
            `}>
              <p className="font-bold text-slate-800 text-lg leading-none truncate">SIAKAD</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-1 truncate">STMIK IKMI Cirebon</p>
            </div>
          </div>

          {/* Close button (Mobile Only) */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* === MENU NAVIGATION === */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200">
          
          <div className="space-y-1">
            <SectionLabel label="Menu Utama" isCollapsed={isCollapsed} />
            
            <NavItem href="/" label="Dashboard" icon={<LayoutDashboard size={20} />} active={isActive("/")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            
            <NavItem href="/users" label="Data Pengguna" icon={<UserCog size={20} />} active={isActive("/users")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            
            <NavItem href="/mahasiswa" label="Data Mahasiswa" icon={<Users size={20} />} active={isActive("/mahasiswa")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            <NavItem href="/matakuliah" label="Mata Kuliah" icon={<BookOpen size={20} />} active={isActive("/matakuliah")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            
            <NavItem href="/nilai" label="Nilai Mahasiswa" icon={<Star size={20} />} active={isActive("/nilai")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            
            <NavItem href="/krs" label="Kartu Rencana Studi" icon={<ClipboardList size={20} />} active={isActive("/krs")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            
            <NavItem href="/khs" label="Kartu Hasil Studi" icon={<FileSpreadsheet size={20} />} active={isActive("/khs")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            <NavItem href="/transkrip" label="Transkrip Nilai" icon={<FileText size={20} />} active={isActive("/transkrip")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            <NavItem href="/surat-keterangan" label="Surat Keterangan" icon={<Mail size={20} />} active={isActive("/surat-keterangan")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
          </div>

          <div className="space-y-1">
            <SectionLabel label="Lainnya" isCollapsed={isCollapsed} />
            <NavItem href="/pengaturan" label="Pengaturan" icon={<Settings size={20} />} active={isActive("/pengaturan")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
          </div>

        </nav>

        {/* === FOOTER === */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0 relative">
           <Tooltip content="Logout" enabled={isCollapsed} position="right">
              <button
                onClick={handleLogout} 
                className={`
                  w-full flex items-center rounded-lg text-sm font-semibold transition-colors overflow-hidden group
                  text-rose-600 hover:bg-rose-50
                  gap-3 px-3 py-2.5
                  ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3 lg:gap-0" : ""}
                `}
              >
                <div className="shrink-0"><LogOut size={20} /></div>
                
                <span className={`transition-all duration-300 whitespace-nowrap 
                  w-auto opacity-100
                  ${isCollapsed ? "lg:w-0 lg:opacity-0" : ""}
                `}>
                  Logout
                </span>
              </button>
           </Tooltip>
        </div>
      </aside>
    </>
  );
}

function NavItem({ href, icon, label, active, onClick, isCollapsed }: any) {
  return (
    <Tooltip content={label} enabled={isCollapsed} position="right">
      <Link href={href} onClick={onClick} className="block group relative">
        <div
          className={`
            flex items-center gap-3 rounded-lg relative
            text-sm font-medium transition-all duration-200
            px-3 py-2.5
            ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3 lg:gap-0" : ""}
            ${active ? "bg-blue-50 text-[#1B3F95]" : "text-slate-600 hover:bg-slate-50"}
          `}
        >
          {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#1B3F95]" />}
          <span className={`transition-colors shrink-0 ${active ? "text-[#1B3F95]" : "text-slate-400 group-hover:text-slate-600"}`}>
            {icon}
          </span>
          
          <span className={`truncate transition-all duration-300 block
             w-auto opacity-100
             ${isCollapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}
          `}>
              {label}
          </span>
        </div>
      </Link>
    </Tooltip>
  );
}

function SectionLabel({ label, isCollapsed }: { label: string; isCollapsed?: boolean }) {
  if (isCollapsed) {
    return (
      <>
        <div className="hidden lg:block h-px bg-slate-100 mx-2 my-2" />
        <p className="lg:hidden px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none truncate">
          {label}
        </p>
      </>
    );
  }
  return (
    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none truncate transition-opacity duration-300">
      {label}
    </p>
  );
}