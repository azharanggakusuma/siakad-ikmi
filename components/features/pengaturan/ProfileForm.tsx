"use client";

import React, { useState, useRef, useCallback } from "react";
import { User, Lock, Save, Info, Camera, Loader2, Check } from "lucide-react"; 
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Library
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage"; 
import imageCompression from "browser-image-compression"; 

import { updateUserSettings } from "@/app/actions/auth";
import { uploadAvatar } from "@/app/actions/upload"; 
import { type UserProfile } from "@/lib/types";
import Image from "next/image"; 

interface ProfileFormProps {
  user: UserProfile | null;
  onUpdateSuccess: (newData: Partial<UserProfile>) => void;
}

export default function ProfileForm({ user, onUpdateSuccess }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Mengganti istilah 'Compressing' jadi 'Processing'
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nama: user?.name || "",
    username: user?.username || "", 
    alamat: user?.alamat || "",
    avatar_url: user?.avatar_url || "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(user?.avatar_url || null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // --- STATE CROPPING ---
  const [imageSrc, setImageSrc] = useState<string | null>(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  if (!user) return null; 

  // --- FUNGSI PEMROSESAN GAMBAR ---
  const processImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,           
      maxWidthOrHeight: 1024,   
      useWebWorker: true,       
      fileType: "image/jpeg",   
      initialQuality: 0.9,      
    };

    try {
      setIsProcessing(true);
      const processedFile = await imageCompression(file, options);
      return new File([processedFile], file.name, { type: processedFile.type });
    } catch (error) {
      console.error("Kesalahan pemrosesan gambar:", error);
      // Tidak perlu toast error di sini, biarkan flow berlanjut dengan file asli atau handle di pemanggil
      return file; 
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Saat user memilih file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validasi Input Awal (Pesan Profesional)
      if (file.size > 20 * 1024 * 1024) { 
         toast.error("Ukuran file terlalu besar", { 
            description: "Mohon unggah foto dengan ukuran di bawah 20MB." 
         });
         return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropModalOpen(true); 
        setZoom(1); 
        setCrop({ x: 0, y: 0 }); 
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 2. Saat User Klik "Gunakan Foto"
  const handleCropSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;

      // a. Crop Gambar
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Gagal memotong gambar.");

      // b. Siapkan File
      const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });

      // c. Proses Optimasi (Silent Process)
      const finalFile = await processImage(croppedFile);

      // d. Simpan ke State
      setFileToUpload(finalFile);

      // e. Update Preview
      const objectUrl = URL.createObjectURL(finalFile);
      setPreviewImage(objectUrl);

      setIsCropModalOpen(false);
      setImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 

      // Pesan Sukses Profesional
      toast.success("Foto berhasil disiapkan", { 
        description: "Silakan klik tombol 'Simpan Perubahan' untuk menerapkan." 
      });

    } catch (e) {
      console.error(e);
      // Pesan Error Profesional
      toast.error("Gagal memproses foto", { 
        description: "Terjadi kesalahan saat mengolah gambar. Silakan coba file lain." 
      });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalAvatarUrl = formData.avatar_url;

      if (fileToUpload) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", fileToUpload);
        uploadFormData.append("username", user.username); 

        finalAvatarUrl = await uploadAvatar(uploadFormData, user.avatar_url);
      }

      await updateUserSettings(user.username, {
        nama: formData.nama,
        username: formData.username,
        alamat: formData.alamat,
        role: user.role,
        avatar_url: finalAvatarUrl, 
      });

      // Pesan Sukses Final
      toast.success("Profil diperbarui", { 
        description: "Data identitas Anda telah berhasil disimpan." 
      });

      onUpdateSuccess({ 
        name: formData.nama, 
        username: formData.username, 
        alamat: formData.alamat,
        avatar_url: finalAvatarUrl
      });
      
      setFileToUpload(null);

    } catch (error: any) {
      // Pesan Error Final
      toast.error("Penyimpanan gagal", { 
        description: error.message || "Terjadi kendala saat menyimpan data. Silakan coba lagi nanti." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* --- MODAL CROPPER --- */}
      <Dialog open={isCropModalOpen} onOpenChange={(open) => !isProcessing && setIsCropModalOpen(open)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sesuaikan Foto</DialogTitle>
            <DialogDescription>
              Geser dan perbesar untuk menyesuaikan tampilan foto profil Anda.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full h-[300px] bg-slate-900 rounded-md overflow-hidden mt-2">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
            
            {/* Loading Overlay Profesional */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-medium">Sedang memproses...</p>
              </div>
            )}
          </div>

          <div className="py-2 space-y-2">
             <div className="flex justify-between text-xs text-slate-500">
                <span>Perbesar</span>
                <span>{zoom.toFixed(1)}x</span>
             </div>
             <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                disabled={isProcessing}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" disabled={isProcessing} onClick={() => setIsCropModalOpen(false)}>
                Batal
            </Button>
            <Button onClick={handleCropSave} disabled={isProcessing} className="gap-2">
                {isProcessing ? "Memproses..." : <><Check size={16} /> Gunakan Foto</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --------------------- */}

      <Card className="flex flex-col h-full shadow-sm border-slate-200">
        <CardHeader className="pb-4 pt-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <CardTitle className="text-lg">Identitas Pengguna</CardTitle>
          </div>
          <CardDescription>Kelola informasi akun dan foto profil Anda.</CardDescription>
        </CardHeader>

        <form onSubmit={handleProfileUpdate} className="flex flex-col flex-1">
          <CardContent className="space-y-6 flex-1">
            
            {/* Bagian Foto Profil */}
            <div className="flex flex-col items-center justify-center gap-4 py-2">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm relative bg-slate-100">
                        {previewImage ? (
                             <Image 
                                src={previewImage} 
                                alt="Foto Profil" 
                                fill 
                                className="object-cover"
                                unoptimized={!!fileToUpload} 
                             />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
                        title="Ubah Foto"
                    >
                        <Camera size={16} />
                    </button>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
                
                {fileToUpload && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full animate-pulse border border-blue-100">
                        Foto baru siap disimpan
                    </span>
                )}
            </div>

            {/* Form Fields Lainnya */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-600">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  disabled={user.role !== "admin"} 
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`pl-3 border-slate-200 ${user.role === "admin" ? "bg-white" : "bg-slate-50 text-slate-500"}`}
                />
                {user.role !== "admin" && (
                  <div className="absolute right-3 top-2.5">
                    <Lock size={14} className="text-slate-400" />
                  </div>
                )}
              </div>
              {user.role === "mahasiswa" && (
                <p className="text-[11px] text-slate-400 italic">*Username dikelola oleh sistem dan tidak dapat diubah.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama" className="text-slate-700">Nama Lengkap</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {user.role === "mahasiswa" && (
                <div className="space-y-2">
                  <Label htmlFor="alamat" className="text-slate-700">Alamat Domisili</Label>
                  <Textarea
                    id="alamat"
                    rows={3}
                    className="resize-none"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                  <div className="flex gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-md text-blue-700 text-xs mt-2">
                      <Info className="shrink-0 mt-0.5" size={16} />
                      <div className="space-y-1">
                          <p className="font-semibold">Informasi Sinkronisasi</p>
                          <p className="opacity-90 leading-relaxed">Perubahan pada Nama dan Alamat akan otomatis memperbarui data induk Mahasiswa.</p>
                      </div>
                  </div>
                </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
            <Button type="submit" disabled={isSaving || isProcessing} className="w-full sm:w-auto ml-auto gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}