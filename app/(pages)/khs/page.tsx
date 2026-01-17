"use client";

import React from "react";
import { useLayout } from "@/app/context/LayoutContext";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import AdminKHSView from "@/components/features/khs/AdminKHSView";
import StudentKHSView from "@/components/features/khs/StudentKHSView";

export default function KhsPage() {
  const { user } = useLayout();

  if (!user) {
    return (
      <div className="flex flex-col gap-6 w-full p-8">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["Beranda", "KHS"]} />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["Beranda", "KHS"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentKHSView />
      ) : (
        <AdminKHSView />
      )}
    </div>
  );
}