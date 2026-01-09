import React from "react";
import { TranscriptItem } from "@/lib/types";

interface GradeTableProps {
  data: TranscriptItem[];
  ipk?: string;
  ips?: string;
  // [UPDATE] Tambahkan props untuk nilai total yang sudah dihitung parent
  totalSKS?: number;
  totalNM?: number;
  mode?: "transkrip" | "khs";
}

export default function GradeTable({ 
  data, 
  ipk, 
  ips, 
  totalSKS: propsTotalSKS,
  totalNM: propsTotalNM,
  mode = "transkrip" 
}: GradeTableProps) {
  
  // Fallback: Jika props tidak dikirim, hitung manual (raw sum)
  // Untuk Transkrip sebaiknya propsTotalSKS SELALU dikirim agar deduplikasi berjalan
  const calculatedTotalSKS = propsTotalSKS ?? data.reduce((acc, row) => acc + row.sks, 0);
  
  const calculatedTotalNM = propsTotalNM ?? data.reduce((acc, row) => {
     if (row.hm === '-') return acc;
     return acc + row.nm;
  }, 0);

  // Jika IPK dikirim, pakai itu. Jika tidak, hitung sederhana.
  const displayedIPK = ipk 
    ? ipk 
    : (calculatedTotalSKS > 0 ? (calculatedTotalNM / calculatedTotalSKS).toFixed(2).replace('.', ',') : "0,00");

  return (
    <table className="w-full text-[9px] border-collapse border border-black mb-2 font-['Cambria']">
      <thead>
        <tr className="bg-[#D9EAF7] text-center font-bold h-5 border-b border-black">
          <th className="border border-black w-6">No</th>
          <th className="border border-black w-34">Kode MK</th>
          <th className="border border-black text-left pl-2">Mata Kuliah</th>
          {mode === "transkrip" && <th className="border border-black w-10">SMT</th>}
          <th className="border border-black w-10">SKS</th>
          <th className="border border-black w-10">HM</th>
          <th className="border border-black w-10">AM</th>
          <th className="border border-black w-10">NM</th>
        </tr>
      </thead>
      <tbody className="font-normal">
        {data.length === 0 && mode === 'khs' ? (
           <tr className="h-[13px]">
              <td colSpan={7} className="border border-black text-center italic py-2">
                 Belum ambil KRS
              </td>
           </tr>
        ) : (
           data.map((row, index) => (
            <tr key={index} className="text-center leading-none h-[13px]">
              <td className="border border-black">{mode === 'khs' ? index + 1 : row.no}</td>
              <td className="border border-black">{row.kode}</td>
              <td className="border border-black text-left pl-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{row.matkul}</td>
              {mode === "transkrip" && <td className="border border-black">{row.smt}</td>}
              <td className="border border-black">{row.sks}</td>
              <td className="border border-black">{row.hm}</td>
              <td className="border border-black">{row.hm === '-' ? '-' : row.am}</td>
              <td className="border border-black">{row.hm === '-' ? '-' : row.nm}</td>
            </tr>
          ))
        )}

        {/* FOOTER SECTION */}
        {mode === "khs" ? (
          <>
             <tr className="font-bold bg-white h-4 border-t border-black">
              <td colSpan={3} className="border border-black px-2 text-left">Jumlah</td>
              <td className="border border-black text-center">{calculatedTotalSKS}</td>
              <td className="border border-black bg-gray-100"></td>
              <td className="border border-black bg-gray-100"></td>
              <td className="border border-black text-center">{calculatedTotalNM}</td>
            </tr>
            <tr className="font-bold bg-white h-4">
              <td colSpan={3} className="border border-black px-2 text-left">Indeks Prestasi Semester (IPS)</td>
              <td colSpan={4} className="border border-black px-2 text-left">{ips}</td>
            </tr>
            <tr className="font-bold bg-white h-4">
              <td colSpan={3} className="border border-black px-2 text-left">Indeks Prestasi Kumulatif (IPK)</td>
              <td colSpan={4} className="border border-black px-2 text-left">{displayedIPK}</td>
            </tr>
          </>
        ) : (
          <>
            <tr className="font-bold bg-white h-4 border-t border-black">
              <td colSpan={3} className="border border-black px-2 text-left">Jumlah Beban SKS</td>
              <td colSpan={5} className="border border-black px-2 text-left">{calculatedTotalSKS}</td>
            </tr>
            <tr className="font-bold bg-white h-4">
              <td colSpan={3} className="border border-black px-2 text-left">Jumlah Nilai Mutu</td>
              <td colSpan={5} className="border border-black px-2 text-left">{calculatedTotalNM}</td>
            </tr>
            <tr className="font-bold bg-white h-4">
              <td colSpan={3} className="border border-black px-2 text-left">Indeks Prestasi Kumulatif (IPK)</td>
              <td colSpan={5} className="border border-black px-2 text-left">{displayedIPK}</td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
}