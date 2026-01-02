"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayout } from "@/app/context/LayoutContext";
import { logout } from "@/app/actions/auth";
import Tooltip from "@/components/shared/Tooltip";
import { Menu } from "@/lib/types"; 
import * as LucideIcons from "lucide-react"; 

type SidebarProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
  isCollapsed?: boolean;
  menus: Menu[]; 
};

export default function Sidebar({ open, setOpen, isCollapsed = false, menus }: SidebarProps) {
  const pathname = usePathname();
  // eslint-disable-next-line no-unused-vars
  const { user } = useLayout();

  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});

  const toggleDropdown = (id: number) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
  };

  // Helper dinamis untuk mengambil icon dari LucideIcons
  const getIconComponent = (iconName: string) => {
    // Mengakses icon secara dinamis menggunakan key string
    // Kita gunakan (LucideIcons as any) untuk menghindari error TypeScript indexing
    const Icon = (LucideIcons as any)[iconName];
    
    // Fallback ke icon 'Circle' atau 'HelpCircle' jika icon tidak ditemukan / typo di DB
    return Icon || LucideIcons.Circle;
  };

  // --- MEMPROSES STRUKTUR MENU ---
  const menuSections = useMemo(() => {
    const sections = Array.from(new Set(menus.map((m) => m.section)));
    
    return sections.map((sectionName) => {
      const rootItems = menus.filter(
        (m) => m.section === sectionName && !m.parent_id
      );

      const itemsWithChildren = rootItems.map((parent) => {
        const children = menus.filter((m) => m.parent_id === parent.id);
        children.sort((a, b) => a.sequence - b.sequence);
        
        return {
          ...parent,
          subItems: children,
        };
      });

      itemsWithChildren.sort((a, b) => a.sequence - b.sequence);

      return {
        label: sectionName,
        items: itemsWithChildren,
      };
    });
  }, [menus]);

  // Icon untuk tombol statis (Logout, Close)
  const LogOutIcon = LucideIcons.LogOut;
  const XIcon = LucideIcons.X;

  return (
    <>
      {/* OVERLAY (Mobile Only) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-[98] lg:hidden"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[99] 
          bg-white border-r border-slate-200 
          flex flex-col
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen
          print:hidden
          w-64
          ${isCollapsed ? "lg:w-[80px]" : "lg:w-64"}
        `}
      >
        {/* === HEADER BRAND === */}
        <div
          className={`
            h-16 flex items-center bg-white transition-all duration-300 relative overflow-hidden shrink-0
            pl-6 pr-4
            ${isCollapsed ? "lg:pr-0" : ""}
        `}
        >
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative w-8 h-8 shrink-0">
              <Image src="/img/logo-ikmi.png" alt="Logo" fill className="object-contain" />
            </div>

            {/* Teks Brand */}
            <div
              className={`
                flex flex-col min-w-0 whitespace-nowrap transition-all duration-300 origin-left
                opacity-100 scale-100 translate-x-0 w-auto
                ${isCollapsed ? "lg:opacity-0 lg:scale-90 lg:translate-x-[-10px] lg:w-0" : ""}
            `}
            >
              <p className="font-bold text-slate-800 text-lg leading-none truncate">SIAKAD</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-1 truncate">
                STMIK IKMI Cirebon
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* === MENU NAVIGATION === */}
        <nav
          className={`
          flex-1 px-3 py-4 space-y-3 overflow-y-auto overflow-x-hidden
          [scrollbar-gutter:stable]
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-slate-200
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-slate-300
        `}
        >
          {/* RENDER DYNAMIC SECTIONS */}
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              <SectionLabel label={section.label} isCollapsed={isCollapsed} />

              {section.items.map((item) => {
                const Icon = getIconComponent(item.icon);

                // Jika punya subItems, render dropdown
                if (item.subItems && item.subItems.length > 0) {
                  return (
                    <NavDropdown
                      key={item.id}
                      label={item.label}
                      icon={<Icon size={20} />}
                      isOpen={!!openDropdowns[item.id]} 
                      onToggle={() => toggleDropdown(item.id)}
                      isCollapsed={isCollapsed}
                    >
                      {item.subItems.map((sub) => {
                        const SubIcon = getIconComponent(sub.icon);
                        return (
                          <NavItem
                            key={sub.id}
                            href={sub.href}
                            label={sub.label}
                            icon={<SubIcon size={16} />}
                            active={isActive(sub.href)}
                            onClick={() => setOpen(false)}
                            isCollapsed={isCollapsed}
                            isSubItem
                          />
                        );
                      })}
                    </NavDropdown>
                  );
                }

                // Jika tidak punya subItems, render item biasa
                return (
                  <NavItem
                    key={item.id}
                    href={item.href}
                    label={item.label}
                    icon={<Icon size={20} />}
                    active={isActive(item.href)}
                    onClick={() => setOpen(false)}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </div>
          ))}
        </nav>

        {/* === FOOTER === */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0 relative">
          <Tooltip content="Logout" enabled={isCollapsed} position="right">
            <button
              onClick={handleLogout}
              className={`
                  w-full flex items-center rounded-lg text-sm font-semibold transition-colors overflow-hidden group
                  text-rose-600 hover:bg-rose-50
                  gap-3 px-3 py-2
                  ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3 lg:gap-0" : ""}
                `}
            >
              <div className="shrink-0">
                <LogOutIcon size={20} />
              </div>

              <span
                className={`transition-all duration-300 whitespace-nowrap 
                  w-auto opacity-100
                  ${isCollapsed ? "lg:w-0 lg:opacity-0" : ""}
                `}
              >
                Logout
              </span>
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
}

// --- KOMPONEN HELPER ---

type NavDropdownProps = {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  children: React.ReactNode;
};

function NavDropdown({ label, icon, isOpen, onToggle, isCollapsed, children }: NavDropdownProps) {
  const ChevronDownIcon = LucideIcons.ChevronDown;

  return (
    <div className="space-y-0.5">
      <Tooltip content={label} enabled={isCollapsed} position="right">
        <button
          onClick={onToggle}
          type="button"
          className={`
            w-full flex items-center justify-between
            gap-3 rounded-lg relative group
            text-sm font-medium transition-all duration-200
            px-3 py-2 select-none
            ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3 lg:gap-0" : ""}
            ${isOpen ? "text-slate-800 bg-slate-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <span
              className={`shrink-0 transition-colors ${
                isOpen ? "text-slate-700" : "text-slate-400 group-hover:text-slate-600"
              }`}
            >
              {icon}
            </span>
            <span
              className={`truncate transition-all duration-300 block text-left
               w-auto opacity-100
               ${isCollapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}
            `}
            >
              {label}
            </span>
          </div>

          {!isCollapsed && (
            <div
              className={`transition-transform duration-200 text-slate-400 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronDownIcon size={16} />
            </div>
          )}
        </button>
      </Tooltip>

      <div
        className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen && !isCollapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
      `}
      >
        <div className="ml-4 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  isSubItem?: boolean;
};

function NavItem({
  href,
  icon,
  label,
  active,
  onClick,
  isCollapsed,
  isSubItem = false,
}: NavItemProps) {
  return (
    <Tooltip content={label} enabled={isCollapsed} position="right">
      <Link href={href} onClick={onClick} className="block group relative">
        <div
          className={`
            flex items-center gap-3 rounded-lg relative
            ${isSubItem ? "text-xs font-medium" : "text-sm font-medium"} 
            transition-all duration-200
            px-3 py-2
            ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3 lg:gap-0" : ""}
            ${active ? "bg-blue-50 text-[#1B3F95]" : "text-slate-600 hover:bg-slate-50"}
          `}
        >
          {active && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#1B3F95]" />
          )}
          <span
            className={`transition-colors shrink-0 ${
              active ? "text-[#1B3F95]" : "text-slate-400 group-hover:text-slate-600"
            }`}
          >
            {icon}
          </span>

          <span
            className={`truncate transition-all duration-300 block
             w-auto opacity-100
             ${isCollapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}
          `}
          >
            {label}
          </span>
        </div>
      </Link>
    </Tooltip>
  );
}

function SectionLabel({ label, isCollapsed }: { label: string; isCollapsed?: boolean }) {
  if (isCollapsed) {
    return (
      <>
        <div className="hidden lg:block h-px bg-slate-100 mx-2 my-2" />
        <p className="lg:hidden px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none truncate">
          {label}
        </p>
      </>
    );
  }
  return (
    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none truncate transition-opacity duration-300">
      {label}
    </p>
  );
}