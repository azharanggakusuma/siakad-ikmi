"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type TranscriptItem, type Official } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { useToastMessage } from "@/hooks/use-toast-message";

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
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [printSemester, setPrintSemester] = useState<number>(0); // Decoupled state for printing
  const { signatureType, setSignatureType, secureImage, isLoading: isSigLoading } = useSignature("none");
  const { isCollapsed, user } = useLayout();
  const { showLoading, dismiss } = useToastMessage();
  
  const [totalPages, setTotalPages] = useState(1);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState(false);
  const [isModalStudentSelectOpen, setIsModalStudentSelectOpen] = useState(false);

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

  // Auto-select latest semester for printing if "All Semesters" is active


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

  // Auto-select latest semester for printing if "All Semesters" is active
  useEffect(() => {
    if (isPrintModalOpen && availableSemesters.length > 0) {
        // If table is showing a specific semester, use that for print
        if (selectedSemester !== 0) {
            setPrintSemester(selectedSemester);
        } else {
             // If table is showing "All", default print to latest
            setPrintSemester(availableSemesters[availableSemesters.length - 1]);
        }
    }
  }, [isPrintModalOpen, selectedSemester, availableSemesters]);

  useEffect(() => {
    if (availableSemesters.length > 0) {
        if (selectedSemester !== 0 && !availableSemesters.includes(selectedSemester)) {
            setSelectedSemester(0);
        }
    }
  }, [availableSemesters, selectedSemester]);

  // Data Semester Ini
  const semesterData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    if (selectedSemester === 0) return currentStudent.transcript;
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

  // Data for Printing (Based on printSemester)
  const printSemesterData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    // Print always needs a specific semester, so we filter by printSemester
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) === printSemester);
  }, [currentStudent, printSemester]);

  // IPS for Printing
  const printIPS = useMemo(() => {
    return calculateIPS(currentStudent?.transcript || [], printSemester).replace('.', ',');
  }, [currentStudent, printSemester]);

  // IPK for Printing (Cumulative until printSemester)
  const printCumulativeData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) <= printSemester && t.hm !== '-');
  }, [currentStudent, printSemester]);

  const printIPK = useMemo(() => {
    return calculateIPK(printCumulativeData).replace('.', ',');
  }, [printCumulativeData]);

  const selectedStudentName = currentStudent?.profile.nama || "Pilih Mahasiswa...";

  return (
    <>
      {/* --- HIDDEN PRINT COMPONENT --- */}
      {/* This component is hidden on screen but visible when printing */}
      <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:z-[9999]">
          <PrintableKHS 
            loading={loading}
            currentStudent={currentStudent}
            selectedSemester={printSemester} // Use printSemester
            semesterData={printSemesterData} // Use printSemesterData
            ips={printIPS} // Use printIPS
            ipk={printIPK} // Use printIPK
            signatureType={signatureType}
            signatureBase64={secureImage}
            official={official}
            isCollapsed={isCollapsed}
            setTotalPages={setTotalPages}
          />
      </div>

      <div className="space-y-6 print:hidden">
         {/* HEADER SECTION */}


         {/* CONTENT SECTION (TABLE) */}
         <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6">
                       <div className="space-y-4">
                         <KHSTable 
                             data={semesterData} 
                             loading={loading}
                             onPrint={() => setIsPrintModalOpen(true)}
                             availableSemesters={availableSemesters}
                             selectedSemester={selectedSemester}
                             onSemesterChange={setSelectedSemester}
                         />
                       </div>
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
                              value={String(printSemester)}
                              onValueChange={(val) => setPrintSemester(Number(val))}
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
