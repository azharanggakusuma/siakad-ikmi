"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Check, Wand2, ShieldCheck } from "lucide-react";
import { FormModal } from "@/components/shared/FormModal";
import { updateUser, type UserData } from "@/app/actions/users";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  user: UserData | null;
  onSuccess?: () => void;
}

export function ResetPasswordModal({ isOpen, onClose, user, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setNewPassword("");
      setShowPassword(false);
      setIsCopied(false);
    }
  }, [isOpen, user]);

  // === GENERATE PASSWORD ===
  const generatePassword = (length: number) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setIsCopied(false);
  };

  // === COPY TO CLIPBOARD ===
  const copyToClipboard = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setIsCopied(true);
    toast.success("Disalin", { description: "Password berhasil disalin." });
    
    // Reset icon copy setelah 2 detik
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword.trim()) return;

    if (newPassword.length < 6) {
      toast.error("Password Lemah", { description: "Minimal 6 karakter." });
      return;
    }

    setIsLoading(true);
    try {
      await updateUser(user.id, {
        ...user,
        password: newPassword,
      });

      toast.success("Sukses", {
        description: `Password untuk ${user.name} berhasil diubah.`
      });

      onClose(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Password"
      description={`Atur ulang akses login untuk: ${user?.name}`}
      maxWidth="sm:max-w-[500px]"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        
        {/* INPUT AREA */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <Label htmlFor="reset-pass" className="text-sm font-medium">Password Baru</Label>
             
             {/* Tombol Acak */}
             <Button 
               type="button" 
               variant="outline" 
               size="sm" 
               onClick={() => generatePassword(8)}
               className="h-6 text-[10px] px-2 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 gap-1.5"
               title="Generate 8 Karakter"
             >
               <Wand2 className="h-3 w-3" />
               Acak (8)
             </Button>
          </div>
          
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1 group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ShieldCheck size={16} />
              </div>
              <Input
                id="reset-pass"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setIsCopied(false);
                }}
                placeholder="Ketik atau generate password..."
                className="pl-9 pr-10 tracking-wide h-10 transition-all focus:ring-2 ring-primary/20"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className={`shrink-0 transition-all duration-300 ${isCopied ? "border-green-500 text-green-600 bg-green-50" : ""}`}
              title="Salin Password"
              disabled={!newPassword}
            >
              {isCopied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-blue-50/50 border border-blue-100 p-3">
           <p className="text-[11px] text-blue-700 leading-relaxed flex gap-2">
             <span className="shrink-0 text-lg leading-none">💡</span>
             <span>
               Pastikan untuk <b>menyalin (Copy)</b> password baru sebelum menyimpan. Perubahan ini akan langsung menonaktifkan password lama user.
             </span>
           </p>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="ghost" onClick={() => onClose(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={!newPassword || newPassword.length < 6 || isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}