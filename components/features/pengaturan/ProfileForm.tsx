"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  User,
  Save,
  Camera,
  Loader2,
  UserCircle,
  AtSign,
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
import { uploadAvatar } from "@/app/actions/upload";
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

  // --- STATE CROPPING ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalAvatarUrl = formData.avatar_url;
      if (fileToUpload) {
        const fd = new FormData();
        fd.append("file", fileToUpload);
        fd.append("username", user.username);
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
                className="bg-slate-900 hover:bg-slate-800"
              >
                Gunakan Foto
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MAIN CARD --- */}
      <Card className="h-full border-none shadow-xl bg-white rounded-xl ring-1 ring-slate-100 flex flex-col overflow-hidden">
        
        {/* HEADER / BANNER GRADIENT + PATTERN BARU */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#0077b5] to-[#00a0dc] relative shrink-0 overflow-hidden">
          
          {/* Pattern 1: Modern Grid Lines (Lebih Rapi & Teknikal) */}
          <div className="absolute inset-0 opacity-20"
               style={{
                   backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                   backgroundSize: '32px 32px'
               }}
          ></div>

          {/* Pattern 2: Subtle Diagonal Overlay */}
          <div className="absolute inset-0 opacity-10"
               style={{
                   backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)"
               }}
          ></div>
          
          {/* Shadow Overlay (Bottom) untuk kedalaman */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        </div>

        <CardContent className="px-6 pb-8 flex-1">
          <form onSubmit={handleProfileUpdate} className="flex flex-col h-full">
            
            {/* PROFILE SECTION */}
            <div className="relative mb-6">
              
              {/* Row: Avatar & Tombol */}
              <div className="flex justify-between items-start">
                
                {/* Avatar Wrapper (Stacked) */}
                <div className="-mt-16 sm:-mt-20 relative z-10">
                   <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[5px] border-white shadow-md overflow-hidden bg-slate-100 relative group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                      {previewImage ? (
                        <Image src={previewImage} alt="Profile" fill className="object-cover" unoptimized={!!fileToUpload} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                          <User size={64} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white" size={28} />
                      </div>
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Tombol Simpan (Desktop) */}
                <div className="mt-4 hidden sm:block">
                  <Button
                    type="submit"
                    disabled={isSaving || isProcessing}
                    className="bg-slate-900 hover:bg-slate-800 rounded-full px-6 font-semibold"
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
                    <Button size="icon" type="submit" disabled={isSaving} className="rounded-full bg-slate-900">
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
                
                <div className="pt-2 flex flex-wrap gap-2">
                   <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 capitalize">
                      {user.role}
                   </span>
                </div>
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