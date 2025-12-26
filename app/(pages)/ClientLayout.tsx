"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar"; 
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter"; 
import { LayoutProvider, useLayout } from "@/app/context/LayoutContext";
import { UserSession } from "@/app/actions/auth"; 

// Komponen internal untuk konten layout
function LayoutContent({ children, user }: { children: React.ReactNode, user: UserSession | null }) {
  const { sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed } = useLayout();

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      {/* Sidebar */}
      <div className="print:hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isCollapsed={isCollapsed} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible relative min-w-0 transition-all duration-300">
        
        {/* Navbar (Sticky) */}
        <div className="sticky top-0 z-30 print:hidden border-b border-slate-200 bg-white/80 backdrop-blur-md">
          {/* Kita oper data 'user' ke Navbar agar nama berubah sesuai login */}
          <Navbar 
            onOpenSidebar={() => setSidebarOpen(true)}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
            user={user} 
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 print:p-0">
          {children}
        </main>

        {/* Footer */}
        <div className="print:hidden">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

// Komponen Utama ClientLayout
export default function ClientLayout({ children, user }: { children: React.ReactNode, user: UserSession | null }) {
  return (
    <LayoutProvider>
      <LayoutContent user={user}>
        {children}
      </LayoutContent>
    </LayoutProvider>
  );
}