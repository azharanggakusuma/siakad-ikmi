import React from "react";
import { StudentData } from "../lib/data";

interface ControlPanelProps {
  students: StudentData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onPrint: () => void;
}

export default function ControlPanel({
  students,
  selectedIndex,
  onSelect,
  onPrint,
}: ControlPanelProps) {
  return (
    // Card Vertikal Penuh
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6 shadow-sm print:hidden flex flex-col gap-6">
      
      {/* Header Panel */}
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Panel Kontrol
        </h3>
      </div>

      {/* Bagian 1: Dropdown */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="student-select"
          className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
        >
          Pilih Mahasiswa
        </label>
        
        <div className="relative">
          <select
            id="student-select"
            value={selectedIndex}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-[#1B3F95] focus:border-[#1B3F95] block p-3 outline-none transition-all cursor-pointer appearance-none shadow-sm"
          >
            {students.map((student, index) => (
              <option key={student.id} value={index}>
                {student.profile.nama}
              </option>
            ))}
          </select>
          {/* Icon Panah */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="text-xs text-gray-400 px-1 mt-1">
          NIM: <span className="font-mono text-gray-600">{students[selectedIndex].profile.nim}</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Bagian 2: Tombol Cetak */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          Aksi
        </label>
        <button
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-2 bg-[#1B3F95] hover:bg-blue-900 text-white font-medium rounded-lg text-sm px-5 py-3 transition-all shadow-md hover:shadow-lg active:translate-y-[1px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Cetak Transkrip (PDF)
        </button>
      </div>

    </div>
  );
}