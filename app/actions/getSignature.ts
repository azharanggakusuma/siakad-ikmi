"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getSignatureBase64(type: "basah" | "digital") {
  try {
    // 1. Inisialisasi Supabase Admin
    const supabase = createAdminClient();

    // 2. Tentukan nama file
    const filename = type === "digital" ? "ttd-digital.png" : "ttd-basah.png";
    const bucketName = "signatures"; 

    // 3. Download file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filename);

    if (error) {
      console.error(`Error downloading ${filename}:`, error.message);
      return null;
    }

    if (!data) return null;

    // 4. Konversi Blob ke Base64
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:image/png;base64,${buffer.toString("base64")}`;

    return base64String;

  } catch (error) {
    console.error("Gagal memuat tanda tangan dari Supabase:", error);
    return null;
  }
}