import React, { useState, useEffect } from "react";

// Update tipe: gunakan 'basah' dan 'digital' agar lebih jelas
interface FooterProps {
  signatureType: "basah" | "digital" | "none";
}

export default function Footer({ signatureType }: FooterProps) {
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

  // Mapping gambar: Basah = ttd-kaprodi.png, Digital = ttd-digital.png
  const signatureImage =
    signatureType === "digital"
      ? "/img/ttd-digital.png"
      : "/img/ttd-kaprodi.png"; 

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
        <div className="relative w-32 h-24 my-1 flex items-center justify-center">
          {signatureType !== "none" && (
            <img
              src={signatureImage}
              alt="Tanda Tangan"
              className={`absolute w-full h-full object-contain z-10 top-0 left-0 mix-blend-multiply translate-y-[-20px] ${
                signatureType === "basah" ? "scale-[1.6]" : "scale-[1.3]"
              }`} 
              // Catatan: scale bisa disesuaikan jika ukuran QR (digital) dan TTD Basah berbeda
            />
          )}
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