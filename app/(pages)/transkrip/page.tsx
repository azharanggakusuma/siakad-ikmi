"use client";

import React from "react";
import { useLayout } from "@/app/context/LayoutContext";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import AdminTranskripView from "@/components/features/transkrip/AdminTranskripView";
import StudentTranskripView from "@/components/features/transkrip/StudentTranskripView";

export default function TranskripPage() {
  const { user } = useLayout();

  if (!user) {
    return (
      <div className="flex flex-col gap-6 w-full p-8">
        <PageHeader title="Transkrip Nilai" breadcrumb={["Beranda", "Transkrip"]} />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Transkrip Nilai" breadcrumb={["Beranda", "Transkrip"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentTranskripView />
      ) : (
        <AdminTranskripView />
      )}
    </div>
  );
}