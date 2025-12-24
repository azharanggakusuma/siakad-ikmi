"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";

export default function MataKuliahPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Mata Kuliah" 
        breadcrumb={["SIAKAD", "Mata Kuliah"]} 
      />
      {/* Content for Mata Kuliah Page goes here */}
    </div>
  );
}