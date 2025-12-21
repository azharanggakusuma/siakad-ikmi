import React from "react";

export default function Header() {
  // Style khusus untuk meniru efek 3D/Emboss pada teks utama
  const embossedTextStyle = {
    fontFamily: "Arial Black, Arial, sans-serif",
    textShadow:
      "-1px -1px 1px rgba(255,255,255,0.9), 1px 1px 1px rgba(0,0,0,0.4), 2px 2px 3px rgba(0,0,0,0.2)",
  };

  const cirebonStyle = {
    fontFamily: "Arial, sans-serif",
    fontWeight: 800,
    textShadow:
      "-0.5px -0.5px 0.5px rgba(255,255,255,0.8), 1px 1px 1px rgba(0,0,0,0.3)",
  };

  return (
    <div className="mb-0 font-sans bg-white">
      {/* === BAGIAN ATAS: LOGO, JUDUL, ALAMAT === */}
      <div className="flex items-start justify-between pb-1 pt-1 relative">
        
        {/* KIRI: Container Logo & Teks Judul */}
        <div className="flex items-center gap-3">
          {/* Logo Shield */}
          <div className="w-[88px] h-[88px] flex-shrink-0 relative ml-1">
            <img
              src="/img/logo-ikmi.png"
              alt="Logo STMIK IKMI"
              className="object-contain w-full h-full"
            />
          </div>

          {/* Teks Judul Kampus */}
          <div className="flex flex-col justify-center mt-[-4px]">
            <h2 className="text-[11px] font-bold text-gray-800 tracking-wide leading-tight mb-0 uppercase font-sans">
              SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER
            </h2>

            {/* Container Teks Besar 3D */}
            <div className="flex items-end leading-none mt-[-2px]">
              <span
                className="text-[4rem] text-[#EE3A43] tracking-tighter"
                style={{ ...embossedTextStyle, lineHeight: "0.8" }}
              >
                STMIK
              </span>

              <div className="flex flex-col ml-2 mb-1">
                <span
                  className="text-[2.3rem] text-[#1B3F95]"
                  style={{ 
                    ...embossedTextStyle, 
                    lineHeight: "0.8",
                    letterSpacing: "0.22em",
                    marginRight: "-0.22em"
                  }}
                >
                  IKMI
                </span>
                <span
                  className="text-[1.35rem] text-[#00A651] tracking-[0.18em] mt-[3px]"
                  style={{ ...cirebonStyle, lineHeight: "0.8" }}
                >
                  CIREBON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KANAN: ALAMAT */}
        <div className="border-l-2 border-[#EE3A43] pl-4 py-1 ml-4 h-[78px] flex flex-col justify-center min-w-[250px]">
          <div className="text-[10px] text-gray-800 leading-[1.25] font-sans">
            <p className="font-bold text-[11px] mb-[2px] text-black">
              Alamat Kampus :
            </p>
            <p>Jl. Perjuangan No. 10 B Majasem</p>
            <p>Kec. Kesambi Kota Cirebon</p>
            <p>Tlp. 0231) 490480 - 490481</p>
            <p className="mt-[1px]">
              Website :{" "}
              <span className="text-[#00ADEE]">https://ikmi.ac.id</span> Email :{" "}
              <span className="text-[#00ADEE]">info@ikmi.ac.id</span>
            </p>
          </div>
        </div>
      </div>

      {/* === BAR BAWAH: ORANGE & HIJAU === */}
      {/* Container flex menyatu tanpa gap */}
      <div className="w-full flex mt-[2px] h-7 font-sans">
        
        {/* Bagian Orange */}
        <div className="bg-[#F7941D] flex-[1.4] flex items-center justify-center px-2">
          {/* Font diperbesar (text-[13px]) agar penuh, line-height none agar center */}
          <span className="text-white text-[13px] font-bold tracking-[0.05em] leading-none whitespace-nowrap">
            SK. MENRISTEKDIKTI NO. 1/KPT/I/2015
          </span>
        </div>

        {/* Bagian Hijau */}
        {/* Tidak ada margin-left (ml) dan tidak ada border putih */}
        <div className="bg-[#009444] flex-1 flex items-center justify-center px-2">
          {/* Font diperbesar (text-[14px]) */}
          <span className="text-white text-[14px] font-bold uppercase tracking-wide leading-none whitespace-nowrap">
            TERAKREDITASI BAN-PT
          </span>
        </div>
      </div>

      {/* Judul Halaman Transkrip */}
      <div className="text-center mt-6 mb-4">
        <h2 className="font-bold underline text-[14px] uppercase tracking-wide font-serif">
          TRANSKRIP NILAI
        </h2>
      </div>
    </div>
  );
}