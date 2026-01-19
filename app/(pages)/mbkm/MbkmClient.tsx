'use client';

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import StudentMbkmView from "@/components/features/mbkm/StudentMbkmView";
import AdminMbkmView from "@/components/features/mbkm/AdminMbkmView";

interface MbkmClientProps {
  user: any;
  mbkmData: any[];
  students: any[];
  academicYears: any[];
}

export default function MbkmClient({
  user,
  mbkmData,
  students,
  academicYears,
}: MbkmClientProps) {

  if (!user) {
    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
          <PageHeader title="Data MBKM" breadcrumb={["Akademik", "MBKM"]} />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Data MBKM" breadcrumb={["Akademik", "MBKM"]} />
      
      {user.role === 'mahasiswa' ? (
          <StudentMbkmView initialData={mbkmData} />
      ) : (
          <AdminMbkmView 
             initialData={mbkmData}
             initialStudents={students}
             initialAcademicYears={academicYears}
          />
      )}
    </div>
  );
}
