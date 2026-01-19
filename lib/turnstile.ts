
import { createClient } from "@/lib/supabase/server";

export async function verifyTurnstile(token: string) {
  // Cek setting sistem terlebih dahulu
  try {
    const supabase = await createClient();
    const { data: setting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'turnstile_enabled')
      .single();

    // Jika setting ditemukan dan value-nya false, bypass verifikasi
    if (setting && setting.value === false) {
      return true;
    }
  } catch (error) {
    // Jika gagal ambil setting, lanjutkan dengan default behavior (verifikasi aktif)
    // atau log error
    console.warn("Gagal cek setting turnstile_enabled, melanjutkan verifikasi default.");
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("Peringatan: TURNSTILE_SECRET_KEY tidak ditemukan.");
    return false;
  }

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  try {
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (e) {
    console.error("Turnstile verification error:", e);
    return false;
  }
}
