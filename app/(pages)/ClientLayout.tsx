"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar"; 
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter"; 
import { LayoutProvider, useLayout } from "@/app/context/LayoutContext";
import { UserSession } from "@/app/actions/auth"; 

function LayoutContent({ children, user }: { children: React.ReactNode, user: UserSession | null }) {
  const { sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed } = useLayout();

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      <div className="print:hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isCollapsed={isCollapsed} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible relative min-w-0 transition-all duration-300">
        <div className="sticky top-0 z-30 print:hidden border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <Navbar 
            onOpenSidebar={() => setSidebarOpen(true)}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
            user={user} 
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

// [!code warning] PERUBAHAN DISINI
export default function ClientLayout({ children, user }: { children: React.ReactNode, user: UserSession | null }) {
  return (
    // Pass 'user' ke LayoutProvider
    <LayoutProvider user={user}>
      <LayoutContent user={user}>
        {children}
      </LayoutContent>
    </LayoutProvider>
  );
}