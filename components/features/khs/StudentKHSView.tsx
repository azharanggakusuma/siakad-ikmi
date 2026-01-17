"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getStudents, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type TranscriptItem, type Official } from "@/lib/types";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";

import ControlPanel from "@/components/features/document/ControlPanel";
import PrintableKHS from "@/components/features/khs/PrintableKHS";
import { calculateIPS, calculateIPK } from "@/lib/grade-calculations";

export default function StudentKHSView() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [official, setOfficial] = useState<Official | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed, user } = useLayout();
  
  const [totalPages, setTotalPages] = useState(1);

  // === FETCH DATA ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, activeOfficial] = await Promise.all([
           getStudents(),
           getActiveOfficial()
        ]);
        setStudentsData(data);
        setOfficial(activeOfficial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-select mahasiswa login
  useEffect(() => {
    if (studentsData.length > 0 && user?.role === "mahasiswa" && user?.student_id) {
       const myIndex = studentsData.findIndex((s) => s.id === user.student_id);
       if (myIndex !== -1) setSelectedIndex(myIndex); 
    }
  }, [studentsData, user]);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);


  // === LOGIC SEMESTER ===
  const availableSemesters = useMemo<number[]>(() => {
    if (!currentStudent) return [];
    const currentSem = currentStudent.profile?.semester || 1;
    const transcriptSmts = currentStudent.transcript?.map((t: TranscriptItem) => Number(t.smt)) || [];
    const maxDataSem = Math.max(0, ...transcriptSmts);
    const limit = Math.max(currentSem, maxDataSem);
    return Array.from({ length: limit }, (_, i) => i + 1);
  }, [currentStudent]);

  useEffect(() => {
    if (availableSemesters.length > 0) {
        if (!availableSemesters.includes(selectedSemester)) {
            setSelectedSemester(availableSemesters[availableSemesters.length - 1]);
        }
    }
  }, [availableSemesters]);

  // Data Semester Ini
  const semesterData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) === selectedSemester);
  }, [currentStudent, selectedSemester]);

  // Data Kumulatif (Sampai Semester Ini)
  const cumulativeData = useMemo(() => {
    if (!currentStudent?.transcript) return [];
    return currentStudent.transcript.filter((t: TranscriptItem) => Number(t.smt) <= selectedSemester && t.hm !== '-');
  }, [currentStudent, selectedSemester]);

  const ips = useMemo(() => {
    return calculateIPS(currentStudent?.transcript || [], selectedSemester).replace('.', ',');
  }, [currentStudent, selectedSemester]);

  const ipk = useMemo(() => {
    return calculateIPK(cumulativeData).replace('.', ',');
  }, [cumulativeData]);

  return (
    <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
      <PrintableKHS 
        loading={loading}
        currentStudent={currentStudent}
        selectedSemester={selectedSemester}
        semesterData={semesterData}
        ips={ips}
        ipk={ipk}
        signatureType={signatureType}
        signatureBase64={secureImage}
        official={official}
        isCollapsed={isCollapsed}
        setTotalPages={setTotalPages}
      />

      <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
        {!loading && (
          <ControlPanel
              students={studentsData}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              signatureType={signatureType}
              onSignatureChange={setSignatureType}
              onPrint={() => window.print()}
              showSemesterSelect={true}
              availableSemesters={availableSemesters}
              selectedSemester={selectedSemester}
              onSelectSemester={setSelectedSemester}
              totalPages={totalPages}
              user={user} 
          />
        )}
      </div>
    </div>
  );
}
