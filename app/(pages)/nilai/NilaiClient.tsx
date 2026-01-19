'use client';

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import AdminNilaiView from "@/components/features/nilai/AdminNilaiView";
import StudentGradeView from "@/components/features/nilai/StudentGradeView";

interface NilaiClientProps {
  user: any;
  initialStudents: any[];
  initialPrograms: any[];
  initialGrades: any[];
  initialSummary: { totalSKS: number; totalNM: number; ipk: string };
}

export default function NilaiClient({
  user,
  initialStudents,
  initialPrograms,
  initialGrades,
  initialSummary,
}: NilaiClientProps) {

  if (!user) {
     return (
        <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
          <PageHeader title="Nilai Mahasiswa" breadcrumb={["Beranda", "Nilai"]} />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Nilai Mahasiswa" breadcrumb={["Beranda", "Nilai"]} />

      {user.role === 'mahasiswa' ? (
         <StudentGradeView user={user} initialGrades={initialGrades} initialSummary={initialSummary} />
      ) : (
         <AdminNilaiView initialStudents={initialStudents} initialPrograms={initialPrograms} />
      )}
    </div>
  );
}
