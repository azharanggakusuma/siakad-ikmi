"use client";

import React, { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  CornerDownRight, 
  Link as LinkIcon 
} from "lucide-react";
import { Menu } from "@/lib/types";
import * as LucideIcons from "lucide-react";

interface MenuTableProps {
  data: Menu[];
  isLoading: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onAdd: () => void;
}

// Helper untuk render icon secara dinamis
const RowIcon = ({ name }: { name: string }) => {
  // @ts-ignore 
  const IconComponent = LucideIcons[name];
  if (!IconComponent) return <HelpCircle className="h-4 w-4 text-slate-400" />;
  return <IconComponent className="h-4 w-4 text-slate-700" />;
};

export default function MenuTable({ data, isLoading, onEdit, onDelete, onAdd }: MenuTableProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === FILTERING LOGIC ===
  const filteredData = useMemo(() => {
    let result = data;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.label.toLowerCase().includes(lowerQuery) ||
          item.href.toLowerCase().includes(lowerQuery) ||
          item.section.toLowerCase().includes(lowerQuery) ||
          (item.parent && item.parent.label.toLowerCase().includes(lowerQuery))
      );
    }
    return result;
  }, [data, searchQuery]);

  // === PAGINATION ===
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === COLUMNS DEFINITION ===
  const columns: Column<Menu>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>,
    },
    {
      header: "Label Menu & Section",
      render: (row) => (
        <div className="flex flex-col min-w-[180px]">
            {/* Visual Hierarchy untuk Sub-Menu */}
            {row.parent ? (
                 <div className="flex items-center gap-1.5 text-slate-600">
                    <CornerDownRight className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold">{row.label}</span>
                 </div>
            ) : (
                <span className="font-semibold text-slate-800">{row.label}</span>
            )}
            
            <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground mt-1">
               {/* Label Section */}
               <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  {row.section}
               </span>
               
               {/* Label Induk (Sekarang styling-nya NETRAL/ABU sama seperti Section) */}
               {row.parent && (
                  <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    Induk: {row.parent.label}
                  </span>
               )}
            </div>
        </div>
      ),
    },
    {
      header: "Icon",
      className: "w-[80px] text-center",
      render: (row) => (
        <div className="flex justify-center" title={`Icon Name: ${row.icon}`}>
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors">
                <RowIcon name={row.icon} />
            </div>
        </div>
      ),
    },
    {
      header: "Path URL",
      render: (row) => (
        <div className="flex items-center gap-2 max-w-[150px]">
           <code className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate" title={row.href}>
              {row.href}
           </code>
        </div>
      ),
    },
    {
      header: "Hak Akses",
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
            {row.allowed_roles && row.allowed_roles.length > 0 ? (
                row.allowed_roles.map(role => (
                    <Badge 
                        key={role} 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 h-5 capitalize bg-white hover:bg-slate-50 font-normal text-slate-600"
                    >
                        {role}
                    </Badge>
                ))
            ) : (
                <span className="text-[10px] text-slate-400 italic">Tidak ada akses</span>
            )}
        </div>
      ),
    },
    {
        header: "Urut",
        className: "text-center w-[60px]",
        render: (row) => <span className="font-mono text-sm text-slate-500 font-medium">{row.sequence}</span>,
    },
    {
        header: "Status",
        className: "text-center w-[120px]",
        render: (row) => (
          <Badge 
            variant={row.is_active ? "default" : "destructive"} 
            // PERBAIKAN DI SINI: Menambahkan hover:bg-green-600 dan hover:bg-destructive agar warna tidak berubah saat di-hover
            className={`font-normal ${
              row.is_active 
                ? "bg-green-600 hover:bg-green-600" 
                : "hover:bg-destructive"
            }`}
          >
            {row.is_active ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {row.is_active ? "Aktif" : "Non-Aktif"}
          </Badge>
        )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex justify-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-amber-600 hover:bg-amber-50 h-8 w-8 transition-colors" 
            onClick={() => onEdit(row)}
            title="Edit Menu"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-rose-600 hover:bg-rose-50 h-8 w-8 transition-colors" 
            onClick={() => onDelete(row)}
            title="Hapus Menu"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-none shadow-sm ring-1 ring-gray-200">
      <CardContent className="p-6">
        <DataTable
          data={currentData}
          columns={columns}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Cari label, path, atau section..."
          onAdd={onAdd}
          addLabel="Tambah Menu"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredData.length}
        />
      </CardContent>
    </Card>
  );
}