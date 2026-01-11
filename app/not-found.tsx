import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="space-y-6 max-w-md mx-auto">
        {/* Status Code */}
        <h1 className="select-none text-9xl font-extrabold text-primary/20 tracking-tighter">
          404
        </h1>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            Silakan periksa kembali URL atau kembali ke halaman utama.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button asChild variant="default" size="lg">
            <Link href="/">
              <MoveLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="absolute bottom-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} STMIK IKMI Cirebon. All rights reserved.
      </div>
    </div>
  );
}