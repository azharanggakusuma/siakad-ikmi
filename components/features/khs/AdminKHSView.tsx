"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

import { getStudents, getStudyPrograms, getActiveOfficial } from "@/app/actions/students";
import { StudentData, StudyProgram, Official, TranscriptItem } from "@/lib/types";
import { StudentTable } from "@/components/features/nilai/StudentTable";
import { useLayout } from "@/app/context/LayoutContext";
import { useSignature } from "@/hooks/useSignature";
import { useToastMessage } from "@/hooks/use-toast-message";
import PrintableKHS from "@/components/features/khs/PrintableKHS";
import { calculateIPS, calculateIPK } from "@/lib/grade-calculations";

export default function AdminKHSView() {
  const { isCollapsed } = useLayout();
  // --- STATE ---
  const [studentList, setStudentList] = useState<StudentData[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [official, setOfficial] = useState<Official | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Modal Cetak State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  
  // Print Configuration State
  const [printSemester, setPrintSemester] = useState<number>(0);
  const { signatureType, setSignatureType, secureImage, isLoading: isSigLoading } = useSignature("none");
  const { showLoading, dismiss } = useToastMessage();
  const [totalPages, setTotalPages] = useState(1);
  
  const toastIdRef = useRef<string | number | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [students, programs, activeOfficial] = await Promise.all([
        getStudents(),
        getStudyPrograms(),
        getActiveOfficial()
      ]);
      
      setStudentList(students);
      setStudyPrograms(programs || []);
      setOfficial(activeOfficial);
    } catch (error) {
      toast.error("Gagal Memuat Data", { description: "Terjadi kesalahan koneksi." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === LOADING TOAST SIGNATURE ===
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

  // === LOGIC SEMESTERS ===
  const availableSemesters = useMemo<number[]>(() => {
    if (!selectedStudent) return [];
    const currentSem = selectedStudent.profile?.semester || 1;
    const transcriptSmts = selectedStudent.transcript?.map((t: TranscriptItem) => Number(t.smt)) || [];
    const maxDataSem = Math.max(0, ...transcriptSmts);
    const limit = Math.max(currentSem, maxDataSem);
    return Array.from({ length: limit }, (_, i) => i + 1);
  }, [selectedStudent]);

  // Auto-select latest semester when modal opens
  useEffect(() => {
    if (isPrintModalOpen && availableSemesters.length > 0) {
        setPrintSemester(availableSemesters[availableSemesters.length - 1]);
    }
  }, [isPrintModalOpen, availableSemesters]);

  // === CALCULATIONS FOR PRINT ===
  const printSemesterData = useMemo(() => {
    if (!selectedStudent?.transcript) return [];
    return selectedStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) === printSemester);
  }, [selectedStudent, printSemester]);

  const printIPS = useMemo(() => {
    return calculateIPS(selectedStudent?.transcript || [], printSemester).replace('.', ',');
  }, [selectedStudent, printSemester]);

  const printCumulativeData = useMemo(() => {
    if (!selectedStudent?.transcript) return [];
    return selectedStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) <= printSemester && t.hm !== '-');
  }, [selectedStudent, printSemester]);

  const printIPK = useMemo(() => {
    return calculateIPK(printCumulativeData).replace('.', ',');
  }, [printCumulativeData]);

  // === HANDLERS ===
  const handleOpenPrintModal = (student: StudentData) => {
    setSelectedStudent(student);
    setIsPrintModalOpen(true);
  };

  const handlePrintProcess = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => {
        window.print();
    }, 300);
  };

  return (
    <>
      {/* HIDDEN PRINT COMPONENT */}
      {selectedStudent && (
        <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:z-[9999]">
            <PrintableKHS 
                loading={false}
                currentStudent={selectedStudent}
                selectedSemester={printSemester}
                semesterData={printSemesterData}
                ips={printIPS}
                ipk={printIPK}
                signatureType={signatureType}
                signatureBase64={secureImage}
                official={official}
                isCollapsed={isCollapsed}
                setTotalPages={setTotalPages}
            />
        </div>
      )}

      {/* MAIN TABLE VIEW */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <StudentTable 
            data={studentList}
            studyPrograms={studyPrograms} 
            isLoading={isLoading}
            onEdit={handleOpenPrintModal}
            actionLabel="Cetak KHS"
            actionIcon={<Printer className="w-3.5 h-3.5 mr-2" />}
          />
        </CardContent>
      </Card>

      {/* MODAL OPSI CETAK */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Opsi Cetak KHS</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
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
    </>
  );
}
