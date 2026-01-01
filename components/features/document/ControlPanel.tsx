import React from "react";
import { StudentData } from "@/lib/types";
import { Printer } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  
  // Style asli dipertahankan
  const labelClass = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block";
  const sectionClass = "flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3";

  return (
    <aside className="w-full print:hidden xl:sticky xl:top-24 h-fit">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
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
              <label className={labelClass}>Mahasiswa</label>
              <p className="text-[11px] text-gray-400">{selectedIndex + 1}/{students.length}</p>
            </div>
            <Select 
              value={String(selectedIndex)} 
              onValueChange={(val) => onSelect(Number(val))}
            >
              <SelectTrigger className="w-full h-9 bg-white text-xs rounded-xl border-gray-200">
                <SelectValue placeholder="Pilih Mahasiswa" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {students.map((student, index) => (
                  <SelectItem key={student.id} value={String(index)} className="text-xs rounded-lg cursor-pointer">
                    {student.profile.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pilih Semester (KHS) */}
          {props.showSemesterSelect && (
            <div className={sectionClass}>
              <div className="flex items-baseline justify-between">
                <label className={labelClass}>Semester</label>
                <p className="text-[11px] text-gray-400">Pilih Smt</p>
              </div>
              <Select
                value={String(props.selectedSemester)}
                onValueChange={(val) => props.onSelectSemester?.(Number(val))}
              >
                <SelectTrigger className="w-full h-9 bg-white text-xs rounded-xl border-gray-200">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {props.availableSemesters?.map((smt) => (
                    <SelectItem key={smt} value={String(smt)} className="text-xs rounded-lg cursor-pointer">
                      Semester {smt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Input Manual Surat */}
          {props.setNomorSurat && (
            <div className={sectionClass}>
              <label className={labelClass}>Detail Surat</label>
              <div className="space-y-2">
                  <Input 
                    type="text" 
                    value={props.nomorSurat} 
                    onChange={(e) => props.setNomorSurat?.(e.target.value)} 
                    className="h-9 bg-white text-xs rounded-xl border-gray-200" 
                    placeholder="No Surat (Contoh: 125)" 
                  />
                  <Input 
                    type="text" 
                    value={props.tahunAkademik} 
                    onChange={(e) => props.setTahunAkademik?.(e.target.value)} 
                    className="h-9 bg-white text-xs rounded-xl border-gray-200" 
                    placeholder="Tahun Akademik" 
                  />
              </div>
            </div>
          )}

          {/* Biodata Manual */}
          {props.setTempatLahir && (
             <div className={sectionClass}>
              <label className={labelClass}>Biodata</label>
              <div className="grid grid-cols-2 gap-2">
                 <Input 
                   type="text" 
                   value={props.tempatLahir} 
                   onChange={(e) => props.setTempatLahir?.(e.target.value)} 
                   className="h-9 bg-white text-xs rounded-xl border-gray-200" 
                   placeholder="Tempat Lahir" 
                 />
                 <Input 
                   type="text" 
                   value={props.tanggalLahir} 
                   onChange={(e) => props.setTanggalLahir?.(e.target.value)} 
                   className="h-9 bg-white text-xs rounded-xl border-gray-200" 
                   placeholder="Tgl Lahir" 
                 />
              </div>
              <Textarea 
                value={props.alamat} 
                onChange={(e) => props.setAlamat?.(e.target.value)} 
                className="bg-white min-h-[60px] text-xs resize-none rounded-xl border-gray-200" 
                placeholder="Alamat Lengkap" 
              />
            </div>
          )}
          
          {/* Data Orang Tua */}
          {props.setNamaOrangTua && (
            <div className={sectionClass}>
              <label className={labelClass}>Data Orang Tua</label>
              <div className="space-y-2">
                <Input 
                  type="text" 
                  value={props.namaOrangTua} 
                  onChange={(e) => props.setNamaOrangTua?.(e.target.value)} 
                  className="h-9 bg-white text-xs rounded-xl border-gray-200" 
                  placeholder="Nama Ayah/Ibu" 
                />
                <Input 
                  type="text" 
                  value={props.pekerjaanOrangTua} 
                  onChange={(e) => props.setPekerjaanOrangTua?.(e.target.value)} 
                  className="h-9 bg-white text-xs rounded-xl border-gray-200" 
                  placeholder="Pekerjaan" 
                />
              </div>
            </div>
          )}

          {/* Tanda Tangan */}
          <div className={sectionClass}>
            <label className={labelClass}>Tanda Tangan</label>
            <Select
              value={signatureType}
              onValueChange={(val: any) => onSignatureChange(val)}
            >
              <SelectTrigger className="w-full h-9 bg-white text-xs rounded-xl border-gray-200">
                <SelectValue placeholder="Pilih Tipe TTD" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none" className="text-xs rounded-lg cursor-pointer">Tanpa tanda tangan</SelectItem>
                <SelectItem value="basah" className="text-xs rounded-lg cursor-pointer">Tanda tangan basah</SelectItem>
                <SelectItem value="digital" className="text-xs rounded-lg cursor-pointer">Tanda tangan digital (QR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={onPrint} 
            className="w-full bg-[#1B3F95] hover:bg-blue-900 h-11 text-sm font-semibold shadow-sm rounded-xl"
          > 
             <Printer className="mr-2 h-4 w-4" />
             Cetak PDF 
          </Button> 
          
          <div className="text-center"> 
            <p className="text-[10px] text-gray-400 leading-snug">Pastikan pengaturan kertas <b>A4</b> & margin <b>None</b>.</p> 
          </div>
        </div>
      </div>
    </aside>
  );
}