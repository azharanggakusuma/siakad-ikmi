import React from "react";

// Data Lengkap (43 Mata Kuliah + Total)
const transcriptData = [
  { no: 1, kode: "MKWI-21012", matkul: "Bahasa Inggris Dasar", smt: 1, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 2, kode: "MKWI-21013", matkul: "Pengenalan Budaya Cirebon", smt: 1, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 3, kode: "MKD-0006", matkul: "Data Manajemen", smt: 1, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 4, kode: "MKWI-21014", matkul: "Kalkulus", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 5, kode: "MKWI-21001", matkul: "Algoritma dan Pemrograman Dasar", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 6, kode: "MKWN-21003", matkul: "Pendidikan Agama", smt: 1, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 7, kode: "MKWI-21007", matkul: "Dasar Dasar Artificial Intelligence", smt: 1, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 8, kode: "MKWN-21001", matkul: "Pancasila", smt: 1, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 9, kode: "MKWN-004", matkul: "Pendidikan Kewarganegaraan", smt: 2, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 10, kode: "SIW-2121", matkul: "Jaringan Komputer", smt: 2, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 11, kode: "MKD-0105", matkul: "Struktur Data", smt: 2, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 12, kode: "MKWI-21002", matkul: "Algoritma Dan Pemrograman Lanjut", smt: 2, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 13, kode: "SIW-2123", matkul: "Statistika", smt: 2, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 14, kode: "MKWI-21005", matkul: "Aljabar Linear", smt: 2, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 15, kode: "MKWN-002", matkul: "Bahasa Indonesia", smt: 2, sks: 2, hm: "A", am: 4, nm: 8 },
  { no: 16, kode: "MDK-0303", matkul: "Matematika Diskrit", smt: 3, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 17, kode: "TDK-0304", matkul: "Jaringan Komputer Advanced", smt: 3, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 18, kode: "MDK-0305", matkul: "Pemrograman Web", smt: 3, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 19, kode: "MDK-0301", matkul: "Pemrograman SQL", smt: 3, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 20, kode: "MDK-0306", matkul: "Data Science", smt: 3, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 21, kode: "MDK-0302", matkul: "Rekayasa Perangkat Lunak", smt: 3, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 22, kode: "MBKM-TI-04078", matkul: "TP. Camping dan Trekking", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 23, kode: "MBKM-TI-04049", matkul: "Modul Nusantara", smt: 4, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 24, kode: "MBKM-TI-04051", matkul: "Pendidikan Anti Korupsi", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 25, kode: "MBKM-TI-04066", matkul: "Semiotika", smt: 4, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 26, kode: "MBKM-TI-04017", matkul: "Etika Bisnis Profesi", smt: 4, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 27, kode: "MBKM-TI-04073", matkul: "Technopreneurship", smt: 4, sks: 3, hm: "A", am: 4, nm: 12 },
  { no: 28, kode: "MBKM-TI-04044", matkul: "Media Pembelajaran", smt: 4, sks: 3, hm: "B", am: 3, nm: 9 },
  { no: 29, kode: "TKK-0501", matkul: "Cloud Computing", smt: 5, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 30, kode: "MKK-0502", matkul: "Keamanan Jaringan", smt: 5, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 31, kode: "TKK-0503", matkul: "Text Mining", smt: 5, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 32, kode: "TKK-0504", matkul: "Sistem Operasi", smt: 5, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 33, kode: "TKK-0505", matkul: "Deep Learning Dasar", smt: 5, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 34, kode: "TKK-0601", matkul: "Deep Learning Lanjut", smt: 6, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 35, kode: "TKK-0602", matkul: "Manajemen Proyek Data Science", smt: 6, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 36, kode: "TKK-0603", matkul: "Big Data Analytic", smt: 6, sks: 4, hm: "B", am: 3, nm: 12 },
  { no: 37, kode: "TKK-0604", matkul: "Computer Vision", smt: 6, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 38, kode: "TKK-0605", matkul: "Robotic", smt: 6, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 39, kode: "MKK-0705", matkul: "IT Enterpreuneur", smt: 7, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 40, kode: "MKK-0704", matkul: "Etika Profesi", smt: 7, sks: 2, hm: "B", am: 3, nm: 6 },
  { no: 41, kode: "MKK-0703", matkul: "Proposal Skripsi", smt: 7, sks: 2, hm: "C", am: 2, nm: 4 },
  { no: 42, kode: "MKK-0702", matkul: "Literature Review", smt: 7, sks: 4, hm: "A", am: 4, nm: 16 },
  { no: 43, kode: "MKK-0701", matkul: "Metode Penelitian", smt: 7, sks: 4, hm: "B", am: 3, nm: 12 },
];

