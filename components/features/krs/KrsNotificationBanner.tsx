"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface KrsNotificationBannerProps {
  show: boolean;
  academicYearName?: string;
  semester?: string;
}

export function KrsNotificationBanner({ show, academicYearName, semester }: KrsNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Cek apakah banner sudah ditutup di sesi ini
    const isDismissed = sessionStorage.getItem("krs_banner_dismissed");
    if (isDismissed) {
      setIsVisible(false);
    }
  }, []);

  if (!show || !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("krs_banner_dismissed", "true");
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 shadow-sm animate-in slide-in-from-top-2 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-9">
        <div className="flex items-start gap-3 w-full">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">
              Pemberitahuan KRS
            </p>
            <p className="text-sm opacity-90 leading-tight mt-0.5">
              Anda belum menyelesaikan pengisian KRS untuk <span className="font-semibold">TA {academicYearName || "Aktif"} {semester ? `(${semester})` : ""}</span>. Segera lakukan pengisian.
            </p>
          </div>
        </div>
        <Link href="/krs" className="w-full md:w-auto ml-8 md:ml-0 pr-7 md:pr-0">
          <Button
            size="sm"
            className="w-full md:w-auto bg-amber-600 text-white hover:bg-amber-700 border-none shadow-sm"
          >
            Isi KRS Sekarang
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
      
      {/* Close Button */}
      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 p-1.5 rounded-full text-amber-500 hover:text-amber-800 hover:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
