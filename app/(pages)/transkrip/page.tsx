"use client";

import React, { useState } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import GradeTable from "@/components/GradeTable";
import Footer from "@/components/Footer";
import ControlPanel from "@/components/ControlPanel";
import { useSignature } from "@/hooks/useSignature";
import PageHeader from "@/components/PageHeader";
import { useLayout } from "@/app/context/LayoutContext";
import PreviewModal from "@/components/PreviewModal"; 

export default function TranskripPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); 
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();
  
  const currentStudent = students[selectedIndex];

  const handlePrint = () => {
    window.print();
  };

  const renderPaperContent = () => (
    <>
      <Header title="TRANSKRIP NILAI" />
      <StudentInfo profile={currentStudent.profile} />
      <GradeTable data={currentStudent.transcript} mode="transkrip" />
      <Footer signatureType={signatureType} signatureBase64={secureImage} mode="transkrip" />
    </>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader 
          title="Transkrip Nilai" 
          breadcrumb={["SIAKAD", "Transkrip"]} 
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
          />
        </div>
      </div>

      {/* --- MODAL PREVIEW --- */}
      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Preview Transkrip">
         <div className="bg-white p-6 sm:p-10 w-[210mm] min-h-[297mm] scale-[0.5] sm:scale-[0.6] origin-top">
            {renderPaperContent()}
         </div>
      </PreviewModal>

    </div>
  );
}