export default function TranskripPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-black flex justify-center print:p-0 print:bg-white">
      
      {/* Container A4 Style */}
      <div className="w-[210mm] min-h-[297mm] bg-white p-8 shadow-lg relative print:shadow-none print:w-full print:m-0">
        
        {/* === HEADER (KOP SURAT) === */}
        <div className="mb-0">
          <div className="flex items-start justify-between pb-1 relative">
            
            {/* Logo & Nama Kampus */}
            <div className="flex items-center gap-3">
              {/* Logo Image Placeholder */}
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

              {/* Teks Header */}
              <div className="flex flex-col">
                 <h2 className="text-[10px] font-bold text-gray-800 tracking-wide font-serif leading-tight">
                   SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER
                 </h2>
                 <div className="flex items-end leading-none mt-[-4px]">
                   <span className="text-[3rem] font-extrabold text-[#EE3A43] tracking-tighter" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>STMIK</span>
                   <span className="text-[3rem] font-extrabold text-[#1B3F95] ml-2 tracking-tighter italic" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>IKMI</span>
                 </div>
                 <h3 className="text-[1.6rem] font-extrabold text-[#009444] tracking-[0.2em] leading-none mt-[-4px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                   CIREBON
                 </h3>
              </div>
            </div>

            {/* Alamat Kampus - Right Aligned */}
            <div className="text-[9px] text-left text-gray-800 mt-2 min-w-[200px] leading-snug pl-4 border-l-2 border-gray-300">
              <p className="font-bold">Alamat Kampus :</p>
              <p>Jl. Perjuangan No. 10 B Majasem</p>
              <p>Kec. Kesambi Kota Cirebon</p>
              <p>Tlp. 0231) 490480 - 490481</p>
              <p>Website : <span className="text-blue-600 underline">https://ikmi.ac.id</span> Email : <span className="text-blue-600 underline">info@ikmi.ac.id</span></p>
            </div>
          </div>

          {/* Bar SK & Akreditasi */}
          <div className="w-full h-5 bg-[#F7941D] relative flex items-center mt-1">
            <span className="text-white text-[9px] font-bold ml-4">SK. MENRISTEKDIKTI NO. 1/KPT/I/2015</span>
            <div className="absolute right-0 top-0 h-full bg-[#009444] px-4 flex items-center" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% 100%, 0% 100%)' }}>
               <span className="text-white text-[10px] font-bold italic">TERAKREDITASI BAN-PT</span>
            </div>
          </div>
        </div>

        {/* === JUDUL TRANSKRIP === */}
        <div className="text-center mt-4 mb-4">
          <h2 className="font-bold underline text-[14px] uppercase tracking-wide">TRANSKRIP NILAI</h2>
        </div>

        {/* === DATA MAHASISWA === */}
        {/* KEMBALI KE mb-4 */}
        <div className="mb-4 text-[11px] font-bold grid grid-cols-[120px_10px_1fr] gap-y-1 ml-1">
          <div className="font-bold">Nama Mahasiswa</div> <div className="font-bold">:</div> <div className="font-bold uppercase">AZHARANGGA KUSUMA</div>
          <div className="font-bold">NIM</div> <div className="font-bold">:</div> <div className="font-normal">41226142</div>
          <div className="font-bold">Program Studi</div> <div className="font-bold">:</div> <div className="font-normal">Teknik Informatika (S1)</div>
          <div className="font-bold">Semester</div> <div className="font-bold">:</div> <div className="font-normal">7</div>
        </div>

        {/* === TABEL NILAI === */}
        <table className="w-full text-[9px] border-collapse border border-black mb-2">
          <thead>
            <tr className="bg-[#D9EAF7] text-center font-bold h-5 border-b border-black">
              <th className="border border-black w-6">No</th>
              <th className="border border-black w-28">Kode MK</th>
              <th className="border border-black text-left pl-2">Mata Kuliah</th>
              <th className="border border-black w-8">SMT</th>
              <th className="border border-black w-8">SKS</th>
              <th className="border border-black w-8">HM</th>
              <th className="border border-black w-8">AM</th>
              <th className="border border-black w-8">NM</th>
            </tr>
          </thead>
          
          <tbody className="font-normal">
            {transcriptData.map((row) => (
              <tr key={row.no} className="text-center leading-none h-[13px]">
                <td className="border border-black">{row.no}</td>
                <td className="border border-black">{row.kode}</td>
                <td className="border border-black text-left pl-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{row.matkul}</td>
                <td className="border border-black">{row.smt}</td>
                <td className="border border-black">{row.sks}</td>
                <td className="border border-black">{row.hm}</td>
                <td className="border border-black">{row.am}</td>
                <td className="border border-black">{row.nm}</td>
              </tr>
            ))}
            
            <tr className="font-bold bg-white h-4 border-t border-black">
              <td colSpan={3} className="border border-black px-2 text-left">Jumlah Beban SKS</td>
              <td colSpan={5} className="border border-black px-2 text-left">135</td>
            </tr>
            <tr className="font-bold bg-white h-4">
              <td colSpan={3} className="border border-black px-2 text-left">Jumlah Nilai Mutu</td>
              <td colSpan={5} className="border border-black px-2 text-left">462</td>
            </tr>
            <tr className="font-bold bg-white h-4">
              <td colSpan={3} className="border border-black px-2 text-left">Indeks Prestasi Kumulatif (IPK)</td>
              <td colSpan={5} className="border border-black px-2 text-left">3,42</td>
            </tr>
          </tbody>
        </table>

        {/* === FOOTER & TANDA TANGAN === */}
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
            <p className="font-normal mb-1 leading-tight">Ketua Program Studi Teknik Informatika (S1)</p>
            
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
                <p className="font-bold underline text-[11px] leading-none">YUDHISTIRA ARIE WIJAYA, M.Kom</p>
                <p className="font-bold text-[10px] leading-tight">NIDN. 0401047103</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}