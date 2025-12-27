"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { User, Lock, ShieldAlert, Save, AlertTriangle } from "lucide-react"; 
import { getSession, getUserSettings, updateUserSettings } from "@/app/actions/auth";

export default function PengaturanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // State loading saat menyimpan
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Data User saat ini (dari DB)
  const [currentUser, setCurrentUser] = useState<any>(null);

  // State Profil
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    alamat: "",
  });

  // State Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // === 1. Fetch Data User dari Database ===
  useEffect(() => {
    const initData = async () => {
      try {
        const session = await getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        const userData = await getUserSettings(session.username);
        
        if (userData) {
          setCurrentUser(userData);
          setFormData({
            nama: userData.name,       
            nim: userData.username,    
            alamat: userData.alamat || "" 
          });
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
        toast.error("Gagal memuat data pengguna.");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [router]);

  // === 2. Handlers ===

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true); 
    
    try {
      await updateUserSettings(formData.nim, {
        nama: formData.nama,
        alamat: formData.alamat,
        role: currentUser?.role
      });

      toast.success("Profil berhasil diperbarui", {
        description: "Data identitas telah disimpan ke sistem.",
      });
      
      // Update state lokal
      setCurrentUser((prev: any) => ({ ...prev, name: formData.nama, alamat: formData.alamat }));

    } catch (error: any) {
      toast.error("Gagal menyimpan profil", {
        description: error.message || "Terjadi kesalahan sistem"
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Gagal memperbarui kata sandi", {
        description: "Konfirmasi kata sandi tidak cocok.",
      });
      return;
    }

    if (passwordData.currentPassword !== currentUser?.password) {
      toast.error("Gagal", { description: "Kata sandi saat ini salah." });
      return;
    }

    setIsSavingPassword(true); 
    
    try {
      await updateUserSettings(formData.nim, {
        password: passwordData.newPassword,
        role: currentUser?.role
      });

      toast.success("Kata sandi berhasil diubah", {
        description: "Silakan login ulang dengan kata sandi baru nanti.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      setCurrentUser((prev: any) => ({ ...prev, password: passwordData.newPassword }));

    } catch (error: any) {
      toast.error("Gagal mengubah password", { description: error.message });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // === UI Loading Asli (Menggunakan animate-pulse sederhana) ===
  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
         <PageHeader title="Pengaturan" breadcrumb={["SIAKAD", "Pengaturan"]} />
         <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
         </div>
      </div>
    );
  }

  // === UI Utama Asli ===
  return (
    <div className="flex flex-col gap-10 pb-10">
      <PageHeader 
        title="Pengaturan" 
        breadcrumb={["SIAKAD", "Pengaturan"]} 
      />
      
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        
        {/* === KARTU 1: PROFIL PENGGUNA === */}
        <div className="flex flex-col h-full">
          <Card className="flex flex-col h-full shadow-sm border-slate-200">
            <CardHeader className="pb-4 pt-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={20} />
                </div>
                <CardTitle className="text-lg">Identitas Pengguna</CardTitle>
              </div>
              <CardDescription>
                Informasi dasar akun yang terdaftar dalam sistem akademik.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleProfileUpdate} className="flex flex-col flex-1">
              <CardContent className="space-y-5 flex-1">
                
                {/* NIM / Username */}
                <div className="space-y-2">
                  <Label htmlFor="nim" className="text-slate-600">
                    Username / NIM
                  </Label>
                  <div className="relative">
                    <Input 
                      id="nim" 
                      value={formData.nim} 
                      disabled 
                      className="pl-3 bg-slate-50 border-slate-200 text-slate-500"
                    />
                    <div className="absolute right-3 top-2.5">
                      <Lock size={14} className="text-slate-400" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ID Pengguna dikelola oleh administrator dan tidak dapat diubah.
                  </p>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-slate-700">Nama Lengkap</Label>
                  <Input 
                    id="nama" 
                    value={formData.nama} 
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  />
                </div>

                {/* Alamat (Hanya untuk mahasiswa) */}
                {currentUser?.role === "mahasiswa" && (
                  <div className="space-y-2">
                    <Label htmlFor="alamat" className="text-slate-700">Alamat Domisili</Label>
                    <Textarea 
                      id="alamat"
                      rows={3}
                      className="resize-none"
                      value={formData.alamat} 
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                    />
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
                <Button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto ml-auto gap-2"
                >
                  <Save size={16} />
                  {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* === KARTU 2: KEAMANAN === */}
        <div className="flex flex-col h-full">
          <Card className="flex flex-col h-full shadow-sm border-slate-200">
            <CardHeader className="pb-4 pt-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <ShieldAlert size={20} />
                </div>
                <CardTitle className="text-lg">Keamanan & Password</CardTitle>
              </div>
              <CardDescription>
                Kelola keamanan akun Anda dengan memperbarui kata sandi secara berkala.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handlePasswordUpdate} className="flex flex-col flex-1">
              <CardContent className="space-y-5 flex-1">
                
                <div className="space-y-2">
                  <Label htmlFor="current_password">Kata Sandi Saat Ini</Label>
                  <Input 
                    id="current_password" 
                    type="password"
                    placeholder="••••••••"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>

                <div className="h-px bg-slate-100 my-2" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Kata Sandi Baru</Label>
                    <Input 
                      id="new_password" 
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Ulangi Kata Sandi</Label>
                    <Input 
                      id="confirm_password" 
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-rose-50 p-4 border border-rose-200 mt-2 flex items-start gap-3">
                  <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-rose-900">Perhatian</p>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      Pastikan Anda menggunakan kombinasi karakter unik. Setelah kata sandi diubah, Anda harus login ulang untuk verifikasi keamanan.
                    </p>
                  </div>
                </div>

              </CardContent>

              <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
                <Button 
                  type="submit" 
                  variant="destructive" 
                  disabled={isSavingPassword}
                  className="w-full sm:w-auto ml-auto gap-2"
                >
                  <Lock size={16} />
                  {isSavingPassword ? "Memproses..." : "Ganti Kata Sandi"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}