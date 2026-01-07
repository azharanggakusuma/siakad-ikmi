"use server";

import { supabase } from "@/lib/supabase";
import { KRS, KRSFormValues, Course } from "@/lib/types";
import { revalidatePath } from "next/cache";

// Tipe Data Khusus untuk Tampilan "Belanja KRS"
export interface CourseOffering extends Course {
  is_taken: boolean;
  krs_id?: string;
  krs_status?: string; // DRAFT, SUBMITTED, APPROVED, REJECTED
}

// ==========================================
// GATEKEEPER & VALIDATION
// ==========================================

export async function validateStudentKrs(studentId: string) {
  try {
    const { data: activeYear, error: yearError } = await supabase
      .from("academic_years")
      .select("id, nama, semester")
      .eq("is_active", true)
      .single();

    if (yearError || !activeYear) {
      return { allowed: false, message: "Tahun akademik tidak aktif." };
    }

    const { data: krs, error: krsError } = await supabase
      .from("krs")
      .select("status")
      .eq("student_id", studentId)
      .eq("academic_year_id", activeYear.id)
      .in("status", ["SUBMITTED", "APPROVED"]) 
      .limit(1);

    const hasValidKrs = krs && krs.length > 0;

    if (!hasValidKrs) {
      return { 
        allowed: false, 
        message: "Anda belum mengajukan atau menyelesaikan KRS untuk semester ini.",
        reason: "no_krs"
      };
    }

    return { allowed: true, year: activeYear };

  } catch (error) {
    return { allowed: false, message: "Terjadi kesalahan sistem saat memvalidasi KRS." };
  }
}

export async function getStudentSksCount(studentId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from("krs")
        .select(`course:courses (sks)`)
        .eq("student_id", studentId)
        .eq("academic_year_id", academicYearId);
      
      if (error || !data) return 0;

      const totalSks = data.reduce((acc: number, curr: any) => {
        return acc + (curr.course?.sks || 0);
      }, 0);
      
      return totalSks;
    } catch (error) {
      return 0;
    }
}

// ==========================================
// STUDENT ACTIONS (MAHASISWA)
// ==========================================

export async function getKRSByStudent(studentId: string, academicYearId: string) {
  try {
    const { data, error } = await supabase
      .from("krs")
      .select(`
        *,
        course:courses (id, kode, matkul, sks, smt_default, kategori),
        academic_year:academic_years (id, nama, semester)
      `)
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as KRS[];
  } catch (error) {
    console.error("Error fetching KRS:", error);
    throw new Error("Gagal mengambil data KRS.");
  }
}

// [LOGIKA FILTER MBKM]
export async function getStudentCourseOfferings(studentId: string, academicYearId: string) {
  try {
    // A. Ambil Data Mahasiswa
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(`*, study_program:study_programs (nama, jenjang)`)
      .eq("id", studentId)
      .single();

    if (studentError) throw new Error("Data mahasiswa tidak ditemukan");

    // B. Ambil Data Tahun Akademik
    const { data: academicYear, error: yearError } = await supabase
      .from("academic_years")
      .select("nama, semester")
      .eq("id", academicYearId)
      .single();

    if (yearError) throw new Error("Tahun akademik tidak ditemukan");

    // --- LOGIKA HITUNG SEMESTER ---
    let calculatedSemester = 1;
    if (student.angkatan && academicYear.nama) {
      const activeStartYear = parseInt(academicYear.nama.split('/')[0]);
      const studentEntryYear = parseInt(student.angkatan);

      if (!isNaN(activeStartYear) && !isNaN(studentEntryYear)) {
        const yearDiff = activeStartYear - studentEntryYear;
        calculatedSemester = (yearDiff * 2);
        if (academicYear.semester === 'Ganjil') calculatedSemester += 1;
        else if (academicYear.semester === 'Genap') calculatedSemester += 2;
        if (calculatedSemester < 1) calculatedSemester = 1;
      }
    }

    // C. Cek Status MBKM Mahasiswa
    const { data: mbkmData } = await supabase
      .from("student_mbkm")
      .select("jenis_mbkm, mitra")
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId)
      .single();

    // D. Build Query Mata Kuliah
    let courseQuery = supabase
      .from("courses")
      .select("*")
      .eq("smt_default", calculatedSemester) 
      .order("matkul", { ascending: true });

    // [LOGIKA FILTER]: 
    // 1. Jika PMM ("Pertukaran Mahasiswa Merdeka") -> Wajib ambil matkul kategori 'MBKM'
    // 2. Jika MBKM Lain atau Reguler -> Ambil matkul 'Reguler' (Non-MBKM).
    if (mbkmData && mbkmData.jenis_mbkm === "Pertukaran Mahasiswa Merdeka") {
      courseQuery = courseQuery.eq("kategori", "MBKM");
    } else {
      courseQuery = courseQuery.neq("kategori", "MBKM");
    }

    const { data: courses, error: courseError } = await courseQuery;
    if (courseError) throw courseError;

    // E. Ambil Data KRS yang SUDAH diambil
    const { data: takenKRS, error: krsError } = await supabase
      .from("krs")
      .select("id, course_id, status")
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId);

    if (krsError) throw krsError;

    // F. Gabungkan Data
    const offerings: CourseOffering[] = courses.map((course) => {
      const taken = takenKRS.find((k) => k.course_id === course.id);
      return {
        ...course,
        is_taken: !!taken, 
        krs_id: taken?.id,
        krs_status: taken?.status
      };
    });

    return {
      student_semester: calculatedSemester,
      student_profile: student, 
      offerings: offerings,
      mbkm_data: mbkmData || null 
    };

  } catch (error) {
    console.error("Error fetching offerings:", error);
    return { student_semester: 0, student_profile: null, offerings: [], mbkm_data: null };
  }
}

