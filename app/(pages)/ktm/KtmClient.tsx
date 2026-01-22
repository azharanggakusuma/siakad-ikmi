"use client";

import React, { useRef } from "react";
import { StudentData } from "@/lib/types";
import { KtmCard } from "@/components/features/mahasiswa/KtmCard";
import { Printer } from "lucide-react";

interface KtmClientProps {
  student: StudentData | null;
}

export default function KtmClient({ student }: KtmClientProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <p>Data mahasiswa tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Kartu Tanda Mahasiswa (KTM)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kartu identitas resmi mahasiswa aktif
          </p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
        >
          <Printer size={16} />
          Cetak KTM
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px] print:shadow-none print:border-0 print:p-0 print:min-h-0 print:block">
        {/* Wrapper for Print Content */}
        <div ref={componentRef} className="p-8 bg-white print:p-0 print:m-0" id="ktm-print-wrapper">
          <div className="print:hidden space-y-4 mb-4 text-center">
             <div className="inline-block p-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold uppercase tracking-wider mb-2">
                Preview Kartu Digital
             </div>
          </div>
          
          <div className="print:block print:w-full print:h-full">
            <KtmCard student={student} />
          </div>
          
          <div className="print:hidden mt-8 max-w-md mx-auto text-center space-y-2">
             <p className="text-xs text-slate-400">
               * Gunakan fitur cetak untuk mengunduh atau mencetak fisik kartu.
             </p>
             <p className="text-xs text-slate-400">
               * Kartu ini sah digunakan untuk kegiatan akademik selama status mahasiswa aktif.
             </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 85.6mm 53.98mm;
            margin: 0;
          }
          body {
            visibility: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Only show the print wrapper and its children */
          #ktm-print-wrapper, #ktm-print-wrapper * {
            visibility: visible;
          }
          
          #ktm-print-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 85.6mm;
            height: 53.98mm;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}
