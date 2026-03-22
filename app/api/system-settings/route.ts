import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/auth";

/**
 * GET: Mengambil status maintenance mode dari database
 */
export async function GET() {
  try {
    // Gunakan helper baru yang sudah handle logic env & db default
    const { getSystemSettings } = await import("@/lib/settings");
    const settings = await getSystemSettings();

    return NextResponse.json(settings);
  } catch (err) {
    console.error("[API] Unexpected error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

/**
 * PATCH: Update system settings (admin only)
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    // Pastikan user sudah login dan role-nya admin atau superuser
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superuser")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { maintenance_mode, turnstile_enabled } = body;

    // Validate inputs
    if (maintenance_mode !== undefined && typeof maintenance_mode !== "boolean") {
      return NextResponse.json({ error: "Format maintenance_mode tidak valid" }, { status: 400 });
    }
    if (turnstile_enabled !== undefined && typeof turnstile_enabled !== "boolean") {
      return NextResponse.json({ error: "Format turnstile_enabled tidak valid" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: any = {};

    if (maintenance_mode !== undefined) updates.maintenance_mode = maintenance_mode;
    if (turnstile_enabled !== undefined) updates.turnstile_enabled = turnstile_enabled;

    // Jika tidak ada update yang valid
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Tidak ada perubahan" });
    }

    const { error } = await supabase
      .from("system_settings")
      .update(updates)
      .eq("id", "global");

    if (error) {
      console.error("[API] Gagal update system settings:", error.message);
      return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...updates });
  } catch (err) {
    console.error("[API] Unexpected error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
