'use client';

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import StudentSuratView from "@/components/features/surat-keterangan/StudentSuratView";
import AdminSuratView from "@/components/features/surat-keterangan/AdminSuratView";

interface SuratKeteranganClientProps {
  user: any;
  studentData: any;
  official: any;
  allStudents: any[];
  academicYearName: string;
}

export default function SuratKeteranganClient({
  user,
  studentData,
  official,
  allStudents,
  academicYearName,
}: SuratKeteranganClientProps) {

  if (!user) {
    return (
       <div className="flex flex-col gap-6 w-full p-8">
         <PageHeader title="Surat Keterangan" breadcrumb={["Beranda", "Surat Keterangan"]} />
         <Skeleton className="h-[500px] w-full rounded-xl" />
       </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Surat Keterangan" breadcrumb={["Beranda", "Surat Keterangan"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentSuratView 
            initialStudentData={studentData}
            initialAcademicYear={academicYearName}
            initialOfficial={official}
        />
      ) : (
        <AdminSuratView 
            initialStudents={allStudents}
            initialAcademicYear={academicYearName}
        />
      )}
    </div>
  );
}
