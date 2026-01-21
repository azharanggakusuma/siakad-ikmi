"use client";

import React, { useRef, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, User, CheckCircle2, XCircle } from "lucide-react";
import PrintableBiodata from "@/components/features/mahasiswa/PrintableBiodata";
import { StudentData } from "@/lib/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface BiodataClientProps {
  student: StudentData;
}

export default function BiodataClient({ student }: BiodataClientProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    // Give time for state update and DOM render
    setTimeout(() => {
        window.print();
        setIsPrinting(false);
    }, 500);
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background-color: white; z-index: 9999;
          }
        }
      `}</style>

      {/* PRINT COMPONENT */}
      <PrintableBiodata student={student} />

      <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-500 print:hidden">
        <PageHeader 
          title="Biodata Mahasiswa" 
          breadcrumb={["Beranda", "Biodata"]} 
        />

        <Card className="border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              {/* Profile Picture */}
              <div className="w-full md:w-auto flex flex-col items-center gap-4 shrink-0">
                <div className="w-[140px] h-[186px] md:w-[180px] md:h-[240px] bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden shadow-sm mx-auto">
                  {student.profile.avatar_url ? (
                    <Image
                      src={student.profile.avatar_url}
                      alt={student.profile.nama}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <User className="h-12 w-12 md:h-16 md:w-16 mb-2" />
                      <span className="text-xs md:text-sm">Tidak ada foto</span>
                    </div>
                  )}
                </div>
                
                <Button 
                   onClick={handlePrint} 
                   className="w-full md:w-[180px]" 
                   variant="default"
                   disabled={isPrinting}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Biodata
                </Button>
              </div>

              {/* Data Table */}
              <div className="flex-1 w-full">
                <div className="mb-6 text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{student.profile.nama}</h2>
                    <p className="text-gray-500 font-mono text-base md:text-lg">{student.profile.nim}</p>
                </div>

                <div className="grid grid-cols-1 gap-y-3 md:gap-y-4 text-sm">
                   <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2 md:pb-3 gap-1 md:gap-4">
                        <span className="text-gray-500 font-medium">Program Studi</span>
                        <span className="sm:col-span-2 text-gray-800">
                            {student.profile.study_program?.nama || "-"}
                        </span>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2 md:pb-3 gap-1 md:gap-4">
                        <span className="text-gray-500 font-medium">Jenjang</span>
                        <span className="sm:col-span-2 text-gray-800">
                            {student.profile.study_program?.jenjang || "-"}
                        </span>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2 md:pb-3 gap-1 md:gap-4">
                        <span className="text-gray-500 font-medium">Angkatan</span>
                        <span className="sm:col-span-2 text-gray-800">
                            {student.profile.angkatan}
                        </span>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2 md:pb-3 gap-1 md:gap-4">
                        <span className="text-gray-500 font-medium">Semester</span>
                        <span className="sm:col-span-2 text-gray-800">
                            {student.profile.semester}
                        </span>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2 md:pb-3 gap-1 md:gap-4">
                        <span className="text-gray-500 font-medium">Status</span>
                        <span className="sm:col-span-2">
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
                   <div className="grid grid-cols-1 sm:grid-cols-3 pt-1 gap-1 md:gap-4">
                        <span className="text-gray-500 font-medium">Alamat</span>
                        <span className="sm:col-span-2 text-gray-800 leading-relaxed">
                            {student.profile.alamat || "-"}
                        </span>
                   </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
