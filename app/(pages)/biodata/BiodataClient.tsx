"use client";

import React, { useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, User, CheckCircle2, XCircle, Loader2 } from "lucide-react"; 
import PrintableBiodata from "@/components/features/mahasiswa/PrintableBiodata";
import { StudentData } from "@/lib/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { usePdfPrint } from "@/hooks/use-pdf-print";

interface BiodataClientProps {
  student: StudentData;
}

export default function BiodataClient({ student }: BiodataClientProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { isPrinting, printPdf } = usePdfPrint();

  const handleDownloadPDF = async () => {
    await printPdf({
      elementRef: printRef,
      fileName: `Biodata_${student.profile.nama.replace(/\s+/g, "_")}_${student.profile.nim}.pdf`,
      pdfFormat: "a4",
      pdfOrientation: "portrait",
    });
  };

  return (
    <>
      {/* Hidden Print Area but Rendered for Capture */}
      <div className="absolute top-0 left-[-9999px] w-[210mm]">
        <PrintableBiodata 
            ref={printRef} 
            student={student} 
            className="block" // Force display:block to override hidden, but position is off-screen
        />
      </div>

      <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-500">
        <PageHeader 
          title="Biodata Mahasiswa" 
          breadcrumb={["Beranda", "Biodata"]} 
        />

        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-5 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* DESKTOP SIDEBAR (Avatar + Button) - Hidden on Mobile */}
              <div className="hidden md:flex w-[170px] flex-col items-center gap-4 shrink-0">
                <div className="w-[150px] h-[200px] bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden shadow-sm">
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
                <Button 
                   onClick={handleDownloadPDF} 
                   className="w-full" 
                   variant="default"
                   disabled={isPrinting}
                >
                  {isPrinting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="mr-2 h-4 w-4" />
                  )}
                  {isPrinting ? "Memproses..." : "Cetak PDF"}
                </Button>
              </div>

              {/* MOBILE HEADER (Avatar + Name) - Hidden on Desktop */}
              <div className="flex md:hidden w-full items-center gap-4 border-b border-gray-100 pb-4 mb-2">
                 <div className="w-24 h-32 bg-slate-100 rounded-md border border-slate-200 relative overflow-hidden shrink-0">
                    {student.profile.avatar_url ? (
                        <Image
                        src={student.profile.avatar_url}
                        alt={student.profile.nama}
                        fill
                        className="object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <User className="h-8 w-8 mb-1" />
                        <span className="text-[10px]">Foto Tidak Tersedia</span>
                        </div>
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800 leading-tight mb-1">{student.profile.nama}</h2>
                    <p className="text-gray-500 font-mono text-sm">{student.profile.nim}</p>
                 </div>
              </div>

              {/* DATA SECTION */}
              <div className="flex-1 w-full">
                {/* Desktop Name Header */}
                <div className="hidden md:block mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{student.profile.nama}</h2>
                    <p className="text-gray-500 font-mono text-base">{student.profile.nim}</p>
                </div>

                <div className="flex flex-col text-sm md:text-sm">
                   {/* DATA AKADEMIK */}
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Program Studi</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.study_program?.nama || "-"}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Jenjang</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.study_program?.jenjang || "-"}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Angkatan</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.angkatan}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Semester</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.semester}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Status Akademik</span>
                        <span>
                          <Badge 
                            variant={student.profile.is_active ? "default" : "destructive"} 
                            className={`font-normal ${student.profile.is_active ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {student.profile.is_active ? (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {student.profile.is_active ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </span>
                   </div>

                   {/* DATA PRIBADI */}
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">NIK</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.nik || "-"}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Tempat, Tgl Lahir</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.tempat_lahir ? `${student.profile.tempat_lahir}, ` : ""}{formatDate(student.profile.tanggal_lahir)}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Jenis Kelamin</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.jenis_kelamin || "-"}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Agama</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.agama || "-"}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Status Perkawinan</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.status || "-"}
                        </span>
                   </div>

                   {/* DATA KONTAK */}
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">No Telepon</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.no_hp || "-"}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-gray-100 py-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Email</span>
                        <span className="text-gray-800 font-medium">
                            {student.profile.email || "-"}
                        </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-start pt-3 gap-1 sm:gap-4">
                        <span className="text-gray-500 font-medium w-[140px] shrink-0">Alamat</span>
                        <span className="text-gray-800 leading-relaxed">
                            {student.profile.alamat || "-"}
                        </span>
                   </div>
                </div>

                {/* MOBILE BUTTON (Bottom) */}
                <div className="mt-6 md:hidden">
                    <Button 
                    onClick={handleDownloadPDF} 
                    className="w-full" 
                    variant="default"
                    disabled={isPrinting}
                    >
                    {isPrinting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Printer className="mr-2 h-4 w-4" />
                    )}
                    {isPrinting ? "Memproses..." : "Cetak PDF"}
                    </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
