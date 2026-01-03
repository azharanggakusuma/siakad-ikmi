"use client";

import React from "react";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import StudentKRSView from "@/components/features/krs/StudentKRSView";
import AdminKRSValidationView from "@/components/features/krs/AdminKRSValidationView";

export default function KRSPage() {
  const { user } = useLayout();

  // Loading State
  if (!user) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
        <PageHeader title="Kartu Rencana Studi" breadcrumb={["Akademik", "KRS"]} />
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <PageHeader title="Kartu Rencana Studi" breadcrumb={["Beranda", "KRS"]} />
      
      {user.role === "mahasiswa" ? (
        <StudentKRSView user={user} />
      ) : (
        <AdminKRSValidationView />
      )}
    </div>
  );
}