import React from "react";

export default function Header() {
  return (
    <div className="mb-0">
      <div className="flex items-start justify-between pb-1 relative">
        {/* Logo & Nama Kampus */}
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 flex-shrink-0 relative">
            <img
              src="/logo-placeholder.png"
              alt="Logo STMIK IKMI"
              className="object-contain w-full h-full"
            />
            <div className="absolute inset-0 -z-10 flex items-center justify-center border-2 border-blue-900 rounded-full bg-gray-100 text-[10px] font-bold text-blue-900 opacity-20">
              LOGO
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-[10px] font-bold text-gray-800 tracking-wide font-serif leading-tight">
              SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER
            </h2>
            <div className="flex items-end leading-none mt-[-4px]">
              <span
                className="text-[3rem] font-extrabold text-[#EE3A43] tracking-tighter"
                style={{ fontFamily: "Arial Black, Arial, sans-serif" }}
              >
                STMIK
              </span>
              <span
                className="text-[3rem] font-extrabold text-[#1B3F95] ml-2 tracking-tighter italic"
                style={{ fontFamily: "Arial Black, Arial, sans-serif" }}
              >
                IKMI
              </span>
            </div>
            <h3
              className="text-[1.6rem] font-extrabold text-[#009444] tracking-[0.2em] leading-none mt-[-4px]"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              CIREBON
            </h3>
          </div>
        </div>

        {/* Alamat Kampus */}
        <div className="text-[9px] text-left text-gray-800 mt-2 min-w-[200px] leading-snug pl-4 border-l-2 border-gray-300">
          <p className="font-bold">Alamat Kampus :</p>
          <p>Jl. Perjuangan No. 10 B Majasem</p>
          <p>Kec. Kesambi Kota Cirebon</p>
          <p>Tlp. 0231) 490480 - 490481</p>
          <p>
            Website :{" "}
            <span className="text-blue-600 underline">https://ikmi.ac.id</span>{" "}
            Email :{" "}
            <span className="text-blue-600 underline">info@ikmi.ac.id</span>
          </p>
        </div>
      </div>

      {/* Bar SK & Akreditasi */}
      <div className="w-full h-5 bg-[#F7941D] relative flex items-center mt-1">
        <span className="text-white text-[9px] font-bold ml-4">
          SK. MENRISTEKDIKTI NO. 1/KPT/I/2015
        </span>
        <div
          className="absolute right-0 top-0 h-full bg-[#009444] px-4 flex items-center"
          style={{ clipPath: "polygon(15px 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          <span className="text-white text-[10px] font-bold italic">
            TERAKREDITASI BAN-PT
          </span>
        </div>
      </div>

      {/* Judul Transkrip */}
      <div className="text-center mt-4 mb-4">
        <h2 className="font-bold underline text-[14px] uppercase tracking-wide">
          TRANSKRIP NILAI
        </h2>
      </div>
    </div>
  );
}