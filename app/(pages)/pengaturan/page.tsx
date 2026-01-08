"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { getSession, getUserSettings } from "@/app/actions/auth";

import SettingsSkeleton from "@/components/features/pengaturan/SettingsSkeleton";
import ProfileForm from "@/components/features/pengaturan/ProfileForm";
import PasswordForm from "@/components/features/pengaturan/PasswordForm";
import { UserProfile } from "@/lib/types"; 

export default function PengaturanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

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
          setCurrentUser(userData as UserProfile);
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
        toast.error("Gagal memuat data pengguna.");
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    initData();
  }, [router]);

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Pengaturan Akun" 
        breadcrumb={["Beranda", "Pengaturan"]} 
      />
      
      {/* Container Grid: items-stretch membuat kedua kolom sama tinggi */}
      <div className="grid gap-8 lg:grid-cols-12 items-stretch">
        
        {/* Kolom Kiri: Profil */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
           <ProfileForm 
              user={currentUser} 
              onUpdateSuccess={(newData) => 
                  setCurrentUser((prev) => prev ? ({ ...prev, ...newData }) : null)
              } 
          />
        </div>

        {/* Kolom Kanan: Password */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
           <PasswordForm 
              user={currentUser} 
              onUpdateSuccess={(newPassword) => 
                  setCurrentUser((prev) => prev ? ({ ...prev, password: newPassword }) : null)
              }
          />
        </div>
      </div>
    </div>
  );
}