import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mengecek status maintenance mode dengan logika prioritas:
 * 1. ENV MAINTENANCE_MODE = true → PASTI MAINTENANCE
 * 2. ENV MAINTENANCE_MODE = false → cek database
 * 3. Database error → fallback SAFE MODE (sistem tetap berjalan)
 */
export async function getMaintenanceStatus(): Promise<boolean> {
  const envMaintenance = process.env.MAINTENANCE_MODE;

  // Cek ENV terlebih dahulu, kalau true langsung return maintenance aktif
  if (envMaintenance === "true") {
    return true;
  }

  // Kalau ENV false atau tidak ada, cek ke database
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("maintenance_mode")
      .eq("id", "global")
      .single();

    if (error) {
      // Database error → safe mode, sistem tetap jalan
      console.error("[Maintenance] Database error, fallback to safe mode:", error.message);
      return false;
    }

    return data?.maintenance_mode ?? false;
  } catch (err) {
    // Fallback safe mode kalau ada exception
    console.error("[Maintenance] Unexpected error, fallback to safe mode:", err);
    return false;
  }
}

/**
 * Mengecek apakah user dengan role tertentu bisa bypass maintenance mode.
 * Hanya admin yang bisa bypass.
 */
export function canBypassMaintenance(userRole: string | undefined): boolean {
  return userRole === "admin";
}
