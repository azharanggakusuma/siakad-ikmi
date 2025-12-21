import React, { useState, useEffect } from "react";

export default function Footer() {
  // State untuk menyimpan tanggal agar tidak error saat render (Hydration Mismatch)
  const [tanggal, setTanggal] = useState("");

  useEffect(() => {
    // Ambil tanggal hari ini saat komponen dimuat di browser
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric", // Menambahkan tahun agar format surat lengkap
    });
    setTanggal(formatter.format(date));
  }, []);

  return (
    // Menggunakan font Cambria dan ukuran text 10px
    <div className="flex justify-between items-start mt-6 text-[10px] w-full font-['Cambria']">
      
      {/* Keterangan Kiri */}
      <div className="mt-0 pl-1">
        <p className="font-bold underline mb-1">Keterangan</p>
        
        {/* Grid Tab 70px sesuai permintaan sebelumnya */}
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
        {/* TANGGAL OTOMATIS */}
        {/* Jika tanggal belum dimuat (loading), tampilkan placeholder kosong atau tanggal default */}
        <p className="mb-0 leading-tight">
          Cirebon, {tanggal || "..."}
        </p>
        
        <p className="font-normal mb-1 leading-tight">
          Ketua Program Studi Teknik Informatika (S1)
        </p>

        <div className="relative w-32 h-24 my-1 flex items-center justify-center">
          <img
            src="/img/ttd-kaprodi.png"
            alt="Tanda Tangan"
            className="absolute w-full h-full object-contain z-10 top-0 left-0 mix-blend-multiply scale-[1.6] translate-y-[-20px]"
          />
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