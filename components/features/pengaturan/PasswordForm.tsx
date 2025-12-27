"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserSettings, logout } from "@/app/actions/auth"; //

interface PasswordFormProps {
  user: any;
  onUpdateSuccess: (newPassword: string) => void;
}

export default function PasswordForm({ user, onUpdateSuccess }: PasswordFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi: Password Baru vs Konfirmasi
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Gagal memperbarui kata sandi", {
        description: "Konfirmasi kata sandi tidak cocok.",
      });
      return;
    }

    // 2. Validasi: Password Saat Ini Benar/Salah
    if (passwordData.currentPassword !== user?.password) {
      toast.error("Gagal", { description: "Kata sandi saat ini salah." });
      return;
    }

    // 3. Validasi: Password Baru vs Password Lama
    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error("Gagal memperbarui kata sandi", {
        description: "Kata sandi baru tidak boleh sama dengan kata sandi saat ini.",
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateUserSettings(user.username, {
        password: passwordData.newPassword,
        role: user.role,
      });

      const TOAST_DURATION = 2000;

      // REKOMENDASI OPSI 1: Lebih profesional dan jelas
      toast.success("Kata sandi berhasil diperbarui", {
        description: "Silakan login kembali demi keamanan. Mengalihkan...",
        duration: TOAST_DURATION,
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      onUpdateSuccess(passwordData.newPassword);

      setTimeout(async () => {
        await logout();
      }, TOAST_DURATION);

    } catch (error: any) {
      toast.error("Gagal mengubah password", { description: error.message });
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full shadow-sm border-slate-200">
        <CardHeader className="pb-4 pt-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <CardTitle className="text-lg">Keamanan Akun</CardTitle>
          </div>
          <CardDescription>
            Perbarui kata sandi Anda secara berkala untuk melindungi akun.
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
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new_password">Kata Sandi Baru</Label>
                <Input
                  id="new_password"
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Ulangi Kata Sandi</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="rounded-lg bg-rose-50 p-4 border border-rose-200 mt-2 flex items-start gap-3">
              <AlertTriangle
                className="text-rose-600 shrink-0 mt-0.5"
                size={18}
              />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-rose-900">
                  Perhatian
                </p>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Pastikan Anda menggunakan kombinasi karakter unik. Setelah
                  kata sandi diubah, Anda harus login ulang untuk verifikasi
                  keamanan.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
            <Button
              type="submit"
              variant="destructive"
              disabled={isSaving}
              className="w-full sm:w-auto ml-auto gap-2"
            >
              <Lock size={16} />
              {isSaving ? "Memproses..." : "Ganti Kata Sandi"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}