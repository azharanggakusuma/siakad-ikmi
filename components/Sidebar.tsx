import React from "react";
import Image from "next/image"; 
import { StudentData } from "../lib/data";

interface SidebarProps {
  students: StudentData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onPrint: () => void;
}

export default function Sidebar({
  students,
  selectedIndex,
  onSelect,
  onPrint,
}: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex-shrink-0 flex flex-col font-sans print:hidden sticky top-0 h-screen overflow-y-auto z-50">
      
      {/* --- BRAND AREA --- */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 gap-3 bg-white sticky top-0 z-10">
        
        {/* Logo Gambar */}
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src="/img/logo-ikmi.png" 
            alt="Logo SIAKAD"
            fill
            className="object-contain"
          />
        </div>

        {/* Nama Aplikasi */}
        <div className="flex flex-col justify-center">
          <span className="font-bold text-gray-800 text-lg leading-none tracking-tight">
            SIAKAD
          </span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">
            STMIK IKMI Cirebon
          </span>
        </div>
      </div>

      {/* --- MENU NAVIGASI --- */}
      <div className="p-4 space-y-1 flex-1">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-2">
          Menu Utama
        </div>
        
        <NavItem icon={<DashboardIcon />} label="Dashboard" />
        <NavItem icon={<DocIcon />} label="Transkrip Nilai" active />
        <NavItem icon={<UserIcon />} label="Data Mahasiswa" />
        <NavItem icon={<BookIcon />} label="Mata Kuliah" />
        <NavItem icon={<SettingsIcon />} label="Pengaturan" />
      </div>

      {/* --- PANEL KONTROL (FILTER & PRINT) --- */}
      <div className="p-4 pt-0">
        <div className="p-4 flex flex-col gap-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 text-blue-800">
            <FilterIcon />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              Aksi Cepat
            </h3>
          </div>

          {/* Pilih Mahasiswa */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-500">
              Pilih Mahasiswa
            </label>
            <select
              value={selectedIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm cursor-pointer"
            >
              {students.map((student, index) => (
                <option key={student.id} value={index}>
                  {student.profile.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Print */}
          <button
            onClick={onPrint}
            className="w-full flex items-center justify-center gap-2 bg-[#1B3F95] hover:bg-blue-900 text-white font-medium rounded-md text-xs px-3 py-2.5 transition-colors shadow-sm"
          >
            <PrintIcon />
            <span>Cetak Transkrip</span>
          </button>
        </div>
      </div>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="text-[10px] text-gray-400 text-center">
          &copy; 2025 STMIK IKMI Cirebon
        </div>
      </div>
    </aside>
  );
}

// --- Komponen Icon & NavItem ---

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
        active
          ? "bg-blue-50 text-[#1B3F95]"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div className={active ? "text-[#1B3F95]" : "text-gray-400"}>{icon}</div>
      <span>{label}</span>
    </div>
  );
}

// Icons
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const DocIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const FilterIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;