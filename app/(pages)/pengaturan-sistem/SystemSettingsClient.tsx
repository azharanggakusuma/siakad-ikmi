'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemSettingsClientProps {
  initialSettings: {
    maintenance_mode: boolean;
  };
}

export default function SystemSettingsClient({ initialSettings }: SystemSettingsClientProps) {
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      maintenance_mode: initialSettings.maintenance_mode || false,
    },
  });

  const handleSwitchChange = async (key: string, value: boolean) => {
    if (key === 'maintenance_mode') setMaintenanceLoading(true);
    
    try {
      const response = await fetch('/api/system-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance_mode: value }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan pengaturan');
      }

      form.setValue(key as any, value);
      
      toast.success(value ? "Maintenance Mode diaktifkan" : "Maintenance Mode dinonaktifkan", {
        description: "Perubahan pengaturan berhasil disimpan.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan pengaturan.");
      form.setValue(key as any, !value);
    } finally {
      if (key === 'maintenance_mode') setMaintenanceLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="print:hidden">
         <PageHeader 
            title="Pengaturan Sistem" 
            breadcrumb={["Beranda", "Pengaturan Sistem"]} 
        />
      </div>

      <div className="w-full">
        <Form {...form}>
          <form className="space-y-6">
            <Card className="shadow-md border-border/60 overflow-hidden">
              <CardHeader className="bg-muted/30 p-8 border-b border-border/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight">Konfigurasi Aplikasi</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Kelola pengaturan global untuk ketersediaan sistem dan kontrol akses aplikasi.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Item 1: Maintenance */}
                <FormField
                  control={form.control}
                  name="maintenance_mode"
                  render={({ field }) => (
                    <FormItem className={cn(
                        "flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border p-6 transition-all duration-200",
                        field.value ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/50" : "bg-card hover:bg-muted/20"
                      )}>
                      <div className="space-y-3 flex-1 mr-6">
                        <div className="flex items-center gap-2">
                           <Shield className={cn("w-5 h-5", field.value ? "text-amber-600 dark:text-amber-500" : "text-slate-500")} />
                           <FormLabel className="text-base font-semibold cursor-pointer">Maintenance Mode</FormLabel>
                             {field.value 
                              ? <Badge variant="destructive" className="ml-2 bg-amber-600 hover:bg-amber-700 border-amber-500 text-white">Maintenance</Badge> 
                              : <Badge variant="outline" className="ml-2 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Online
                                </Badge>}
                        </div>
                        <FormDescription className="text-sm leading-relaxed max-w-2xl">
                           Aktifkan mode ini untuk membatasi akses sistem hanya kepada Administrator. 
                           Pengguna lain akan dialihkan ke halaman maintenance saat mencoba mengakses sistem.
                           {field.value && (
                             <span className="flex items-start gap-2 mt-3 text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-md text-xs font-medium border border-amber-200/50 dark:border-amber-800/50" style={{ display: 'flex' }}>
                               <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                               <span>Perhatian: Mode ini akan mencegah pengguna standar untuk login atau mengakses fitur apapun.</span>
                             </span>
                           )}
                        </FormDescription>
                      </div>
                      <FormControl className="mt-4 sm:mt-0">
                        <Switch
                          className={cn("data-[state=checked]:bg-amber-600")}
                          checked={field.value}
                          onCheckedChange={(val) => {
                            field.onChange(val);
                            handleSwitchChange('maintenance_mode', val);
                          }}
                          disabled={maintenanceLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />                
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
