'use server';

import { createClient } from "@/lib/supabase/server";
import { SystemSettings } from "@/lib/types";

export async function getSystemSettings() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');

    if (error) throw error;

    // Convert array to object for easier access
    const settings: Record<string, any> = {};
    data?.forEach((item: SystemSettings) => {
      settings[item.key] = item.value;
    });

    return { success: true, data: settings, raw: data };
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return { success: false, error: 'Gagal mengambil pengaturan sistem' };
  }
}

export async function updateSystemSetting(key: string, value: any) {
  const supabase = await createClient();

  try {
    // Check permissions - only admin should be able to do this
    // Optional: You might want to verify user role here if not handled by middleware/RLS

    const { error } = await supabase
      .from('system_settings')
      .update({
        value: value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    return { success: false, error: `Gagal memperbarui pengaturan ${key}` };
  }
}
