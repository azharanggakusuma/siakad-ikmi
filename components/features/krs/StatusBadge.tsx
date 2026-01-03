import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400">-</span>;

  let styles = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200";
  let icon = <FileText className="mr-1.5 h-3 w-3" />;
  let label = "Draft";

  switch (status) {
    case "APPROVED":
      styles = "bg-green-600 hover:bg-green-700 text-white border-transparent";
      icon = <CheckCircle2 className="mr-1.5 h-3 w-3" />;
      label = "Disetujui";
      break;
    case "SUBMITTED":
      styles = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";
      icon = <Clock className="mr-1.5 h-3 w-3" />;
      label = "Diajukan";
      break;
    case "REJECTED":
      styles = "bg-red-50 text-red-700 hover:bg-red-100 border-red-200";
      icon = <XCircle className="mr-1.5 h-3 w-3" />;
      label = "Ditolak";
      break;
  }

  return (
    <Badge variant="outline" className={`font-medium px-2.5 py-0.5 ${styles}`}>
      {icon} {label}
    </Badge>
  );
}