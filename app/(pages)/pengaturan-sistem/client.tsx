'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateSystemSetting } from '@/app/actions/system-settings';
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
import { Separator } from '@/components/ui/separator';

interface SystemSettingsClientProps {
  initialSettings: {
    maintenance_mode: boolean;
    turnstile_enabled: boolean;
  };
}

export default function SystemSettingsClient({ initialSettings }: SystemSettingsClientProps) {
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [turnstileLoading, setTurnstileLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      maintenance_mode: initialSettings.maintenance_mode || false,
      turnstile_enabled: initialSettings.turnstile_enabled || false,
    },
  });

  const handleSwitchChange = async (key: string, value: boolean) => {
    if (key === 'maintenance_mode') setMaintenanceLoading(true);
    if (key === 'turnstile_enabled') setTurnstileLoading(true);
    
    try {
      form.setValue(key as any, value);
      const result = await updateSystemSetting(key, value);
      
      if (!result.success) throw new Error(result.error);
      
      toast.success(`Pengaturan disimpan.`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan pengaturan.");
      form.setValue(key as any, !value);
    } finally {
      if (key === 'maintenance_mode') setMaintenanceLoading(false);
      if (key === 'turnstile_enabled') setTurnstileLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="print:hidden">
         <PageHeader 
            title="Pengaturan Sistem" 
            breadcrumb={["Beranda", "Pengaturan", "Sistem"]} 
        />
      </div>

      <div className="w-full">
        <Form {...form}>
          <form>
            <Card className="h-full">
              <CardHeader className="p-8 pb-2">
                <CardTitle>Konfigurasi Aplikasi</CardTitle>
                <CardDescription>
                  Kelola pengaturan global untuk ketersediaan sistem dan keamanan keamanan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8 pt-0">
                
                {/* Item 1: Maintenance */}
                <FormField
                  control={form.control}
                  name="maintenance_mode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6 shadow-sm">
                      <div className="space-y-1">
                        <FormLabel className="text-base font-semibold">Maintenance Mode</FormLabel>
                        <FormDescription className="text-sm">
                           Jika aktif, aplikasi hanya dapat diakses oleh Admin. User lain akan dialihkan.
                           <br />
                           {field.value 
                              ? <span className="text-amber-600 font-medium mt-2 inline-block">Status: Sedang Maintenance</span> 
                              : <span className="text-muted-foreground mt-2 inline-block">Status: Online (Normal)</span>}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
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

                {/* Item 2: Turnstile */}
                <FormField
                  control={form.control}
                  name="turnstile_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6 shadow-sm">
                      <div className="space-y-1">
                        <FormLabel className="text-base font-semibold">Cloudflare Turnstile</FormLabel>
                        <FormDescription className="text-sm">
                          Aktifkan verifikasi CAPTCHA otomatis untuk login dan form sensitif.
                           <br />
                           {field.value 
                              ? <span className="text-emerald-600 font-medium mt-2 inline-block">Status: Proteksi Aktif</span> 
                              : <span className="text-red-500 font-medium mt-2 inline-block">Status: Proteksi Non-Aktif</span>}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(val) => {
                            field.onChange(val);
                            handleSwitchChange('turnstile_enabled', val);
                          }}
                          disabled={turnstileLoading}
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
