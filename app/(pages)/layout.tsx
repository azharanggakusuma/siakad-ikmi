// app/(pages)/layout.tsx
import React from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import AppFooter from "../../components/AppFooter";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      
      {/* Sidebar sekarang mengatur dirinya sendiri kapan harus muncul/sembunyi */}
      <Sidebar />

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible relative">
        <div className="sticky top-0 z-30 print:hidden">
          <Navbar />
        </div>

        <main className="flex-1 p-4 sm:p-8 print:p-0">
          {children}
        </main>

        <div className="print:hidden">
          <AppFooter />
        </div>
      </div>
    </div>
  );
}