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
import { StudentFormValues } from "@/lib/types";

interface StudentFormProps {
  initialData?: StudentFormValues;
  isEditing: boolean;
  onSubmit: (data: StudentFormValues) => void;
  onCancel: () => void;
}

const defaultValues: StudentFormValues = {
  nim: "", nama: "", prodi: "", jenjang: "", semester: "", alamat: ""
};

export function StudentForm({ initialData, isEditing, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormValues, boolean>>>({});

  // Reset form saat initialData berubah
  useEffect(() => {
    if (initialData) {
      setFormData({
        nim: initialData.nim || "",
        nama: initialData.nama || "",
        prodi: String(initialData.prodi || "").trim(),
        jenjang: String(initialData.jenjang || "").trim(),
        semester: initialData.semester || "",
        alamat: initialData.alamat || ""
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
    if (!formData.prodi) { newErrors.prodi = true; errorMessages.push("Prodi wajib dipilih."); }
    if (!formData.jenjang) { newErrors.jenjang = true; errorMessages.push("Jenjang wajib dipilih."); }

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
      {/* Baris 1: NIM & Semester */}
      <div className="grid grid-cols-5 gap-4">
        <div className="grid gap-2 col-span-3">
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
        <div className="grid gap-2 col-span-2">
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

      {/* Baris 2: Nama */}
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

      {/* Baris 3: Prodi & Jenjang */}
      <div className="grid grid-cols-5 gap-4">
        <div className="grid gap-2 col-span-3"> 
          <Label htmlFor="prodi">Program Studi</Label>
          <Select value={formData.prodi} onValueChange={(v) => handleInputChange("prodi", v)}>
            <SelectTrigger className={errorClass("prodi")}>
               <SelectValue placeholder="Pilih Prodi" />
            </SelectTrigger>
            <SelectContent>
              {["Teknik Informatika", "Sistem Informasi", "Manajemen Informatika", "Komputerisasi Akuntansi", "Rekayasa Perangkat Lunak"].map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="jenjang">Jenjang</Label>
          <Select value={formData.jenjang} onValueChange={(v) => handleInputChange("jenjang", v)}>
            <SelectTrigger className={errorClass("jenjang")}>
               <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="D3">D3</SelectItem>
              <SelectItem value="S1">S1</SelectItem>
            </SelectContent>
          </Select>
        </div>
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