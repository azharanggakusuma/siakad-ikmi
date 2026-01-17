"use client";

import React from "react";
import { useLayout } from "@/app/context/LayoutContext";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

import AdminSuratView from "@/components/features/surat-keterangan/AdminSuratView";
import StudentSuratView from "@/components/features/surat-keterangan/StudentSuratView";

export default function SuratKeteranganPage() {
  const { user } = useLayout();

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
        <StudentSuratView />
      ) : (
        <AdminSuratView />
      )}
    </div>
  );
}