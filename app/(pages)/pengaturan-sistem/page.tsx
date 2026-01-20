import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import SystemSettingsClient from './SystemSettingsClient';

export const metadata: Metadata = {
  title: 'Pengaturan Sistem',
};

export default async function SystemSettingsPage() {
  const supabase = createAdminClient();
  
  // Ambil status maintenance dari database
  const { data } = await supabase
    .from('system_settings')
    .select('maintenance_mode')
    .eq('id', 'global')
    .single();

  const initialSettings = {
    maintenance_mode: data?.maintenance_mode ?? false,
  };

  return <SystemSettingsClient initialSettings={initialSettings} />;
}
