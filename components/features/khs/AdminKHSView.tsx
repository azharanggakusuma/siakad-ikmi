"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type TranscriptItem, type Official } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";

import PrintableKHS from "@/components/features/khs/PrintableKHS"; // Keep for Modal
import KHSTable from "@/components/features/khs/KHSTable"; // New Table
import { calculateIPS, calculateIPK } from "@/lib/grade-calculations";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Printer, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminKHSView() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<Official | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed, user } = useLayout();
  
  const [totalPages, setTotalPages] = useState(1);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState(false);
  const [isModalStudentSelectOpen, setIsModalStudentSelectOpen] = useState(false);

  // === FETCH DATA ===
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

  useEffect(() => {
    if (availableSemesters.length > 0) {
        if (!availableSemesters.includes(selectedSemester)) {
            setSelectedSemester(availableSemesters[availableSemesters.length - 1]);
        }
    }
  }, [availableSemesters, selectedSemester]);

  // Data Semester Ini
  const semesterData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) === selectedSemester);
  }, [currentStudent, selectedSemester]);

  // Data Kumulatif (Sampai Semester Ini)
  const cumulativeData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) <= selectedSemester && t.hm !== '-');
  }, [currentStudent, selectedSemester]);

  const ips = useMemo(() => {
    return calculateIPS(currentStudent?.transcript || [], selectedSemester).replace('.', ',');
  }, [currentStudent, selectedSemester]);

  const ipk = useMemo(() => {
    return calculateIPK(cumulativeData).replace('.', ',');
  }, [cumulativeData]);

  // Handle Print with delay to ensure state updates
  const handlePrintProcess = () => {
    setIsPrintModalOpen(false);
    // Give time for the modal to close and state to settle
    setTimeout(() => {
        window.print();
    }, 300);
  };

  const selectedStudentName = currentStudent?.profile.nama || "Pilih Mahasiswa...";

  return (
    <>
      {/* --- HIDDEN PRINT COMPONENT --- */}
      {/* This component is hidden on screen but visible when printing */}
      <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:z-[9999]">
          <PrintableKHS 
            loading={loading}
            currentStudent={currentStudent}
            selectedSemester={selectedSemester}
            semesterData={semesterData}
            ips={ips}
            ipk={ipk}
            signatureType={signatureType}
            signatureBase64={secureImage}
            official={official}
            isCollapsed={isCollapsed}
            setTotalPages={setTotalPages}
          />
      </div>

      <div className="space-y-6 print:hidden">
         {/* HEADER SECTION */}
         <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-1">
               <h1 className="text-xl font-bold text-gray-800">Kartu Hasil Studi (KHS)</h1>
               <p className="text-sm text-gray-500">Kelola dan cetak Kartu Hasil Studi mahasiswa.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
               {/* Student Selector */}
               <Popover open={isStudentSelectOpen} onOpenChange={setIsStudentSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isStudentSelectOpen}
                        className="w-full sm:w-[250px] justify-between h-10 bg-white text-sm"
                      >
                        <span className="truncate">{selectedStudentName}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0 rounded-xl shadow-lg" align="end">
                      <Command className="rounded-xl">
                        <CommandInput placeholder="Cari mahasiswa..." className="text-sm h-9" />
                        <CommandList>
                          <CommandEmpty className="py-2 text-center text-xs text-gray-500">
                            Tidak ditemukan.
                          </CommandEmpty>
                          <CommandGroup>
                            {studentsData.map((student, index) => (
                              <CommandItem
                                key={student.id}
                                value={student.profile.nama}
                                onSelect={() => {
                                  setSelectedIndex(index);
                                  setIsStudentSelectOpen(false);
                                }}
                                className="text-sm rounded-lg cursor-pointer aria-selected:bg-gray-100"
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

               {/* Semester Selector */}
               <div className="w-[140px]">
                  <Select
                      value={String(selectedSemester)}
                      onValueChange={(val) => setSelectedSemester(Number(val))}
                  >
                      <SelectTrigger className="w-full h-10 bg-white text-sm">
                      <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                      {availableSemesters.map((smt) => (
                          <SelectItem key={smt} value={String(smt)} className="text-sm">
                          Semester {smt}
                          </SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
               </div>

               {/* Print Button */}
               <Button 
                  onClick={() => setIsPrintModalOpen(true)}
                  disabled={loading || !currentStudent}
                  className="bg-primary hover:bg-primary/90 text-white h-10"
               >
                  <Printer className="mr-2 h-4 w-4" /> Cetak PDF
               </Button>
            </div>
         </div>

         {/* CONTENT SECTION (TABLE) */}
         <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6">
               {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                       <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                       <p className="text-gray-500 text-sm">Memuat data...</p>
                  </div>
               ) : (
                      <div className="space-y-4">
                        <KHSTable 
                            data={semesterData} 
                            loading={loading}
                            onPrint={() => setIsPrintModalOpen(true)} 
                        />
                      </div>
               )}
            </CardContent>
         </Card>

         {/* PRINT MODAL (Simple, Replicating KRS Style) */}
         <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
              <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                      <DialogTitle>Opsi Cetak KHS</DialogTitle>
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

                      {/* Select Semester in Modal (Syncs with main view) */}
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Semester</label>
                          <Select
                              value={String(selectedSemester)}
                              onValueChange={(val) => setSelectedSemester(Number(val))}
                          >
                              <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih Semester" />
                              </SelectTrigger>
                              <SelectContent>
                                  {availableSemesters.map((smt) => (
                                      <SelectItem key={smt} value={String(smt)}>
                                          Semester {smt}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
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
