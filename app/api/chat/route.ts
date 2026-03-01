import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 60;

// Inisialisasi Supabase admin client untuk query database
const supabase = createAdminClient();

// Mapping nilai huruf ke angka mutu
function getAM(hm: string): number {
  const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  return map[hm?.toUpperCase()] ?? 0;
}

export async function POST(req: Request) {
  try {
    // Ambil session user yang sedang login
    const session = await auth();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const user = session.user;
    const { messages } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    // System prompt dan tools yang disesuaikan berdasarkan role user
    const systemPrompt = buildSystemPrompt(user);
    const availableTools = buildTools(user);

    const result = streamText({
      model: google('gemini-3-flash-preview'),
      system: systemPrompt,
      messages: modelMessages,
      tools: availableTools,
      stopWhen: stepCountIs(5),
      onError: ({ error }) => {
        console.error("AI SDK Stream Error:", error);
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ============================================================
// System Prompt Builder — menyesuaikan konteks per role
// ============================================================
function buildSystemPrompt(user: any): string {
  const basePrompt = `Kamu adalah **SIAKAD Bot**, asisten AI virtual yang terintegrasi dalam Sistem Informasi Akademik (SIAKAD) STMIK IKMI Cirebon.

## Aturan Penting
1. Selalu jawab menggunakan **Bahasa Indonesia** yang profesional, ramah, dan informatif.
2. Gunakan format **Markdown** untuk menyusun jawaban agar rapi dan mudah dibaca.
3. Gunakan heading, bullet points, bold, dan emoji yang sesuai untuk meningkatkan keterbacaan.
4. Jangan memberikan informasi palsu — akui jika tidak tahu dan sarankan menghubungi pihak kampus.
5. Gunakan tools yang tersedia untuk mengambil data dari database saat dibutuhkan.
6. PENTING: Jangan pernah mengungkapkan bahwa kamu mengambil data dari database atau memanggil tools. Cukup jawab dengan data yang relevan seolah kamu sudah mengetahuinya.

## Panduan Akademik
- **Sistem Penilaian**: A (4.00), B (3.00), C (2.00), D (1.00), E (0.00)
- **IPK** dihitung dari total (Angka Mutu × SKS) / Total SKS
- **Syarat Kelulusan**: S1 minimal 144 SKS, D3 minimal 108 SKS`;

  if (user.role === 'mahasiswa') {
    return `${basePrompt}

## Konteks User
Kamu sedang berbicara dengan **mahasiswa** bernama **${user.name}** (NIM: ${user.username}).
Data yang kamu tampilkan HARUS milik mahasiswa ini saja. Jangan pernah menampilkan data mahasiswa lain.

## Fitur yang Bisa Dibantu
- **Biodata / Profil** — Data pribadi mahasiswa (nama, NIM, alamat, prodi, dll)
- **KHS (Kartu Hasil Studi)** — Nilai per semester tertentu beserta IP semester
- **Transkrip Nilai** — Seluruh nilai dari semua semester, IPK keseluruhan, dan total SKS lulus
- **KRS (Kartu Rencana Studi)** — Mata kuliah yang sedang diambil di tahun akademik aktif
- **Program Studi** — Informasi program studi yang tersedia
- **Tahun Akademik** — Informasi tahun akademik aktif dan sebelumnya

## Perbedaan KHS dan Transkrip
- **KHS**: Menampilkan nilai HANYA untuk 1 semester tertentu, beserta IP semester tersebut
- **Transkrip**: Menampilkan SELURUH nilai dari semua semester yang sudah ditempuh, beserta IPK kumulatif
Jangan pernah menyamakan KHS dengan Transkrip. Jika user bertanya KHS, tampilkan data per semester. Jika user bertanya transkrip, tampilkan seluruh data.`;
  }

  if (user.role === 'dosen') {
    return `${basePrompt}

## Konteks User
Kamu sedang berbicara dengan **dosen** bernama **${user.name}** (Username: ${user.username}).

## Fitur yang Bisa Dibantu
- Melihat **statistik** keseluruhan (total mahasiswa, dosen, mata kuliah)
- Melihat **daftar mahasiswa** dan mencari mahasiswa berdasarkan NIM/nama
- Melihat **daftar mata kuliah** dan program studi
- Melihat **daftar dosen** yang terdaftar
- Informasi **tahun akademik**
- Panduan penggunaan fitur SIAKAD`;
  }

  // Admin / Superuser
  return `${basePrompt}

## Konteks User
Kamu sedang berbicara dengan **${user.role}** bernama **${user.name}** (Username: ${user.username}).
Kamu memiliki akses penuh ke semua data akademik.

## Fitur yang Bisa Dibantu
- **Statistik** — Total mahasiswa, dosen, mata kuliah, prodi
- **Data Mahasiswa** — Cari profil, KHS, transkrip, KRS mahasiswa berdasarkan NIM/nama
- **Daftar Dosen** — Informasi dosen yang terdaftar
- **Daftar Mata Kuliah** — Mata kuliah beserta SKS, semester, dan prodi terkait
- **Program Studi** — Informasi program studi yang tersedia
- **Tahun Akademik** — Informasi tahun akademik aktif
- Panduan penggunaan dan pengelolaan sistem SIAKAD`;
}

// ============================================================
// Tools Builder — tools yang tersedia berdasarkan role user
// ============================================================
function buildTools(user: any) {
  const isMahasiswa = user.role === 'mahasiswa';

  // Tools dasar yang tersedia untuk semua role
  const baseTools: Record<string, any> = {
    getInfoProdi: tool({
      description: 'Mengambil daftar semua program studi yang tersedia di STMIK IKMI Cirebon',
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await supabase
          .from('study_programs')
          .select('kode, nama, jenjang')
          .order('kode', { ascending: true });
        if (error) return { error: 'Gagal mengambil data prodi' };
        return { programs: data };
      },
    }),

    getTahunAkademik: tool({
      description: 'Mengambil informasi tahun akademik, termasuk yang sedang aktif saat ini',
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await supabase
          .from('academic_years')
          .select('nama, semester, is_active')
          .order('nama', { ascending: false })
          .limit(10);
        if (error) return { error: 'Gagal mengambil data tahun akademik' };
        const active = data?.find((y: any) => y.is_active);
        return { tahunAkademik: data, aktif: active || null };
      },
    }),
  };

  // Tools khusus untuk mahasiswa
  if (isMahasiswa) {
    return {
      ...baseTools,

      getProfilSaya: tool({
        description: 'Mengambil data profil dan biodata mahasiswa yang sedang login',
        inputSchema: z.object({}),
        execute: async () => {
          const { data, error } = await supabase
            .from('students')
            .select(`
              nim, nama, alamat, angkatan, semester, is_active,
              jenis_kelamin, tempat_lahir, tanggal_lahir, agama, nik, status, no_hp, email,
              study_programs:study_program_id (kode, nama, jenjang)
            `)
            .eq('nim', user.username)
            .single();
          if (error) return { error: 'Gagal mengambil data profil' };
          return { profil: data };
        },
      }),

      getKHSSaya: tool({
        description: 'Mengambil KHS (Kartu Hasil Studi) mahasiswa — menampilkan nilai per semester tertentu beserta IP semester. Gunakan tool ini jika user bertanya tentang KHS atau nilai di semester tertentu.',
        inputSchema: z.object({
          semester: z.number().optional().describe('Nomor semester yang ingin dilihat KHS-nya. Jika tidak diisi, tampilkan semester terakhir.'),
        }),
        execute: async ({ semester }: { semester?: number }) => {
          const { data: student, error: studentError } = await supabase
            .from('students')
            .select('id, semester')
            .eq('nim', user.username)
            .single();
          if (studentError || !student) return { error: 'Data mahasiswa tidak ditemukan' };

          const targetSmt = semester || student.semester || 1;

          const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select(`hm, courses:course_id (kode, matkul, sks, smt_default, kategori)`)
            .eq('student_id', student.id);
          if (gradesError) return { error: 'Gagal mengambil data nilai' };

          const semesterGrades = (grades || []).filter((g: any) => g.courses?.smt_default === targetSmt);

          if (semesterGrades.length === 0) {
            return { pesan: `Belum ada data nilai untuk semester ${targetSmt}`, semester: targetSmt };
          }

          const items = semesterGrades.map((g: any, i: number) => ({
            no: i + 1,
            kode: g.courses?.kode || '-',
            matkul: g.courses?.matkul || '-',
            sks: g.courses?.sks || 0,
            hm: g.hm,
            am: getAM(g.hm),
            nm: getAM(g.hm) * (g.courses?.sks || 0),
          }));

          const totalSKS = items.reduce((acc: number, t: any) => acc + t.sks, 0);
          const totalNM = items.reduce((acc: number, t: any) => acc + t.nm, 0);
          const ipSemester = totalSKS > 0 ? (totalNM / totalSKS).toFixed(2) : '0.00';

          return {
            semester: targetSmt,
            khs: items,
            ringkasan: { totalMataKuliah: items.length, totalSKS, ipSemester }
          };
        },
      }),

      getTranskripSaya: tool({
        description: 'Mengambil transkrip nilai LENGKAP dari SELURUH semester mahasiswa yang sedang login, termasuk IPK kumulatif dan total SKS lulus. Gunakan tool ini jika user bertanya tentang transkrip, IPK keseluruhan, atau seluruh nilai.',
        inputSchema: z.object({}),
        execute: async () => {
          const { data: student, error: studentError } = await supabase
            .from('students')
            .select('id')
            .eq('nim', user.username)
            .single();
          if (studentError || !student) return { error: 'Data mahasiswa tidak ditemukan' };

          const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select(`
              hm,
              courses:course_id (kode, matkul, sks, smt_default, kategori)
            `)
            .eq('student_id', student.id);
          if (gradesError) return { error: 'Gagal mengambil data nilai' };

          const transcript = (grades || []).map((g: any, i: number) => ({
            no: i + 1,
            kode: g.courses?.kode || '-',
            matkul: g.courses?.matkul || '-',
            sks: g.courses?.sks || 0,
            smt: g.courses?.smt_default || 0,
            hm: g.hm,
            am: getAM(g.hm),
            nm: getAM(g.hm) * (g.courses?.sks || 0),
            kategori: g.courses?.kategori || 'Reguler'
          }));

          const totalSKS = transcript.filter(t => t.am >= 2).reduce((acc, t) => acc + t.sks, 0);
          const totalNM = transcript.reduce((acc, t) => acc + t.nm, 0);
          const totalSKSAll = transcript.reduce((acc, t) => acc + t.sks, 0);
          const ipk = totalSKSAll > 0 ? (totalNM / totalSKSAll).toFixed(2) : '0.00';

          return {
            transkrip: transcript,
            ringkasan: {
              totalMataKuliah: transcript.length,
              totalSKSLulus: totalSKS,
              ipk: ipk
            }
          };
        },
      }),

      getKRSSaya: tool({
        description: 'Mengambil data KRS (Kartu Rencana Studi) mahasiswa yang sedang login pada tahun akademik aktif',
        inputSchema: z.object({}),
        execute: async () => {
          const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('nim', user.username)
            .single();
          if (!student) return { error: 'Data mahasiswa tidak ditemukan' };

          const { data: activeYear } = await supabase
            .from('academic_years')
            .select('id, nama, semester')
            .eq('is_active', true)
            .single();
          if (!activeYear) return { error: 'Tidak ada tahun akademik aktif' };

          const { data: krsData, error } = await supabase
            .from('krs')
            .select(`
              status, created_at,
              courses:course_id (kode, matkul, sks, smt_default)
            `)
            .eq('student_id', student.id)
            .eq('academic_year_id', activeYear.id);
          if (error) return { error: 'Gagal mengambil data KRS' };

          const totalSKS = (krsData || []).reduce((acc: number, k: any) => acc + (k.courses?.sks || 0), 0);

          return {
            tahunAkademik: `${activeYear.nama} - ${activeYear.semester}`,
            mataKuliah: krsData?.map((k: any) => ({
              kode: k.courses?.kode,
              matkul: k.courses?.matkul,
              sks: k.courses?.sks,
              semester: k.courses?.smt_default,
              status: k.status
            })) || [],
            totalSKS,
            totalMataKuliah: krsData?.length || 0
          };
        },
      }),
    };
  }

  // Tools untuk admin/dosen — akses ke data luas
  return {
    ...baseTools,

    getStatistik: tool({
      description: 'Mengambil statistik umum SIAKAD: jumlah mahasiswa, dosen aktif, mata kuliah, dan program studi',
      inputSchema: z.object({}),
      execute: async () => {
        const [students, lecturers, courses, programs] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('lecturers').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('study_programs').select('id', { count: 'exact', head: true }),
        ]);

        return {
          totalMahasiswa: students.count || 0,
          totalDosenAktif: lecturers.count || 0,
          totalMataKuliah: courses.count || 0,
          totalProdi: programs.count || 0
        };
      },
    }),

    getDaftarMahasiswa: tool({
      description: 'Mengambil daftar mahasiswa terdaftar. Gunakan parameter limit untuk membatasi jumlah data.',
      inputSchema: z.object({
        limit: z.number().optional().describe('Jumlah maksimal data yang ditampilkan, default 20'),
      }),
      execute: async ({ limit = 20 }: { limit?: number }) => {
        const { data, error } = await supabase
          .from('students')
          .select(`
            nim, nama, angkatan, semester, is_active, status,
            study_programs:study_program_id (nama, jenjang)
          `)
          .order('nama', { ascending: true })
          .limit(limit);
        if (error) return { error: 'Gagal mengambil data mahasiswa' };
        return { mahasiswa: data, total: data?.length || 0 };
      },
    }),

    cariMahasiswa: tool({
      description: 'Mencari mahasiswa berdasarkan NIM atau nama. Bisa juga dipakai untuk melihat detail profil dan transkrip mahasiswa.',
      inputSchema: z.object({
        keyword: z.string().describe('NIM atau nama mahasiswa yang dicari'),
      }),
      execute: async ({ keyword }: { keyword: string }) => {
        let query = supabase
          .from('students')
          .select(`
            id, nim, nama, alamat, angkatan, semester, is_active, status,
            jenis_kelamin, tempat_lahir, tanggal_lahir, agama, no_hp, email,
            study_programs:study_program_id (kode, nama, jenjang)
          `);

        if (/^\d+$/.test(keyword)) {
          query = query.ilike('nim', `%${keyword}%`);
        } else {
          query = query.ilike('nama', `%${keyword}%`);
        }

        const { data, error } = await query.limit(10);
        if (error) return { error: 'Gagal mencari mahasiswa' };
        if (!data || data.length === 0) return { pesan: 'Tidak ditemukan mahasiswa dengan keyword tersebut' };

        // Jika hanya 1 hasil, ambil juga transkrip-nya
        if (data.length === 1) {
          const student = data[0];
          const { data: grades } = await supabase
            .from('grades')
            .select(`hm, courses:course_id (kode, matkul, sks, smt_default)`)
            .eq('student_id', student.id);

          const transcript = (grades || []).map((g: any, i: number) => ({
            no: i + 1,
            kode: g.courses?.kode || '-',
            matkul: g.courses?.matkul || '-',
            sks: g.courses?.sks || 0,
            smt: g.courses?.smt_default || 0,
            hm: g.hm,
          }));

          const totalNM = transcript.reduce((acc: number, t: any) => acc + getAM(t.hm) * t.sks, 0);
          const totalSKS = transcript.reduce((acc: number, t: any) => acc + t.sks, 0);
          const ipk = totalSKS > 0 ? (totalNM / totalSKS).toFixed(2) : '0.00';

          return {
            mahasiswa: student,
            transkrip: transcript,
            ringkasan: { totalMataKuliah: transcript.length, ipk }
          };
        }

        return { hasil: data };
      },
    }),

    getDaftarDosen: tool({
      description: 'Mengambil daftar semua dosen yang terdaftar di STMIK IKMI',
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await supabase
          .from('lecturers')
          .select('nidn, nama, email, is_active')
          .order('nama', { ascending: true });
        if (error) return { error: 'Gagal mengambil data dosen' };
        return { dosen: data };
      },
    }),

    getDaftarMatakuliah: tool({
      description: 'Mengambil daftar mata kuliah beserta SKS dan semester default',
      inputSchema: z.object({
        prodiFilter: z.string().optional().describe('Filter berdasarkan nama program studi (opsional)'),
      }),
      execute: async ({ prodiFilter }: { prodiFilter?: string }) => {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            kode, matkul, sks, smt_default, kategori,
            course_study_programs (
              study_program:study_programs (nama, jenjang)
            )
          `)
          .order('smt_default', { ascending: true });
        if (error) return { error: 'Gagal mengambil data mata kuliah' };

        let result = (data || []).map((c: any) => ({
          kode: c.kode,
          matkul: c.matkul,
          sks: c.sks,
          semester: c.smt_default,
          kategori: c.kategori,
          prodi: c.course_study_programs?.map((csp: any) => csp.study_program?.nama).filter(Boolean) || []
        }));

        if (prodiFilter) {
          result = result.filter((c: any) => c.prodi.some((p: string) => p.toLowerCase().includes(prodiFilter.toLowerCase())));
        }

        return { mataKuliah: result, total: result.length };
      },
    }),
  };
}
