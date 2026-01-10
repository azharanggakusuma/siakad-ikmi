"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  User,
  Save,
  Camera,
  Loader2,
  UserCircle,
  AtSign,
  X,
  Maximize2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Library
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import imageCompression from "browser-image-compression";

import { updateUserSettings } from "@/app/actions/auth";
import { uploadAvatar, deleteAvatarFile } from "@/app/actions/upload";
import { type UserProfile } from "@/lib/types";
import Image from "next/image";

interface ProfileFormProps {
  user: UserProfile | null;
  onUpdateSuccess: (newData: Partial<UserProfile>) => void;
}

export default function ProfileForm({
  user,
  onUpdateSuccess,
}: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Loading saat crop/upload
  const [isDeleting, setIsDeleting] = useState(false);     // Loading saat hapus
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nama: user?.name || "",
    username: user?.username || "",
    alamat: user?.alamat || "",
    avatar_url: user?.avatar_url || "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.avatar_url || null
  );
  
  // Kita HAPUS state `fileToUpload` karena sekarang langsung upload

  // --- STATE CROPPING & VIEW MODAL ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  if (!user) return null;

  // --- LOGIC HELPER ---
  const handleSystemError = (error: any, defaultMsg: string) => {
    console.error("System Error:", error);
    let userMessage = defaultMsg;
    const msg = error?.message?.toLowerCase() || "";
    if (msg.includes("limit") || msg.includes("size"))
      userMessage = "Ukuran berkas melebihi batas.";
    else if (msg.includes("network"))
      userMessage = "Gagal terhubung ke server.";
    return userMessage;
  };

  const processImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.9,
    };
    try {
      // Note: isProcessing di-handle di parent caller (handleAutoUpload)
      const processedFile = await imageCompression(file, options);
      return new File([processedFile], file.name, { type: processedFile.type });
    } catch {
      return file;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Berkas terlalu besar");
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

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // --- FUNGSI BARU: AUTO UPLOAD ---
  const handleAutoUpload = async (file: File) => {
    setIsProcessing(true);
    try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("username", user.username);

        // 1. Upload ke Storage (Otomatis hapus yg lama jika ada di formData.avatar_url)
        // Gunakan formData.avatar_url sebagai referensi oldUrl agar jika user upload berkali-kali tanpa refresh, file lama tetap terhapus
        const newAvatarUrl = await uploadAvatar(fd, formData.avatar_url);

        // 2. Update URL di Database User
        await updateUserSettings(user.username, {
            avatar_url: newAvatarUrl
            // Kita hanya update avatar_url, data lain biarkan user simpan manual
        });

        // 3. Update State Lokal & Parent
        setPreviewImage(newAvatarUrl);
        setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
        onUpdateSuccess({ avatar_url: newAvatarUrl });

        toast.success("Foto Diperbarui", { 
            description: "Foto profil baru berhasil disimpan." 
        });

        // 4. Cleanup
        setIsCropModalOpen(false);
        setImageSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (e: any) {
        toast.error("Gagal Upload", { 
            description: handleSystemError(e, "Gagal mengunggah foto.") 
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCropSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      
      // Mulai loading processing crop
      setIsProcessing(true);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Crop failed");
      
      const finalFile = await processImage(
        new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })
      );

      // LANGSUNG UPLOAD
      await handleAutoUpload(finalFile);

    } catch (e) {
      toast.error("Gagal memproses gambar");
      setIsProcessing(false); // Matikan loading jika error di tahap crop
    }
  };

  // --- LOGIC HAPUS FOTO (SAMA SEPERTI SEBELUMNYA) ---
  const handleDeletePhoto = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto profil ini?")) return;

    setIsDeleting(true);
    try {
      if (formData.avatar_url) {
        await deleteAvatarFile(formData.avatar_url);
      }

      await updateUserSettings(user.username, {
        nama: formData.nama,
        role: user.role,
        avatar_url: null,
      });

      setPreviewImage(null);
      setFormData({ ...formData, avatar_url: "" });
      onUpdateSuccess({ avatar_url: null });

      toast.success("Foto Dihapus", { description: "Foto profil berhasil dihapus." });
      setIsViewModalOpen(false);
    } catch (error: any) {
      toast.error("Gagal Menghapus", {
        description: handleSystemError(error, "Terjadi kesalahan saat menghapus."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- SIMPAN MANUAL (HANYA TEKS) ---
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Di sini kita HAPUS logika uploadAvatar karena sudah otomatis
      await updateUserSettings(user.username, {
        nama: formData.nama,
        username: formData.username,
        alamat: formData.alamat,
        role: user.role,
        // avatar_url tidak perlu dikirim lagi karena sudah di-update di handleAutoUpload
      });

      toast.success("Profil Diperbarui", {
        description: "Data teks berhasil disimpan.",
      });
      
      onUpdateSuccess({
        name: formData.nama,
        username: formData.username,
        alamat: formData.alamat,
      });
    } catch (error: any) {
      toast.error("Gagal Menyimpan", {
        description: handleSystemError(error, "Terjadi kesalahan."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* --- MODAL VIEW IMAGE --- */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent 
          className="p-0 bg-transparent border-none shadow-none max-w-fit flex items-center justify-center overflow-hidden"
          showCloseButton={false} 
        >
            <DialogTitle className="sr-only">Lihat Foto Profil</DialogTitle>

            <div className="relative group">
                <div className="relative w-[80vw] h-[80vw] sm:w-[500px] sm:h-[500px] rounded-xl overflow-hidden bg-black">
                    {previewImage ? (
                        <Image 
                            src={previewImage} 
                            alt="Full Avatar" 
                            fill 
                            className="object-cover"
                            // Unoptimized tidak wajib jika URL berubah (unique timestamp), tapi boleh dibiarkan untuk aman
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                            <User size={120} />
                        </div>
                    )}
                </div>

                {previewImage && (
                  <Button
                      onClick={handleDeletePhoto}
                      disabled={isDeleting}
                      className="absolute top-3 left-3 rounded-full w-8 h-8 p-0 bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-md transition-all z-50 border-none shadow-sm"
                      title="Hapus Foto"
                  >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </Button>
                )}

                <Button
                    onClick={() => setIsViewModalOpen(false)}
                    className="absolute top-3 right-3 rounded-full w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all z-50 border-none"
                    title="Tutup"
                >
                    <X size={16} />
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL CROP --- */}
      <Dialog
        open={isCropModalOpen}
        onOpenChange={(open) => !isProcessing && setIsCropModalOpen(open)}
      >
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 bg-slate-50 border-b">
            <DialogTitle>Sesuaikan Foto</DialogTitle>
            <DialogDescription>
              Geser dan zoom untuk hasil terbaik.
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[300px] bg-black">
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
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="text-sm font-medium">Mengunggah...</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-slate-900"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCropModalOpen(false)} disabled={isProcessing}>
                Batal
              </Button>
              <Button
                onClick={handleCropSave}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isProcessing ? "Menyimpan..." : "Gunakan Foto"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MAIN CARD --- */}
      <Card className="h-full border-none shadow-xl bg-white rounded-xl ring-1 ring-slate-100 flex flex-col overflow-hidden">
        
        {/* HEADER / BANNER */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#0077b5] to-[#00a0dc] relative shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20"
               style={{
                   backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                   backgroundSize: '32px 32px'
               }}
          ></div>
          <div className="absolute inset-0 opacity-10"
               style={{
                   backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)"
               }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        </div>

        <CardContent className="px-6 pb-8 flex-1">
          <form onSubmit={handleProfileUpdate} className="flex flex-col h-full">
            
            {/* PROFILE SECTION */}
            <div className="relative mb-6">
              
              <div className="flex justify-between items-start">
                
                {/* Avatar Wrapper */}
                <div className="-mt-20 sm:-mt-24 relative z-10 group">
                   <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[5px] border-white shadow-md overflow-hidden bg-slate-100 relative cursor-pointer"
                        onClick={() => setIsViewModalOpen(true)}>
                      
                      {previewImage ? (
                        <Image src={previewImage} alt="Profile" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                          <User size={64} />
                        </div>
                      )}
                      
                      {/* Indikator Loading di Avatar jika sedang upload (optional feedback) */}
                      {isProcessing && !isCropModalOpen && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                             <Loader2 className="text-white animate-spin" />
                         </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white" size={32} />
                      </div>
                   </div>

                   {/* TOMBOL UPLOAD */}
                   <button
                     type="button"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation(); 
                       if(!isProcessing) fileInputRef.current?.click();
                     }}
                     disabled={isProcessing}
                     className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 p-2 rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-white transition-transform hover:scale-105 active:scale-95 z-20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                     title="Ganti Foto"
                   >
                     {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                   </button>

                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Tombol Simpan Teks (Desktop) */}
                <div className="mt-4 hidden sm:block">
                  <Button
                    type="submit"
                    disabled={isSaving || isProcessing}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-semibold"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <Save size={16} className="mr-2" />
                    )}
                    Simpan Perubahan
                  </Button>
                </div>
                
                {/* Tombol Simpan Teks (Mobile) */}
                <div className="mt-4 sm:hidden">
                    <Button size="icon" type="submit" disabled={isSaving} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Save size={18} />
                    </Button>
                </div>

              </div>

              {/* Nama & Info */}
              <div className="mt-4 text-left space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  {formData.nama || "Pengguna"}
                </h2>
                <p className="text-slate-500 font-medium text-base">@{formData.username}</p>
              </div>

            </div>

            <Separator className="mb-8" />

            {/* FORM INPUTS */}
            <div className="space-y-6 max-w-3xl">
              <div className="grid md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
                  <div className="relative">
                    <AtSign size={16} className="absolute left-3 top-3 text-slate-400" />
                    <Input
                        id="username"
                        value={formData.username}
                        disabled={user.role !== "admin"} 
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all h-11"
                    />
                  </div>
                  {user.role !== "admin" && (
                    <p className="text-[11px] text-slate-400">Hubungi admin untuk mengubah username.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-slate-700 font-medium">Nama Lengkap</Label>
                  <div className="relative">
                    <UserCircle size={16} className="absolute left-3 top-3 text-slate-400" />
                    <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all h-11"
                    />
                  </div>
                </div>
              </div>

              {user.role === "mahasiswa" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label htmlFor="alamat" className="text-slate-700 font-medium">Alamat Domisili</Label>
                  <Textarea
                    id="alamat"
                    rows={3}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="bg-slate-50 border-slate-200 focus:bg-white resize-none transition-all"
                    placeholder="Masukkan alamat lengkap..."
                  />
                </div>
              )}
            </div>

          </form>
        </CardContent>
      </Card>
    </>
  );
}