import { Metadata } from 'next';
import SystemSettingsClient from './SystemSettingsClient';

export const metadata: Metadata = {
  title: 'Pengaturan Sistem',
};

export default async function SystemSettingsPage() {
  const initialSettings = {
    maintenance_mode: false,
  };

  return <SystemSettingsClient initialSettings={initialSettings} />;
}
