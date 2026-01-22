"use client";

import React from "react";
import Image from "next/image";
import { StudentData } from "@/lib/types";
import QRCode from "react-qr-code";

interface KtmCardProps {
  student: StudentData;
}

export function KtmCard({ student }: KtmCardProps) {
  const { profile } = student;
  
  // Hitung tahun berlaku (Angkatan + 4 tahun)
  const validUntilYear = (profile.angkatan || new Date().getFullYear()) + 4;
  const validUntil = `September ${validUntilYear}`;

  // Styles from DocumentHeader
  const embossedTextStyle = {
    fontFamily: "Arial Black, Arial, sans-serif",
    textShadow:
      "-0.5px -0.5px 0.5px rgba(255,255,255,0.9), 0.5px 0.5px 0.5px rgba(0,0,0,0.4), 1px 1px 1.5px rgba(0,0,0,0.2)",
  };

  const cirebonStyle = {
    fontFamily: "Arial, sans-serif",
    fontWeight: 800,
    textShadow:
      "-0.25px -0.25px 0.25px rgba(255,255,255,0.8), 0.5px 0.5px 0.5px rgba(0,0,0,0.3)",
  };

  return (
    <div className="w-[85.6mm] h-[53.98mm] relative overflow-hidden bg-white shadow-xl rounded-xl border border-slate-200 print:shadow-none print:border-0 print:rounded-none select-none font-sans">
      
      {/* --- TOP SECTION (WHITE) --- */}
      <div className="absolute top-0 left-0 right-0 h-[62%] bg-white px-5 pt-4">
        {/* Header - Recreating DocumentHeader Look */}
        <div className="flex items-center gap-2 mb-2 relative z-10 pl-1">
          {/* Logo */}
          <div className="relative w-[34px] h-[34px] shrink-0">
             <Image 
               src="/img/logo-ikmi.png" 
               alt="Logo" 
               fill 
               className="object-contain"
             />
          </div>
          
          {/* Text Block */}
          <div className="flex flex-col justify-center mt-[-1px]">
            <h2 className="text-[5.5px] font-bold text-gray-800 tracking-wide leading-tight mb-[0.5px] uppercase font-sans">
              SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER
            </h2>

            <div className="flex items-end leading-none mt-[-1.5px]">
              <span
                className="text-[22px] text-[#EE3A43] tracking-tighter"
                style={{ ...embossedTextStyle, lineHeight: "0.8" }}
              >
                STMIK
              </span>

              <div className="flex flex-col ml-[3px] mb-[0px]">
                <span
                  className="text-[12px] text-[#1B3F95]"
                  style={{ 
                    ...embossedTextStyle, 
                    lineHeight: "0.8",
                    letterSpacing: "0.42em",
                    marginRight: "-0.42em"
                  }}
                >
                  IKMI
                </span>
                <span
                  className="text-[8px] text-[#00A651] tracking-[0.16em] mt-[1.5px] ml-[0.5px]"
                  style={{ ...cirebonStyle, lineHeight: "0.8" }}
                >
                  CIREBON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Content: QR & Title */}
        <div className="flex items-start gap-3 relative z-10 mt-3 pl-1">
            {/* QR Code with Logo Overlay */}
            <div className="relative w-[42px] h-[42px] bg-white">
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={profile.nim || "-"}
                  viewBox={`0 0 256 256`}
                />
                {/* Logo Overlay Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center p-[1px]">
                   <div className="relative w-full h-full">
                      <Image 
                        src="/img/logo-ikmi.png" 
                        alt="Logo Center" 
                        fill 
                        className="object-contain"
                      />
                   </div>
                </div>
            </div>
            
            {/* Title */}
            <h2 className="text-[11px] font-bold text-slate-900 uppercase leading-3 w-32 tracking-tight mt-1" style={{ fontFamily: "Arial, sans-serif" }}>
              KARTU IDENTITAS<br/>MAHASISWA
            </h2>
        </div>
      </div>

      {/* --- PHOTO (Overlapping Top and Bottom) --- */}
      {/* Photo size reduced as requested */}
      <div className="absolute right-[18px] top-[44px] w-[19mm] h-[25.3mm] z-30 bg-slate-200 shadow-sm overflow-hidden">
         {profile.avatar_url ? (
           <Image 
             src={profile.avatar_url} 
             alt={profile.nama} 
             fill 
             className="object-cover"
           />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-[8px] text-center p-1">
             No Photo
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
               backgroundSize: "cover",
               backgroundPosition: "center",
               backgroundRepeat: "no-repeat",
            }}
         />

         {/* Info Content */}
         <div className="relative z-10 flex justify-between items-end h-full mb-0.5">
            <div className="flex flex-col gap-0 mb-0.5 max-w-[65%] leading-tight">
              <h1 className="text-[12px] font-bold uppercase truncate tracking-wide text-white font-sans" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {profile.nama}
              </h1>
              <p className="text-[11px] font-bold tracking-wider font-sans opacity-100 text-slate-100 mt-[1px]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {profile.nim}
              </p>
              <p className="text-[10px] font-bold opacity-100 mt-[1px] text-slate-100" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {profile.study_program?.nama || "Mahasiswa"}
                {profile.study_program?.jenjang ? ` (${profile.study_program.jenjang})` : ""}
              </p>
            </div>
            
            <div className="flex flex-col items-end text-[7px] text-right opacity-100 mb-0.5 leading-tight text-white font-semibold" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
               <span>Berlaku sampai dengan :</span>
               <span className="font-bold text-[8px] mt-[1px]">{validUntil}</span>
            </div>
         </div>
      </div>
      
      {/* Separator Line */}
      {/* Removed/Hidden in new design reference, just a clean cut or dark block. 
          The reference shows no separator line, the blue block starts directly. */}
    </div>
  );
}
