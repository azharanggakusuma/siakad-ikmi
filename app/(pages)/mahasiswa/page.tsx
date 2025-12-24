"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";

export default function MahasiswaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Data Mahasiswa" 
        breadcrumb={["SIAKAD", "Mahasiswa"]} 
      />
      {/* Content for Mahasiswa Page goes here */}
    </div>
  );
}