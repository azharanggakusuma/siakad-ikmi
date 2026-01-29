import React from "react";

interface DocumentHeaderProps {
  title?: string;
}

export default function DocumentHeader({ title = "TRANSKRIP NILAI" }: DocumentHeaderProps) {
  const embossedTextStyle = {
    fontWeight: 900,
    textShadow:
      "-1px -1px 1px rgba(255,255,255,0.9), 1px 1px 1px rgba(0,0,0,0.4), 2px 2px 3px rgba(0,0,0,0.2)",
  };

  const cirebonStyle = {
    fontWeight: 800,
    textShadow:
      "-0.5px -0.5px 0.5px rgba(255,255,255,0.8), 1px 1px 1px rgba(0,0,0,0.3)",
  };

  const forcePrintBackground = {
    printColorAdjust: "exact" as const,
    WebkitPrintColorAdjust: "exact" as const,
  };

  return (
    <div className="mb-0 bg-white">
      <div className="grid grid-cols-[1fr_auto] gap-x-0 relative font-sans">
        
        {/* LOGO & NAMA KAMPUS */}
        <div className="flex items-center gap-3 pb-1 pt-1 pr-2">
          <div className="w-[80px] h-[80px] flex-shrink-0 relative ml-1">
            <img
              src="/img/logo-ikmi.png"
              alt="Logo STMIK IKMI"
              className="object-contain w-full h-full"
            />
          </div>

          <div className="flex flex-col justify-center mt-[-4px]">
            <h2 className="text-[11px] font-bold text-gray-800 tracking-wide leading-tight mb-0 uppercase font-sans">
              SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER
            </h2>

            <div className="flex items-end leading-none mt-[-2px]">
              <span
                className="text-[4rem] text-[#EE3A43] font-sans"
                style={{ 
                  ...embossedTextStyle, 
                  lineHeight: "0.8",
                  letterSpacing: "-1px"
                }}
              >
                STMIK
              </span>

              <div className="flex flex-col ml-2 mb-[-1px]">
                <span
                  className="text-[2.3rem] text-[#1B3F95] font-sans"
                  style={{ 
                    ...embossedTextStyle, 
                    lineHeight: "0.8",
                    letterSpacing: "0.43em",
                    marginRight: "-0.43em"
                  }}
                >
                  IKMI
                </span>
                <span
                  className="text-[1.35rem] text-[#00A651] tracking-[0.25em] mt-[3px] font-sans"
                  style={{ ...cirebonStyle, lineHeight: "0.8" }}
                >
                  CIREBON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ALAMAT */}
        <div 
          className="border-l-2 border-[#EE3A43] pl-4 py-1 h-[78px] flex flex-col justify-center min-w-[250px]"
          style={forcePrintBackground}
        >
          <div className="text-[10px] text-gray-800 leading-[1.25] font-sans">
            <p className="font-bold text-[11px] mb-[2px] text-black">
              Alamat Kampus :
            </p>
            <p>Jl. Perjuangan No. 10 B Majasem</p>
            <p>Kec. Kesambi Kota Cirebon</p>
            <p>Tlp. (0231) 490480 - 490481</p>
            <p className="mt-[1px]">
              Website :{" "}
              <span className="text-[#00ADEE]">https://ikmi.ac.id</span> Email :{" "}
              <span className="text-[#00ADEE]">info@ikmi.ac.id</span>
            </p>
          </div>
        </div>

        {/* BAR WARNA */}
        <div 
          className="bg-[#F7941D] h-[26px] flex items-center justify-center px-1 mt-[2px] overflow-hidden"
          style={forcePrintBackground}
        >
          <span className="text-white text-[12px] font-bold tracking-[0.3em] leading-none whitespace-nowrap ml-[0.3em]">
            SK. MENRISTEKDIKTI NO. 1/KPT/I/2015
          </span>
        </div>

        <div 
          className="bg-[#009444] h-[26px] flex items-center justify-center px-1 mt-[2px] overflow-hidden"
          style={forcePrintBackground}
        >
          <span className="text-white text-[12px] font-bold uppercase tracking-[0.15em] leading-none whitespace-nowrap ml-[0.15em]">
            TERAKREDITASI BAN-PT
          </span>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="col-span-2 text-center mt-4 mb-4">
          <h2 className="font-bold underline text-[14px] uppercase tracking-wide font-caladea text-black">
            {title}
          </h2>
        </div>

      </div>
    </div>
  );
}