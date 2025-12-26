import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultValues);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      
      {/* Baris 1: NIM & Semester */}
      <div className="grid grid-cols-5 gap-4">
        <div className="grid gap-2 col-span-3">
          <Label htmlFor="nim">NIM</Label>
          <Input
            id="nim"
            value={formData.nim}
            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            disabled={isEditing}
            placeholder="Contoh: 4121001"
            required
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
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            placeholder="1"
            required
          />
        </div>
      </div>

      {/* Baris 2: Nama Lengkap */}
      <div className="grid gap-2">
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input
          id="nama"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          placeholder="Contoh: Budi Santoso"
          required
        />
      </div>

      {/* Baris 3: Program Studi & Jenjang (KEMBALI KE SAMPING-SAMPINGAN) */}
      {/* Menggunakan grid-cols-5 agar pembagiannya 60% (Prodi) : 40% (Jenjang) */}
      <div className="grid grid-cols-5 gap-4">
        <div className="grid gap-2 col-span-3"> {/* Lebar 3 bagian */}
          <Label htmlFor="prodi">Program Studi</Label>
          <Select value={formData.prodi} onValueChange={(val) => setFormData({ ...formData, prodi: val })}>
            <SelectTrigger className="w-full">
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
        
        <div className="grid gap-2 col-span-2"> {/* Lebar 2 bagian (Lebih lebar dari sebelumnya) */}
          <Label htmlFor="jenjang">Jenjang</Label>
          <Select value={formData.jenjang} onValueChange={(val) => setFormData({ ...formData, jenjang: val })}>
            <SelectTrigger className="w-full">
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
        <Input
          id="alamat"
          value={formData.alamat}
          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          placeholder="Contoh: Jl. Perjuangan No. 1, Cirebon"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">{isEditing ? "Simpan Perubahan" : "Tambah Mahasiswa"}</Button>
      </div>
    </form>
  );
}