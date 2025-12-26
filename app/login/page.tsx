"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    if (username && password) {
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setError("Username dan Password wajib diisi");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-slate-900 dark:to-slate-800">
      
      {/* Card diperkecil ke max-w-sm */}
      <Card className="w-full max-w-sm border-none shadow-xl ring-1 ring-slate-900/5 sm:rounded-xl">
        
        {/* Header Lebih Padat */}
        <CardHeader className="flex flex-col items-center space-y-2 pb-2 pt-8">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
            <Image
              src="/img/logo-ikmi.png"
              alt="Logo Kampus"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              SIAKAD
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem Informasi Akademik
            </p>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-3 px-6">
            {error && (
              <div className="rounded-md bg-red-50 p-2 text-center text-xs font-medium text-red-500">
                {error}
              </div>
            )}

            {/* Input Username */}
            <div className="space-y-1">
              <Label htmlFor="username" className="sr-only">Username</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                <Input
                  id="username"
                  name="username"
                  placeholder="Username"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={loading}
                  className="pl-9 h-9 text-sm bg-slate-50/50 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={loading}
                  className="pl-9 pr-9 h-9 text-sm bg-slate-50/50 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-6 pb-8 pt-2">
            <Button 
              className="w-full h-9 text-sm mt-6 font-medium shadow-sm" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk Sistem"
              )}
            </Button>
            
            <p className="text-center text-[10px] text-slate-400">
              &copy; {new Date().getFullYear()} STMIK IKMI Cirebon
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}