"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar"; 
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter"; 
import { LayoutProvider, useLayout } from "@/app/context/LayoutContext";
import { UserSession } from "@/app/actions/auth"; 
// 1. Import tipe data
import { AcademicYear } from "@/lib/types";

// 2. Update props untuk menerima academicYear
function LayoutContent({ 
  children, 
  user,
  academicYear 
}: { 
  children: React.ReactNode, 
  user: UserSession | null,
  academicYear: AcademicYear | null 
}) {
  const { sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed } = useLayout();

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      <div className="print:hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isCollapsed={isCollapsed} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible relative min-w-0 transition-all duration-300">
        <div className="sticky top-0 z-30 print:hidden border-b border-slate-200 bg-white/80 backdrop-blur-md">
          {/* 3. Pass data ke Navbar */}
          <Navbar 
            onOpenSidebar={() => setSidebarOpen(true)}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
            user={user} 
            academicYearData={academicYear}
          />
        </div>

        <main className="flex-1 p-4 md:p-8 print:p-0">
          {children}
        </main>

        <div className="print:hidden">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

// 4. Update Main Component props
export default function ClientLayout({ 
  children, 
  user,
  academicYear 
}: { 
  children: React.ReactNode, 
  user: UserSession | null,
  academicYear: AcademicYear | null
}) {
  return (
    <LayoutProvider user={user}>
      <LayoutContent user={user} academicYear={academicYear}>
        {children}
      </LayoutContent>
    </LayoutProvider>
  );
}