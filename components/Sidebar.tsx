"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60]
                   h-11 w-11 rounded-xl
                   bg-white border border-slate-200 shadow-sm
                   flex items-center justify-center"
      >
        <MenuIcon />
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-white border-r border-slate-200
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen
        `}
      >
        {/* BRAND */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100 bg-slate-50">
          <div className="relative w-10 h-10">
            <Image src="/img/logo-ikmi.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg leading-none">
              SIAKAD
            </p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-1">
              STMIK IKMI Cirebon
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <SectionLabel label="Menu Utama" />

          <NavItem
            href="/"
            label="Dashboard"
            icon={<DashboardIcon />}
            active={isActive("/")}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/transkrip"
            label="Transkrip Nilai"
            icon={<DocIcon />}
            active={isActive("/transkrip")}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/mahasiswa"
            label="Data Mahasiswa"
            icon={<UserIcon />}
            active={isActive("/mahasiswa")}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/matakuliah"
            label="Mata Kuliah"
            icon={<BookIcon />}
            active={isActive("/matakuliah")}
            onClick={() => setOpen(false)}
          />

          <div className="my-4 border-t border-slate-100" />

          <NavItem
            href="/pengaturan"
            label="Pengaturan"
            icon={<SettingsIcon />}
            active={isActive("/pengaturan")}
            onClick={() => setOpen(false)}
          />
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5
                       rounded-lg text-sm font-semibold
                       text-rose-600 hover:bg-rose-100/60"
          >
            <LogoutIcon />
            Logout
          </button>

          <div className="text-center text-[11px] font-medium text-slate-400">
            Version App 1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`
          group relative flex items-center gap-3 px-4 py-2.5 rounded-lg
          text-sm font-medium transition-all duration-200
          ${
            active
              ? "bg-blue-50 text-[#1B3F95]"
              : "text-slate-600 hover:bg-slate-100"
          }
        `}
      >
        {active && (
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#1B3F95]" />
        )}

        <span
          className={`transition-colors ${
            active ? "text-[#1B3F95]" : "text-slate-400 group-hover:text-slate-600"
          }`}
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-2 mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {label}
    </p>
  );
}

/* ================= ICONS ================= */

const MenuIcon = () => (
  <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const DocIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
