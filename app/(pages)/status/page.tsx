"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkSystemHealth } from "@/app/actions/system";
import { Activity, Database, RefreshCw, Server, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/layout/PageHeader";

type HealthStatus = {
  status: string;
  latency: number;
  message: string;
  timestamp: string;
};

export default function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await checkSystemHealth();
      setHealth(result);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check status", error);
      setHealth({
        status: "error",
        latency: 0,
        message: "Network Error",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "healthy") return "text-emerald-500 bg-emerald-50 border-emerald-200";
    if (status === "warning") return "text-amber-500 bg-amber-50 border-amber-200";
    return "text-rose-500 bg-rose-50 border-rose-200";
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 200) return "text-emerald-600";
    if (ms < 500) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Status Sistem"
        breadcrumb={["Beranda", "Status"]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Connection Status Card */}
        <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mt-4">
                <CardTitle className="text-base font-medium">Koneksi Database</CardTitle>
                <div className="flex items-center gap-2">
                     <span className="text-xs text-slate-400">
                        {loading ? "Checking..." : lastChecked ? `Last Check: ${lastChecked.toLocaleTimeString()}` : ""}
                     </span>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={checkStatus} disabled={loading}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                     </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "h-16 w-16 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                        health?.status === "healthy" ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-rose-100 bg-rose-50 text-rose-600"
                    )}>
                        {health?.status === "healthy" ? <Wifi className="h-8 w-8" /> : <WifiOff className="h-8 w-8" />}
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold">
                                {health?.status === "healthy" ? "Terhubung" : "Masalah Koneksi"}
                            </h3>
                            <Badge variant={health?.status === 'healthy' ? 'default' : 'destructive'} className={cn("capitalize", health?.status === "healthy" && "bg-emerald-600 hover:bg-emerald-700")}>
                                {health?.status === "healthy" ? "Operational" : "Downtime"}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 max-w-md">
                            {health?.message || "Memeriksa status koneksi..."}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-6 bg-slate-50/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                             <Database className="w-4 h-4" />
                         </div>
                         <div>
                             <p className="text-xs font-medium text-slate-500">Database Service</p>
                             <p className="text-sm font-semibold text-slate-700">PostgreSQL</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                             <Activity className="w-4 h-4" />
                         </div>
                         <div>
                             <p className="text-xs font-medium text-slate-500">Response Latency</p>
                             <p className={cn("text-sm font-bold font-mono", getLatencyColor(health?.latency || 0))}>
                                {health ? `${health.latency}ms` : "-"}
                             </p>
                         </div>
                    </div>
                </div>
            </CardContent>
        </Card>

         {/* Info Card */}
         <Card className="bg-slate-900 text-white border-slate-800">
             <CardHeader className="mt-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="w-5 h-5 text-indigo-400" />
                    Informasi Server
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 mb-4">
                <div className="space-y-1">
                    <p className="text-xs text-slate-400">Environment</p>
                    <p className="font-mono text-sm">Production</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-400">Region</p>
                    <p className="font-mono text-sm">ap-southeast-1 (Singapore)</p>
                </div>
                <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Client Check Interval</span>
                        <span className="font-medium text-indigo-300">30s</span>
                    </div>
                </div>
             </CardContent>
         </Card>
      </div>
    </div>
  );
}
