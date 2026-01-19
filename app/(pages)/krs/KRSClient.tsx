'use client';

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import AdminKRSValidationView from "@/components/features/krs/AdminKRSValidationView";
import StudentKRSView from "@/components/features/krs/StudentKRSView";

interface KRSClientProps {
  user: any;
  academicYears: any[];
  selectedYearId: string;
  initialDataStudent: any;
  initialOfficial: any;
  initialStudentsAdmin: any[];
}

export default function KRSClient({
  user,
  academicYears,
  selectedYearId,
  initialDataStudent,
  initialOfficial,
  initialStudentsAdmin,
}: KRSClientProps) {

  if (!user) {
    return null;
  }

  return (
    <div className="pb-10">
      <PageHeader title="Kartu Rencana Studi" breadcrumb={["Beranda", "KRS"]} />
      
      {user.role === "mahasiswa" ? (
        <StudentKRSView 
            user={user} 
            initialAcademicYears={academicYears}
            initialOfficial={initialOfficial}
            initialSelectedYear={selectedYearId}
            initialData={initialDataStudent}
        />
      ) : (
        <AdminKRSValidationView 
            initialAcademicYears={academicYears}
            initialSelectedYear={selectedYearId}
            initialStudents={initialStudentsAdmin}
        />
      )}
    </div>
  );
}
