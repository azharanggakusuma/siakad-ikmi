import React from "react";
import Link from "next/link";
import { Lock, FileText, ArrowRight } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface KrsLockProps {
  message?: string;
  title?: string;
}

export default function KrsLock({ message, title = "Akses Terkunci" }: KrsLockProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-in fade-in zoom-in duration-500">
      <Card className="max-w-md w-full text-center border-2 border-dashed border-slate-200 shadow-none bg-slate-50/50">
        <CardHeader className="pb-2">
          <div className="mx-auto bg-white p-4 rounded-full mb-4 w-fit shadow-sm ring-1 ring-slate-100">
            <Lock className="h-10 w-10 text-orange-500" />
          </div>
          <CardTitle className="text-xl text-slate-800">{title}</CardTitle>
          <CardDescription className="text-slate-600 text-base mt-2 max-w-xs mx-auto">
            {message || "Anda harus menyelesaikan Kartu Rencana Studi (KRS) terlebih dahulu untuk mengakses halaman ini."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Link href="/krs">
            <Button className="w-full font-semibold shadow-md bg-indigo-600 hover:bg-indigo-700" size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Pergi ke Halaman KRS
              <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
            </Button>
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            Pastikan KRS Anda berstatus <strong>Submitted</strong> atau <strong>Approved</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}