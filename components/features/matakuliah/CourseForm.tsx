import React, { useState } from "react";
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
import { CourseCategory } from "@/lib/data";

export interface CourseFormValues {
  kode: string;
  matkul: string;
  sks: number | string;
  smt_default: number | string;
  kategori: CourseCategory | "";
}

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
  // Inisialisasi state mengikuti pola StudentForm (lazy init)
  const [formData, setFormData] = useState<CourseFormValues>(() => {
    if (initialData) {
      return {
        kode: initialData.kode || "",
        matkul: initialData.matkul || "",
        sks: initialData.sks || "",
        smt_default: initialData.smt_default || "",
        kategori: initialData.kategori || ""
      };
    }
    return defaultValues;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormValues, boolean>>>({});

  // --- LOGIKA VALIDASI ---
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    // 1. Validasi Kode MK
    if (!formData.kode) {
      newErrors.kode = true;
      errorMessages.push("Kode Mata Kuliah wajib diisi.");
      isValid = false;
    }

    // 2. Validasi SKS
    const sksVal = parseInt(formData.sks.toString());
    if (formData.sks === "" || formData.sks === undefined) {
      newErrors.sks = true;
      errorMessages.push("SKS wajib diisi.");
      isValid = false;
    } else if (isNaN(sksVal)) {
      newErrors.sks = true;
      errorMessages.push("SKS harus berupa angka.");
      isValid = false;
    }

    // 3. Validasi Semester
    const smtVal = parseInt(formData.smt_default.toString());
    if (formData.smt_default === "" || formData.smt_default === undefined) {
      newErrors.smt_default = true;
      errorMessages.push("Semester wajib diisi.");
      isValid = false;
    } else if (isNaN(smtVal) || smtVal < 1 || smtVal > 14) {
      // Validasi range angka (maksimal 14) dilakukan saat submit
      newErrors.smt_default = true;
      errorMessages.push("Semester harus angka antara 1 - 14.");
      isValid = false;
    }

    // 4. Validasi Nama MK
    if (!formData.matkul) {
      newErrors.matkul = true;
      errorMessages.push("Nama Mata Kuliah wajib diisi.");
      isValid = false;
    }

    // 5. Validasi Kategori
    if (!formData.kategori) {
      newErrors.kategori = true;
      errorMessages.push("Kategori wajib dipilih.");
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error("Validasi Gagal", {
        description: (
          <ul className="list-disc pl-4 mt-1 space-y-1">
            {errorMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        ),
      });
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CourseFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getErrorClass = (isError?: boolean) => 
    isError ? "border-red-500 focus-visible:ring-0 focus-visible:border-red-500" : "";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      {/* Layout Grid Asli: 4 Kolom */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* Kolom 1-2: Kode MK */}
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="kode">Kode MK</Label>
          <Input 
            id="kode" 
            value={formData.kode} 
            onChange={(e) => handleInputChange("kode", e.target.value)} 
            // --- PERUBAHAN: disabled={isEditing} DIHAPUS agar bisa diedit ---
            placeholder="Contoh: TKK-01" 
            className={getErrorClass(errors.kode)}
          />
        </div>

        {/* Kolom 3: SKS (Max 1 Digit) */}
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="sks">SKS</Label>
          <Input 
            id="sks" 
            value={formData.sks} 
            onChange={(e) => {
              const val = e.target.value;
              // Batasi input: hanya angka & max 1 digit
              if (/^\d*$/.test(val) && val.length <= 1) {
                handleInputChange("sks", val);
              }
            }} 
            placeholder="0" 
            className={getErrorClass(errors.sks)}
          />
        </div>

        {/* Kolom 4: Semester (Max 2 Digit) */}
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="smt">Semester</Label>
          <Input 
            id="smt" 
            value={formData.smt_default} 
            onChange={(e) => {
              const val = e.target.value;
              // Batasi input: hanya angka & max 2 digit
              if (/^\d*$/.test(val) && val.length <= 2) {
                handleInputChange("smt_default", val);
              }
            }} 
            placeholder="0" 
            className={getErrorClass(errors.smt_default)}
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
          className={getErrorClass(errors.matkul)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kategori">Kategori</Label>
        <Select 
          value={formData.kategori} 
          onValueChange={(val: CourseCategory) => handleInputChange("kategori", val)}
        >
          <SelectTrigger className={`w-full ${errors.kategori ? "border-red-500 focus:ring-0 focus:border-red-500" : ""}`}>
            <SelectValue placeholder="Pilih Kategori Mata Kuliah" />
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