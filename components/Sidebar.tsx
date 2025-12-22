"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Logika logout (hapus session/cookie) bisa ditambahkan di sini
    console.log("Logging out...");
    window.location.href = "/login"; 
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex-shrink-0 flex flex-col font-sans print:hidden sticky top-0 h-screen z-50">
      {/* BRAND HEADER */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 gap-3 bg-white sticky top-0 z-10">
        <div className="relative w-9 h-9 shrink-0">
          <Image src="/img/logo-ikmi.png" alt="Logo SIAKAD" fill className="object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-bold text-gray-800 text-lg leading-none">SIAKAD</span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">
            STMIK IKMI Cirebon
          </span>
        </div>
      </div>

      {/* MENU NAVIGASI */}
      <div className="p-4 space-y-1 overflow-y-auto flex-1">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-2">
          Menu Utama
        </div>
        
        <Link href="/">
          <NavItem icon={<DashboardIcon />} label="Dashboard" active={isActive("/")} />
        </Link>
        
        <Link href="/transkrip">
          <NavItem icon={<DocIcon />} label="Transkrip Nilai" active={isActive("/transkrip")} />
        </Link>
        
        <Link href="/mahasiswa">
          <NavItem icon={<UserIcon />} label="Data Mahasiswa" active={isActive("/mahasiswa")} />
        </Link>
        
        <Link href="/matakuliah">
          <NavItem icon={<BookIcon />} label="Mata Kuliah" active={isActive("/matakuliah")} />
        </Link>
        
        <div className="my-4 border-t border-gray-100"></div>
        
        <Link href="/pengaturan">
          <NavItem icon={<SettingsIcon />} label="Pengaturan" active={isActive("/pengaturan")} />
        </Link>
      </div>

      {/* FOOTER SIDEBAR */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* TOMBOL LOGOUT */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>

        {/* VERSION APP */}
        <div className="bg-gray-50 py-2 rounded-md text-[10px] text-gray-400 text-center font-medium">
          Version App 1.0.0
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium mb-1 ${active ? "bg-blue-50 text-[#1B3F95]" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
      <div className={active ? "text-[#1B3F95]" : "text-gray-400"}>{icon}</div>
      <span>{label}</span>
    </div>
  );
}

{/* SVG ICONS */}
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const DocIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;