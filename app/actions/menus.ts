"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Menu, MenuFormValues } from "@/lib/types";

// Gunakan Service Key untuk akses Admin (bypass RLS jika perlu, atau gunakan client biasa jika RLS sudah diatur)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// === GET MENUS ===
export async function getMenus() {
  const { data, error } = await supabaseAdmin
    .from("menus")
    .select("*")
    .order("section", { ascending: true }) // Kelompokkan by section dulu
    .order("sequence", { ascending: true }); // Lalu urutkan sequence

  if (error) {
    console.error("Error fetching menus:", error.message);
    return [];
  }
  return data as Menu[];
}

// === CREATE MENU ===
export async function createMenu(values: MenuFormValues) {
  const { label, href, icon, section, allowed_roles, sequence, is_active } = values;

  const payload = {
    label,
    href,
    icon,
    section: section || "Menu Utama",
    allowed_roles,
    sequence: Number(sequence) || 0,
    is_active,
  };

  const { error } = await supabaseAdmin.from("menus").insert([payload]);

  if (error) throw new Error(error.message);
  revalidatePath("/menus");
}

// === UPDATE MENU ===
export async function updateMenu(id: number, values: MenuFormValues) {
  const { label, href, icon, section, allowed_roles, sequence, is_active } = values;

  const payload = {
    label,
    href,
    icon,
    section,
    allowed_roles,
    sequence: Number(sequence),
    is_active,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("menus")
    .update(payload)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/menus");
}

// === DELETE MENU ===
export async function deleteMenu(id: number) {
  const { error } = await supabaseAdmin.from("menus").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/menus");
}