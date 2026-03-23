import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { decrypt } from '@/lib/encryption'; // Import utilitas enkripsi

export const maxDuration = 60;

const supabase = createAdminClient();

function getAM(hm: string): number {
  const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  return map[hm?.toUpperCase()] ?? 0;
}

// Fungsi untuk mendapatkan API Key yang aktif (Fallback ke .env jika tidak ada/limit)
async function getActiveApiKey() {
  let activeKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  let activeId = null;
  let model: string | null = null;

  try {
    const { data: dbKey } = await supabase
      .from('api_keys')
      .select('id, key_data, model')
      .eq('is_active', true)
      .eq('is_limited', false)
      .limit(1)
      .single();

    if (dbKey && dbKey.key_data) {
      const decrypted = decrypt(dbKey.key_data);
      if (decrypted) {
        activeKey = decrypted;
        activeId = dbKey.id;
        model = dbKey.model;
      }
    }
  } catch (e) {
    console.error("Gagal mengambil API key kustom dari DB, menggunakan default:", e);
  }

  return { activeKey, activeId, model };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return Response.json({ status: 'unauthorized' });

    const keyInfo = await getActiveApiKey();
    if (!keyInfo.activeKey) return Response.json({ status: 'error' });

    const modelName = keyInfo.model as string;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${keyInfo.activeKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) {
      if (keyInfo.activeId) {
        console.log(`[Ping Offline] Menandai key ${keyInfo.activeId} sebagai limit karena LLM offline.`);
        await supabase.from('api_keys').update({ is_limited: true, is_active: false }).eq('id', keyInfo.activeId);
      }
      return Response.json({ status: 'ai_unavailable' });
    }

    return Response.json({ status: 'ok' });
  } catch {
    return Response.json({ status: 'error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let activeApiKeyId: string | null = null;

  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Pesan kosong" }), { status: 400 });
    }

    // Ambil API Key Kustom / Default
    const keyInfo = await getActiveApiKey();
    activeApiKeyId = keyInfo.activeId;

    // Inisialisasi provider Google Generative AI secara dinamis
    const googleAI = createGoogleGenerativeAI({
      apiKey: keyInfo.activeKey as string,
    });

    const modelMessages = await convertToModelMessages(messages);
    const systemPrompt = buildSystemPrompt(session.user);
    const availableTools = buildTools(session.user);

    const result = streamText({
      model: googleAI(keyInfo.model as string),
      system: systemPrompt,
      messages: modelMessages,
      tools: availableTools,
      stopWhen: stepCountIs(5),
      onError: async ({ error }) => {
        const errStatus = (error as any)?.status;
        const errMessage = String(
          (error as any)?.message || (error as any)?.statusText || error
        ).toLowerCase();

        // Deteksi error limit kuota (429)
        const isLimit =
          errStatus === 429 ||
          errMessage.includes('429') ||
          errMessage.includes('too many') ||
          errMessage.includes('quota') ||
          errMessage.includes('rate limit') ||
          errMessage.includes('resource_exhausted');

        // Deteksi error API Key tidak valid / salah
        const isInvalid =
          errStatus === 400 ||
          errStatus === 401 ||
          errStatus === 403 ||
          errMessage.includes('api_key_invalid') ||
          errMessage.includes('invalid api key') ||
          errMessage.includes('api key not valid') ||
          errMessage.includes('permission_denied') ||
          errMessage.includes('invalid_argument');

        if (activeApiKeyId && isLimit) {
          console.log(`[Limit] Menandai key ${activeApiKeyId} sebagai limit.`);
          await supabase
            .from('api_keys')
            .update({ is_limited: true, is_active: false })
            .eq('id', activeApiKeyId);
        } else if (activeApiKeyId && isInvalid) {
          console.log(`[Invalid Key] Menonaktifkan key ${activeApiKeyId} karena API key tidak valid.`);
          await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', activeApiKeyId);
        } else {
          console.error("AI Stream Error:", error);
        }
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    const errString = String(error?.message || error).toLowerCase();

    // Deteksi error limit kuota
    const isLimit = error?.status === 429 || errString.includes('429') || errString.includes('quota') || errString.includes('resource_exhausted');
    // Deteksi API Key tidak valid/salah
    const isInvalid = [400, 401, 403].includes(error?.status) || errString.includes('api_key_invalid') || errString.includes('invalid api key') || errString.includes('permission_denied');

    if (activeApiKeyId && isLimit) {
      console.log(`[Limit Sync] Menandai key ${activeApiKeyId} sebagai limit.`);
      await supabase.from('api_keys').update({ is_limited: true, is_active: false }).eq('id', activeApiKeyId);
      return new Response(JSON.stringify({ error: "API Key mencapai limit. Silakan coba kirim ulang pesan Anda." }), { status: 429 });
    }

    if (activeApiKeyId && isInvalid) {
      console.log(`[Invalid Key Sync] Menonaktifkan key ${activeApiKeyId} karena tidak valid.`);
      await supabase.from('api_keys').update({ is_active: false }).eq('id', activeApiKeyId);
      return new Response(JSON.stringify({ error: "API Key tidak valid atau tidak memiliki akses. Silakan periksa konfigurasi key di halaman Manajemen API Key." }), { status: 401 });
    }

    return new Response(JSON.stringify({ error: "Terjadi kesalahan server" }), { status: 500 });
  }
}

// =====================================
// PROMPT OPTIMIZATION (Hemat Token)
// =====================================
function buildSystemPrompt(user: any): string {
  // Hanya masukkan instruksi inti yang relevan agar menghemat ratusan token
  const base = `Kamu asisten SIAKAD IKMI Cirebon. Aturan:
1. Bhs Indonesia ramah & rapi (Markdown).
2. Jawaban singkat, padat, berdasar data tools.
3. Jangan sebut kamu pakai tools.
Standar Akademik: A=4, B=3, C=2, D=1, E=0. Lulus: S1(144SKS), D3(108SKS).`;

  if (user.role === 'mahasiswa') {
    return `${base}
Bicara dgn mahasiswa: ${user.name} (${user.username}). 
Gunakan data tools (Profil, KHS per semester, Transkrip kumulatif, KRS). Beda KHS (1 smst) & Transkrip (semua).`;
  }
  if (user.role === 'dosen') {
    return `${base}
Bicara dgn Dosen: ${user.name} (${user.username}).
Gunakan data tools Statistik, Daftar Mhs/Dosen/Matkul.`;
  }
  return `${base}
Admin: ${user.name} (${user.username}). Punya akses semua fitur (Statistik, Profil Data).`;
}

// =====================================
// TOOLS OPTIMIZATION (Batas Data Respons Terlalu Besar)
// =====================================
function buildTools(user: any) {
  const isMahasiswa = user.role === 'mahasiswa';

  const baseTools: Record<string, any> = {
    getInfoProdi: tool({
      description: 'Ambil prodi',
      inputSchema: z.object({}),
      execute: async () => {
        const { data } = await supabase.from('study_programs').select('kode,nama,jenjang');
        return data; // Hilangkan bungkus property untuk hemat token JSON
      },
    }),

    getTahunAkademik: tool({
      description: 'Ambil tahun akademik 5 terbaru', // Limit 5 dari 10
      inputSchema: z.object({}),
      execute: async () => {
        const { data } = await supabase.from('academic_years').select('nama,semester,is_active').order('nama', { ascending: false }).limit(5);
        return data;
      },
    }),
  };

  if (isMahasiswa) {
    return {
      ...baseTools,
      getProfilSaya: tool({
        description: 'Biodata mhs login',
        inputSchema: z.object({}),
        execute: async () => {
          const { data } = await supabase.from('students').select('nim,nama,angkatan,semester,status,study_programs(nama,jenjang)').eq('nim', user.username).single();
          return data;
        },
      }),

      getKHSSaya: tool({
        description: 'Lihat KHS (nilai 1 smst)',
        inputSchema: z.object({ semester: z.number().optional() }),
        execute: async ({ semester }: { semester?: number }) => {
          const { data: std } = await supabase.from('students').select('id,semester').eq('nim', user.username).single();
          if (!std) return { err: 'Mhs tdk valid' };

          const tgt = semester || std.semester || 1;
          const { data: grds } = await supabase.from('grades').select('hm,courses:course_id(matkul,sks,smt_default)').eq('student_id', std.id);
          const sGrds = (grds || []).filter((g: any) => g.courses?.smt_default === tgt);

          // Hemat return object format
          const res = sGrds.map((g: any) => ({
            mk: g.courses?.matkul,
            sks: g.courses?.sks,
            hm: g.hm
          }));
          return { smt: tgt, mk: res };
        },
      }),

      getTranskripSaya: tool({
        description: 'Transkrip semua nilai (IPK)',
        inputSchema: z.object({}),
        execute: async () => {
          const { data: std } = await supabase.from('students').select('id').eq('nim', user.username).single();
          if (!std) return { err: 'Err' };
          const { data: grds } = await supabase.from('grades').select('hm,courses:course_id(matkul,sks)').eq('student_id', std.id);

          let ts = 0, tn = 0;
          const list = (grds || []).map((g: any) => {
            const m = g.courses; const amu = getAM(g.hm);
            if (amu >= 2) ts += m.sks;
            tn += amu * m.sks;
            return { mk: m.matkul, sks: m.sks, nilai: g.hm };
          });
          const allSks = (grds || []).reduce((a: any, c: any) => a + c.courses.sks, 0);
          return { ipk: allSks ? (tn / allSks).toFixed(2) : 0, sks: ts, ls: list.slice(0, 15) }; // Limit list 15 max jk terlalu besar
        },
      }),

      getKRSSaya: tool({
        description: 'KRS aktif',
        inputSchema: z.object({}),
        execute: async () => {
          const { data: std } = await supabase.from('students').select('id').eq('nim', user.username).single();
          const { data: y } = await supabase.from('academic_years').select('id,nama').eq('is_active', true).single();
          if (!y || !std) return { err: 'Err' };
          const { data: k } = await supabase.from('krs').select('courses:course_id(matkul,sks)').eq('student_id', std.id).eq('academic_year_id', y.id);
          return { thn: y.nama, mk: k?.map((x: any) => x.courses) };
        }
      })
    };
  }

  // Admin Tools (Batasi response)
  return {
    ...baseTools,
    getStatistik: tool({
      description: 'Statistik SIAKAD',
      inputSchema: z.object({}),
      execute: async () => {
        const [m, d, c] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('lecturers').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
        ]);
        return { mhs: m.count, dsn: d.count, mk: c.count };
      }
    }),
    cariMahasiswa: tool({
      description: 'Cari mhs',
      inputSchema: z.object({ kw: z.string() }),
      execute: async ({ kw }: { kw: string }) => {
        const { data } = await supabase.from('students').select('nim,nama').ilike(/^\d+$/.test(kw) ? 'nim' : 'nama', `%${kw}%`).limit(3); // Batasi max 3 biar hemat token
        return data;
      }
    })
  };
}
