"use client";

import React from "react";
import PageHeader from "@/components/layout/PageHeader";

export default function KrsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Halaman */}
      <PageHeader title="Kartu Rencana Studi" breadcrumb={["SIAKAD", "KRS"]} />

      {/* Konten Halaman Kosong */}
      <div className="w-full bg-white p-8 rounded-xl border border-slate-200 shadow-sm min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-400 font-medium">Halaman Kartu Rencana Studi</p>
      </div>
    </div>
  );
}