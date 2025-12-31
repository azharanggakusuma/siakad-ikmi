"use client";

import React, { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Menu } from "@/lib/types";

interface MenuTableProps {
  data: Menu[];
  isLoading: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onAdd: () => void;
}

export default function MenuTable({ 
  data, 
  isLoading, 
  onEdit, 
  onDelete, 
  onAdd 
}: MenuTableProps) {
  
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
          item.section.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [data, searchQuery]);

  // === PAGINATION ===
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === COLUMNS ===
  const columns: Column<Menu>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>,
    },
    {
      header: "Label",
      render: (row) => (
        <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{row.label}</span>
            <span className="text-xs text-muted-foreground">{row.section}</span>
        </div>
      ),
    },
    {
      header: "Path & Icon",
      render: (row) => (
        <div className="flex flex-col text-sm">
            <code className="text-slate-600 bg-slate-100 px-1 rounded w-fit mb-1">{row.href}</code>
            <span className="text-xs text-muted-foreground">Icon: {row.icon}</span>
        </div>
      ),
    },
    {
      header: "Akses",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
            {row.allowed_roles.map(role => (
                <Badge key={role} variant="outline" className="text-[10px] px-1 py-0 h-5 capitalize">
                    {role}
                </Badge>
            ))}
        </div>
      ),
    },
    {
        header: "Urutan",
        className: "text-center w-[80px]",
        render: (row) => <span className="font-mono text-slate-600">{row.sequence}</span>,
    },
    {
        header: "Status",
        className: "text-center w-[100px]",
        render: (row) => (
          row.is_active ? 
          <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1"/> Aktif</Badge> : 
          <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Non</Badge>
        )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-600 hover:bg-amber-50 h-8 w-8"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-600 hover:bg-rose-50 h-8 w-8"
            onClick={() => onDelete(row)}
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
          searchPlaceholder="Cari Menu, Path atau Section..."
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