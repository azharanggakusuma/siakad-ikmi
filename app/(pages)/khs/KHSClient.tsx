'use client';

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import StudentKHSView from "@/components/features/khs/StudentKHSView";
import AdminKHSView from "@/components/features/khs/AdminKHSView";

interface KHSClientProps {
  user: any;
  studentData: any;
  official: any;
  allStudents: any[];
  studyPrograms: any[];
}

export default function KHSClient({
  user,
  studentData,
  official,
  allStudents,
  studyPrograms,
}: KHSClientProps) {

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["Beranda", "KHS"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentKHSView 
            initialStudentData={studentData}
            initialOfficial={official}
        />
      ) : (
        <AdminKHSView 
            initialStudents={allStudents}
            initialStudyPrograms={studyPrograms}
        />
      )}
    </div>
  );
}
