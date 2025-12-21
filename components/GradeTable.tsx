import React from "react";
import { TranscriptItem } from "../lib/data";

interface GradeTableProps {
  data: TranscriptItem[];
}

export default function GradeTable({ data }: GradeTableProps) {
  return (
    // Tetap menggunakan w-full
    <table className="w-full text-[9px] border-collapse border border-black mb-2">
      <thead>
        <tr className="bg-[#D9EAF7] text-center font-bold h-5 border-b border-black">
          <th className="border border-black w-6">No</th>
          <th className="border border-black w-34">Kode MK</th>
          <th className="border border-black text-left pl-2">Mata Kuliah</th>
          <th className="border border-black w-10">SMT</th>
          <th className="border border-black w-10">SKS</th>
          <th className="border border-black w-10">HM</th>
          <th className="border border-black w-10">AM</th>
          <th className="border border-black w-10">NM</th>
        </tr>
      </thead>

      <tbody className="font-normal">
        {data.map((row) => (
          <tr key={row.no} className="text-center leading-none h-[13px]">
            <td className="border border-black">{row.no}</td>
            <td className="border border-black">{row.kode}</td>
            <td className="border border-black text-left pl-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] pl-2">
              {row.matkul}
            </td>
            <td className="border border-black">{row.smt}</td>
            <td className="border border-black">{row.sks}</td>
            <td className="border border-black">{row.hm}</td>
            <td className="border border-black">{row.am}</td>
            <td className="border border-black">{row.nm}</td>
          </tr>
        ))}

        <tr className="font-bold bg-white h-4 border-t border-black">
          <td colSpan={3} className="border border-black px-2 text-left">
            Jumlah Beban SKS
          </td>
          <td colSpan={5} className="border border-black px-2 text-left">
            135
          </td>
        </tr>
        <tr className="font-bold bg-white h-4">
          <td colSpan={3} className="border border-black px-2 text-left">
            Jumlah Nilai Mutu
          </td>
          <td colSpan={5} className="border border-black px-2 text-left">
            462
          </td>
        </tr>
        <tr className="font-bold bg-white h-4">
          <td colSpan={3} className="border border-black px-2 text-left">
            Indeks Prestasi Kumulatif (IPK)
          </td>
          <td colSpan={5} className="border border-black px-2 text-left">
            3,42
          </td>
        </tr>
      </tbody>
    </table>
  );
}