'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { StudentData, TranscriptItem, StudentFormValues, StudyProgram, AcademicYear, Official } from "@/lib/types";

const supabaseAdmin = createAdminClient();

// Internal Interface
interface DBResponseStudent {
  id: string;
  nim: string;
  nama: string;
  alamat: string;
  angkatan: number; 
  study_program_id: string | null;
  is_active: boolean;
  study_programs: StudyProgram | null;
  grades: {
    id: string;
    hm: string;
    courses: {
      id: string;
      kode: string;
      matkul: string;
      sks: number;
      smt_default: number;
    } | null;
  }[];
  
  krs: {
    status: string; 
    courses: {
      id: string;
      kode: string;
      matkul: string;
      sks: number;
      smt_default: number;
    } | null;
  }[];
}

const getAM = (hm: string): number => {
  const map: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  return map[hm] || 0;
};

// --- HELPER CALCULATE SEMESTER ---
const calculateSemester = (angkatan: number | null, activeYear: { nama: string, semester: string } | null): number => {
  if (!angkatan || !activeYear) return 1; 
  
  const currentStartYear = parseInt(activeYear.nama.split('/')[0]);
  if (isNaN(currentStartYear)) return 1;

  const yearDiff = currentStartYear - angkatan;
  let sem = yearDiff * 2;

  if (activeYear.semester === 'Ganjil') {
    sem += 1;
  } else if (activeYear.semester === 'Genap') {
    sem += 2;
  }

  return sem > 0 ? sem : 1;
};

// --- HELPER ERROR HANDLING ---
const handleDbError = (error: any, context: string) => {
  console.error(`[DB_ERROR] ${context}:`, error);

  if (error.code === '23505') {
    if (error.message?.includes('nim')) {
        throw new Error("NIM tersebut sudah terdaftar. Silakan gunakan NIM lain.");
    }
    throw new Error("Data duplikat terdeteksi dalam sistem.");
  }

  if (error.code === '23503') {
    throw new Error("Data tidak dapat dihapus atau diubah karena sedang digunakan oleh data lain.");
  }

  throw new Error("Gagal memproses data. Terjadi kendala di server.");
};

// --- READ OPERATIONS ---

export async function getStudyPrograms(): Promise<StudyProgram[]> {
  const { data, error } = await supabaseAdmin
    .from('study_programs')
    .select('*')
    .order('nama', { ascending: true });
  
  if (error) return [];
  return data as StudyProgram[];
}

export async function getActiveAcademicYear(): Promise<AcademicYear | null> {
  const { data, error } = await supabaseAdmin
    .from('academic_years')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') console.error("Error fetching active academic year:", error.message);
    return null;
  }
  return data as AcademicYear;
}

export async function getActiveOfficial(): Promise<Official | null> {
  const { data, error } = await supabaseAdmin
    .from('officials')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') console.error("Error fetching active official:", error.message);
    return null;
  }
  return data as Official;
}

export async function getStudents(): Promise<StudentData[]> {
  const activeYear = await getActiveAcademicYear();

  // 1. AMBIL DATA USERS SECARA TERPISAH (Untuk Foto)
  const { data: usersData } = await supabaseAdmin
    .from('users')
    .select('student_id, avatar_url')
    .not('student_id', 'is', null);
  
  const avatarMap = new Map<string, string>();
  if (usersData) {
    usersData.forEach((u) => {
      if (u.student_id && u.avatar_url) {
        avatarMap.set(u.student_id, u.avatar_url);
      }
    });
  }

  // 2. AMBIL DATA MAHASISWA
  const { data, error } = await supabaseAdmin
    .from('students')
    .select(`
      *,
      study_programs (
        id, kode, nama, jenjang
      ),
      grades (
        id, hm,
        courses (
          id, kode, matkul, sks, smt_default
        )
      ),
      krs (
        status,
        courses (
          id, kode, matkul, sks, smt_default
        )
      )
    `)
    .order('nama', { ascending: true });

  if (error) {
    console.error("Error fetching students:", error.message);
    return [];
  }

  if (!data) return [];

  const students = data as unknown as DBResponseStudent[];

  return students.map((s) => {
    const dynamicSemester = calculateSemester(s.angkatan, activeYear);
    const userAvatar = avatarMap.get(s.id) || null;

    const totalSksApproved = (s.krs || []).reduce((acc, curr) => {
        if (curr.status === "APPROVED") {
            return acc + (curr.courses?.sks || 0);
        }
        return acc;
    }, 0);

    const gradesTranscript: TranscriptItem[] = (s.grades || []).map((g) => {
        const course = g.courses;
        const am = getAM(g.hm);
        const sks = course?.sks || 0;
        const nm = am * sks;

        return {
          no: 0, 
          course_id: course?.id,
          kode: course?.kode || "CODE",
          matkul: course?.matkul || "Unknown",
          smt: course?.smt_default || 1,
          sks: sks,
          hm: g.hm,
          am: am,
          nm: nm
        };
    });

    const gradeCourseIds = new Set(gradesTranscript.map(t => t.course_id));
    
    const krsTranscript: TranscriptItem[] = (s.krs || [])
      .filter(k => k.status === 'APPROVED' && k.courses && !gradeCourseIds.has(k.courses.id))
      .map(k => {
          const c = k.courses!;
          return {
            no: 0,
            course_id: c.id,
            kode: c.kode,
            matkul: c.matkul,
            smt: c.smt_default,
            sks: c.sks,
            hm: "-", 
            am: 0,
            nm: 0
          };
      });

    const fullTranscript = [...gradesTranscript, ...krsTranscript]
      .sort((a, b) => a.smt - b.smt || a.kode.localeCompare(b.kode))
      .map((item, index) => ({ ...item, no: index + 1 }));

    return {
      id: s.id,
      profile: {
        id: s.id,
        nim: s.nim,
        nama: s.nama,
        alamat: s.alamat,
        angkatan: s.angkatan || 0,
        semester: dynamicSemester, 
        study_program_id: s.study_program_id,
        study_program: s.study_programs,
        is_active: s.is_active ?? true,
        avatar_url: userAvatar,
      },
      transcript: fullTranscript, 
      total_sks: totalSksApproved 
    };
  });
}

// --- CRUD OPERATIONS ---
export async function createStudent(values: StudentFormValues) {
  const { error } = await supabaseAdmin.from('students').insert([{
    nim: values.nim,
    nama: values.nama,
    angkatan: Number(values.angkatan), 
    alamat: values.alamat,
    study_program_id: values.study_program_id || null, 
    is_active: values.is_active,
  }]);
  
  if (error) handleDbError(error, "createStudent");
  
  revalidatePath('/mahasiswa'); 
}

export async function updateStudent(id: string, values: StudentFormValues) {
  const { error } = await supabaseAdmin.from('students').update({
    nim: values.nim,
    nama: values.nama,
    angkatan: Number(values.angkatan),
    alamat: values.alamat,
    study_program_id: values.study_program_id || null,
    is_active: values.is_active,
  }).eq('id', id);

  if (error) handleDbError(error, "updateStudent");
  
  revalidatePath('/mahasiswa');
}

export async function deleteStudent(id: string) {
  const { error } = await supabaseAdmin.from('students').delete().eq('id', id);
  
  if (error) handleDbError(error, "deleteStudent");
  
  revalidatePath('/mahasiswa');
}