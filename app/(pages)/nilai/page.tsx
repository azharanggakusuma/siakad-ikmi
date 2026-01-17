"use client";

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useLayout } from "@/app/context/LayoutContext"; 
import { Skeleton } from "@/components/ui/skeleton";

// Imports Views
import AdminNilaiView from "@/components/features/nilai/AdminNilaiView";
import StudentGradeView from "@/components/features/nilai/StudentGradeView";

export default function NilaiPage() {
  const { user } = useLayout(); 

  // 1. Loading State (Menunggu User Session)
  if (!user) {
     return (
        <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
          <PageHeader title="Nilai Mahasiswa" breadcrumb={["Beranda", "Nilai"]} />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
     );
  }

  // 2. Render View Based on Role
  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Nilai Mahasiswa" breadcrumb={["Beranda", "Nilai"]} />

      {user.role === 'mahasiswa' ? (
         <StudentGradeView user={user} />
      ) : (
         <AdminNilaiView />
      )}
    </div>
  );
}