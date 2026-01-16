import React, { useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import StudentInfo from "@/components/features/document/StudentInfo";
import DocumentFooter from "@/components/features/document/DocumentFooter";
import GradeTable from "@/components/features/transkrip/GradeTable";
import { Official, StudentData, TranscriptItem } from "@/lib/types";

interface PrintableTranskripProps {
  loading: boolean;
  currentStudent: StudentData | null;
  transcriptData: TranscriptItem[];
  ipk: string;
  totalSKS: number;
  totalNM: number;
  signatureType: "basah" | "digital" | "none";
  signatureBase64: string | null;
  official: Official | null;
  isCollapsed: boolean;
  setTotalPages?: (pages: number) => void;
}

export default function PrintableTranskrip({
  loading,
  currentStudent,
  transcriptData,
  ipk,
  totalSKS,
  totalNM,
  signatureType,
  signatureBase64,
  official,
  isCollapsed,
  setTotalPages,
}: PrintableTranskripProps) {
  const paperRef = useRef<HTMLDivElement>(null);

  // Observer Halaman Kertas
  useEffect(() => {
    if (!paperRef.current || !setTotalPages) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const pages = Math.ceil((entry.target.scrollHeight - 1) / 1122.5);
        setTotalPages(pages < 1 ? 1 : pages);
      }
    });
    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [currentStudent, transcriptData, setTotalPages]);

  return (
    <div
      className={`
        hidden xl:flex print:flex print:w-full print:justify-center
        shrink-0 justify-start w-full transition-all duration-300
        ${isCollapsed ? "xl:w-[210mm]" : "xl:w-[189mm]"}
        overflow-visible mb-0 
    `}
    >
      <div
        ref={paperRef}
        className={`
          bg-white p-8 shadow-2xl border border-gray-300 
          print:shadow-none print:border-none print:m-0 
          w-[210mm] min-h-[297mm] origin-top-left transform transition-transform duration-300
          ${isCollapsed ? "xl:scale-100" : "xl:scale-[0.9]"}
          print:scale-100
        `}
      >
        {loading ? (
          <div className="animate-pulse flex flex-col h-full space-y-4">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-96" />
          </div>
        ) : !currentStudent ? (
          <div className="flex flex-col h-full items-center justify-center text-slate-400">
            <p>Data Transkrip Kosong</p>
          </div>
        ) : (
          <>
            <DocumentHeader title="TRANSKRIP NILAI" />
            <StudentInfo profile={currentStudent.profile} />

            {/* [UPDATE] Pass calculated Summary */}
            <GradeTable
              data={transcriptData}
              mode="transkrip"
              ipk={ipk}
              totalSKS={totalSKS}
              totalNM={totalNM}
            />

            <DocumentFooter
              signatureType={signatureType}
              signatureBase64={signatureBase64}
              mode="transkrip"
              official={official}
            />
          </>
        )}
      </div>
    </div>
  );
}
