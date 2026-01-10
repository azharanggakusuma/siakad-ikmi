import React from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import { Separator } from "@/components/ui/separator";

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Pengaturan Akun" breadcrumb={["Beranda", "Pengaturan"]} />

      {/* Grid disesuaikan dengan PengaturanPage: 12 kolom */}
      <div className="grid gap-8 lg:grid-cols-12 items-stretch">
        
        {/* --- SKELETON 1: PROFILE FORM (Kiri: 7/12 atau 8/12) --- */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <Card className="h-full border-none shadow-xl bg-white rounded-xl ring-1 ring-slate-100 flex flex-col overflow-hidden">
            
            {/* 1. Fake Banner Area (Sesuai tinggi asli: h-32 sm:h-40) */}
            <div className="h-32 sm:h-40 bg-slate-100 relative shrink-0">
               <Skeleton className="w-full h-full bg-slate-200/50" />
            </div>

            <CardContent className="px-6 pb-8 flex-1">
              {/* 2. Avatar & Header Info */}
              <div className="relative mb-6">
                  <div className="flex justify-between items-start">
                      {/* Avatar Circle (Margin negatif sesuai asli: -mt-20 sm:-mt-24) */}
                      <div className="-mt-20 sm:-mt-24 relative z-10">
                          <div className="rounded-full border-[5px] border-white bg-white shadow-md">
                              <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 rounded-full" />
                          </div>
                      </div>
                      
                      {/* Tombol Simpan Placeholder (Desktop) */}
                      <div className="mt-4 hidden sm:block">
                          <Skeleton className="h-10 w-48 rounded-full" />
                      </div>
                  </div>

                  {/* Nama & Username */}
                  <div className="mt-4 space-y-2">
                      <Skeleton className="h-8 w-48 bg-slate-200" /> {/* Nama */}
                      <Skeleton className="h-5 w-32" /> {/* Username */}
                  </div>
              </div>

              <Separator className="mb-8 opacity-60" />

              {/* 3. Form Inputs Grid */}
              <div className="space-y-6 max-w-3xl">
                  <div className="grid md:grid-cols-2 gap-6">
                      {/* Input 1: Username */}
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-20" /> 
                          <Skeleton className="h-11 w-full rounded-md" /> 
                      </div>
                      {/* Input 2: Nama Lengkap */}
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-24" /> 
                          <Skeleton className="h-11 w-full rounded-md" /> 
                      </div>
                  </div>

                  {/* Input 3: Alamat (Full Width Textarea) */}
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-28" /> 
                      <Skeleton className="h-24 w-full rounded-md" /> 
                  </div>
              </div>

              {/* Tombol Simpan Mobile Placeholder (Icon only) */}
               <div className="mt-6 sm:hidden">
                    <Skeleton className="h-10 w-10 rounded-full" />
               </div>

            </CardContent>
          </Card>
        </div>


        {/* --- SKELETON 2: PASSWORD FORM (Kanan: 5/12 atau 4/12) --- */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <Card className="h-full flex flex-col overflow-hidden border-none shadow-xl bg-white rounded-xl ring-1 ring-slate-100">
            <CardHeader className="space-y-1 mt-2">
               {/* Title & Desc */}
               <Skeleton className="h-6 w-32 mb-2" />
               <Skeleton className="h-4 w-full max-w-[250px]" />
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col">
              {/* Alert Box Placeholder (Penting) */}
              <Skeleton className="h-20 w-full rounded-lg bg-slate-50" />

              <div className="space-y-5">
                 {/* Input 1: Password Lama */}
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                 </div>
                 
                 {/* Input 2: Password Baru */}
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                 </div>

                 {/* Input 3: Konfirmasi Password */}
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                 </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 mt-auto">
              {/* Tombol Update Password */}
              <Skeleton className="h-11 w-full rounded-lg" />
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}