"use client";

import React, { useRef, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, User, Eye, ShieldCheck } from "lucide-react";
import { StudentData } from "@/lib/types";
import { KtmCard } from "@/components/features/mahasiswa/KtmCard";
import Image from "next/image";

import { usePdfPrint } from "@/hooks/use-pdf-print";

interface KtmClientProps {
  student: StudentData | null;
}

export default function KtmClient({ student }: KtmClientProps) {
  const ktmRef = useRef<HTMLDivElement>(null);
  const { isPrinting, printPdf } = usePdfPrint();

  const handleDownloadPDF = async () => {
    if (!student) return;

    await printPdf({
      elementRef: ktmRef,
      fileName: `KTM_${student.profile.nama.replace(/\s+/g, "_")}_${student.profile.nim}.pdf`,
      pdfFormat: [85.6, 53.98], // ID-1 Card Size
      pdfOrientation: "landscape",
      pixelRatio: 8, // 8x Res gives extreme sharpness
      imageType: "image/jpeg", // JPEG compresses better than PNG for photos
      imageQuality: 1.0 // Lossless JPEG
    });
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <p>Data mahasiswa tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hidden Print Area for KTM Capture - Force Sharp Corners */}
      <div className="absolute top-0 left-[-9999px] w-[85.6mm] h-[53.98mm]">
          <div ref={ktmRef} className="block w-[85.6mm] h-[53.98mm]">
             <KtmCard student={student} className="rounded-none shadow-none border-none" />
          </div>
      </div>
      
      {/* SCREEN CONTENT */}
      <div className="screen-content flex flex-col gap-6 pb-10 animate-in fade-in duration-500">
        <PageHeader 
          title="Kartu Tanda Mahasiswa" 
          breadcrumb={["Beranda", "KTM"]} 
        />

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
             
             {/* SIDEBAR - Profil Ringkas */}
             <Card className="border-slate-200 shadow-sm overflow-hidden min-h-[500px] md:sticky md:top-4">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-32 h-40 bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden shadow-inner">
                        {student.profile.avatar_url ? (
                            <Image
                                src={student.profile.avatar_url}
                                alt={student.profile.nama}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <User className="h-16 w-16 mb-2" />
                                <span className="text-xs">Foto Tidak Tersedia</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 w-full border-b border-slate-100 pb-4">
                        <h3 className="font-semibold text-slate-900 leading-tight">{student.profile.nama}</h3>
                        <p className="text-sm text-slate-500 font-mono">{student.profile.nim}</p>
                    </div>

                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs">
                             <span className="text-slate-500">Status</span>
                             <span className="font-medium text-emerald-600 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Aktif
                             </span>
                        </div>
                        <div className="flex justify-between text-xs">
                             <span className="text-slate-500">Prodi</span>
                             <span className="font-medium text-slate-700 truncate max-w-[160px]" title={`${student.profile.study_program?.nama || "-"}${student.profile.study_program?.jenjang ? ` (${student.profile.study_program.jenjang})` : ""}`}>
                                {student.profile.study_program?.nama || "-"}
                                {student.profile.study_program?.jenjang && ` (${student.profile.study_program.jenjang})`}
                             </span>
                        </div>
                        <div className="flex justify-between text-xs">
                             <span className="text-slate-500">Angkatan</span>
                             <span className="font-medium text-slate-700">
                                {student.profile.angkatan || "-"}
                             </span>
                        </div>
                        <div className="flex justify-between text-xs">
                             <span className="text-slate-500">Semester</span>
                             <span className="font-medium text-slate-700">
                                {student.profile.semester || "-"}
                             </span>
                        </div>
                    </div>

                    <Button 
                        onClick={handleDownloadPDF} 
                        className="w-full mt-2" 
                        disabled={isPrinting}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {isPrinting ? "Memproses..." : "Cetak KTM"}
                    </Button>
                </CardContent>
             </Card>

             {/* MAIN CONTENT - Card Preview */}
             <Card className="border-slate-200 shadow-sm min-h-[500px] flex flex-col overflow-hidden">
                <CardContent className="flex-1 p-0 flex flex-col bg-slate-50/50">
                    
                    {/* Header Section */}
                    <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center">
                        <div>
                             <h2 className="text-lg font-semibold text-slate-900">Preview KTM Digital</h2>
                             <p className="text-sm text-slate-500">Tampilan kartu identitas mahasiswa.</p>
                        </div>
                        {/* Download Prompt (Visual only) */}
                        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <Eye className="w-3 h-3" />
                            Mode Pratinjau
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 opacity-100 overflow-hidden">
                         {/* Card Container - Screen Only */}
                         <div className="relative shadow-md rounded-xl overflow-hidden bg-white mobile-card-wrapper transform scale-105 md:scale-125 origin-center">
                             <KtmCard student={student} />
                         </div>
                    </div>

                    {/* Footer Info */}
                    <div className="px-8 py-4 bg-white border-t border-slate-200 text-center md:text-left md:flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 max-w-lg">
                            Dokumen ini adalah identitas resmi yang diterbitkan oleh STMIK IKMI Cirebon. 
                            Segala bentuk penyalahgunaan kartu ini dapat dikenakan sanksi akademik.
                        </p>
                    </div>

                </CardContent>
             </Card>

        </div>
      </div>
    </>
  );
}
