import React, { useEffect, useState } from "react";
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

export interface StudentFormValues {
  nim: string;
  nama: string;
  prodi: string;
  jenjang: string;
  semester: string | number;
  alamat: string;
}

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultValues);
    }
  }, [initialData]);

  // --- FUNGSI VALIDASI ---
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    // 1. Validasi NIM
    const nimRegex = /^\d{8}$/;
    if (!formData.nim) {
      newErrors.nim = true;
      errorMessages.push("NIM wajib diisi.");
      isValid = false;
    } else if (!nimRegex.test(formData.nim)) {
      newErrors.nim = true;
      errorMessages.push("NIM harus 8 digit angka.");
      isValid = false;
    }

    // 2. Validasi Semester
    const semesterVal = parseInt(formData.semester.toString());
    if (!formData.semester) {
      newErrors.semester = true;
      errorMessages.push("Semester wajib diisi.");
      isValid = false;
    } else if (isNaN(semesterVal) || semesterVal < 1 || semesterVal > 14) {
      newErrors.semester = true;
      errorMessages.push("Semester harus antara 1 sampai 14.");
      isValid = false;
    }

    // 3. Validasi Nama
    const nameHasNumber = /\d/;
    if (!formData.nama) {
      newErrors.nama = true;
      errorMessages.push("Nama wajib diisi.");
      isValid = false;
    } else if (nameHasNumber.test(formData.nama)) {
      newErrors.nama = true;
      errorMessages.push("Nama tidak boleh mengandung angka.");
      isValid = false;
    }

    // 4. Validasi Prodi & Jenjang
    if (!formData.prodi) {
      newErrors.prodi = true;
      errorMessages.push("Program studi wajib dipilih.");
      isValid = false;
    }
    if (!formData.jenjang) {
      newErrors.jenjang = true;
      errorMessages.push("Jenjang wajib dipilih.");
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

  const handleInputChange = (field: keyof StudentFormValues, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Helper class untuk styling error:
  // - border-red-500: Garis tepi merah
  // - focus-visible:ring-0: Menghilangkan ring tebal saat diklik
  // - focus-visible:border-red-500: Memastikan border tetap merah saat diklik (menggantikan border default focus)
  const getErrorClass = (isError?: boolean) => 
    isError ? "border-red-500 focus-visible:ring-0 focus-visible:border-red-500" : "";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      
      {/* Baris 1: NIM & Semester */}
      <div className="grid grid-cols-5 gap-4">
        <div className="grid gap-2 col-span-3">
          <Label htmlFor="nim">NIM</Label>
          <Input
            id="nim"
            value={formData.nim}
            onChange={(e) => {
               const val = e.target.value;
               if (/^\d*$/.test(val) && val.length <= 8) {
                 handleInputChange("nim", val);
               }
            }}
            disabled={isEditing}
            placeholder="Contoh: 4121001"
            className={getErrorClass(errors.nim)}
          />
        </div>

        <div className="grid gap-2 col-span-2">
          <Label htmlFor="semester">Semester</Label>
          <Input
            id="semester"
            type="number"
            min={1}
            max={14}
            value={formData.semester}
            onChange={(e) => {
               const val = e.target.value;
               if (/^\d*$/.test(val) && val.length <= 2) {
                  handleInputChange("semester", val);
               }
            }}
            placeholder="1"
            className={getErrorClass(errors.semester)}
          />
        </div>
      </div>

      {/* Baris 2: Nama Lengkap */}
      <div className="grid gap-2">
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input
          id="nama"
          value={formData.nama}
          onChange={(e) => handleInputChange("nama", e.target.value)}
          placeholder="Contoh: Budi Santoso"
          className={getErrorClass(errors.nama)}
        />
      </div>

      {/* Baris 3: Program Studi & Jenjang */}
      <div className="grid grid-cols-5 gap-4">
        <div className="grid gap-2 col-span-3"> 
          <Label htmlFor="prodi">Program Studi</Label>
          <Select 
            value={formData.prodi} 
            onValueChange={(val) => handleInputChange("prodi", val)}
          >
            <SelectTrigger className={`w-full ${errors.prodi ? "border-red-500 focus:ring-0 focus:border-red-500" : ""}`}>
               <SelectValue placeholder="Pilih Prodi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Teknik Informatika">Teknik Informatika</SelectItem>
              <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
              <SelectItem value="Manajemen Informatika">Manajemen Informatika</SelectItem>
              <SelectItem value="Komputerisasi Akuntansi">Komputerisasi Akuntansi</SelectItem>
              <SelectItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="jenjang">Jenjang</Label>
          <Select 
            value={formData.jenjang} 
            onValueChange={(val) => handleInputChange("jenjang", val)}
          >
            <SelectTrigger className={`w-full ${errors.jenjang ? "border-red-500 focus:ring-0 focus:border-red-500" : ""}`}>
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
          placeholder="Contoh: Jl. Perjuangan No. 1, Cirebon"
          className={`min-h-[80px] ${getErrorClass(errors.alamat)}`} // Terapkan style error juga di sini jika mau
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">{isEditing ? "Simpan Perubahan" : "Tambah Mahasiswa"}</Button>
      </div>
    </form>
  );
}