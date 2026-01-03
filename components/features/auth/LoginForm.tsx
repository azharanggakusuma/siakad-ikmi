"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Lock, User, ChevronRight } from "lucide-react";
import { toast } from "sonner"; 

import { authenticate } from "@/app/actions/auth"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault(); 
    toast.info("Lupa Kata Sandi?", {
      description: "Silakan hubungi Biro Administrasi Akademik dan Kemahasiswaan (BAAK) untuk mereset akun Anda.",
      duration: 5000,
    });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await authenticate(formData);

      if (result?.success) {
        toast.success("Login Berhasil", {
            description: `Selamat datang kembali, ${result.name}! Semoga harimu menyenangkan.`,
            duration: 3000,
        });
        
        router.push("/");
        router.refresh();
      } else {
        // [LOGIKA ERROR CLIENT-SIDE DENGAN PESAN YANG LEBIH BAGUS]
        if (result?.error === "InactiveAccount") {
           // 1. Kasus Akun Non-Aktif (KUNING)
           toast.warning("Akses Akun Ditangguhkan", {
             description: "Status akun Anda saat ini tidak aktif. Harap hubungi Bagian Akademik untuk penyelesaian.", 
             duration: 6000,
           });
        } else if (result?.error === "CredentialsSignin") {
           // 2. Kasus Salah Password/Username (MERAH)
           toast.error("Kredensial Tidak Valid", {
             description: "Username atau kata sandi yang Anda masukkan tidak sesuai. Mohon periksa kembali.",
           });
        } else {
           // 3. Error Lainnya
           toast.error("Gagal Masuk", {
             description: "Terjadi kendala saat menghubungi server. Silakan coba beberapa saat lagi.",
           });
        }
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Sistem", {
        description: "Layanan sedang sibuk. Silakan muat ulang halaman atau coba lagi nanti.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Mobile */}
      <div className="lg:hidden flex flex-col items-center space-y-4 mb-10">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-100 p-3">
          <Image
            src="/img/logo-ikmi.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            SIAKAD
          </h1>
          <p className="text-sm text-slate-500 font-medium">STMIK IKMI Cirebon</p>
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden lg:block space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Login Akun
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Silakan masukkan kredensial Anda untuk masuk.
        </p>
      </div>

      <Card className="border-none shadow-none bg-transparent p-0">
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5 p-0">
            
            {/* Input Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-slate-700 dark:text-slate-300 font-medium hidden lg:block"
              >
                Username
              </Label>
              <div className="relative group transition-all duration-300">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="username"
                  name="username"
                  placeholder="Username / NIM / NIDN"
                  type="text"
                  disabled={loading}
                  className="pl-10 h-12 lg:h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all rounded-xl lg:rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center hidden lg:flex">
                <Label
                  htmlFor="password"
                  className="text-slate-700 dark:text-slate-300 font-medium"
                >
                  Password
                </Label>
                
                {/* Link Lupa Password (Desktop) */}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline focus:outline-none"
                >
                  Lupa password?
                </button>

              </div>
              <div className="relative group transition-all duration-300">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={loading}
                  className="pl-10 pr-10 h-12 lg:h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all rounded-xl lg:rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 lg:top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Link Lupa Password (Mobile) */}
              <div className="flex justify-end lg:hidden mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline focus:outline-none"
                >
                  Lupa password?
                </button>
              </div>

            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-5 p-0 pt-8">
            <Button
              className="w-full h-12 lg:h-11 text-base font-semibold bg-[#1B3F95] hover:bg-[#15327a] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all active:scale-[0.98] rounded-xl lg:rounded-md"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Masuk Portal <ChevronRight className="h-4 w-4 opacity-70" />
                </div>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} STMIK IKMI Cirebon.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}