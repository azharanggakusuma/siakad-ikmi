"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type Official, type TranscriptItem } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import PrintableTranskrip from "@/components/features/transkrip/PrintableTranskrip";
import { calculateIPK, calculateTotalSKSLulus, calculateTotalMutu } from "@/lib/grade-calculations";
import TranskripTable from "@/components/features/transkrip/TranskripTable";
import { useToastMessage } from "@/hooks/use-toast-message";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"; // Added DropdownMenuItem
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Printer, Check, ChevronsUpDown, Loader2, TrendingUp, Award, PieChart, GraduationCap, FileText, Trophy, BookOpen, UserPen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTranskripView() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<Official | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const { signatureType, setSignatureType, secureImage, isLoading: isSigLoading } = useSignature("none");
  const { isCollapsed, user } = useLayout();
  const { showLoading, dismiss } = useToastMessage();

  const [totalPages, setTotalPages] = useState(1);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isModalStudentSelectOpen, setIsModalStudentSelectOpen] = useState(false);
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState(true); // Default open on load
  const [selectedSemester, setSelectedSemester] = useState<number>(0);

  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (isSigLoading) {
        if (!toastIdRef.current) toastIdRef.current = showLoading("Menyiapkan dokumen...");
    } else {
        if (toastIdRef.current) {
            dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }
    }
  }, [isSigLoading, showLoading, dismiss]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, activeOfficial] = await Promise.all([
           getStudents(),
           getActiveOfficial()
        ]);
        setStudentsData(data);
        setOfficial(activeOfficial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // === LOGIC SEMESTER ===
  const availableSemesters = useMemo<number[]>(() => {
    if (!currentStudent) return [];
    const currentSem = currentStudent.profile?.semester || 1;
    const transcriptSmts = currentStudent.transcript?.map((t: TranscriptItem) => Number(t.smt)) || [];
    const maxDataSem = Math.max(0, ...transcriptSmts);
    const limit = Math.max(currentSem, maxDataSem);
    return Array.from({ length: limit }, (_, i) => i + 1);
  }, [currentStudent]);

  // Data Transkrip Bersih (Tanpa KRS kosong)
  const transcriptData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((item: TranscriptItem) => item.hm !== '-');
  }, [currentStudent]);

  // Data UNTUK TABEL (Bisa difilter)
  const tableData = useMemo(() => {
    if (selectedSemester === 0) return transcriptData;
    return transcriptData.filter((item: TranscriptItem) => Number(item.smt) === selectedSemester);
  }, [transcriptData, selectedSemester]);

  // Hitung Summary
  const summaryData = useMemo(() => {
      if (!transcriptData) return { ipk: "0,00", totalSKS: 0, totalNM: 0 };
      
      const ipkVal = calculateIPK(transcriptData).replace('.', ',');
      const sksVal = calculateTotalSKSLulus(transcriptData);
      const mutuVal = calculateTotalMutu(transcriptData);

      return { ipk: ipkVal, totalSKS: sksVal, totalNM: mutuVal };
  }, [transcriptData]);

  const handlePrintProcess = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => {
        window.print();
    }, 300);
  };

  const selectedStudentName = currentStudent?.profile.nama || "Pilih Mahasiswa...";

  return (
    <>
      <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:z-[9999]">
         <PrintableTranskrip
             loading={loading}
             currentStudent={currentStudent}
             transcriptData={transcriptData}
             ipk={summaryData.ipk}
             totalSKS={summaryData.totalSKS}
             totalNM={summaryData.totalNM}
             signatureType={signatureType}
             signatureBase64={secureImage}
             official={official}
             isCollapsed={isCollapsed}
             setTotalPages={setTotalPages}
          />
      </div>

    <div className="space-y-6 print:hidden">
         {/* HEADER SECTION - SUMMARY CARDS (IPK & Total SKS) */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* CARD 1: IPK (Left) - Spans 2 columns */}
             <Card className="col-span-1 md:col-span-2 border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-blue-800 to-blue-900">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy size={120} />
                </div>
                
                {/* BUTTON GANTI MAHASISWA - Absolute Top Right (COMBOBOX) */}
                {!loading && (
                    <div className="absolute top-4 right-4 z-20">
                        <Popover open={isStudentSelectOpen} onOpenChange={setIsStudentSelectOpen}>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    role="combobox"
                                    aria-expanded={isStudentSelectOpen}
                                    className="bg-white/10 hover:bg-white/20 text-white hover:text-white border border-white/20 backdrop-blur-md gap-2"
                                >
                                    <UserPen className="w-4 h4" />
                                    <span className="text-xs font-medium">{currentStudent?.profile.nama}</span>
                                    <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="end">
                                <Command>
                                    <CommandInput placeholder="Cari mahasiswa..." />
                                    <CommandList>
                                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                            {studentsData.map((student, index) => (
                                                <CommandItem
                                                    key={student.id}
                                                    value={student.profile.nama}
                                                    onSelect={() => {
                                                        setSelectedIndex(index);
                                                        setIsStudentSelectOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedIndex === index ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {student.profile.nama}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                     {loading ? (
                         <div className="flex flex-col justify-between h-full gap-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-32 opacity-25" />
                                    <Skeleton className="h-8 w-48 opacity-25" />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <Skeleton className="h-10 w-[240px] opacity-25" />
                            </div>
                         </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-blue-100 font-medium text-sm mb-1">Indeks Prestasi Kumulatif</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-extrabold tracking-tight">{summaryData.ipk}</h2>
                                    <span className="text-lg text-blue-200 font-medium">/ 4.00</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md border border-white/10 backdrop-blur-sm">
                                    <GraduationCap className="w-4 h-4 text-blue-50" />
                                    <span className="text-sm font-medium text-blue-50">Total Nilai Mutu: {summaryData.totalNM}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md border border-white/10 backdrop-blur-sm">
                                    <FileText className="w-4 h-4 text-blue-50" />
                                    <span className="text-sm font-medium text-blue-50">Total Mata Kuliah: {transcriptData.length}</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
             </Card>

             {/* CARD 2: Total SKS (Right) - Spans 1 column */}
             <Card className="border-none shadow-md text-white overflow-hidden relative bg-gradient-to-br from-cyan-600 to-blue-600">
                <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12">
                    <BookOpen size={140} />
                </div>
                <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                    {loading ? (
                         <div className="space-y-6">
                           <div className="space-y-3">
                               <Skeleton className="h-4 w-32 opacity-25" />
                               <div className="flex items-baseline gap-2">
                                  <Skeleton className="h-10 w-16 opacity-25" />
                                  <Skeleton className="h-6 w-12 opacity-25" />
                               </div>
                           </div>
                           <div className="space-y-2">
                              <Skeleton className="h-3 w-full opacity-25 rounded-full" />
                              <Skeleton className="h-3 w-3/4 opacity-25 rounded-full" />
                           </div>
                         </div>
                    ) : (
                        <>
                            <div>
                                <div className="flex items-center gap-2 text-cyan-50 mb-1">
                                    <span className="text-sm font-medium">Total SKS Lulus</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-extrabold tracking-tight">{summaryData.totalSKS}</h2>
                                    <span className="text-lg text-cyan-100 font-medium">/ 144 SKS</span>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="w-full bg-black/20 rounded-full h-3 mb-3 overflow-hidden backdrop-blur-sm">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000 ease-out bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                                        style={{ width: `${Math.min((summaryData.totalSKS / 144) * 100, 100)}%` }} 
                                    />
                                </div>
                                <p className="text-xs text-cyan-50/90 leading-relaxed font-medium">
                                    {Math.round((summaryData.totalSKS / 144) * 100)}% dari minimal 144 SKS untuk kelulusan Sarjana.
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
             </Card>
         </div>

         {/* TABLE SECTION */}
         <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6">
                
                
                {/* 
                   ADMIN CONTROL MOVED TO FILTER 
                   Removed the button "Ganti Mahasiswa" as per request.
                   Trigger is now inside TranskripTable filter menu.
                */}

                <div className="space-y-4">
                    <TranskripTable 
                        data={tableData}
                        loading={loading}
                        onPrint={() => setIsPrintModalOpen(true)}
                        availableSemesters={availableSemesters}
                        selectedSemester={selectedSemester}
                        onSemesterChange={setSelectedSemester}
                    />
                </div>
            </CardContent>
         </Card>

         {/* PRINT MODAL */}
         <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
              <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                      <DialogTitle>Opsi Cetak Transkrip</DialogTitle>
                  </DialogHeader>

                  <div className="py-4 space-y-4">
                      {/* Select Student in Modal (Syncs with main view) */}
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Mahasiswa</label>
                          <Popover open={isModalStudentSelectOpen} onOpenChange={setIsModalStudentSelectOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                              >
                                {selectedStudentName}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Cari mahasiswa..." />
                                <CommandList>
                                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                  <CommandGroup>
                                    {studentsData.map((student, index) => (
                                      <CommandItem
                                        key={student.id}
                                        value={student.profile.nama}
                                        onSelect={() => {
                                          setSelectedIndex(index);
                                          setIsModalStudentSelectOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedIndex === index ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {student.profile.nama}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-medium">Pilih Jenis Tanda Tangan</label>
                          <Select value={signatureType} onValueChange={(val) => setSignatureType(val as "basah" | "digital" | "none")}>
                              <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih Tanda Tangan" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="none">Tanpa Tanda Tangan</SelectItem>
                                  <SelectItem value="basah">Tanda Tangan Basah</SelectItem>
                                  <SelectItem value="digital">Tanda Tangan Digital (QR)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>

                   <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>Batal</Button>
                      <Button onClick={handlePrintProcess} className="bg-primary text-white">
                          <Printer className="mr-2 h-4 w-4" /> Cetak PDF
                      </Button>
                  </div>
              </DialogContent>
         </Dialog>

    </div>
    </>
  );
}