export async function createKRS(payload: KRSFormValues) {
  try {
    const { data: existing } = await supabase
        .from("krs")
        .select("id")
        .eq("student_id", payload.student_id)
        .eq("course_id", payload.course_id)
        .eq("academic_year_id", payload.academic_year_id)
        .single();

    if (existing) throw new Error("Mata kuliah ini sudah diambil.");

    const { error } = await supabase.from("krs").insert({
      student_id: payload.student_id,
      course_id: payload.course_id,
      academic_year_id: payload.academic_year_id,
      status: "DRAFT", 
    });

    if (error) {
        if (error.code === '23505') throw new Error("Mata kuliah sudah diambil.");
        throw error;
    }

    revalidatePath("/krs");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengambil mata kuliah.");
  }
}

export async function deleteKRS(id: string) {
  try {
    const { error } = await supabase.from("krs").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/krs");
  } catch (error) {
    throw new Error("Gagal membatalkan mata kuliah.");
  }
}

export async function submitKRS(studentId: string, academicYearId: string) {
    try {
      const { error } = await supabase
        .from("krs")
        .update({ status: "SUBMITTED" })
        .eq("student_id", studentId)
        .eq("academic_year_id", academicYearId)
        .eq("status", "DRAFT"); 
  
      if (error) throw error;
      revalidatePath("/krs");
      revalidatePath("/validasi-krs"); 
    } catch (error) {
      throw new Error("Gagal mengajukan KRS.");
    }
}

export async function resetKRS(studentId: string, academicYearId: string) {
  try {
    const { error } = await supabase
      .from("krs")
      .delete()
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId);

    if (error) throw error;
    revalidatePath("/krs");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal mereset KRS.");
  }
}

// ==========================================
// ADMIN ACTIONS (VALIDASI)
// ==========================================

export async function getStudentsWithSubmittedKRS(academicYearId: string) {
  try {
    const { data: academicYear } = await supabase
      .from("academic_years")
      .select("nama, semester")
      .eq("id", academicYearId)
      .single();

    const { data: krsList, error } = await supabase
      .from("krs")
      .select(`
        student_id, status,
        students:students (
          id, nim, nama, angkatan,
          study_program:study_programs (nama, jenjang)
        )
      `)
      .eq("academic_year_id", academicYearId)
      .in("status", ["SUBMITTED", "APPROVED", "REJECTED"]);

    if (error) throw error;

    const studentMap = new Map<string, any>();

    krsList.forEach((item: any) => {
      if (item.students && !studentMap.has(item.student_id)) {
        let calculatedSemester = 1;
        if (item.students.angkatan && academicYear?.nama) {
           const activeStartYear = parseInt(academicYear.nama.split('/')[0]);
           const studentEntryYear = parseInt(item.students.angkatan);
           
           if (!isNaN(activeStartYear) && !isNaN(studentEntryYear)) {
             const yearDiff = activeStartYear - studentEntryYear;
             calculatedSemester = (yearDiff * 2);
             if (academicYear.semester === 'Ganjil') calculatedSemester += 1;
             else if (academicYear.semester === 'Genap') calculatedSemester += 2;
             if (calculatedSemester < 1) calculatedSemester = 1;
           }
        }
        studentMap.set(item.student_id, { 
            ...item.students, status: item.status, semester: calculatedSemester 
        });
      }
    });

    return Array.from(studentMap.values());
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function approveKRS(studentId: string, academicYearId: string) {
  try {
    const { error } = await supabase
      .from("krs")
      .update({ status: "APPROVED" })
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId)
      .in("status", ["SUBMITTED", "DRAFT", "REJECTED"]); 

    if (error) throw error;
    revalidatePath("/validasi-krs"); 
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal menyetujui KRS.");
  }
}

export async function rejectKRS(studentId: string, academicYearId: string) {
  try {
    const { error } = await supabase
      .from("krs")
      .update({ status: "REJECTED" }) 
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId)
      .in("status", ["SUBMITTED", "APPROVED"]);

    if (error) throw error;
    revalidatePath("/validasi-krs");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal menolak KRS.");
  }
}