"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkSystemHealth } from "@/app/actions/system";
import { Activity, Bot, Database, HardDrive, RefreshCw, Server, Wifi, WifiOff, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/layout/PageHeader";

type HealthStatus = {
  status: string;
  latency: number;
  message: string;
  timestamp: string;
  checks?: {
    database: boolean;
    storage: boolean;
  };
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
                <CardTitle className="text-base text-lg">Koneksi Layanan</CardTitle>
                <div className="flex items-center gap-2">
                     <span className="text-xs text-slate-400">
                        {loading ? "Memeriksa..." : lastChecked ? `Cek Terakhir: ${lastChecked.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB` : ""}
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
                                {health?.status === "healthy" ? "Operasional" : "Gangguan"}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 max-w-md">
                            {health?.message || "Memeriksa status koneksi..."}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t pt-6 bg-slate-50/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                             <Database className="w-4 h-4" />
                         </div>
                         <div>
                             <p className="text-xs font-medium text-slate-500">Database Service</p>
                             <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-700">PostgreSQL</p>
                             </div>
                         </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                             <HardDrive className="w-4 h-4" />
                         </div>
                         <div>
                             <p className="text-xs font-medium text-slate-500">Storage Service</p>
                             <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-700">Supabase</p>
                             </div>
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
                    <p className="text-xs text-slate-400">Cloud Provider</p>
                    <p className="font-mono text-sm">Amazon Web Services (AWS)</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-400">Region Server</p>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-5 h-auto rounded-sm shadow-sm border border-slate-100">
                            <rect width="900" height="600" fill="#fff"/>
                            <rect width="900" height="300" fill="#ed2939"/>
                            <path fill="#fff" d="M251 158l9 28-26-19h32l-26 19 9-28zM186 98c0 38 27 70 63 78-43-1-78-36-78-78s35-77 78-78c-36 8-63 40-63 78zm90-34l9 28-26-19h32l-26 19 9-28zM240 76l9 28-26-19h32l-26 19 9-28zM212 96l9 28-26-19h32l-26 19 9-28zM268 96l9 28-26-19h32l-26 19 9-28z"/>
                        </svg>
                        <p className="font-mono text-sm">ap-southeast-1 (Singapore)</p>
                    </div>
                </div>
             </CardContent>
         </Card>

         {/* Resources Usage Card */}
         <ResourceUsageCard loading={loading} lastTrigger={lastChecked} />

         {/* AI Service Status */}
         <AIStatusCard loading={loading} lastTrigger={lastChecked} />
      </div>
    </div>
  );
}

import { getSystemResources } from "@/app/actions/system";

