"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { StudentData } from "@/lib/types";
import QRCode from "react-qr-code";
import DocumentHeader from "@/components/features/document/DocumentHeader";

import { cn } from "@/lib/utils";

interface KtmCardProps {
  student: StudentData;
  className?: string;
}

export function KtmCard({ student, className }: KtmCardProps) {
  const { profile } = student;
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  
  // Hitung tahun berlaku (Angkatan + 4 tahun)
  const validUntilYear = (profile.angkatan || new Date().getFullYear()) + 4;
  const validUntil = `September ${validUntilYear}`;



  return (
    <div className={cn("w-[85.6mm] h-[53.98mm] relative overflow-hidden bg-white shadow-xl rounded-xl border border-slate-200 print:shadow-none print:border-0 print:rounded-none select-none font-sans", className)}>
      
      {/* --- TOP SECTION (WHITE) --- */}
      <div className="absolute top-0 left-0 right-0 h-[62%] bg-white px-5 pt-4">
        {/* Header - Recreating DocumentHeader Look */}
        <div className="mb-[-50px] relative z-10 pl-1 origin-top-left" style={{ transform: "scale(0.42)", width: "240%" }}>
           <DocumentHeader variant="simple" title="" />
        </div>

        {/* Middle Content: QR & Title */}
        <div className="flex items-center gap-3 relative z-10 mt-3 pl-1">
            {/* QR Code */}
            <div className="relative w-[42px] h-[42px] bg-white">
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={`${origin}/verify/${student.id}`}
                  viewBox={`0 0 256 256`}
                />
            </div>
            
            {/* Title */}
            <h2 className="text-[11px] font-bold text-slate-900 uppercase leading-3 w-32 tracking-tight">
              KARTU IDENTITAS<br/>MAHASISWA
            </h2>
        </div>
      </div>

      {/* --- PHOTO (Overlapping Top and Bottom) --- */}
      {/* Photo size reduced as requested */}
      <div className="absolute right-[19px] top-[44px] w-[14mm] h-[18mm] z-30 bg-slate-200 shadow-sm overflow-hidden pointer-events-none">
         {profile.avatar_url ? (
           <Image 
             src={profile.avatar_url} 
             alt={profile.nama} 
             fill 
             className="object-cover"
           />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-[7px] text-center p-1">
             Foto Tidak Tersedia
           </div>
         )}
      </div>

      {/* --- BOTTOM SECTION (BLUE) --- */}
      <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-[#1a2d52] text-white px-5 py-2 overflow-hidden">
         {/* Mega Mendung Batik Pattern Overlay - From SVG */}
         <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-30"
            style={{
               backgroundImage: "url('/img/mega_mendung.svg')",
               backgroundSize: "105%",
               backgroundPosition: "center",
               backgroundRepeat: "no-repeat",
            }}
         />

         {/* Info Content */}
         <div className="relative z-10 flex justify-between items-center h-full w-full">
            <div className="flex flex-col gap-[2px] max-w-[65%] leading-tight text-left justify-center">
              <h1 className="text-[11px] font-bold uppercase truncate tracking-wide text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {profile.nama}
              </h1>
              <p className="text-[10px] font-bold tracking-wider opacity-100 text-slate-100" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {profile.nim}
              </p>
              <p className="text-[9px] font-bold opacity-100 text-slate-100" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {profile.study_program?.nama || "Mahasiswa"}
                {profile.study_program?.jenjang ? ` (${profile.study_program.jenjang})` : ""}
              </p>
            </div>
            
            <div className="flex flex-col items-end text-[6px] text-right opacity-100 leading-tight text-white" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
               <span>Berlaku sampai dengan :</span>
               <span className="text-[7px] mt-[1px]">{validUntil}</span>
            </div>
         </div>
      </div>
      
      {/* Separator Line */}
      {/* Removed/Hidden in new design reference, just a clean cut or dark block. 
          The reference shows no separator line, the blue block starts directly. */}
    </div>
  );
}
