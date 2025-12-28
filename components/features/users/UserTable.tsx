"use client";

import React, { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, ShieldCheck, BookOpen } from "lucide-react";
import { type UserData } from "@/app/actions/users";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface UserTableProps {
  data: UserData[];
  isLoading: boolean;
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onAdd: () => void;
}

export default function UserTable({ 
  data, 
  isLoading, 
  onEdit, 
  onDelete, 
  onAdd 
}: UserTableProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // State untuk Filter Role
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === FILTERING LOGIC ===
  const filteredData = useMemo(() => {
    let result = data;

    // 1. Filter Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerQuery) ||
          user.username.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Filter Role
    if (roleFilter !== "ALL") {
      result = result.filter((user) => user.role === roleFilter);
    }

    return result;
  }, [data, searchQuery, roleFilter]);

  // === PAGINATION ===
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === COLUMNS ===
  const columns: Column<UserData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>,
    },
    {
      header: "Nama User",
      render: (row) => (
        <span className="font-semibold text-slate-700">{row.name}</span>
      ),
    },
    {
      header: "Username",
      render: (row) => (
        <span className="text-slate-700">{row.username}</span>
      ),
    },
    {
      header: "Role",
      className: "text-center",
      render: (row) => {
        let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
        let icon = null;

        if (row.role === 'admin') {
            variant = "default";
            icon = <ShieldCheck size={12} className="mr-1" />;
        } else if (row.role === 'dosen') {
            variant = "secondary";
            icon = <BookOpen size={12} className="mr-1" />;
        } else if (row.role === 'mahasiswa') {
            variant = "outline";
            icon = null;
        }
        
        return (
          <Badge variant={variant} className="capitalize font-normal">
            {icon}
            {row.role}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center w-[120px]",
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

  // === FILTER DROPDOWN CONTENT ===
  const filterContent = (
    <>
      <DropdownMenuLabel>Filter Peran (Role)</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup 
        value={roleFilter} 
        onValueChange={(v) => { 
          setRoleFilter(v); 
          setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
        }}
      >
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dosen">Dosen</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="mahasiswa">Mahasiswa</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>
  );

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
          searchPlaceholder="Cari Nama atau Username..."
          onAdd={onAdd}
          addLabel="Tambah User"
          
          // Props Filter
          filterContent={filterContent}
          isFilterActive={roleFilter !== "ALL"}
          onResetFilter={() => {
            setRoleFilter("ALL");
            setSearchQuery("");
            setCurrentPage(1);
          }}

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