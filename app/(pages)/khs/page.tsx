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

export default function KhsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
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

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="print:hidden">
        <PageHeader 
          title="Kartu Hasil Studi" 
          breadcrumb={["SIAKAD", "KHS"]} 
        />
      </div>

      <div className="flex flex-col xl:flex-row items-start justify-start gap-6 min-h-screen">
        
        {/* WRAPPER KERTAS */}
        <div className={`
            shrink-0 flex justify-start w-full 
            transition-all duration-300

            ${isCollapsed 
               ? "lg:w-[179mm] xl:w-[210mm]" 
               : "lg:w-[147mm] xl:w-[189mm]" 
            }

            overflow-x-hidden xl:overflow-visible 
            mb-[-600px] sm:mb-[-400px] md:mb-[-250px] lg:mb-[-100px] xl:mb-0 
        `}>
          
          <div 
             className={`
              bg-white p-8 sm:p-12 shadow-2xl border border-gray-300 
              print:shadow-none print:border-none print:p-0 print:m-0 
              w-[210mm] min-h-[297mm] 
              origin-top-left transform 
              transition-transform duration-300

              scale-[0.4] 
              sm:scale-[0.6] 
              md:scale-[0.75] 

              ${isCollapsed ? "lg:scale-[0.85] xl:scale-100" : "lg:scale-[0.7] xl:scale-[0.9]"}
            `}
          >
            <Header title={`KARTU HASIL STUDI`} />
            <StudentInfo profile={currentStudent.profile} displaySemester={selectedSemester} />
            <GradeTable mode="khs" data={semesterData} ips={ips} ipk={ipk} />
            <Footer signatureType={signatureType} signatureBase64={secureImage} mode="khs" />
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-full flex-1 print:hidden xl:h-[calc(100vh-6rem)] xl:sticky xl:top-24 z-10 pb-10 xl:pb-0">
          <ControlPanel
            students={students}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            signatureType={signatureType}
            onSignatureChange={setSignatureType}
            onPrint={handlePrint}
            showSemesterSelect={true}
            availableSemesters={availableSemesters}
            selectedSemester={selectedSemester}
            onSelectSemester={setSelectedSemester}
          />
        </div>
      </div>
    </div>
  );
}