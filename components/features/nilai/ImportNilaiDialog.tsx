
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, Search, RefreshCw, Filter, ListFilter } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { createBulkGrades } from "@/app/actions/grades"; 
import { StudentData } from "@/lib/types";

interface ImportNilaiDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSuccess: () => void;
  students: StudentData[];
  courses: any[]; // Add courses prop
}

interface ParsedGrade {
  nim: string;
  nama: string; 
  kode_matkul: string;
  nama_matkul: string;
  semester: string; // Added back
  nilai_huruf: string;
  
  // Validation status
  isValid: boolean;
  errors: string[];
}

export function ImportNilaiDialog({
  isOpen,
  onClose,
  onSuccess,
  students,
  courses 
}: ImportNilaiDialogProps) {
  const [data, setData] = useState<ParsedGrade[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "valid" | "invalid">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setData([]);
      setSearchQuery("");
      setFilterStatus("all");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Template Import
    const headers = [
      "NIM", "Nama Mahasiswa", "Kode Mata Kuliah", "Nama Mata Kuliah", "Semester", "Nilai Huruf (A/B/C/D/E)"
    ];
    
    // Generate rows from students' active KRS (where hm is "-" or empty)
    // Flatten result: [Student1_Course1, Student1_Course2, Student2_Course1, ...]
    const templateRows: any[][] = [];

    students.forEach(student => {
        // Filter transcript items that seem to be "active" (e.g. from KRS)
        // Adjust logic based on how your transcript data is structured.
        // Assuming hm === "-" means taken in KRS but not graded.
        const activeCourses = student.transcript.filter(t => t.hm === "-" || !t.hm);
        
        activeCourses.forEach(course => {
            templateRows.push([
                student.profile.nim,
                student.profile.nama,
                course.kode,
                course.matkul,
                course.smt, // Semester
                "" // Nilai Huruf left empty for manual input
            ]);
        });
    });

    // If no data, provide at least one example or empty structure
    if (templateRows.length === 0) {
        templateRows.push(["4124001", "Contoh Mahasiswa", "TIK-101", "Contoh Matkul", "1", ""]);
    }

    // Helper for max width
    const getColWidths = (rows: any[][]) => {
        return rows[0].map((_, colIndex) => {
            const maxLen = rows.reduce((acc, row) => {
                const cellValue = String(row[colIndex] || "");
                return Math.max(acc, cellValue.length);
            }, 10); // Minimum width 10
            return { wch: maxLen + 2 }; // Add padding
        });
    };

    const templateData = [headers, ...templateRows];
    const wsTemplate = XLSX.utils.aoa_to_sheet(templateData);
    wsTemplate['!cols'] = getColWidths(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Template Input Nilai");

    // 2. Sheet Referensi Mata Kuliah
    const courseHeaders = ["Kode", "Mata Kuliah", "SKS", "Semester Default"];
    const courseRows = courses.map(c => [
        c.kode, 
        c.matkul, 
        c.sks, 
        c.smt_default
    ]);
    const courseData = [courseHeaders, ...courseRows];
    const wsCourses = XLSX.utils.aoa_to_sheet(courseData);
    wsCourses['!cols'] = getColWidths(courseData);
    XLSX.utils.book_append_sheet(wb, wsCourses, "Ref Mata Kuliah");

    // 3. Sheet Referensi Mahasiswa
    const studentHeaders = ["NIM", "Nama", "Program Studi", "Angkatan"];
    const studentRows = students.map(s => [
        s.profile.nim,
        s.profile.nama,
        s.profile.study_program?.nama || "-",
        s.profile.angkatan
    ]);
    const studentData = [studentHeaders, ...studentRows];
    const wsStudents = XLSX.utils.aoa_to_sheet(studentData);
    wsStudents['!cols'] = getColWidths(studentData);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Ref Data Mahasiswa");

    XLSX.writeFile(wb, "Template_Import_Nilai.xlsx");
  };

  const processExcel = async (file: File) => {
    const toastId = toast.loading("Memvalidasi data file Excel...");
    setIsChecking(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Skip header row
        const rows = jsonData.slice(1) as any[];
        
        // Maps for O(1) checking
        const studentMap = new Map(students.map(s => [s.profile.nim, s]));
        const courseCodeSet = new Set(courses.map(c => c.kode));

        // 1. Initial Parse checks
        let parsedData: ParsedGrade[] = rows.map((row) => {
          const errors: string[] = [];
          
          const nim = String(row[0] || "").trim();
          const nama = String(row[1] || "").trim(); 
          const kode_matkul = String(row[2] || "").trim();
          const nama_matkul = String(row[3] || "").trim();
          const semester = String(row[4] || "").trim(); // Semester at index 4
          const nilai_huruf = String(row[5] || "").trim().toUpperCase(); // Nilai at index 5

          // Basic Validation
          if (!nim) errors.push("NIM wajib diisi");
          if (!kode_matkul) errors.push("Kode MK wajib diisi");
          if (!nilai_huruf) errors.push("Nilai wajib diisi");
          
          const validGrades = ["A", "B", "C", "D", "E"];
          if (nilai_huruf && !validGrades.includes(nilai_huruf)) {
              errors.push(`Nilai tidak valid '${nilai_huruf}'`);
          }

          // Strict Student Validation (NIM)
          let student = null;
          if (nim) {
             student = studentMap.get(nim);
             if (!student) {
                // Not found by NIM
                errors.push(`Mahasiswa tidak ditemukan di sistem`);
             } else {
                 // Check if Name matches (Case insensitive)
                 const systemName = student.profile.nama.toLowerCase().trim();
                 const excelName = nama.toLowerCase().trim();
                 
                 // Simple loose equality or includes check? 
                 // Let's go with exact match (normalized) for strictness, 
                 // or maybe just warning? User seems to want error.
                 if (systemName !== excelName) {
                     errors.push(`Nama tidak sesuai dengan data sistem`);
                 }
             }
          }

          // Strict Course Validation (Code)
          if (kode_matkul) {
              if (!courseCodeSet.has(kode_matkul)) {
                  errors.push(`Mata kuliah tidak ditemukan di sistem`);
              }
          }

          // Strict KRS Validation (Check if student has taken this course)
          if (student && kode_matkul) {
              const hasTaken = student.transcript.some(t => t.kode === kode_matkul);
              if (!hasTaken) {
                  errors.push(`Mahasiswa belum mengambil KRS mata kuliah ini`);
              }
          }

          return {
            nim, 
            nama,
            kode_matkul,
            nama_matkul,
            semester,
            nilai_huruf, 
            isValid: errors.length === 0,
            errors
          };
        }).filter(item => item.nim || item.kode_matkul); // Filter empty rows

        // 2. Check for Duplicates WITHIN file (NIM + Kode MK)
        const compositeKeys = new Map<string, number>();
        parsedData.forEach(d => {
            const key = `${d.nim}-${d.kode_matkul}`;
            compositeKeys.set(key, (compositeKeys.get(key) || 0) + 1);
        });

        parsedData = parsedData.map(d => {
            const key = `${d.nim}-${d.kode_matkul}`;
            if (compositeKeys.get(key)! > 1) {
                return { ...d, isValid: false, errors: [...d.errors, "Duplikat di file ini"] };
            }
            return d;
        });

        setData(parsedData);
      } catch (error) {
        console.error("Error reading excel:", error);
        toast.error("Gagal membaca file Excel.", { id: toastId });
      } finally {
        setIsChecking(false);
        toast.dismiss(toastId);
      }
    };
    reader.readAsBinaryString(file);
  };
    
  // Filter data (Updated to include nama search)
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode_matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_matkul.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === "valid") return item.isValid;
    if (filterStatus === "invalid") return !item.isValid;
    
    return true;
  });

  const handleUpload = async () => {
    const validData = data.filter(d => d.isValid);
    if (validData.length === 0) {
      toast.error("Tidak ada data valid untuk diimport.");
      return;
    }
    
    setIsUploading(true);
    const toastId = toast.loading("Mengimport nilai mahasiswa...");
    try {
      const payload = validData.map(d => ({
        nim: d.nim,
        kode: d.kode_matkul,
        hm: d.nilai_huruf
      }));

      const result = await createBulkGrades(payload);
      
      if (result.success) {
          toast.success(`Berhasil mengimport data nilai.`, { id: toastId });
          onSuccess();
          onClose(false);
      } else {
          // Handle partial failure or specific errors if backend returns detailed info
          // For now assuming all-or-nothing or string error
          toast.error(`Gagal import: ${result.message}`, { id: toastId });
      }

    } catch (error: any) {
      toast.error("Gagal melakukan import: " + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setData([]);
    setSearchQuery("");
    setFilterStatus("all");
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[85vw] w-full h-[85vh] flex flex-col p-0 gap-0">
        <div className="p-4 sm:p-6 pb-2">
            <DialogHeader>
            <DialogTitle className="text-xl">Import Nilai Mahasiswa</DialogTitle>
            <DialogDescription>
                Unduh template, isi data nilai, lalu upload file Excel (.xlsx).
            </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleDownloadTemplate} className="justify-center">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download Template
                    </Button>
                    <div className="relative">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) processExcel(e.target.files[0]);
                            }}
                        />
                        <Button 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={isChecking || data.length > 0}
                            className="w-full sm:w-auto justify-center"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Pilih File Excel
                        </Button>
                    </div>
                </div>

                {data.length > 0 && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={handleReset}
                            title="Reset Data"
                            className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    className={filterStatus !== "all" ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                                >
                                    {filterStatus !== "all" ? <ListFilter className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem 
                                    checked={filterStatus === "all"}
                                    onCheckedChange={() => setFilterStatus("all")}
                                >
                                    Semua Status
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem 
                                    checked={filterStatus === "valid"}
                                    onCheckedChange={() => setFilterStatus("valid")}
                                >
                                    Valid
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem 
                                    checked={filterStatus === "invalid"}
                                    onCheckedChange={() => setFilterStatus("invalid")}
                                >
                                    Error
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="relative flex-1 sm:w-64">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input
                                placeholder="Cari NIM atau Kode MK..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                             />
                        </div>
                    </div>
                )}
            </div>
        </div>

        {isChecking || data.length > 0 ? (
            <div className="flex-1 overflow-hidden px-4 sm:px-6">
                <ScrollArea className="h-full border rounded-md">
                    <Table className="min-w-full w-max">
                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                            <TableRow>
                                <TableHead className="w-[50px] whitespace-nowrap">Status</TableHead>
                                <TableHead className="whitespace-nowrap">Keterangan</TableHead>
                                <TableHead className="whitespace-nowrap">NIM</TableHead>
                                <TableHead className="whitespace-nowrap">Nama</TableHead>
                                <TableHead className="whitespace-nowrap">Kode MK</TableHead>
                                <TableHead className="whitespace-nowrap">Nama MK</TableHead>
                                <TableHead className="whitespace-nowrap">Semester</TableHead>
                                <TableHead className="whitespace-nowrap">Nilai</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isChecking ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-6 w-full rounded" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((row, idx) => (
                                    <TableRow key={idx} className={!row.isValid ? "bg-red-50" : ""}>
                                        <TableCell className="text-center">
                                            {row.isValid ? (
                                                <div className="flex justify-center">
                                                     <CheckCircle className="h-4 w-4 text-green-600" />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="min-w-[200px]">
                                            {row.isValid ? (
                                                <span className="text-xs font-medium text-emerald-600">
                                                    Siap import
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    {row.errors.map((err, i) => (
                                                        <span key={i} className="text-xs text-red-600 font-medium">
                                                            {err}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-mono">{row.nim}</TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">{row.nama || "-"}</TableCell>
                                        <TableCell className="whitespace-nowrap font-mono">{row.kode_matkul}</TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">{row.nama_matkul || "-"}</TableCell>
                                        <TableCell className="whitespace-nowrap text-center">{row.semester || "-"}</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">{row.nilai_huruf}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        Data tidak ditemukan sesuai kata kunci "{searchQuery}"
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        ) : (
            <div 
                className="flex-1 flex flex-col items-center justify-center border-dashed border-2 rounded-md mx-4 sm:mx-6 mb-2 text-muted-foreground min-h-[200px] hover:bg-muted/5 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) processExcel(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center gap-4 p-6">
                    <div className="p-4 bg-slate-50 text-slate-500 rounded-full">
                         <Upload className="h-8 w-8" />
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-base font-semibold text-slate-900">
                            Drag & Drop file Excel di sini
                        </p>
                        <p className="text-sm text-slate-500">
                            atau klik untuk memilih file dari komputer
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="p-4 sm:p-6 pt-4 mt-auto border-t bg-background sm:rounded-b-lg">
            <DialogFooter className="flex-col sm:flex-row gap-2">
                <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left mb-2 sm:mb-0">
                    {data.length > 0 && (
                        <span>
                            Total: {data.length} | Valid: {data.filter(d => d.isValid).length} | Invalid: {data.filter(d => !d.isValid).length}
                            {searchQuery && ` (Ditampilkan: ${filteredData.length})`}
                        </span>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => onClose(false)} disabled={isUploading} className="w-full sm:w-auto">Batal</Button>
                    <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || data.filter(d => d.isValid).length === 0}
                        className="w-full sm:w-auto"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : "Import Nilai Valid"}
                    </Button>
                </div>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
