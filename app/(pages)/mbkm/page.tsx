"use client";

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";

import AdminMbkmView from "@/components/features/mbkm/AdminMbkmView";
import StudentMbkmView from "@/components/features/mbkm/StudentMbkmView";

export default function MbkmPage() {
  const { user } = useLayout();

  if (!user) {
    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
          <PageHeader title="Mahasiswa MBKM" breadcrumb={["Akademik", "MBKM"]} />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Mahasiswa MBKM" breadcrumb={["Akademik", "MBKM"]} />
      
      {user.role === 'mahasiswa' ? (
          <StudentMbkmView />
      ) : (
          <AdminMbkmView />
      )}
    </div>
  );
}