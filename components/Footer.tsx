import React from "react";

export default function Footer() {
  return (
    <div className="flex justify-between items-start mt-6 text-[10px] w-full">
      {/* Keterangan Kiri */}
      <div className="mt-0 pl-1">
        <p className="font-bold underline mb-1">Keterangan</p>
        <div className="grid grid-cols-[30px_10px_1fr] leading-tight">
          <div>SMT</div> <div>:</div> <div>Semester</div>
          <div>SKS</div> <div>:</div> <div>Satuan Kredit Semester</div>
          <div>HM</div> <div>:</div> <div>Huruf Mutu</div>
          <div>AM</div> <div>:</div> <div>Angka Mutu</div>
          <div>NM</div> <div>:</div> <div>Nilai Mutu</div>
        </div>
      </div>

      {/* Area Tanda Tangan Kanan */}
      <div className="flex flex-col items-center w-fit mt-0 pr-1">
        <p className="mb-0 leading-tight">Cirebon, 21 Oktober</p>
        <p className="font-normal mb-1 leading-tight">
          Ketua Program Studi Teknik Informatika (S1)
        </p>

        {/* CONTAINER VISUAL (TANPA STEMPEL, HANYA GAMBAR TTD) */}
        <div className="relative w-32 h-24 my-1 flex items-center justify-center">
          {/* TANDA TANGAN (Image File) */}
          <img
            src="/img/ttd-kaprodi.png"
            alt="Tanda Tangan"
            className="absolute w-full h-full object-contain z-10 top-0 left-0 mix-blend-multiply scale-[1.6] translate-y-[-20px]"
          />
        </div>

        {/* NAMA - Diangkat ke atas (negative margin) agar nempel gambar */}
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