import React from "react";
import { StudentData } from "@/lib/data";
import { Printer } from "lucide-react"; // Import Icon Printer

interface ControlPanelProps {
  students: StudentData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  signatureType: "basah" | "digital" | "none";
  onSignatureChange: (type: "basah" | "digital" | "none") => void;
  onPrint: () => void;
  
  // Props KHS
  showSemesterSelect?: boolean;
  availableSemesters?: number[];
  selectedSemester?: number;
  onSelectSemester?: (smt: number) => void;

  // Props Data Manual untuk Surat
  nomorSurat?: string; setNomorSurat?: (val: string) => void;
  tahunAkademik?: string; setTahunAkademik?: (val: string) => void;
  tempatLahir?: string; setTempatLahir?: (val: string) => void;
  tanggalLahir?: string; setTanggalLahir?: (val: string) => void;
  alamat?: string; setAlamat?: (val: string) => void;
  namaOrangTua?: string; setNamaOrangTua?: (val: string) => void;
  pekerjaanOrangTua?: string; setPekerjaanOrangTua?: (val: string) => void;
  
  totalPages?: number;
}

export default function ControlPanel(props: ControlPanelProps) {
  const { students, selectedIndex, onSelect, signatureType, onSignatureChange, onPrint, totalPages } = props;
  
  const labelClass = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider";
  const selectClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-[#1B3F95]/30 focus:border-[#1B3F95] hover:border-gray-300";
  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition focus:ring-2 focus:ring-[#1B3F95]/30 focus:border-[#1B3F95] hover:border-gray-300";
  const sectionClass = "flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3";

  return (
    <aside className="w-full print:hidden xl:sticky xl:top-24 h-fit">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-5 pt-5 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Panel Kontrol</h3>
            <p className="mt-1 text-xs text-gray-500">Atur opsi dokumen, lalu cetak.</p>
          </div>
          {totalPages !== undefined && (
            <div className={`px-2 py-1 rounded-xl text-[10px] font-bold border ${
              totalPages > 1 
                ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {totalPages} Hal.
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-4">
          
          {/* Pilih Mahasiswa */}
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
          </div>

          {/* Pilih Semester (KHS) */}
          {props.showSemesterSelect && (
            <div className={sectionClass}>
              <div className="flex items-baseline justify-between">
                <p className={labelClass}>Semester</p>
                <p className="text-[11px] text-gray-400">Pilih Smt</p>
              </div>
              <select
                value={props.selectedSemester}
                onChange={(e) => props.onSelectSemester?.(Number(e.target.value))}
                className={selectClass}
              >
                {props.availableSemesters?.map((smt) => (
                  <option key={smt} value={smt}>
                    Semester {smt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Input Manual Surat */}
          {props.setNomorSurat && (
            <div className={sectionClass}>
              <p className={labelClass}>Detail Surat</p>
              <div className="space-y-2">
                  <input type="text" value={props.nomorSurat} onChange={(e) => props.setNomorSurat?.(e.target.value)} className={inputClass} placeholder="No Surat (Contoh: 125)" />
                  <input type="text" value={props.tahunAkademik} onChange={(e) => props.setTahunAkademik?.(e.target.value)} className={inputClass} placeholder="Tahun Akademik" />
              </div>
            </div>
          )}

          {/* Biodata Manual */}
          {props.setTempatLahir && (
             <div className={sectionClass}>
              <p className={labelClass}>Biodata</p>
              <div className="grid grid-cols-2 gap-2">
                 <input type="text" value={props.tempatLahir} onChange={(e) => props.setTempatLahir?.(e.target.value)} className={inputClass} placeholder="Tempat Lahir" />
                 <input type="text" value={props.tanggalLahir} onChange={(e) => props.setTanggalLahir?.(e.target.value)} className={inputClass} placeholder="Tgl Lahir" />
              </div>
              <textarea value={props.alamat} onChange={(e) => props.setAlamat?.(e.target.value)} className={`${inputClass} h-16 resize-none leading-tight`} placeholder="Alamat Lengkap" />
            </div>
          )}
          
          {props.setNamaOrangTua && (
            <div className={sectionClass}>
              <p className={labelClass}>Data Orang Tua</p>
              <div className="space-y-2">
                <input type="text" value={props.namaOrangTua} onChange={(e) => props.setNamaOrangTua?.(e.target.value)} className={inputClass} placeholder="Nama Ayah/Ibu" />
                <input type="text" value={props.pekerjaanOrangTua} onChange={(e) => props.setPekerjaanOrangTua?.(e.target.value)} className={inputClass} placeholder="Pekerjaan" />
              </div>
            </div>
          )}

          {/* Tanda Tangan */}
          <div className={sectionClass}>
            <p className={labelClass}>Tanda Tangan</p>
            <select
              value={signatureType}
              onChange={(e) => onSignatureChange(e.target.value as any)}
              className={selectClass}
            >
              <option value="none">Tanpa tanda tangan</option>
              <option value="basah">Tanda tangan basah</option>
              <option value="digital">Tanda tangan digital (QR)</option>
            </select>
          </div>

          <button onClick={onPrint} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3F95] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 active:translate-y-[1px]" > 
             <Printer className="h-4 w-4" /> {/* Icon Printer Ditambahkan */}
             Cetak PDF 
          </button> 
          
          <div className="text-center"> 
            <p className="text-[10px] text-gray-400 leading-snug">Pastikan pengaturan kertas <b>A4</b> & margin <b>None</b>.</p> 
          </div>
        </div>
      </div>
    </aside>
  );
}