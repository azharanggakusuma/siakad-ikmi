"use client";

import React, { useState, useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { StudentData } from "@/lib/types";
import { KtmCard } from "@/components/features/mahasiswa/KtmCard";
import { usePdfPrint } from "@/hooks/use-pdf-print";
import JSZip from "jszip";
import KtmTable from "@/components/features/mahasiswa/KtmTable"; // Adjust path if needed

interface KtmAdminClientProps {
  students: StudentData[];
}

export default function KtmAdminClient({ students }: KtmAdminClientProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  
  const ktmRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { isPrinting, printPdf, generatePdfBlob } = usePdfPrint();

  // Print individual KTM
  const handlePrintIndividual = async (student: StudentData) => {
    const ref = ktmRefs.current.get(student.id);
    if (!ref) return;

    await printPdf({
      elementRef: { current: ref },
      fileName: `KTM_${student.profile.nama.replace(/\s+/g, "_")}_${student.profile.nim}.pdf`,
      pdfFormat: [85.6, 53.98],
      pdfOrientation: "landscape",
      pixelRatio: 8,
      imageType: "image/jpeg",
      imageQuality: 1.0
    });
  };

  // Generate ZIP with multiple KTMs
  const handlePrintBulk = async () => {
    if (selectedStudents.size === 0) {
      alert("Pilih minimal 1 mahasiswa untuk dicetak");
      return;
    }

    setIsGeneratingZip(true);

    try {
      const zip = new JSZip();
      const selectedList = Array.from(selectedStudents);

      // Process sequentially to avoid memory spikes
      for (const studentId of selectedList) {
        const student = students.find(s => s.id === studentId);
        const ref = ktmRefs.current.get(studentId);
        
        if (!student || !ref) continue;

        // Use the shared PDF generation logic
        const pdfBlob = await generatePdfBlob({
            elementRef: { current: ref },
            fileName: "", // Not used for blob generation
            pdfFormat: [85.6, 53.98],
            pdfOrientation: "landscape",
            pixelRatio: 8,
            imageType: "image/jpeg",
            imageQuality: 1.0,
        });

        if (pdfBlob) {
            const fileName = `KTM_${student.profile.nama.replace(/\s+/g, "_")}_${student.profile.nim}.pdf`;
            zip.file(fileName, pdfBlob);
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `KTM_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      setSelectedStudents(new Set());
    } catch (error) {
      console.error("Error generating ZIP:", error);
      alert("Gagal membuat file ZIP. Silakan coba lagi.");
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const hiddenKtmCards = React.useMemo(() => (
    <div className="absolute top-0 left-[-9999px]">
      {students.map(student => (
        <div 
          key={student.id}
          ref={(el) => {
            if (el) ktmRefs.current.set(student.id, el);
          }}
          className="w-[85.6mm] h-[53.98mm]"
        >
          <KtmCard student={student} className="rounded-none shadow-none border-none" />
        </div>
      ))}
    </div>
  ), [students]);

  return (
    <>
      {/* Hidden KTM Cards for PDF Generation */}
      {hiddenKtmCards}

      {/* Screen Content */}
      <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-500">
        <PageHeader 
          title="Kartu Tanda Mahasiswa" 
          breadcrumb={["Beranda", "KTM"]} 
        />

        <KtmTable 
          data={students}
          isLoading={false}
          selectedIds={selectedStudents}
          onSelectionChange={setSelectedStudents}
          onPrint={handlePrintIndividual}
          onPrintBulk={handlePrintBulk}
          isGeneratingZip={isGeneratingZip}
          isPrinting={isPrinting}
        />
      </div>
    </>
  );
}
