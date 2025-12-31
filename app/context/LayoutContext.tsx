"use client";

import React, { createContext, useContext, useState } from "react";
import { UserSession } from "@/app/actions/auth"; // Pastikan import tipe ini ada

type LayoutContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  user: UserSession | null; // [!code ++] Tambahkan user ke tipe context
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Terima prop 'user' di provider
export function LayoutProvider({ 
  children,
  user 
}: { 
  children: React.ReactNode;
  user: UserSession | null; // [!code ++] Tambahkan prop user
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <LayoutContext.Provider 
      value={{ 
        sidebarOpen, 
        setSidebarOpen, 
        isCollapsed, 
        setIsCollapsed,
        user // [!code ++] Masukkan user ke value context
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}