import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CourseFormValues } from "@/lib/types";

interface CourseFormProps {
  initialData?: CourseFormValues;
  isEditing: boolean;
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
}

const defaultValues: CourseFormValues = {
  kode: "", matkul: "", sks: "", smt_default: "", kategori: ""
};

export function CourseForm({ initialData, isEditing, onSubmit, onCancel }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormValues, boolean>>>({});

  // Reset form saat modal dibuka kembali
  useEffect(() => {
    if (initialData) {
      setFormData({
        kode: initialData.kode || "",
        matkul: initialData.matkul || "",
        sks: initialData.sks || "",
        smt_default: initialData.smt_default || "",
        kategori: initialData.kategori || ""
      });
    } else {
      setFormData(defaultValues);
    }
  }, [initialData]);

  // --- HANDLERS ---
  const handleInputChange = (field: keyof CourseFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumericInput = (field: keyof CourseFormValues, value: string, maxLength: number) => {
    // Hanya izinkan angka dan batasi panjang karakter
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      handleInputChange(field, value);
    }
  };

  // --- VALIDASI ---
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    if (!formData.kode) {
      newErrors.kode = true;
      errorMessages.push("Kode MK wajib diisi.");
    }

    const sksVal = Number(formData.sks);
    if (!formData.sks || isNaN(sksVal)) {
      newErrors.sks = true;
      errorMessages.push("SKS wajib diisi angka.");
    }

    const smtVal = Number(formData.smt_default);
    if (!formData.smt_default || isNaN(smtVal) || smtVal < 1 || smtVal > 14) {
      newErrors.smt_default = true;
      errorMessages.push("Semester harus angka (1-14).");
    }

    if (!formData.matkul) {
      newErrors.matkul = true;
      errorMessages.push("Nama Mata Kuliah wajib diisi.");
    }

    if (!formData.kategori) {
      newErrors.kategori = true;
      errorMessages.push("Kategori wajib dipilih.");
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

  const errorClass = (field: keyof CourseFormValues) => 
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Kolom Kode MK */}
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="kode">Kode MK</Label>
          <Input 
            id="kode" 
            value={formData.kode} 
            onChange={(e) => handleInputChange("kode", e.target.value)} 
            placeholder="Contoh: TKK-01" 
            className={errorClass("kode")}
          />
        </div>

        {/* Kolom SKS */}
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="sks">SKS</Label>
          <Input 
            id="sks" 
            value={formData.sks} 
            onChange={(e) => handleNumericInput("sks", e.target.value, 1)} 
            placeholder="0" 
            className={errorClass("sks")}
          />
        </div>

        {/* Kolom Semester */}
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="smt">Semester</Label>
          <Input 
            id="smt" 
            value={formData.smt_default} 
            onChange={(e) => handleNumericInput("smt_default", e.target.value, 2)} 
            placeholder="0" 
            className={errorClass("smt_default")}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="matkul">Nama Mata Kuliah</Label>
        <Input 
          id="matkul" 
          value={formData.matkul} 
          onChange={(e) => handleInputChange("matkul", e.target.value)} 
          placeholder="Contoh: Pemrograman Web Lanjut" 
          className={errorClass("matkul")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kategori">Kategori</Label>
        <Select 
          value={formData.kategori} 
          onValueChange={(val) => handleInputChange("kategori", val)}
        >
          <SelectTrigger className={`w-full ${errorClass("kategori")}`}>
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Reguler">Reguler</SelectItem>
            <SelectItem value="MBKM">MBKM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">{isEditing ? "Simpan Perubahan" : "Tambah Mata Kuliah"}</Button>
      </div>
    </form>
  );
}