import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Loader2, GraduationCap } from "lucide-react";
import { CourseFormValues, StudyProgram } from "@/lib/types";
import { useToastMessage } from "@/hooks/use-toast-message";

interface CourseFormProps {
  initialData?: CourseFormValues;
  isEditing: boolean;
  isLoading?: boolean;
  studyPrograms: StudyProgram[];
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
}

const defaultValues: CourseFormValues = {
  kode: "", matkul: "", sks: "", smt_default: "", kategori: "", study_program_ids: []
};

export function CourseForm({ initialData, isEditing, isLoading = false, studyPrograms, onSubmit, onCancel }: CourseFormProps) {
  const { showError } = useToastMessage();

  const parseInitialData = (data?: CourseFormValues): CourseFormValues => {
    if (!data) return defaultValues;
    return {
      kode: data.kode || "",
      matkul: data.matkul || "",
      sks: data.sks ? String(data.sks) : "",
      smt_default: data.smt_default ? String(data.smt_default) : "",
      kategori: data.kategori || "",
      study_program_ids: data.study_program_ids || []
    };
  };

  const [formData, setFormData] = useState<CourseFormValues>(() => parseInitialData(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormValues, boolean>>>({});

  useEffect(() => {
    setFormData(parseInitialData(initialData));
  }, [initialData]);

  useEffect(() => {
    if (formData.kategori === "MBKM") {
      setFormData(prev => ({ ...prev, study_program_ids: [] }));
    }
  }, [formData.kategori]);

  const handleInputChange = (field: keyof CourseFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumericInput = (field: keyof CourseFormValues, value: string, maxLength: number) => {
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      handleInputChange(field, value);
    }
  };

  const handleProdiToggle = (prodiId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentIds = prev.study_program_ids || [];
      if (checked) {
        return { ...prev, study_program_ids: [...currentIds, prodiId] };
      } else {
        return { ...prev, study_program_ids: currentIds.filter(id => id !== prodiId) };
      }
    });
    if (errors.study_program_ids) {
      setErrors((prev) => ({ ...prev, study_program_ids: undefined }));
    }
  };

  const handleSelectAll = () => {
    const allIds = studyPrograms.map(sp => sp.id);
    setFormData(prev => ({ ...prev, study_program_ids: allIds }));
    if (errors.study_program_ids) {
      setErrors((prev) => ({ ...prev, study_program_ids: undefined }));
    }
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({ ...prev, study_program_ids: [] }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormValues, boolean>> = {};
    const errorMessages: string[] = [];

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

    if (formData.kategori === "Reguler" && (!formData.study_program_ids || formData.study_program_ids.length === 0)) {
      newErrors.study_program_ids = true;
      errorMessages.push("Pilih minimal 1 program studi.");
    }

    if (errorMessages.length > 0) {
      setErrors(newErrors);
      showError("Validasi Gagal", errorMessages.join(", "));
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const errorClass = (field: keyof CourseFormValues) => 
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  const isMBKM = formData.kategori === "MBKM";
  const selectedCount = formData.study_program_ids?.length || 0;
  const allSelected = selectedCount === studyPrograms.length && studyPrograms.length > 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="kode">Kode MK</Label>
          <div className="relative">
            <Input 
              id="kode" 
              value={formData.kode} 
              onChange={(e) => handleInputChange("kode", e.target.value)} 
              placeholder="Contoh: TKK-01" 
              className={`${errorClass("kode")} ${isEditing ? "bg-muted text-muted-foreground opacity-100 pr-8" : ""}`}
              disabled={isEditing} 
            />
            {isEditing && (
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

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

      {/* Section Program Studi */}
      {!isMBKM && (
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className={errors.study_program_ids ? "text-red-500" : ""}>
                Program Studi
              </Label>
              {selectedCount > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {selectedCount} dipilih
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={allSelected ? handleDeselectAll : handleSelectAll}
              >
                {allSelected ? "Hapus Semua" : "Pilih Semua"}
              </Button>
            </div>
          </div>
          
          <div className={`rounded-lg border bg-muted/30 ${errors.study_program_ids ? "border-red-500" : "border-border"}`}>
            <div className="grid grid-cols-2 gap-1 p-3 max-h-[140px] overflow-y-auto">
              {studyPrograms.map((prodi) => {
                const isChecked = formData.study_program_ids?.includes(prodi.id) || false;
                return (
                  <label
                    key={prodi.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      isChecked 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={`prodi-${prodi.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleProdiToggle(prodi.id, checked as boolean)}
                    />
                    <span className={`text-sm leading-tight ${isChecked ? "font-medium text-primary" : "text-foreground"}`}>
                      {prodi.nama}
                      <span className="text-muted-foreground ml-1">({prodi.jenjang})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isMBKM && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Mata kuliah <strong>MBKM</strong> otomatis tersedia untuk semua program studi
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
        </Button>
      </div>
    </form>
  );
}