"use server";

import { createClient } from "@supabase/supabase-js";

// Inisialisasi Client Admin menggunakan Service Role Key dari ENV
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadAvatar(formData: FormData, oldUrl?: string | null) {
  const file = formData.get("file") as File;
  const username = formData.get("username") as string;

  if (!file || !username) {
    throw new Error("File dan Username diperlukan.");
  }

  // Validasi tipe file
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Format file harus JPG, PNG, atau WEBP.");
  }

  // Validasi ukuran (contoh 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 2MB.");
  }

  try {
    // 1. Buat nama file unik
    const fileExt = file.name.split(".").pop();
    const fileName = `${username}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Hapus file lama jika ada
    if (oldUrl) {
      await deleteAvatarFile(oldUrl);
    }

    // 3. Upload file baru
    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Dapatkan URL Publik
    const { data } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error: any) {
    console.error("Upload Error:", error);
    throw new Error("Gagal mengunggah gambar: " + error.message);
  }
}

// --- FUNGSI BARU UNTUK MENGHAPUS FILE ---
export async function deleteAvatarFile(fileUrl: string) {
  try {
    // URL biasanya: https://[project].supabase.co/storage/v1/object/public/avatars/[filename.jpg]
    // Kita perlu mengambil bagian terakhir (filename)
    const fileName = fileUrl.split("/").pop();

    if (!fileName) return;

    const { error } = await supabaseAdmin.storage
      .from("avatars")
      .remove([fileName]);

    if (error) {
      console.error("Gagal menghapus file dari storage:", error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Delete File Error:", error);
    return { success: false }; // Tidak throw error agar proses DB tetap bisa lanjut jika perlu
  }
}