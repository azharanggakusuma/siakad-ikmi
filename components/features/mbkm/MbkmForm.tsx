'use client'

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { StudentMBKMFormValues, StudentData, AcademicYear } from "@/lib/types";

interface MbkmFormProps {
  initialData?: StudentMBKMFormValues;
  students: StudentData[];
  academicYears: AcademicYear[];
  isEditing: boolean;
  onSubmit: (data: StudentMBKMFormValues) => void;
  onCancel: () => void;
}

const defaultValues: StudentMBKMFormValues = {
  student_id: "",
  academic_year_id: "",
  jenis_mbkm: "",
  mitra: "",
  keterangan: ""
};

const JENIS_MBKM = [
  "Magang Bersertifikat",
  "Studi Independen",
  "Kampus Mengajar",
  "Pertukaran Mahasiswa Merdeka",
  "Wirausaha Merdeka",
  "Penelitian / Riset",
  "Proyek Kemanusiaan",
  "KKN Tematik"
];

export function MbkmForm({ 
  initialData, 
  students, 
  academicYears, 
  isEditing, 
  onSubmit, 
  onCancel 
}: MbkmFormProps) {

  const [formData, setFormData] = useState<StudentMBKMFormValues>(initialData || defaultValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.academic_year_id || !formData.jenis_mbkm) {
        toast.error("Mohon lengkapi data wajib (Mahasiswa, Periode, Jenis).");
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      
      {/* Pilih Mahasiswa */}
      <div className="grid gap-2">
        <Label>Mahasiswa</Label>
        <Select 
            value={formData.student_id} 
            onValueChange={(val) => setFormData({...formData, student_id: val})}
            disabled={isEditing} // Biasanya ID tidak diedit saat update
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Mahasiswa" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.profile.nim} - {s.profile.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pilih Periode Akademik */}
      <div className="grid gap-2">
        <Label>Periode Akademik</Label>
        <Select 
            value={formData.academic_year_id} 
            onValueChange={(val) => setFormData({...formData, academic_year_id: val})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Tahun Akademik" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((ay) => (
              <SelectItem key={ay.id} value={ay.id}>
                {ay.nama} - {ay.semester} {ay.is_active ? "(Aktif)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jenis MBKM */}
      <div className="grid gap-2">
        <Label>Jenis MBKM</Label>
        <Select 
            value={formData.jenis_mbkm} 
            onValueChange={(val) => setFormData({...formData, jenis_mbkm: val})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Jenis Program" />
          </SelectTrigger>
          <SelectContent>
            {JENIS_MBKM.map((j) => (
              <SelectItem key={j} value={j}>{j}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mitra */}
      <div className="grid gap-2">
        <Label>Nama Mitra / Perusahaan</Label>
        <Input 
          value={formData.mitra}
          onChange={(e) => setFormData({...formData, mitra: e.target.value})}
          placeholder="Contoh: PT. Telkom Indonesia"
          required
        />
      </div>

      {/* Keterangan */}
      <div className="grid gap-2">
        <Label>Keterangan (Opsional)</Label>
        <Textarea 
          value={formData.keterangan}
          onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
          placeholder="Catatan tambahan..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  );
}