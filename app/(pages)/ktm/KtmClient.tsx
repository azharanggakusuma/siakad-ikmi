"use client";

import React, { useRef, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, User } from "lucide-react";
import { StudentData } from "@/lib/types";
import { KtmCard } from "@/components/features/mahasiswa/KtmCard";
import Image from "next/image";

interface KtmClientProps {
  student: StudentData | null;
}

export default function KtmClient({ student }: KtmClientProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
        window.print();
        setIsPrinting(false);
    }, 500);
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
      <style jsx global>{`
        @media print {
          @page {
            size: 85.6mm 53.98mm;
            margin: 0;
          }
          body * { visibility: hidden; }
          #ktm-print-wrapper, #ktm-print-wrapper * { visibility: visible; }
          
          #ktm-print-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 85.6mm;
            height: 53.98mm;
            overflow: hidden;
            z-index: 9999;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-500 print:hidden">
        <PageHeader 
          title="Kartu Tanda Mahasiswa" 
          breadcrumb={["Beranda", "KTM"]} 
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
                      <span className="text-sm">Tidak ada foto</span>
                    </div>
                  )}
                </div>
                <Button 
                   onClick={handlePrint} 
                   className="w-full" 
                   variant="default"
                   disabled={isPrinting}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak KTM
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
                        <span className="text-[10px]">No Photo</span>
                        </div>
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800 leading-tight mb-1">{student.profile.nama}</h2>
                    <p className="text-gray-500 font-mono text-sm">{student.profile.nim}</p>
                 </div>
              </div>

              {/* MAIN CONTENT SECTION */}
              <div className="flex-1 w-full flex flex-col items-center md:items-start">
                
                {/* Desktop Name Header */}
                <div className="hidden md:block mb-6 w-full border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">{student.profile.nama}</h2>
                    <p className="text-gray-500 font-mono text-base">{student.profile.nim} - {student.profile.study_program?.nama}</p>
                </div>

                <div className="w-full flex flex-col items-center md:items-start gap-4">
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-full flex justify-center">
                      <div id="ktm-print-wrapper" className="shadow-lg">
                        <KtmCard student={student} />
                      </div>
                   </div>
                   
                   <div className="w-full text-left space-y-2 max-w-2xl">
                      <p className="text-sm text-slate-500">
                         * Gunakan tombol "Cetak KTM" di sebelah kiri (desktop) atau bawah (mobile) untuk mencetak.
                      </p>
                      <p className="text-sm text-slate-500">
                         * Kartu ini sah digunakan selama status mahasiswa aktif.
                      </p>
                   </div>
                </div>

                {/* MOBILE BUTTON (Bottom) */}
                <div className="mt-6 md:hidden w-full">
                    <Button 
                    onClick={handlePrint} 
                    className="w-full" 
                    variant="default"
                    disabled={isPrinting}
                    >
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak KTM
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
