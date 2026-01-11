import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react"; 
import { StudentFormValues, StudyProgram } from "@/lib/types";

interface StudentFormProps {
  initialData?: StudentFormValues;
  studyPrograms: StudyProgram[]; 
  isEditing: boolean;
  onSubmit: (data: StudentFormValues) => void;
  onCancel: () => void;
}

// Default value
const defaultValues: StudentFormValues = {
  nim: "", 
  nama: "", 
  study_program_id: "", 
  angkatan: new Date().getFullYear(), // Default tahun sekarang
  alamat: "", 
  is_active: true,
  avatar_url: null, // [!code ++] Default null
};

export function StudentForm({ initialData, studyPrograms, isEditing, onSubmit, onCancel }: StudentFormProps) {
  
  const parseInitialData = (data?: StudentFormValues): StudentFormValues => {
    if (!data) return defaultValues;
    return {
      nim: data.nim || "",
      nama: data.nama || "",
      study_program_id: data.study_program_id ? String(data.study_program_id) : "",
      angkatan: data.angkatan ? String(data.angkatan) : new Date().getFullYear().toString(),
      alamat: data.alamat || "",
      is_active: data.is_active ?? true,
      avatar_url: data.avatar_url || null, // [!code ++] Keep avatar_url existing
    };
  };

  const [formData, setFormData] = useState<StudentFormValues>(() => parseInitialData(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormValues, boolean>>>({});

  useEffect(() => {
    setFormData(parseInitialData(initialData));
  }, [initialData]);

  // --- HANDLERS ---
  const handleInputChange = (field: keyof StudentFormValues, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumericInput = (field: keyof StudentFormValues, value: string, maxLength: number) => {
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      handleInputChange(field, value);
    }
  };

  // --- VALIDASI ---
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    // 1. Validasi NIM
    if (!formData.nim) {
      newErrors.nim = true;
      errorMessages.push("NIM wajib diisi.");
    } else if (!/^\d{8}$/.test(formData.nim)) {
      newErrors.nim = true;
      errorMessages.push("NIM harus 8 digit angka.");
    }

    // 2. Validasi Angkatan
    const angkatan = Number(formData.angkatan);
    if (!formData.angkatan) {
      newErrors.angkatan = true;
      errorMessages.push("Tahun Angkatan wajib diisi.");
    } else if (isNaN(angkatan) || angkatan < 2000 || angkatan > 2100) {
      newErrors.angkatan = true;
      errorMessages.push("Tahun Angkatan tidak valid.");
    }

    // 3. Validasi Nama
    if (!formData.nama.trim()) {
      newErrors.nama = true;
      errorMessages.push("Nama wajib diisi.");
    } else if (/\d/.test(formData.nama)) {
      newErrors.nama = true;
      errorMessages.push("Nama tidak boleh mengandung angka.");
    }

    // 4. Lainnya
    if (!formData.study_program_id) { 
      newErrors.study_program_id = true; 
      errorMessages.push("Prodi wajib dipilih."); 
    }

    if (errorMessages.length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Validasi Gagal", {
        description: <ul className="list-disc pl-4">{errorMessages.map((m, i) => <li key={i}>{m}</li>)}</ul>
      });
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const errorClass = (field: keyof StudentFormValues) => 
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      {/* Baris 1: NIM, Status (Edit), & Angkatan */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* NIM */}
        <div className={`grid gap-2 ${isEditing ? "col-span-6" : "col-span-9"}`}>
          <Label htmlFor="nim">
            <span>NIM <span className="text-red-500">*</span></span>
          </Label>
          <div className="relative">
            <Input
              id="nim"
              value={formData.nim}
              onChange={(e) => handleNumericInput("nim", e.target.value, 8)}
              placeholder="Contoh: 4121001"
              className={`${errorClass("nim")} ${isEditing ? "bg-muted text-muted-foreground opacity-100 pr-8" : ""}`}
              disabled={isEditing} 
            />
            {isEditing && (
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Status: Hanya muncul saat Edit */}
        {isEditing && (
          <div className="grid gap-2 col-span-3">
            <Label htmlFor="status">Status</Label>
            <Select 
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(val) => setFormData(prev => ({ ...prev, is_active: val === "active" }))}
            >
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Non-Aktif</SelectItem>
                </SelectContent>
            </Select>
          </div>
        )}

        {/* Angkatan (Dulu Semester) */}
        <div className="grid gap-2 col-span-3">
          <Label htmlFor="angkatan">
            <span>Angkatan <span className="text-red-500">*</span></span>
          </Label>
          <Input
            id="angkatan"
            value={formData.angkatan}
            onChange={(e) => handleNumericInput("angkatan", e.target.value, 4)}
            placeholder="2023"
            className={errorClass("angkatan")}
          />
        </div>
      </div>

      {/* Baris 2: Nama Lengkap */}
      <div className="grid gap-2">
        <Label htmlFor="nama">
          <span>Nama Lengkap <span className="text-red-500">*</span></span>
        </Label>
        <Input
        id="nama"
        value={formData.nama}
        onChange={(e) => handleInputChange("nama", e.target.value)}
        placeholder="Contoh: Budi Santoso"
        className={errorClass("nama")}
        />
      </div>

      {/* Baris 3: Prodi */}
      <div className="grid gap-2"> 
          <Label htmlFor="study_program_id">
            <span>Program Studi <span className="text-red-500">*</span></span>
          </Label>
          <Select 
            value={formData.study_program_id} 
            onValueChange={(v) => handleInputChange("study_program_id", v)}
          >
            <SelectTrigger className={`w-full ${errorClass("study_program_id")}`}>
              <SelectValue placeholder="Pilih Program Studi" />
            </SelectTrigger>
            <SelectContent>
              {studyPrograms.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nama} ({p.jenjang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>

      {/* Baris 4: Alamat */}
      <div className="grid gap-2">
        <Label htmlFor="alamat">Alamat Domisili</Label>
        <Textarea
          id="alamat"
          value={formData.alamat}
          onChange={(e) => handleInputChange("alamat", e.target.value)}
          placeholder="Jl. Perjuangan No. 1, Cirebon"
          className={`min-h-[80px] ${errorClass("alamat")}`}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">{isEditing ? "Simpan Perubahan" : "Tambah Mahasiswa"}</Button>
      </div>
    </form>
  );
}