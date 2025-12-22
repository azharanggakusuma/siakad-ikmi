"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import AppFooter from "../../components/AppFooter";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      {/* Sidebar (drawer controlled by layout state) */}
      <div className="print:hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible relative min-w-0">
        {/* Header wrapper border */}
        <div className="sticky top-0 z-30 print:hidden border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        </div>

        {/* UPDATED: Padding responsif (p-4 di mobile, p-8 di desktop) */}
        <main className="flex-1 p-4 md:p-8 print:p-0">{children}</main>

        <div className="print:hidden">
          <AppFooter />
        </div>
      </div>
    </div>
  );
}