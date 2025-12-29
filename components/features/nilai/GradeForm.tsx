"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GradeFormValues } from "@/lib/types";

interface GradeFormProps {
  initialData?: GradeFormValues;
  isEditing: boolean;
  onSubmit: (values: GradeFormValues) => void;
  onCancel: () => void;
  studentsList: any[]; // List mahasiswa untuk dropdown
  coursesList: any[];  // List matkul untuk dropdown
}

export function GradeForm({
  initialData,
  isEditing,
  onSubmit,
  onCancel,
  studentsList,
  coursesList
}: GradeFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<GradeFormValues>({
    defaultValues: initialData || {
      student_id: "",
      course_id: "",
      hm: "",
    },
  });

  // Untuk handle Select shadcn (perlu manual set value karena UI component)
  const setStudent = (val: string) => setValue("student_id", val);
  const setCourse = (val: string) => setValue("course_id", val);
  const setHM = (val: string) => setValue("hm", val);

  // Watch values for Select components
  const selectedStudent = watch("student_id");
  const selectedCourse = watch("course_id");
  const selectedHM = watch("hm");

  // Pilihan Huruf Mutu
  const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "D", "E"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* Pilih Mahasiswa */}
      <div className="space-y-2">
        <Label>Mahasiswa</Label>
        <Select onValueChange={setStudent} defaultValue={initialData?.student_id}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Mahasiswa" />
          </SelectTrigger>
          <SelectContent>
            {studentsList.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.nim} - {s.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Hidden input agar tetap ter-register di react-hook-form jika diperlukan validasi ketat */}
        <input type="hidden" {...register("student_id", { required: true })} />
        {errors.student_id && <span className="text-xs text-red-500">Mahasiswa wajib dipilih</span>}
      </div>

      {/* Pilih Mata Kuliah */}
      <div className="space-y-2">
        <Label>Mata Kuliah</Label>
        <Select onValueChange={setCourse} defaultValue={initialData?.course_id}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Mata Kuliah" />
          </SelectTrigger>
          <SelectContent>
            {coursesList.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.kode} - {c.matkul}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" {...register("course_id", { required: true })} />
        {errors.course_id && <span className="text-xs text-red-500">Mata kuliah wajib dipilih</span>}
      </div>

      {/* Input Nilai Huruf */}
      <div className="space-y-2">
        <Label>Nilai Huruf (HM)</Label>
        <Select onValueChange={setHM} defaultValue={initialData?.hm}>
            <SelectTrigger>
                <SelectValue placeholder="Pilih Nilai" />
            </SelectTrigger>
            <SelectContent>
                {gradeOptions.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <input type="hidden" {...register("hm", { required: true })} />
        {errors.hm && <span className="text-xs text-red-500">Nilai wajib diisi</span>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : isEditing ? "Update Nilai" : "Simpan Nilai"}
        </Button>
      </div>
    </form>
  );
}