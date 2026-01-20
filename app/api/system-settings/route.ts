import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/auth";

/**
 * GET: Mengambil status maintenance mode dari database
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("maintenance_mode")
      .eq("id", "global")
      .single();

    if (error) {
      console.error("[API] Gagal mengambil system settings:", error.message);
      return NextResponse.json({ error: "Gagal mengambil pengaturan" }, { status: 500 });
    }

    return NextResponse.json({ maintenance_mode: data?.maintenance_mode ?? false });
  } catch (err) {
    console.error("[API] Unexpected error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

/**
 * PATCH: Update status maintenance mode (admin only)
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    // Pastikan user sudah login dan role-nya admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { maintenance_mode } = body;

    if (typeof maintenance_mode !== "boolean") {
      return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("system_settings")
      .update({ maintenance_mode })
      .eq("id", "global");

    if (error) {
      console.error("[API] Gagal update maintenance mode:", error.message);
      return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, maintenance_mode });
  } catch (err) {
    console.error("[API] Unexpected error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
