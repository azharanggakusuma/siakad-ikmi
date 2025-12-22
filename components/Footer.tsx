import React, { useState, useEffect } from "react";

interface FooterProps {
  signatureType: "basah" | "digital" | "none";
  signatureBase64: string | null; // Menerima data gambar Base64
}

export default function Footer({ signatureType, signatureBase64 }: FooterProps) {
  const [tanggal, setTanggal] = useState("");

  useEffect(() => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setTanggal(formatter.format(date));
  }, []);

  return (
    <div className="flex justify-between items-start mt-6 text-[10px] w-full font-['Cambria']">
      
      {/* Keterangan Kiri */}
      <div className="mt-0 pl-1">
        <p className="font-bold underline mb-1">Keterangan</p>
        <div className="grid grid-cols-[70px_10px_1fr] leading-tight">
          <div>SMT</div> <div>:</div> <div>Semester</div>
          <div>SKS</div> <div>:</div> <div>Satuan Kredit Semester</div>
          <div>HM</div> <div>:</div> <div>Huruf Mutu</div>
          <div>AM</div> <div>:</div> <div>Angka Mutu</div>
          <div>NM</div> <div>:</div> <div>Nilai Mutu</div>
        </div>
      </div>

      {/* Area Tanda Tangan Kanan */}
      <div className="flex flex-col items-center w-fit mt-0 pr-1">
        <p className="mb-0 leading-tight">
          Cirebon, {tanggal || "..."}
        </p>
        
        <p className="font-normal mb-1 leading-tight">
          Ketua Program Studi Teknik Informatika (S1)
        </p>

        {/* Container Gambar */}
        <div 
          className="relative w-32 h-24 my-1 flex items-center justify-center select-none"
          // Mencegah Menu Klik Kanan pada area ini
          onContextMenu={(e) => e.preventDefault()} 
        >
          {signatureType !== "none" && signatureBase64 && (
            <img
              src={signatureBase64}
              alt="Tanda Tangan"
              // pointer-events-none: Mencegah user klik/drag gambar
              // select-none: Mencegah user memblok/highlight gambar
              className={`absolute w-full h-full object-contain z-10 top-0 left-0 mix-blend-multiply translate-y-[-20px] pointer-events-none select-none ${
                signatureType === "basah" ? "scale-[1.6]" : "scale-[1.3]"
              }`} 
              // Tambahan: disable drag attribute HTML5
              draggable={false}
            />
          )}
          
          {/* Layer Transparan Tambahan untuk keamanan ekstra (menghalangi akses langsung ke elemen img) */}
          <div className="absolute inset-0 z-20 bg-transparent w-full h-full"></div>
        </div>

        <div className="text-center z-20 mt-[-35px] relative">
          <p className="font-bold underline text-[11px] leading-none">
            YUDHISTIRA ARIE WIJAYA, M.Kom
          </p>
          <p className="font-bold text-[10px] leading-tight">
            NIDN. 0401047103
          </p>
        </div>
      </div>
    </div>
  );
}