"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LecturerFormValues } from "@/lib/types";
import { Loader2, Upload, User } from "lucide-react";
import Image from "next/image";
import { uploadAvatar } from "@/app/actions/upload"; // We can reuse this client-side or use server action wrapper if complex

interface LecturerFormProps {
  initialData?: LecturerFormValues;
  onSubmit: (data: LecturerFormValues) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function LecturerForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
}: LecturerFormProps) {
  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<LecturerFormValues>({
    defaultValues: {
      nidn: "",
      nama: "",
      email: "",
      phone: "",
      is_active: true,
      avatar_url: null,
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("nidn", initialData.nidn);
      setValue("nama", initialData.nama);
      setValue("email", initialData.email);
      setValue("phone", initialData.phone);
      setValue("is_active", initialData.is_active);
      setValue("avatar_url", initialData.avatar_url);
      setPreviewAvatar(initialData.avatar_url || null);
    } else {
      reset();
      setPreviewAvatar(null);
    }
  }, [initialData, reset, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = async (data: LecturerFormValues) => {
    setLoading(true);
    try {
        let finalAvatarUrl = data.avatar_url;

        // Jika ada file baru, upload dulu
        if (avatarFile) {
            // Kita gunakan formData untuk upload lewat server action 'upload.ts' / create helper wrapper
            // Namun 'uploadAvatar' di actions/upload.ts sepertinya butuh FormData? 
            // Mari kita cek 'upload.ts' usage pattern. Biasanya uploadAvatar(formData).
            
            const formData = new FormData();
            formData.append("file", avatarFile);
            
            // Asumsi kita punya action uploadAvatar yang return string url
            finalAvatarUrl = await uploadAvatar(formData); 
        }

        const payload = { ...data, avatar_url: finalAvatarUrl };
        await onSubmit(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 py-4">
      <div className="flex gap-6">
          {/* KOLOM KIRI: FOTO */}
          <div className="w-1/3 flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                {previewAvatar ? (
                    <Image 
                        src={previewAvatar} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                    />
                ) : (
                    <User className="w-12 h-12 text-slate-400" />
                )}
            </div>
            
            <div>
                <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center gap-2 text-xs font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Foto
                </Label>
                <Input 
                    id="avatar" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
            </div>
          </div>

          {/* KOLOM KANAN: INPUT DATA */}
          <div className="w-2/3 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input
                    id="nama"
                    placeholder="Contoh: Budi Santoso, M.Kom"
                    {...register("nama", { required: true })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="nidn">NIDN</Label>
                <Input
                    id="nidn"
                    placeholder="Nomor Induk Dosen Nasional"
                    {...register("nidn")}
                />
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="email@ikmi.ac.id"
                        {...register("email")}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                        id="phone"
                        placeholder="08..."
                        {...register("phone")}
                    />
                </div>
             </div>

             {/* STATUS (Hanya muncul saat Edit) */}
             {isEditing && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="is_active">Status Aktif</Label>
                   <Select
                      value={watch("is_active") ? "active" : "inactive"}
                      onValueChange={(val) => setValue("is_active", val === "active")}
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
          </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Tambah Dosen"}
        </Button>
      </div>
    </form>
  );
}
