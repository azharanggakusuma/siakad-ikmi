import React from "react";
import { StudentData } from "../lib/data";

interface ControlPanelProps {
  students: StudentData[];
  selectedIndex: number;
  onSelect: (index: number) => void;

  signatureType: "basah" | "digital" | "none";
  onSignatureChange: (type: "basah" | "digital" | "none") => void;

  onPrint: () => void;

  // Props opsional untuk KHS (Semester)
  showSemesterSelect?: boolean;
  availableSemesters?: number[];
  selectedSemester?: number;
  onSelectSemester?: (smt: number) => void;
}

export default function ControlPanel({
  students,
  selectedIndex,
  onSelect,
  signatureType,
  onSignatureChange,
  onPrint,
  showSemesterSelect = false,
  availableSemesters = [],
  selectedSemester,
  onSelectSemester,
}: ControlPanelProps) {
  const selectedStudent = students[selectedIndex];

  const labelClass = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider";
  const selectClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-[#1B3F95]/30 focus:border-[#1B3F95] hover:border-gray-300";
  const sectionClass = "flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3";

  return (
    <aside className="w-full print:hidden sticky top-24">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-5 pt-5">
          <h3 className="text-sm font-semibold text-gray-900">Panel Kontrol</h3>
          <p className="mt-1 text-xs text-gray-500">Atur opsi dokumen, lalu cetak.</p>
        </div>

        <div className="p-5 flex flex-col gap-4">
          
          {/* 1. Select Mahasiswa */}
          <div className={sectionClass}>
            <div className="flex items-baseline justify-between">
              <p className={labelClass}>Mahasiswa</p>
              <p className="text-[11px] text-gray-400">{selectedIndex + 1}/{students.length}</p>
            </div>
            <select
              value={selectedIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              className={selectClass}
            >
              {students.map((student, index) => (
                <option key={student.id} value={index}>{student.profile.nama}</option>
              ))}
            </select>
            <div className="text-xs text-gray-600">
              NIM. <span className="font-mono text-gray-800">{selectedStudent?.profile?.nim ?? "-"}</span>
            </div>
          </div>

          {/* 2. Select Semester (KHUSUS HALAMAN KHS) */}
          {showSemesterSelect && availableSemesters.length > 0 && (
            <div className={sectionClass}>
               <p className={labelClass}>Pilih Semester</p>
               <select
                value={selectedSemester}
                onChange={(e) => onSelectSemester && onSelectSemester(Number(e.target.value))}
                className={selectClass}
               >
                 {availableSemesters.map((smt) => (
                   <option key={smt} value={smt}>Semester {smt}</option>
                 ))}
               </select>
            </div>
          )}

          {/* 3. Tanda Tangan */}
          <div className={sectionClass}>
            <p className={labelClass}>Opsi Tanda Tangan</p>
            <select
              value={signatureType}
              onChange={(e) => onSignatureChange(e.target.value as "basah" | "digital" | "none")}
              className={selectClass}
            >
              <option value="none">Tanpa tanda tangan</option>
              <option value="basah">Tanda tangan basah</option>
              <option value="digital">Tanda tangan digital (QR)</option>
            </select>
          </div>

          {/* 4. Tombol Cetak */}
          <div className="pt-1">
            <button
              onClick={onPrint}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3F95] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 active:translate-y-[1px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" />
              </svg>
              Cetak PDF
            </button>
            <div className="mt-2 text-center">
              <p className="text-[10px] text-gray-400 leading-snug">Pastikan pengaturan kertas <b>A4</b> & margin <b>None</b>.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}