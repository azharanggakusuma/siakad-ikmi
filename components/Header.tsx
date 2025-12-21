import React from "react";

export default function Header() {
  return (
    <div className="mb-0 font-sans">
      {/* Container Utama */}
      <div className="flex items-center justify-between pb-2 relative">
        
        {/* === BAGIAN KIRI: LOGO & NAMA KAMPUS === */}
        <div className="flex items-center gap-4">
          
          {/* Logo */}
          <div className="w-24 h-24 flex-shrink-0 relative">
            <img
              src="/img/logo-ikmi.png"
              alt="Logo STMIK IKMI"
              className="object-contain w-full h-full"
            />
            {/* Fallback visual jika gambar tidak ada */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center border-2 border-blue-900 rounded-full bg-gray-100 text-[10px] font-bold text-blue-900 opacity-20">
              LOGO
            </div>
          </div>

          {/* Teks STMIK IKMI CIREBON */}
          <div className="flex flex-col justify-center mt-1">
            {/* Teks Kecil di Atas */}
            <h2 className="text-[10px] font-bold text-gray-800 tracking-wide leading-tight mb-[-4px]">
              SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER
            </h2>
            
            {/* Container Teks Besar */}
            <div className="flex items-end">
              {/* STMIK - Merah Besar */}
              <span
                className="text-[3.8rem] font-extrabold text-[#E93635] tracking-tighter leading-[0.85]"
                style={{ 
                  fontFamily: "Arial Black, sans-serif",
                  textShadow: "1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 2px rgba(0,0,0,0.1)" 
                }}
              >
                STMIK
              </span>

              {/* IKMI & CIREBON - Stack di sebelah kanan STMIK */}
              <div className="flex flex-col ml-1.5 mb-[2px]">
                {/* IKMI - Biru (Hapus italic) */}
                <span
                  className="text-[2.1rem] font-extrabold text-[#193583] tracking-tighter leading-[0.85]"
                  style={{ 
                    fontFamily: "Arial Black, sans-serif",
                    textShadow: "1px 1px 0 #fff, -1px -1px 0 #fff"
                  }}
                >
                  IKMI
                </span>
                {/* CIREBON - Hijau */}
                <span
                  className="text-[1.25rem] font-extrabold text-[#008940] tracking-[0.22em] leading-none mt-0"
                  style={{ 
                    fontFamily: "Arial, sans-serif",
                    textShadow: "0.5px 0.5px 0 #fff"
                  }}
                >
                  CIREBON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* === BAGIAN KANAN: ALAMAT KAMPUS === */}
        {/* Dibatasi garis merah di kiri */}
        <div className="text-[9px] text-left text-gray-800 mt-2 min-w-[220px] leading-snug pl-3 border-l-[3px] border-[#E93635] h-[65px] flex flex-col justify-center">
          <p className="font-bold">Alamat Kampus :</p>
          <p>Jl. Perjuangan No. 10 B Majasem</p>
          <p>Kec. Kesambi Kota Cirebon</p>
          <p>Tlp. 0231) 490480 - 490481</p>
          <p>
            Website :{" "}
            <span className="text-[#00ADEE] underline">https://ikmi.ac.id</span> Email :{" "}
            <span className="text-[#00ADEE] underline">info@ikmi.ac.id</span>
          </p>
        </div>
      </div>

      {/* === BAR BAWAH: ORANGE & HIJAU === */}
      <div className="w-full flex mt-1">
        {/* Bagian Orange (SK) */}
        <div className="bg-[#F7931E] flex-grow py-[3px] px-4 flex items-center">
           <span className="text-white text-[10px] font-bold tracking-wide">
             SK. MENRISTEKDIKTI NO. 1/KPT/I/2015
           </span>
        </div>
        
        {/* Bagian Hijau (Akreditasi) */}
        <div className="bg-[#009444] py-[3px] px-6 flex items-center justify-center ml-[2px]">
           <span className="text-white text-[10px] font-bold uppercase italic tracking-wide">
             TERAKREDITASI BAN-PT
           </span>
        </div>
      </div>

      {/* Judul Halaman */}
      <div className="text-center mt-5 mb-4">
        <h2 className="font-bold underline text-[14px] uppercase tracking-wide">
          TRANSKRIP NILAI
        </h2>
      </div>
    </div>
  );
}