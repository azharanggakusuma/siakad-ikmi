"use client";
import React from "react";
import PageHeader from "@/components/layout/PageHeader";

export default function PengaturanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Pengaturan" 
        breadcrumb={["SIAKAD", "Pengaturan"]} 
      />
      {/* Content for Pengaturan Page goes here */}
    </div>
  );
}