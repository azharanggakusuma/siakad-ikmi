"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Tooltip from "./Tooltip";

type SidebarProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
  isCollapsed?: boolean;
};

export default function Sidebar({ open, setOpen, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleLogout = () => {
    window.location.href = "/login";
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
            <CloseIcon />
          </button>
        </div>

        {/* === MENU NAVIGATION === */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200">
          
          <div className="space-y-1">
            <SectionLabel label="Menu Utama" isCollapsed={isCollapsed} />
            
            <NavItem href="/" label="Dashboard" icon={<DashboardIcon />} active={isActive("/")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            <NavItem href="/mahasiswa" label="Data Mahasiswa" icon={<UserIcon />} active={isActive("/mahasiswa")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            <NavItem href="/khs" label="Kartu Hasil Studi" icon={<KhsIcon />} active={isActive("/khs")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            <NavItem href="/transkrip" label="Transkrip Nilai" icon={<DocIcon />} active={isActive("/transkrip")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
            <NavItem href="/matakuliah" label="Mata Kuliah" icon={<BookIcon />} active={isActive("/matakuliah")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
          </div>

          <div className="space-y-1">
             <SectionLabel label="Lainnya" isCollapsed={isCollapsed} />
            <NavItem href="/pengaturan" label="Pengaturan" icon={<SettingsIcon />} active={isActive("/pengaturan")} onClick={() => setOpen(false)} isCollapsed={isCollapsed} />
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
                <div className="shrink-0"><LogoutIcon /></div>
                
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

/* ================= COMPONENT: NAV ITEM ================= */

function NavItem({
  href, icon, label, active, onClick, isCollapsed,
}: {
  href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; isCollapsed?: boolean;
}) {
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

/* ================= ICONS (Tidak Ada Perubahan) ================= */
const CloseIcon = () => (<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const DashboardIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const DocIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const KhsIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>);
const UserIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const BookIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>);
const SettingsIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const LogoutIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);