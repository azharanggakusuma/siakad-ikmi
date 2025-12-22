import React from "react";
import Sidebar from "../../components/Sidebar"; // Sesuaikan path import

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      
      {/* SIDEBAR GLOBAL (Hanya tampil di Desktop) */}
      <div className="hidden lg:block print:hidden">
        <Sidebar />
      </div>

      {/* AREA KONTEN DINAMIS */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible relative">
        {children}
      </div>

    </div>
  );
}