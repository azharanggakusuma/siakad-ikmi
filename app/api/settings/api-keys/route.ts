import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { encrypt, decrypt } from '@/lib/encryption';

const supabase = createAdminClient();

export const dynamic = 'force-dynamic';

// Ambil semua API Key
export async function GET(req: Request) {
  const session = await auth();
  const isAdmin = session?.user && !['mahasiswa', 'dosen'].includes(session.user.role as any);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, is_active, is_limited, key_data, model, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Gagal mengambil API keys' }, { status: 500 });
  }

  const decryptedData = data.map((item) => ({
    ...item,
    key_data: item.key_data ? decrypt(item.key_data) : ''
  }));

  const envKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (envKey) {
    const hasActiveCustomKey = decryptedData.some(k => k.is_active && !k.is_limited);
    decryptedData.unshift({
      id: 'env-default',
      name: 'Default',
      is_active: !hasActiveCustomKey,
      is_limited: false,
      key_data: envKey,
      model: 'gemini-3-flash-preview',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json(decryptedData);
}

// Tambah API Key baru
export async function POST(req: Request) {
  const session = await auth();
  const isAdmin = session?.user && !['mahasiswa', 'dosen'].includes(session.user.role as any);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, key_data, model } = await req.json();
    if (!name || !key_data || !model) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const encryptedKey = encrypt(key_data);

    const { error } = await supabase
      .from('api_keys')
      .insert({ name, key_data: encryptedKey, model });

    if (error) throw error;
    return NextResponse.json({ message: 'API key berhasil ditambahkan' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

// Update API Key (Set Active, Set Default, atau Edit)
export async function PATCH(req: Request) {
  const session = await auth();
  const isAdmin = session?.user && !['mahasiswa', 'dosen'].includes(session.user.role as any);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, id, name, key_data, model } = await req.json();

    if (action === 'set_active') {
      // 1. Matikan semua key terlebih dahulu
      await supabase.from('api_keys').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      // 2. Set key dengan ID spesifik menjadi aktif, dan bersihkan status is_limited-nya juga jika diaktifkan ulang
      const { error } = await supabase.from('api_keys').update({ is_active: true, is_limited: false }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ message: 'API key berhasil diaktifkan' });
    }

    if (action === 'set_default') {
      // Matikan semua key, fallback akan otomatis menggunakan env
      await supabase.from('api_keys').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      return NextResponse.json({ message: 'Sistem kembali menggunakan Default API Key (.env)' });
    }

    if (action === 'edit') {
      const payload: any = { name, model, updated_at: new Date().toISOString() };
      if (key_data) {
        payload.key_data = encrypt(key_data);
        payload.is_limited = false; // Jika diubah key-nya, asumsikan bukan limit lagi
      }
      const { error } = await supabase.from('api_keys').update(payload).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ message: 'API key berhasil diubah' });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

// Hapus API Key
export async function DELETE(req: Request) {
  const session = await auth();
  const isAdmin = session?.user && !['mahasiswa', 'dosen'].includes(session.user.role as any);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'API key berhasil dihapus' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}
