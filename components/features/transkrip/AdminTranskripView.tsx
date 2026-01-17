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
import PrintableTranskrip from "@/components/features/transkrip/PrintableTranskrip";
import { calculateIPK, calculateTotalSKSLulus, calculateTotalMutu } from "@/lib/grade-calculations";

export default function AdminTranskripView() {
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

  // === DATA TRANSKRIP (Clean Data) ===
  const transcriptData = useMemo(() => {
    if (!selectedStudent?.transcript) return [];
    // Filter mata kuliah yang nilainya belum ada (-)
    return selectedStudent.transcript.filter((item: TranscriptItem) => item.hm !== '-');
  }, [selectedStudent]);

  const summaryData = useMemo(() => {
      if (!transcriptData) return { ipk: "0,00", totalSKS: 0, totalNM: 0 };
      
      const ipkVal = calculateIPK(transcriptData).replace('.', ',');
      const sksVal = calculateTotalSKSLulus(transcriptData);
      const mutuVal = calculateTotalMutu(transcriptData);

      return { ipk: ipkVal, totalSKS: sksVal, totalNM: mutuVal };
  }, [transcriptData]);

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
             <PrintableTranskrip
                loading={false}
                currentStudent={selectedStudent}
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
      )}

      {/* MAIN TABLE VIEW */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <StudentTable 
            data={studentList}
            studyPrograms={studyPrograms} 
            isLoading={isLoading}
            onEdit={handleOpenPrintModal}
            actionLabel="Cetak Transkrip"
            actionIcon={<Printer className="w-3.5 h-3.5 mr-2" />}
          />
        </CardContent>
      </Card>

      {/* MODAL OPSI CETAK */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Opsi Cetak Transkrip</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
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
