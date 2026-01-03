"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Menu, MenuFormValues } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// === GET MENUS ===
export async function getMenus() {
  const { data, error } = await supabaseAdmin
    .from("menus")
    .select(`
      *,
      parent:parent_id (
        label
      )
    `)
    .order("section", { ascending: true })
    .order("sequence", { ascending: true });

  if (error) {
    console.error("Error fetching menus:", error.message);
    return [];
  }
  return data as Menu[];
}

// === CREATE MENU ===
export async function createMenu(values: MenuFormValues) {
  const { label, href, icon, section, allowed_roles, sequence, is_active, parent_id } = values;

  // UUID: Jika string kosong atau "0", anggap null
  const formattedParentId = (!parent_id || parent_id === "0") ? null : parent_id;

  const payload = {
    label,
    href,
    icon,
    section: section || "Menu Utama",
    parent_id: formattedParentId,
    allowed_roles,
    sequence: Number(sequence) || 0,
    is_active,
  };

  const { error } = await supabaseAdmin.from("menus").insert([payload]);
  if (error) throw new Error(error.message);
  revalidatePath("/menus");
}

// === UPDATE MENU ===
export async function updateMenu(id: string, values: MenuFormValues) {
  const { label, href, icon, section, allowed_roles, sequence, is_active, parent_id } = values;

  const formattedParentId = (!parent_id || parent_id === "0") ? null : parent_id;

  const payload = {
    label,
    href,
    icon,
    section,
    parent_id: formattedParentId,
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
export async function deleteMenu(id: string) {
  const { error } = await supabaseAdmin.from("menus").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/menus");
}

// === REORDER MENUS (DRAG & DROP) ===
export async function reorderMenus(items: { id: string; sequence: number }[]) {
  // Update batch urutan
  const updates = items.map((item) =>
    supabaseAdmin
      .from("menus")
      .update({ sequence: item.sequence })
      .eq("id", item.id)
  );

  await Promise.all(updates);
  revalidatePath("/menus");
}