function ResourceUsageCard({ loading, lastTrigger }: { loading: boolean, lastTrigger: Date | null }) {
    const [resources, setResources] = useState<{
        database: { used: number, limit: number, percentage: number };
        storage: { used: number, limit: number, percentage: number };
    } | null>(null);

    useEffect(() => {
        const fetchResources = async () => {
            const data = await getSystemResources();
            setResources(data);
        };
        fetchResources();
    }, [lastTrigger]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="md:col-span-3 lg:col-span-3 overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="mt-4">
                <CardTitle className="text-lg">Penggunaan Sumber Daya</CardTitle>
            </CardHeader>
            <CardContent className="mb-5">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Database Usage */}
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Database Size</p>
                                    <p className="text-xs text-slate-500">PostgreSQL Storage</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded-full",
                                resources && resources.database.percentage > 90 ? "bg-rose-100 text-rose-700" :
                                resources && resources.database.percentage > 75 ? "bg-amber-100 text-amber-700" :
                                "bg-emerald-100 text-emerald-700"
                            )}>
                                {resources ? `${resources.database.percentage.toFixed(1)}%` : "0%"}
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-500 font-medium font-mono">
                                <span>{resources ? formatBytes(resources.database.used) : "0 B"}</span>
                                <span>{resources ? formatBytes(resources.database.limit) : "500 MB"}</span>
                            </div>
                             <Progress value={resources?.database.percentage || 0} className="h-2.5 bg-slate-100" indicatorClassName={cn(
                                "transition-all duration-1000",
                                resources && resources.database.percentage > 90 ? "bg-rose-500" :
                                resources && resources.database.percentage > 75 ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                        </div>
                    </div>

                    {/* Storage Usage */}
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                                    <HardDrive className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Storage Size</p>
                                    <p className="text-xs text-slate-500">Supabase Bucket</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded-full",
                                resources && resources.storage.percentage > 90 ? "bg-rose-100 text-rose-700" :
                                resources && resources.storage.percentage > 75 ? "bg-amber-100 text-amber-700" :
                                "bg-emerald-100 text-emerald-700"
                            )}>
                                {resources ? `${resources.storage.percentage.toFixed(1)}%` : "0%"}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-500 font-medium font-mono">
                                <span>{resources ? formatBytes(resources.storage.used) : "0 B"}</span>
                                <span>{resources ? formatBytes(resources.storage.limit) : "1 GB"}</span>
                            </div>
                             <Progress value={resources?.storage.percentage || 0} className="h-2.5 bg-slate-100" indicatorClassName={cn(
                                "transition-all duration-1000",
                                resources && resources.storage.percentage > 90 ? "bg-rose-500" :
                                resources && resources.storage.percentage > 75 ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function AIStatusCard({ loading, lastTrigger }: { loading: boolean; lastTrigger: Date | null }) {
  const [aiStatus, setAiStatus] = useState<{
    status: "checking" | "online" | "offline";
    model: string;
    latency: number;
  }>({ status: "checking", model: "-", latency: 0 });

  useEffect(() => {
    const checkAI = async () => {
      setAiStatus((prev) => ({ ...prev, status: "checking" }));
      try {
        const start = Date.now();
        const res = await fetch("/api/chat", { method: "GET", signal: AbortSignal.timeout(8000) });
        const latency = Date.now() - start;
        const data = await res.json();
        setAiStatus({
          status: data.status === "ok" ? "online" : "offline",
          model: "Gemini 3 Flash",
          latency,
        });
      } catch {
        setAiStatus({ status: "offline", model: "-", latency: 0 });
      }
    };
    checkAI();
  }, [lastTrigger]);

  const isOnline = aiStatus.status === "online";
  const isChecking = aiStatus.status === "checking";

  return (
    <Card className="md:col-span-3 lg:col-span-3 overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="mt-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="w-5 h-5 text-blue-500" />
          SIAKAD Bot (AI)
        </CardTitle>
      </CardHeader>
      <CardContent className="mb-5">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Status Koneksi */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-md shadow-sm border",
                  isOnline ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                  isChecking ? "bg-yellow-50 border-yellow-100 text-yellow-600" :
                  "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Status Layanan</p>
                  <p className="text-xs text-slate-500">Koneksi ke AI</p>
                </div>
              </div>
              <Badge className={cn(
                "text-[10px]",
                isOnline ? "bg-emerald-600 hover:bg-emerald-700" :
                isChecking ? "bg-yellow-500 hover:bg-yellow-600" :
                "bg-rose-600 hover:bg-rose-700"
              )}>
                {isOnline ? "Aktif" : isChecking ? "Memeriksa" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                isOnline ? "bg-emerald-500" : isChecking ? "bg-yellow-500 animate-pulse" : "bg-rose-500"
              )} />
              <span className="text-xs text-slate-500">
                {isOnline ? "AI siap menerima permintaan" :
                 isChecking ? "Sedang memeriksa..." :
                 "Layanan tidak tersedia"}
              </span>
            </div>
          </div>

          {/* Model */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Model AI</p>
                <p className="text-xs text-slate-500">Large Language Model</p>
              </div>
            </div>
            <p className="text-sm font-mono font-semibold text-slate-700">{aiStatus.model}</p>
            <p className="text-xs text-slate-400 mt-1">Google Generative AI</p>
          </div>

          {/* Latency */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 text-slate-500">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Response Time</p>
                <p className="text-xs text-slate-500">Latency ke AI</p>
              </div>
            </div>
            <p className={cn(
              "text-lg font-mono font-bold",
              aiStatus.latency < 500 ? "text-emerald-600" :
              aiStatus.latency < 1000 ? "text-amber-600" : "text-rose-600"
            )}>
              {aiStatus.latency > 0 ? `${aiStatus.latency}ms` : "-"}
            </p>
          </div>
        </div>

        {!isOnline && !isChecking && (
          <div className="mt-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            <strong>Perhatian:</strong> Layanan AI sedang tidak tersedia. Kemungkinan penyebab: kuota API harian telah habis, gangguan pada layanan Google AI, atau masalah koneksi internet server.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
