"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Filter,         // Icon Filter
  ChevronLeft,
  ChevronRight,
  ListFilter      // Icon Filter dengan indikator (opsional, tapi kita pakai style button aja)
} from "lucide-react";

// --- SHADCN COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import DropdownMenu untuk Filter
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- IMPORT DATA DARI LIB ---
import { COURSES_DB, type CourseData as TCourseData, type CourseCategory } from "@/lib/data";

// --- TYPES ---
interface CourseState extends TCourseData {
  kode: string;
}

interface CourseFormState {
  kode: string;
  matkul: string;
  sks: number | string;
  smt_default: number | string;
  kategori: CourseCategory | "";
}

// --- TRANSFORMASI DATA ---
const DATA_FROM_DB: CourseState[] = Object.entries(COURSES_DB).map(([kode, data]) => ({
  kode,
  ...data
}));

export default function MataKuliahPage() {
  const [courses, setCourses] = useState<CourseState[]>(DATA_FROM_DB);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- FILTER STATE ---
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | CourseCategory>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- DIALOG STATE ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<CourseFormState>({
    kode: "",
    matkul: "",
    sks: "",        
    smt_default: "",
    kategori: "",   
  });

  // --- FILTER LOGIC (SEARCH + KATEGORI + SEMESTER) ---
  const filteredCourses = courses.filter((course) => {
    // 1. Filter Search
    const matchSearch = 
      course.matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.kode.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Filter Kategori
    const matchCategory = categoryFilter === "ALL" || course.kategori === categoryFilter;

    // 3. Filter Semester
    const matchSemester = semesterFilter === "ALL" || course.smt_default.toString() === semesterFilter;

    return matchSearch && matchCategory && matchSemester;
  });

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredCourses.slice(startIndex, endIndex);

  // --- HANDLERS ---

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val as "ALL" | CourseCategory);
    setCurrentPage(1);
  };

  const handleSemesterFilterChange = (val: string) => {
    setSemesterFilter(val);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setFormData({ kode: "", matkul: "", sks: "", smt_default: "", kategori: "" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: CourseState) => {
    setFormData({
      kode: course.kode,
      matkul: course.matkul,
      sks: course.sks,
      smt_default: course.smt_default,
      kategori: course.kategori
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (kode: string) => {
    if (confirm(`Hapus data ${kode}?`)) {
      setCourses((prev) => prev.filter((item) => item.kode !== kode));
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.sks === "" || formData.smt_default === "" || formData.kategori === "") {
      alert("Mohon lengkapi semua data (SKS, Semester, dan Kategori harus diisi).");
      return;
    }

    const finalData: CourseState = {
      kode: formData.kode,
      matkul: formData.matkul,
      sks: Number(formData.sks),
      smt_default: Number(formData.smt_default),
      kategori: formData.kategori as CourseCategory,
    };

    if (isEditing) {
      setCourses((prev) =>
        prev.map((item) => (item.kode === finalData.kode ? finalData : item))
      );
    } else {
      if (courses.some((c) => c.kode === finalData.kode)) {
        alert("Kode Mata Kuliah sudah ada!");
        return;
      }
      setCourses((prev) => [...prev, finalData]);
    }
    setIsDialogOpen(false);
  };

  // Cek apakah ada filter yang aktif (untuk styling button)
  const isFilterActive = categoryFilter !== "ALL" || semesterFilter !== "ALL";

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Mata Kuliah" 
        breadcrumb={["SIAKAD", "Mata Kuliah"]} 
      />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          {/* TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* SEARCH INPUT */}
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode atau nama..."
                    className="pl-9 bg-muted/30"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* FILTER BUTTON (DROPDOWN) */}
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
                    {/* Filter Kategori */}
                    <DropdownMenuLabel>Kategori</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                      <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Reguler">Reguler</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="MBKM">MBKM</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Filter Semester */}
                    <DropdownMenuLabel>Semester</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={semesterFilter} onValueChange={handleSemesterFilterChange}>
                      <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="1">Semester 1</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="2">Semester 2</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="3">Semester 3</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="4">Semester 4</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="5">Semester 5</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="6">Semester 6</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="7">Semester 7</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="8">Semester 8</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Button 
              onClick={handleOpenAdd} 
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>

          {/* TABLE SECTION */}
          <div className="rounded-md border min-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead>Kode MK</TableHead>
                  <TableHead>Mata Kuliah</TableHead>
                  <TableHead className="text-center w-[100px]">SKS</TableHead>
                  <TableHead className="text-center w-[100px]">Semester</TableHead>
                  <TableHead className="w-[150px]">Kategori</TableHead>
                  <TableHead className="w-[100px] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((row, index) => (
                    <TableRow key={row.kode} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {row.kode}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-700">{row.matkul}</span>
                      </TableCell>
                      
                      {/* --- SKS (PLAIN TEXT) --- */}
                      <TableCell className="text-center text-gray-700">
                        {row.sks}
                      </TableCell>

                      <TableCell className="text-center text-muted-foreground">
                        {row.smt_default}
                      </TableCell>
                      
                      {/* --- BADGE KATEGORI --- */}
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className="font-normal border-gray-300 text-gray-600"
                        >
                          {row.kategori}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            onClick={() => handleOpenEdit(row)}
                            title="Edit Data"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(row.kode)}
                            title="Hapus Data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-8 w-8 text-gray-300" />
                        <p>Data tidak ditemukan.</p>
                        {(isFilterActive) && (
                          <Button 
                            variant="link" 
                            className="text-primary h-auto p-0"
                            onClick={() => { setCategoryFilter("ALL"); setSemesterFilter("ALL"); setSearchQuery(""); }}
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
          
          {/* PAGINATION FOOTER */}
          <div className="flex items-center justify-between mt-4">
             <div className="text-xs text-muted-foreground">
              {filteredCourses.length > 0 ? (
                <>
                  Menampilkan <strong>{startIndex + 1}-{Math.min(endIndex, filteredCourses.length)}</strong> dari <strong>{filteredCourses.length}</strong> data
                </>
              ) : (
                "Tidak ada data"
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* --- MODAL DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
               {isEditing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi detail mata kuliah di bawah ini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 py-4">
              
              <div className="grid grid-cols-4 gap-4">
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="kode">Kode MK</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    disabled={isEditing}
                    placeholder="Contoh: TKK-01"
                    required
                  />
                </div>
                <div className="grid gap-2 col-span-1">
                  <Label htmlFor="sks">SKS</Label>
                  <Input
                    id="sks"
                    type="number"
                    min={0} 
                    max={6}
                    value={formData.sks} 
                    onChange={(e) => setFormData({ ...formData, sks: e.target.value })} 
                    placeholder="0"
                    required
                  />
                </div>
                <div className="grid gap-2 col-span-1">
                  <Label htmlFor="smt">Smt</Label>
                  <Input
                    id="smt"
                    type="number"
                    min={1} 
                    max={8}
                    value={formData.smt_default} 
                    onChange={(e) => setFormData({ ...formData, smt_default: e.target.value })} 
                    placeholder="0" 
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="matkul">Nama Mata Kuliah</Label>
                <Input
                  id="matkul"
                  value={formData.matkul}
                  onChange={(e) => setFormData({ ...formData, matkul: e.target.value })}
                  placeholder="Contoh: Pemrograman Web Lanjut"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(val: CourseCategory) => setFormData({ ...formData, kategori: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kategori Mata Kuliah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reguler">Reguler</SelectItem>
                    <SelectItem value="MBKM">MBKM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <DialogFooter className="mt-2">
               <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                Simpan Data
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}