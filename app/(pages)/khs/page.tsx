"use client";

import React, { useState, useEffect, useMemo } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import Footer from "@/components/Footer";
import ControlPanel from "@/components/ControlPanel";
import GradeTable from "@/components/GradeTable"; 
import { useSignature } from "@/hooks/useSignature";
import PageHeader from "@/components/PageHeader";
import { useLayout } from "@/app/context/LayoutContext";
import PreviewModal from "@/components/PreviewModal"; 

export default function KhsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); 
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();

  const currentStudent = students[selectedIndex];

  const availableSemesters = useMemo(() => {
    const smts = currentStudent.transcript.map((t) => t.smt);
    return [...new Set(smts)].sort((a, b) => a - b);
  }, [currentStudent]);

  useEffect(() => {
    if (availableSemesters.length > 0) {
      setSelectedSemester(availableSemesters[0]);
    }
  }, [selectedIndex, availableSemesters]);

  const semesterData = useMemo(() => {
    return currentStudent.transcript.filter((t) => t.smt === selectedSemester);
  }, [currentStudent, selectedSemester]);

  const cumulativeData = useMemo(() => {
    return currentStudent.transcript.filter((t) => t.smt <= selectedSemester);
  }, [currentStudent, selectedSemester]);

  const ips = useMemo(() => {
    const totalSKS = semesterData.reduce((acc, row) => acc + row.sks, 0);
    const totalNM = semesterData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace('.', ',') : "0,00";
  }, [semesterData]);

  const ipk = useMemo(() => {
    const totalSKS = cumulativeData.reduce((acc, row) => acc + row.sks, 0);
    const totalNM = cumulativeData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace('.', ',') : "0,00";
  }, [cumulativeData]);

  const handlePrint = () => {
    window.print();
  };

  const renderPaperContent = () => (
    <>
      <Header title={`KARTU HASIL STUDI`} />
      <StudentInfo profile={currentStudent.profile} displaySemester={selectedSemester} />
      <GradeTable mode="khs" data={semesterData} ips={ips} ipk={ipk} />
      <Footer signatureType={signatureType} signatureBase64={secureImage} mode="khs" />
    </>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader 
          title="Kartu Hasil Studi" 
          breadcrumb={["SIAKAD", "KHS"]} 
        />
      </div>

      <div className="flex flex-col xl:flex-row items-start justify-start gap-6 min-h-screen">
        
        {/* --- AREA KERTAS --- */}
        <div className={`
            hidden xl:flex print:flex print:w-full print:justify-center
            shrink-0 justify-start w-full 
            transition-all duration-300
            
            ${isCollapsed 
               ? "xl:w-[210mm]" 
               : "xl:w-[189mm]" 
            }

            overflow-visible mb-0 
        `}>
          
          <div 
             className={`
              bg-white p-12 shadow-2xl border border-gray-300 
              
              /* PERBAIKAN: Hapus 'print:p-0' agar margin kertas tetap ada */
              print:shadow-none print:border-none print:m-0 
              
              w-[210mm] min-h-[297mm] 
              
              origin-top-left 
              transform transition-transform duration-300

              ${isCollapsed ? "xl:scale-100" : "xl:scale-[0.9]"}
              print:scale-100
            `}
          >
            {renderPaperContent()}
          </div>
        </div>

        {/* --- CONTROL PANEL --- */}
        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          <ControlPanel
            students={students}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            signatureType={signatureType}
            onSignatureChange={setSignatureType}
            onPrint={handlePrint}
            onPreview={() => setIsPreviewOpen(true)}
            
            showSemesterSelect={true}
            availableSemesters={availableSemesters}
            selectedSemester={selectedSemester}
            onSelectSemester={setSelectedSemester}
          />
        </div>
      </div>

       {/* --- MODAL PREVIEW --- */}
       <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Preview KHS">
         <div className="bg-white p-6 sm:p-10 w-[210mm] min-h-[297mm] scale-[0.5] sm:scale-[0.6] origin-top">
            {renderPaperContent()}
         </div>
      </PreviewModal>
    </div>
  );
}