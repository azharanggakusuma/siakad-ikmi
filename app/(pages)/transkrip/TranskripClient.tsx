'use client';

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import StudentTranskripView from "@/components/features/transkrip/StudentTranskripView";
import AdminTranskripView from "@/components/features/transkrip/AdminTranskripView";

interface TranskripClientProps {
  user: any;
  studentData: any;
  official: any;
  allStudents: any[];
  studyPrograms: any[];
}

export default function TranskripClient({
  user,
  studentData,
  official,
  allStudents,
  studyPrograms,
}: TranskripClientProps) {

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Transkrip Nilai" breadcrumb={["Beranda", "Transkrip"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentTranskripView 
            initialStudentData={studentData}
            initialOfficial={official}
        />
      ) : (
        <AdminTranskripView 
            initialStudents={allStudents}
            initialStudyPrograms={studyPrograms}
        />
      )}
    </div>
  );
}
