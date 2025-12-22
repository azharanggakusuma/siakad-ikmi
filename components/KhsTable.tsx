import React from "react";
import { TranscriptItem } from "../lib/data";

interface KhsTableProps {
  data: TranscriptItem[]; // Data khusus semester yang dipilih
  ips: string;
  ipk: string;
}

export default function KhsTable({ data, ips, ipk }: KhsTableProps) {
  // Hitung total SKS dan NM untuk semester ini saja (untuk ditampilkan di baris Jumlah)
  const totalSksSemester = data.reduce((acc, row) => acc + row.sks, 0);
  const totalNmSemester = data.reduce((acc, row) => acc + row.nm, 0);

  return (
    <table className="w-full text-[9px] border-collapse border border-black mb-2 font-['Cambria']">
      <thead>
        <tr className="bg-[#D9EAF7] text-center font-bold h-5 border-b border-black">
          <th className="border border-black w-6">No</th>
          <th className="border border-black w-34">Kode MK</th>
          <th className="border border-black text-left pl-2">Mata Kuliah</th>
          <th className="border border-black w-10">SKS</th>
          <th className="border border-black w-10">HM</th>
          <th className="border border-black w-10">AM</th>
          <th className="border border-black w-10">NM</th>
        </tr>
      </thead>
      <tbody className="font-normal">
        {data.map((row, index) => (
          <tr key={index} className="text-center leading-none h-[13px]">
            <td className="border border-black">{index + 1}</td>
            <td className="border border-black">{row.kode}</td>
            <td className="border border-black text-left pl-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
              {row.matkul}
            </td>
            <td className="border border-black">{row.sks}</td>
            <td className="border border-black">{row.hm}</td>
            <td className="border border-black">{row.am}</td>
            <td className="border border-black">{row.nm}</td>
          </tr>
        ))}

        {/* --- FOOTER KHS (IPS & IPK) --- */}
        <tr className="font-bold bg-white h-4 border-t border-black">
          <td colSpan={3} className="border border-black px-2 text-left">Jumlah (Semester Ini)</td>
          <td className="border border-black text-center">{totalSksSemester}</td>
          <td className="border border-black bg-gray-100"></td>
          <td className="border border-black bg-gray-100"></td>
          <td className="border border-black text-center">{totalNmSemester}</td>
        </tr>
        <tr className="font-bold bg-white h-4">
          <td colSpan={3} className="border border-black px-2 text-left">Indeks Prestasi Semester (IPS)</td>
          <td colSpan={4} className="border border-black px-2 text-left">{ips}</td>
        </tr>
        <tr className="font-bold bg-white h-4">
          <td colSpan={3} className="border border-black px-2 text-left">Indeks Prestasi Kumulatif (IPK)</td>
          <td colSpan={4} className="border border-black px-2 text-left">{ipk}</td>
        </tr>
      </tbody>
    </table>
  );
}