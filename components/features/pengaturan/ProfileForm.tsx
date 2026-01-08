"use client";

import React, { useState, useRef, useCallback } from "react";
import { User, MapPin, Save, Camera, Loader2, UserCircle, AtSign } from "lucide-react"; 
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

export default function ProfileForm({ user, onUpdateSuccess }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
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

  // --- LOGIC ---
  const handleSystemError = (error: any, defaultMsg: string) => {
    console.error("System Error:", error); 
    let userMessage = defaultMsg;
    const msg = error?.message?.toLowerCase() || "";
    if (msg.includes("limit") || msg.includes("size")) userMessage = "Ukuran berkas melebihi batas.";
    else if (msg.includes("network")) userMessage = "Gagal terhubung ke server.";
    return userMessage;
  };

  const processImage = async (file: File): Promise<File> => {
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true, fileType: "image/jpeg", initialQuality: 0.9 };
    try {
      setIsProcessing(true);
      const processedFile = await imageCompression(file, options);
      return new File([processedFile], file.name, { type: processedFile.type });
    } catch { return file; } finally { setIsProcessing(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) { 
         toast.error("Berkas terlalu besar"); return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropModalOpen(true); setZoom(1); setCrop({ x: 0, y: 0 }); 
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
      const finalFile = await processImage(new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }));
      setFileToUpload(finalFile);
      setPreviewImage(URL.createObjectURL(finalFile));
      setIsCropModalOpen(false); setImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      toast.success("Foto Siap", { description: "Klik 'Simpan Perubahan' untuk menerapkan." });
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
        const fd = new FormData(); fd.append("file", fileToUpload); fd.append("username", user.username); 
        finalAvatarUrl = await uploadAvatar(fd, user.avatar_url);
      }
      await updateUserSettings(user.username, {
        nama: formData.nama, username: formData.username, alamat: formData.alamat, role: user.role, avatar_url: finalAvatarUrl, 
      });
      toast.success("Profil Diperbarui", { description: "Data Anda berhasil disimpan." });
      onUpdateSuccess({ name: formData.nama, username: formData.username, alamat: formData.alamat, avatar_url: finalAvatarUrl });
      setFileToUpload(null);
    } catch (error: any) {
      toast.error("Gagal Menyimpan", { description: handleSystemError(error, "Terjadi kesalahan.") });
    } finally { setIsSaving(false); }
  };

  return (
    <>
        {/* --- MODAL CROP (Sama) --- */}
        <Dialog open={isCropModalOpen} onOpenChange={(open) => !isProcessing && setIsCropModalOpen(open)}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 bg-slate-50 border-b">
                    <DialogTitle>Sesuaikan Foto</DialogTitle>
                    <DialogDescription>Geser dan zoom untuk hasil terbaik.</DialogDescription>
                </DialogHeader>
                <div className="relative w-full h-[300px] bg-black">
                    {imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />}
                    {isProcessing && <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>}
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-4"><span className="text-xs text-slate-500">Zoom</span><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-slate-900"/></div>
                    <DialogFooter><Button variant="ghost" onClick={() => setIsCropModalOpen(false)}>Batal</Button><Button onClick={handleCropSave} disabled={isProcessing} className="bg-slate-900 hover:bg-slate-800">Gunakan Foto</Button></DialogFooter>
                </div>
            </DialogContent>
        </Dialog>

        {/* --- MAIN CARD --- */}
        <Card className="overflow-hidden border-none shadow-xl bg-white rounded-xl ring-1 ring-slate-100">
            {/* 1. Header dengan Gradient Biru (KRS Style) */}
            <div className="h-40 bg-gradient-to-br from-cyan-600 to-blue-600 relative">
                {/* Dekorasi Abstrak (Subtle) */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute -bottom-9 -right-8 text-white opacity-20 rotate-12 pointer-events-none">
                    <User size={200} />
                </div>
            </div>

            <CardContent className="px-6 sm:px-8 pb-8">
                <form onSubmit={handleProfileUpdate}>
                    {/* 2. Container Profile Info (Responsive) */}
                    <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-16 mb-8">
                        
                        {/* Avatar Wrapper */}
                        <div className="relative z-10 shrink-0">
                            <div className="w-32 h-32 rounded-full border-[5px] border-white shadow-lg overflow-hidden bg-slate-100 relative group">
                                {previewImage ? (
                                    <Image src={previewImage} alt="Profile" fill className="object-cover" unoptimized={!!fileToUpload} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100"><User size={64} /></div>
                                )}
                                {/* Overlay Edit saat Hover (Desktop) */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Camera className="text-white drop-shadow-md" size={24} />
                                </div>
                            </div>
                            
                            {/* Tombol Kamera Kecil (Mobile/Always visible fallback) */}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="md:hidden absolute bottom-1 right-1 bg-slate-900 text-white p-2 rounded-full shadow-md border-[2px] border-white hover:bg-slate-800 transition-all" title="Ubah Foto">
                                <Camera size={14} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {/* Nama & Role */}
                        <div className="flex-1 text-center md:text-left space-y-1 md:pb-2 min-w-0 w-full">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">{formData.nama || "Pengguna Baru"}</h2>
                            <p className="text-slate-500 font-medium">@{formData.username}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Tombol Simpan (Desktop) - Tetap Hitam Sesuai Permintaan (Yang lain jangan berubah) */}
                        <div className="hidden md:block md:pb-2">
                             <Button type="submit" disabled={isSaving || isProcessing} className="bg-slate-900 hover:bg-slate-800 shadow-md transition-all h-10 px-6">
                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-8 opacity-60" />

                    {/* 3. Form Inputs Grid */}
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="username" className="text-slate-700 font-medium flex items-center gap-2">
                                    <AtSign size={16} className="text-slate-400" /> Username
                                </Label>
                                <Input 
                                    id="username" 
                                    value={formData.username} 
                                    disabled={user.role !== "admin"} 
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 transition-all h-11"
                                />
                                {user.role !== "admin" && <p className="text-[11px] text-slate-400 ml-1">Username dikelola oleh administrator.</p>}
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="nama" className="text-slate-700 font-medium flex items-center gap-2">
                                    <UserCircle size={16} className="text-slate-400" /> Nama Lengkap
                                </Label>
                                <Input 
                                    id="nama" 
                                    value={formData.nama} 
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })} 
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 transition-all h-11"
                                />
                            </div>
                        </div>

                        {user.role === "mahasiswa" && (
                            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="alamat" className="text-slate-700 font-medium flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> Alamat Domisili
                                </Label>
                                <Textarea 
                                    id="alamat" 
                                    rows={4} 
                                    value={formData.alamat} 
                                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} 
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 resize-none transition-all"
                                    placeholder="Masukkan alamat lengkap..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Tombol Simpan (Mobile Only) */}
                    <div className="md:hidden mt-8 pt-4 border-t border-slate-100">
                         <Button type="submit" disabled={isSaving || isProcessing} className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base font-medium">
                            {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                            Simpan Perubahan
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    </>
  );
}