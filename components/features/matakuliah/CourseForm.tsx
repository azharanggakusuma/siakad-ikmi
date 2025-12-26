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
import { CourseCategory } from "@/lib/data";

// Definisi tipe data form
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
  const [formData, setFormData] = useState<CourseFormValues>(defaultValues);

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
      <div className="grid grid-cols-4 gap-4">
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="kode">Kode MK</Label>
          <Input 
            id="kode" 
            value={formData.kode} 
            onChange={(e) => setFormData({ ...formData, kode: e.target.value })} 
            disabled={isEditing} 
            placeholder="Contoh: TKK-01" 
            required 
          />
        </div>
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="sks">SKS</Label>
          <Input 
            id="sks" 
            type="number" 
            min={0} 
            max={6} 
            value={formData.sks} 
            onChange={(e) => setFormData({ ...formData, sks: e.target.value })} 
            placeholder="0" 
            required 
          />
        </div>
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="smt">Smt</Label>
          <Input 
            id="smt" 
            type="number" 
            min={1} 
            max={8} 
            value={formData.smt_default} 
            onChange={(e) => setFormData({ ...formData, smt_default: e.target.value })} 
            placeholder="0" 
            required 
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="matkul">Nama Mata Kuliah</Label>
        <Input 
          id="matkul" 
          value={formData.matkul} 
          onChange={(e) => setFormData({ ...formData, matkul: e.target.value })} 
          placeholder="Contoh: Pemrograman Web Lanjut" 
          required 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kategori">Kategori</Label>
        <Select 
          value={formData.kategori} 
          onValueChange={(val: CourseCategory) => setFormData({ ...formData, kategori: val })}
        >
          <SelectTrigger className="w-full">
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