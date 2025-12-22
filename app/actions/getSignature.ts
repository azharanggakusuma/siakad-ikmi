// app/actions/getSignature.ts
"use server";

import fs from "fs/promises";
import path from "path";

export async function getSignatureBase64(type: "basah" | "digital") {
  try {
    // Tentukan nama file berdasarkan tipe
    const filename = type === "digital" ? "ttd-digital.png" : "ttd-basah.png";
    
    // Cari path absolut ke folder private_assets di server
    const filePath = path.join(process.cwd(), "private_assets", filename);

    // Baca file gambar
    const fileBuffer = await fs.readFile(filePath);

    // Ubah ke format Base64 string
    const base64String = `data:image/png;base64,${fileBuffer.toString("base64")}`;

    return base64String;
  } catch (error) {
    console.error("Gagal memuat tanda tangan:", error);
    return null;
  }
}