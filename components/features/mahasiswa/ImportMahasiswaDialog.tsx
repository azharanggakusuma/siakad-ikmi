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
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StudyProgram } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { createBulkStudents, checkExistingNims } from "@/app/actions/students"; 

interface ImportMahasiswaDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  studyPrograms: StudyProgram[];
  onSuccess: () => void;
}

interface ParsedStudent {
  nim: string;
  nama: string;
  nik: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string; // Format YYYY-MM-DD
  agama: string;
  status: string; // Status Perkawinan
  no_hp: string;
  email: string;
  alamat: string;
  angkatan: string | number;
  prodi_nama: string; // Nama Prodi dari Excel
  
  // Validation status
  isValid: boolean;
  errors: string[];
}

export function ImportMahasiswaDialog({
  isOpen,
  onClose,
  studyPrograms,
  onSuccess,
}: ImportMahasiswaDialogProps) {
  const [data, setData] = useState<ParsedStudent[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const headers = [
      "NIM", "Nama Lengkap", "NIK", "Jenis Kelamin (L/P)", 
      "Tempat Lahir", "Tanggal Lahir (YYYY-MM-DD)", "Agama", 
      "Status Perkawinan", "No HP", "Email", "Alamat", 
      "Angkatan", "Nama Program Studi"
    ];
    
    // Example row
    const example = [
      "4124001", "Budi Santoso", "3201123456780001", "L", 
      "Jakarta", "2000-01-01", "Islam", 
      "Belum Menikah", "081234567890", "budi@example.com", "Jl. Sudirman No. 1", 
      new Date().getFullYear(), studyPrograms[0]?.nama || "Tehnik Informatika"
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Mahasiswa.xlsx");
  };

  const processExcel = async (file: File) => {
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
        
        // 1. Initial Parse checks
        let parsedData: ParsedStudent[] = rows.map((row) => {
          const errors: string[] = [];
          
          // Mapping columns (assuming standard template order)
          const nim = String(row[0] || "").trim();
          const nama = String(row[1] || "").trim();
          const nik = String(row[2] || "").trim();
          let jk = String(row[3] || "").trim().toUpperCase();
          if (jk === "L") jk = "Laki-laki";
          if (jk === "P") jk = "Perempuan";
          
          const tempat_lahir = String(row[4] || "").trim();
          const tanggal_lahir = String(row[5] || "").trim();
          const agama = String(row[6] || "").trim();
          const status = String(row[7] || "").trim();
          const no_hp = String(row[8] || "").trim();
          const email = String(row[9] || "").trim();
          const alamat = String(row[10] || "").trim();
          const angkatan = String(row[11] || "").trim();
          const prodi_nama = String(row[12] || "").trim();

          // Basic Validation
          if (!nim) errors.push("NIM wajib diisi");
          if (!nama) errors.push("Nama wajib diisi");
          if (!nik) errors.push("NIK wajib diisi");
          if (!["Laki-laki", "Perempuan"].includes(jk)) errors.push("JK harus L atau P");
          if (!prodi_nama) errors.push("Prodi wajib diisi");
          
          // Validate Date (Simple YYYY-MM-DD check)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!tanggal_lahir) {
             errors.push("Tgl Lahir wajib");
          } else if (tanggal_lahir !== "-" && !dateRegex.test(tanggal_lahir)) {
             errors.push("Format Tgl salah (YYYY-MM-DD) atau '-'");
          }

          // Validate Email
          const emailRegex = /\S+@\S+\.\S+/;
          if (!email) {
             errors.push("Email wajib");
          } else if (email !== "-" && !emailRegex.test(email)) {
             errors.push("Format Email salah");
          }

          // Validate Required Text Fields
          if (!tempat_lahir) errors.push("Tempat Lahir wajib");
          if (!agama) errors.push("Agama wajib");
          if (!status) errors.push("Status nikah wajib");
          if (!no_hp) errors.push("No HP wajib");
          if (!alamat) errors.push("Alamat wajib");
          
          // Check Prodi exists
          const prodiExists = studyPrograms.some(p => p.nama.toLowerCase() === prodi_nama.toLowerCase());
          if (!prodiExists && prodi_nama) errors.push(`Prodi '${prodi_nama}' tidak ditemukan`);

          return {
            nim, nama, nik, jenis_kelamin: jk, tempat_lahir, 
            tanggal_lahir, agama, status, no_hp, email, 
            alamat, angkatan, prodi_nama,
            isValid: errors.length === 0,
            errors
          };
        }).filter(item => item.nim || item.nama); // Filter empty rows

        // 2. Check for Duplicates WITHIN file
        const nimCounts = new Map<string, number>();
        parsedData.forEach(d => {
            const n = d.nim;
            nimCounts.set(n, (nimCounts.get(n) || 0) + 1);
        });

        parsedData = parsedData.map(d => {
            if (nimCounts.get(d.nim)! > 1) {
                return { ...d, isValid: false, errors: [...d.errors, "NIM ganda di file ini"] };
            }
            return d;
        });

        // 3. Check for Duplicates IN DATABASE
        const nimsToCheck = parsedData.filter(d => d.nim).map(d => d.nim);
        if (nimsToCheck.length > 0) {
            const existingNims = await checkExistingNims(nimsToCheck);
            const existingSet = new Set(existingNims);

            parsedData = parsedData.map(d => {
                if (existingSet.has(d.nim)) {
                    return { ...d, isValid: false, errors: [...d.errors, "NIM sudah terdaftar"] };
                }
                return d;
            });
        }

        setData(parsedData);
      } catch (error) {
        console.error("Error reading excel:", error);
        toast.error("Gagal membaca file Excel.");
      } finally {
        setIsChecking(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Filter data
  const filteredData = data.filter(item => 
    item.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.prodi_nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async () => {
    const validData = data.filter(d => d.isValid);
    if (validData.length === 0) {
      toast.error("Tidak ada data valid untuk diimport.");
      return;
    }

    setIsUploading(true);
    try {
      // Prepare payload
      const payload = validData.map(d => {
        const prodi = studyPrograms.find(p => p.nama.toLowerCase() === d.prodi_nama.toLowerCase());
        return {
          nim: d.nim,
          nama: d.nama,
          study_program_id: prodi?.id || "",
          angkatan: d.angkatan,
          alamat: d.alamat,
          is_active: true,
          jenis_kelamin: d.jenis_kelamin,
          tempat_lahir: d.tempat_lahir,
          // Map "-" to null for database
          tanggal_lahir: d.tanggal_lahir === "-" ? null : d.tanggal_lahir,
          agama: d.agama,
          nik: d.nik,
          status: d.status,
          no_hp: d.no_hp,
          // Map "-" to null for database
          email: d.email === "-" ? null : d.email,
        };
      });

      await createBulkStudents(payload);
      toast.success(`Berhasil mengimport ${validData.length} data mahasiswa.`);
      onSuccess();
      onClose(false);
      setData([]); // Reset
      setSearchQuery("");
    } catch (error: any) {
      toast.error("Gagal melakukan import: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setData([]);
    setSearchQuery("");
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[85vw] w-full h-[85vh] flex flex-col p-0 gap-0">
        <div className="p-6 pb-2">
            <DialogHeader>
            <DialogTitle>Import Data Mahasiswa</DialogTitle>
            <DialogDescription>
                Unduh template, isi data, lalu upload file Excel (.xlsx).
            </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleDownloadTemplate}>
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
                        <Button onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Pilih File Excel
                        </Button>
                    </div>
                </div>

                {data.length > 0 && (
                    <div className="relative w-full sm:w-72">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input
                            placeholder="Cari NIM atau Nama..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
                    </div>
                )}
            </div>
        </div>

        {isChecking ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Memvalidasi data...</p>
            </div>
        ) : data.length > 0 ? (
            <div className="flex-1 overflow-hidden px-6">
                <ScrollArea className="h-full border rounded-md">
                    <Table className="min-w-full w-max">
                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                            <TableRow>
                                <TableHead className="w-[50px] whitespace-nowrap">Status</TableHead>
                                <TableHead className="whitespace-nowrap">Error</TableHead>
                                <TableHead className="whitespace-nowrap">NIM</TableHead>
                                <TableHead className="min-w-[200px] whitespace-nowrap">Nama</TableHead>
                                <TableHead className="whitespace-nowrap">Prodi</TableHead>
                                <TableHead className="whitespace-nowrap">Tempat Lahir</TableHead>
                                <TableHead className="whitespace-nowrap">Tanggal Lahir</TableHead>
                                <TableHead className="whitespace-nowrap">Agama</TableHead>
                                <TableHead className="whitespace-nowrap">Status</TableHead>
                                <TableHead className="whitespace-nowrap">No HP</TableHead>
                                <TableHead className="whitespace-nowrap">Email</TableHead>
                                <TableHead className="whitespace-nowrap">Alamat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, idx) => (
                                    <TableRow key={idx} className={!row.isValid ? "bg-red-50" : ""}>
                                        <TableCell>
                                            {row.isValid ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-red-500 text-xs min-w-[200px]">
                                            {row.errors.join(", ")}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{row.nim}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.nama}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.prodi_nama}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.tempat_lahir}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.tanggal_lahir}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.agama}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.status}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.no_hp}</TableCell>
                                        <TableCell className="whitespace-nowrap">{row.email}</TableCell>
                                        <TableCell className="min-w-[300px]">{row.alamat}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={12} className="text-center h-24 text-muted-foreground">
                                        Data tidak ditemukan sesuai kata kunci "{searchQuery}"
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center border-dashed border-2 rounded-md mx-6 mb-2 text-muted-foreground min-h-[200px]">
                <p>Belum ada data yang diupload.</p>
            </div>
        )}

        <div className="p-6 pt-4 mt-auto border-t bg-background">
            <DialogFooter>
                <div className="flex-1 text-sm text-muted-foreground self-center">
                    {data.length > 0 && (
                        <span>
                            Total: {data.length} | Valid: {data.filter(d => d.isValid).length} | Invalid: {data.filter(d => !d.isValid).length}
                            {searchQuery && ` (Ditampilkan: ${filteredData.length})`}
                        </span>
                    )}
                </div>
                {data.length > 0 && (
                    <Button variant="destructive" onClick={handleReset} disabled={isUploading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                )}
                <Button variant="outline" onClick={() => onClose(false)} disabled={isUploading}>Batal</Button>
                <Button 
                    onClick={handleUpload} 
                    disabled={isUploading || data.filter(d => d.isValid).length === 0}
                >
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Import Data Valid
                </Button>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
