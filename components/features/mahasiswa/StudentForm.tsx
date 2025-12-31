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
import { StudentFormValues, StudyProgram } from "@/lib/types";

interface StudentFormProps {
  initialData?: StudentFormValues;
  studyPrograms: StudyProgram[]; // Menerima data program studi
  isEditing: boolean;
  onSubmit: (data: StudentFormValues) => void;
  onCancel: () => void;
}

const defaultValues: StudentFormValues = {
  nim: "", nama: "", study_program_id: "", semester: "", alamat: "", is_active: true
};

export function StudentForm({ initialData, studyPrograms, isEditing, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormValues, boolean>>>({});

  // Reset form saat initialData berubah
  useEffect(() => {
    if (initialData) {
      setFormData({
        nim: initialData.nim || "",
        nama: initialData.nama || "",
        study_program_id: initialData.study_program_id || "",
        semester: initialData.semester || "",
        alamat: initialData.alamat || "",
        is_active: initialData.is_active ?? true 
      });
    } else {
      setFormData(defaultValues);
    }
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

    // 2. Validasi Semester
    const sem = Number(formData.semester);
    if (!formData.semester) {
      newErrors.semester = true;
      errorMessages.push("Semester wajib diisi.");
    } else if (isNaN(sem) || sem < 1 || sem > 14) {
      newErrors.semester = true;
      errorMessages.push("Semester harus antara 1 - 14.");
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
      {/* Baris 1: NIM, Status (Edit), & Semester */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* NIM: 
            - Edit: 6/12 (50%) 
            - Add:  9/12 (75%) 
        */}
        <div className={`grid gap-2 ${isEditing ? "col-span-6" : "col-span-9"}`}>
          <Label htmlFor="nim">NIM</Label>
          <Input
            id="nim"
            value={formData.nim}
            onChange={(e) => handleNumericInput("nim", e.target.value, 8)}
            placeholder="Contoh: 4121001"
            className={errorClass("nim")}
            disabled={isEditing} 
          />
        </div>

        {/* Status: 3/12 (25%) - Sama dengan Semester, hanya saat Edit */}
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

        {/* Semester: 3/12 (25%) - Ukuran sama dengan Status */}
        <div className="grid gap-2 col-span-3">
          <Label htmlFor="semester">Semester</Label>
          <Input
            id="semester"
            value={formData.semester}
            onChange={(e) => handleNumericInput("semester", e.target.value, 2)}
            placeholder="1"
            className={errorClass("semester")}
          />
        </div>
      </div>

      {/* Baris 2: Nama Lengkap (Full Width) */}
      <div className="grid gap-2">
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input
        id="nama"
        value={formData.nama}
        onChange={(e) => handleInputChange("nama", e.target.value)}
        placeholder="Contoh: Budi Santoso"
        className={errorClass("nama")}
        />
      </div>

      {/* Baris 3: Prodi (Select ID) */}
      <div className="grid gap-2"> 
          <Label htmlFor="study_program_id">Program Studi</Label>
          <Select 
            value={formData.study_program_id} 
            onValueChange={(v) => handleInputChange("study_program_id", v)}
          >
            <SelectTrigger className={`w-full ${errorClass("study_program_id")}`}>
              <SelectValue placeholder="Pilih Program Studi" />
            </SelectTrigger>
            <SelectContent>
              {studyPrograms.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>
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