"use server";

import { createClient } from "@supabase/supabase-js";

export async function getSignatureBase64(type: "basah" | "digital") {
  try {
    // 1. Inisialisasi Supabase Client
    // Gunakan SERVICE_ROLE_KEY agar bisa membaca bucket "Private" tanpa RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials belum diset di .env");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Tentukan nama file berdasarkan tipe
    const filename = type === "digital" ? "ttd-digital.png" : "ttd-basah.png";
    const bucketName = "signatures"; // Pastikan sesuai nama bucket Anda

    // 3. Download file dari Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filename);

    if (error) {
      console.error(`Error downloading ${filename}:`, error.message);
      return null;
    }

    if (!data) return null;

    // 4. Konversi Blob ke Buffer, lalu ke Base64 String
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:image/png;base64,${buffer.toString("base64")}`;

    return base64String;

  } catch (error) {
    console.error("Gagal memuat tanda tangan dari Supabase:", error);
    return null;
  }
}