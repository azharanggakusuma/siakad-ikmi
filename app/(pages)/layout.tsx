"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import AppFooter from "../../components/AppFooter";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Untuk Mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // Untuk Desktop

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-gray-800 print:bg-white print:block">
      {/* Sidebar */}
      <div className="print:hidden">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen}
          isCollapsed={isCollapsed} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible relative min-w-0 transition-all duration-300">
        
        {/* Header wrapper */}
        <div className="sticky top-0 z-30 print:hidden border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <Navbar 
            onOpenSidebar={() => setSidebarOpen(true)}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 print:p-0">
          {children}
        </main>

        <div className="print:hidden">
          <AppFooter />
        </div>
      </div>
    </div>
  );
}