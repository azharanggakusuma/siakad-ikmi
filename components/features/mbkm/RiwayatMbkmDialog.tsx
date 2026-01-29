import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMbkmByStudentId } from "@/app/actions/mbkm";
import { StudentMBKM } from "@/lib/types";
import { toast } from "sonner";
import { Building2, CalendarDays, Info, GraduationCap, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RiwayatMbkmDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  studentName: string;
  studentId?: string;
}

export function RiwayatMbkmDialog({
  isOpen,
  onClose,
  studentName,
  studentId,
}: RiwayatMbkmDialogProps) {
  const [data, setData] = useState<StudentMBKM[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMbkmData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const result = await getMbkmByStudentId(studentId);
      setData(result || []);
    } catch (error) {
        console.error("Failed to fetch MBKM:", error);
        toast.error("Gagal memuat riwayat MBKM");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentId) {
      fetchMbkmData();
    }
  }, [isOpen, studentId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[700px] w-full h-[70vh] flex flex-col p-0 gap-0">
        <div className="p-6 pb-2">
            <DialogHeader>
            <DialogTitle className="text-xl">
                Riwayat MBKM
            </DialogTitle>
            <DialogDescription>
                Daftar program MBKM yang diikuti oleh <strong>{studentName}</strong>.
            </DialogDescription>
            </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-xl border p-5 bg-card">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <div className="space-y-2 w-full max-w-[70%]">
                                        <Skeleton className="h-6 w-3/4 sm:w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                            </div>
                        ))
                    ) : data.length > 0 ? (
                        data.map((item, idx) => (
                            <div 
                                key={item.id} 
                                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/50"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-lg leading-none tracking-tight">
                                                {item.jenis_mbkm}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-foreground/80 mt-1">
                                            <span className="font-medium">{item.mitra}</span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="w-fit flex items-center gap-1.5 px-3 py-1">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {item.academic_year?.nama} ({item.academic_year?.semester})
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 border-2 border-dashed rounded-xl bg-muted/5">
                            <div className="p-3 bg-muted rounded-full">
                                <GraduationCap className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-lg">Belum ada riwayat MBKM</p>
                                <p className="text-sm text-muted-foreground">
                                    Mahasiswa ini belum mengikuti program MBKM apapun.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
            <Button onClick={() => onClose(false)}>
                Tutup
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
