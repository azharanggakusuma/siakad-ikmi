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
  Trash2, // Import icon Trash
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
import { uploadAvatar, deleteAvatarFile } from "@/app/actions/upload"; // Import deleteAvatarFile
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State untuk loading hapus
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
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // --- STATE CROPPING & VIEW MODAL ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  if (!user) return null;

  // --- LOGIC ---
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
      setIsProcessing(true);
      const processedFile = await imageCompression(file, options);
      return new File([processedFile], file.name, { type: processedFile.type });
    } catch {
      return file;
    } finally {
      setIsProcessing(false);
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

  const handleCropSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Crop failed");
      const finalFile = await processImage(
        new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })
      );
      setFileToUpload(finalFile);
      setPreviewImage(URL.createObjectURL(finalFile));
      setIsCropModalOpen(false);
      setImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Foto Siap", {
        description: "Klik 'Simpan Perubahan' untuk menerapkan.",
      });
    } catch (e) {
      toast.error("Gagal memproses gambar");
    }
  };

  // --- LOGIC HAPUS FOTO ---
  const handleDeletePhoto = async () => {
    // Konfirmasi sederhana
    if (!confirm("Apakah Anda yakin ingin menghapus foto profil ini?")) return;

    setIsDeleting(true);
    try {
      // 1. Jika ada file di storage (bukan file lokal yg belum disave), hapus dari storage
      if (user.avatar_url && !fileToUpload) {
        await deleteAvatarFile(user.avatar_url);
      }

      // 2. Update database user setting avatar_url menjadi null
      // Kita panggil updateUserSettings dengan avatar_url: null
      await updateUserSettings(user.username, {
        nama: formData.nama,
        role: user.role,
        avatar_url: null, // Set null ke database
      });

      // 3. Reset State Lokal
      setPreviewImage(null);
      setFileToUpload(null);
      setFormData({ ...formData, avatar_url: "" });
      
      // 4. Update Parent / Global State
      onUpdateSuccess({
        avatar_url: null,
      });

      toast.success("Foto Dihapus", {
        description: "Foto profil berhasil dihapus.",
      });
      
      setIsViewModalOpen(false); // Tutup modal view
    } catch (error: any) {
      toast.error("Gagal Menghapus", {
        description: handleSystemError(error, "Terjadi kesalahan saat menghapus."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalAvatarUrl = formData.avatar_url;
      
      // Jika ada file baru yang mau diupload
      if (fileToUpload) {
        const fd = new FormData();
        fd.append("file", fileToUpload);
        fd.append("username", user.username);
        // Upload avatar baru (fungsi ini skrg otomatis hapus yg lama jika ada parameter ke-2)
        finalAvatarUrl = await uploadAvatar(fd, user.avatar_url);
      }

      await updateUserSettings(user.username, {
        nama: formData.nama,
        username: formData.username,
        alamat: formData.alamat,
        role: user.role,
        avatar_url: finalAvatarUrl,
      });

      toast.success("Profil Diperbarui", {
        description: "Data Anda berhasil disimpan.",
      });
      
      onUpdateSuccess({
        name: formData.nama,
        username: formData.username,
        alamat: formData.alamat,
        avatar_url: finalAvatarUrl,
      });
      setFileToUpload(null);
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
      {/* --- MODAL VIEW IMAGE FULL SCREEN --- */}
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
                            unoptimized={!!fileToUpload}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                            <User size={120} />
                        </div>
                    )}
                </div>

                {/* Tombol Delete (Kiri Atas) - Hanya muncul jika ada gambar */}
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

                {/* Tombol Close (Kanan Atas) */}
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
                <Loader2 className="animate-spin" />
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
              <Button variant="ghost" onClick={() => setIsCropModalOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleCropSave}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Gunakan Foto
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MAIN CARD --- */}
      <Card className="h-full border-none shadow-xl bg-white rounded-xl ring-1 ring-slate-100 flex flex-col overflow-hidden">
        
        {/* HEADER / BANNER GRADIENT */}
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
              
              {/* Row: Avatar & Tombol */}
              <div className="flex justify-between items-start">
                
                {/* Avatar Wrapper (Stacked) */}
                <div className="-mt-20 sm:-mt-24 relative z-10 group">
                   {/* KLIK PADA FOTO: MEMBUKA MODAL VIEW */}
                   <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[5px] border-white shadow-md overflow-hidden bg-slate-100 relative cursor-pointer"
                        onClick={() => setIsViewModalOpen(true)}>
                      
                      {previewImage ? (
                        <Image src={previewImage} alt="Profile" fill className="object-cover" unoptimized={!!fileToUpload} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                          <User size={64} />
                        </div>
                      )}
                      
                      {/* Hover Overlay: Indikasi View */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white" size={32} />
                      </div>
                   </div>

                   {/* TOMBOL KAMERA KECIL: UPLOAD / GANTI FOTO */}
                   <button
                     type="button"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation(); 
                       fileInputRef.current?.click();
                     }}
                     className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 p-2 rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-white transition-transform hover:scale-105 active:scale-95 z-20 flex items-center justify-center"
                     title="Ganti Foto"
                   >
                     <Camera size={16} />
                   </button>

                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Tombol Simpan (Desktop) */}
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
                
                {/* Tombol Simpan (Mobile Icon) */}
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