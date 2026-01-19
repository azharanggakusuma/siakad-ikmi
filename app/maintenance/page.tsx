"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wrench, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full text-center space-y-6"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
          <Wrench className="w-12 h-12 text-primary" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Sedang Dalam Perbaikan
          </h1>
          <p className="text-muted-foreground text-lg">
            Kami sedang meningkatkan kualitas layanan sistem akademik. Mohon maaf atas ketidaknyamanan ini.
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Coba Lagi
          </Button>
          
          <Button 
            asChild
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
