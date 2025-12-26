"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Definisi Tipe Column
export interface Column<T> {
  header: string;
  className?: string;
  accessorKey?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  filterContent?: React.ReactNode;
  isFilterActive?: boolean;
  onResetFilter?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function DataTable<T>({
  data,
  columns,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cari data...",
  filterContent,
  isFilterActive = false,
  onResetFilter,
  onAdd,
  addLabel = "Tambah Data",
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
}: DataTableProps<T>) {
  
  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-9 bg-muted/30"
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>

          {filterContent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`shrink-0 transition-colors ${
                    isFilterActive 
                      ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700" 
                      : "text-muted-foreground"
                  }`}
                  title="Filter Data"
                >
                  {isFilterActive ? <ListFilter className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {filterContent}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {onAdd && (
          <Button 
            onClick={onAdd} 
            className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-md border min-h-[300px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="group hover:bg-muted/30 transition-colors">
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className}>
                      {col.render 
                        ? col.render(row, rowIndex) 
                        : col.accessorKey 
                          ? (row[col.accessorKey] as React.ReactNode) 
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-gray-300" />
                    <p>Data tidak ditemukan.</p>
                    {isFilterActive && onResetFilter && (
                      <Button 
                        variant="link" 
                        className="text-primary h-auto p-0"
                        onClick={onResetFilter}
                      >
                        Reset Filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {data.length > 0 ? (
            <>
              Menampilkan <strong>{startIndex + 1}-{Math.min(endIndex, totalItems)}</strong> dari <strong>{totalItems}</strong> data
            </>
          ) : (
            "Tidak ada data"
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs font-medium px-2">
            Hal {currentPage} / {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}