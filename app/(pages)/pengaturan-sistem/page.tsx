import { Metadata } from 'next';
import { getSystemSettings } from '@/app/actions/system-settings';
import SystemSettingsClient from './SystemSettingsClient';

export const metadata: Metadata = {
  title: 'Pengaturan Sistem',
};

export default async function SystemSettingsPage() {
  const { data: settings } = await getSystemSettings();

  const initialSettings = {
    maintenance_mode: settings?.maintenance_mode ?? false,
    turnstile_enabled: settings?.turnstile_enabled ?? true,
  };

  return <SystemSettingsClient initialSettings={initialSettings} />;
}
