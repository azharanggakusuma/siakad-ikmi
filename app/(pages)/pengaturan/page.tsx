"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { getSession, getUserSettings } from "@/app/actions/auth";

import SettingsSkeleton from "@/components/features/pengaturan/SettingsSkeleton";
import ProfileForm from "@/components/features/pengaturan/ProfileForm";
import PasswordForm from "@/components/features/pengaturan/PasswordForm";

// Definisi tipe data user di pengaturan
export interface UserProfile {
  name: string;
  username: string;
  role: string;
  alamat?: string;
  password?: string;
}

export default function PengaturanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // === 1. Fetch Data User ===
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
    <div className="flex flex-col gap-10 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Pengaturan" breadcrumb={["SIAKAD", "Pengaturan"]} />
      
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <ProfileForm 
            user={currentUser} 
            onUpdateSuccess={(newData) => 
                setCurrentUser((prev) => prev ? ({ ...prev, ...newData }) : null)
            } 
        />
        <PasswordForm 
            user={currentUser} 
            onUpdateSuccess={(newPassword) => 
                setCurrentUser((prev) => prev ? ({ ...prev, password: newPassword }) : null)
            }
        />
      </div>
    </div>
  );
}