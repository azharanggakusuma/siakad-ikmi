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
    <>
      {/* === DESKTOP VERSION === */}
      <div className="hidden md:flex w-[210mm] bg-white rounded-lg shadow-md border border-slate-300 p-4 items-center justify-between gap-4 print:hidden z-40 font-sans">
        {/* Dropdown Mahasiswa */}
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-blue-50 p-2 rounded-full text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <label
              htmlFor="student-select"
              className="block text-[10px] font-bold text-slate-500 uppercase mb-1"
            >
              Pilih Mahasiswa
            </label>
            <select
              id="student-select"
              value={selectedIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none font-medium cursor-pointer"
            >
              {students.map((student, index) => (
                <option key={student.id} value={index}>
                  {student.profile.nama} (NIM: {student.profile.nim})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider Vertical */}
        <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>

        {/* Tombol Print */}
        <button
          onClick={onPrint}
          className="group flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 font-semibold rounded-md text-sm px-6 py-3 transition-all shadow hover:shadow-lg transform active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 group-hover:animate-bounce"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
            />
          </svg>
          Cetak Transkrip
        </button>
      </div>

      {/* === MOBILE VERSION === */}
      <div className="md:hidden w-full bg-white p-4 rounded-lg shadow border border-slate-200 print:hidden space-y-3 font-sans">
        <label className="text-xs font-bold text-gray-500 uppercase">
          Pilih Mahasiswa:
        </label>
        <select
          value={selectedIndex}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="w-full border border-gray-300 rounded p-2 text-sm"
        >
          {students.map((student, index) => (
            <option key={student.id} value={index}>
              {student.profile.nama}
            </option>
          ))}
        </select>
        <button
          onClick={onPrint}
          className="w-full bg-emerald-600 text-white py-2 rounded text-sm font-bold flex justify-center gap-2"
        >
          <span>🖨️</span> Cetak PDF
        </button>
      </div>
    </>
  );
}