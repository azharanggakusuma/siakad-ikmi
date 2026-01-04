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
// GATEKEEPER & VALIDATION (BARU)
// ==========================================

// Cek Status KRS Mahasiswa untuk Gatekeeper Halaman Lain
export async function validateStudentKrs(studentId: string) {
  try {
    // 1. Cari Tahun Akademik Aktif
    const { data: activeYear, error: yearError } = await supabase
      .from("academic_years")
      .select("id, nama, semester")
      .eq("is_active", true)
      .single();

    if (yearError || !activeYear) {
      return { allowed: false, message: "Tahun akademik tidak aktif." };
    }

    // 2. Cek apakah ada KRS di tahun tsb dengan status VALID (Submitted/Approved)
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

// Hitung Total SKS yang diambil (Untuk UI Sophisticated)
export async function getStudentSksCount(studentId: string, academicYearId: string) {
    try {
      const { data, error } = await supabase
        .from("krs")
        .select(`
          course:courses (sks)
        `)
        .eq("student_id", studentId)
        .eq("academic_year_id", academicYearId);
      
      if (error || !data) return 0;

      // Hitung total
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

// 1. Ambil List KRS milik satu mahasiswa (untuk detail atau history)
export async function getKRSByStudent(studentId: string, academicYearId: string) {
  try {
    const { data, error } = await supabase
      .from("krs")
      .select(`
        *,
        course:courses (
          id, kode, matkul, sks, smt_default, kategori
        ),
        academic_year:academic_years (
          id, nama, semester
        )
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

// 2. Ambil Paket Mata Kuliah Ditawarkan ( + Status Ambil)
export async function getStudentCourseOfferings(studentId: string, academicYearId: string) {
  try {
    // A. Ambil Data Mahasiswa (untuk tahu semester berapa dia sekarang)
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("semester")
      .eq("id", studentId)
      .single();

    if (studentError) throw new Error("Data mahasiswa tidak ditemukan");

    // B. Ambil Mata Kuliah yang sesuai semester mahasiswa
    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("smt_default", student.semester) 
      .order("matkul", { ascending: true });

    if (courseError) throw courseError;

    // C. Ambil Data KRS yang SUDAH diambil
    const { data: takenKRS, error: krsError } = await supabase
      .from("krs")
      .select("id, course_id, status")
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId);

    if (krsError) throw krsError;

    // D. Gabungkan Data
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
      student_semester: student.semester,
      offerings: offerings
    };

  } catch (error) {
    console.error("Error fetching offerings:", error);
    return { student_semester: 0, offerings: [] };
  }
}

// 3. Create KRS (Ambil Mata Kuliah)
export async function createKRS(payload: KRSFormValues) {
  try {
    // Cek duplikasi manual
    const { data: existing } = await supabase
        .from("krs")
        .select("id")
        .eq("student_id", payload.student_id)
        .eq("course_id", payload.course_id)
        .eq("academic_year_id", payload.academic_year_id)
        .single();

    if (existing) {
        throw new Error("Mata kuliah ini sudah diambil.");
    }

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

// 4. Delete KRS (Batal Ambil)
export async function deleteKRS(id: string) {
  try {
    const { error } = await supabase.from("krs").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/krs");
  } catch (error) {
    throw new Error("Gagal membatalkan mata kuliah.");
  }
}

// 5. Submit KRS (Ajukan ke Admin/Dosen)
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
      revalidatePath("/validasi-krs"); // Update halaman admin juga
    } catch (error) {
      throw new Error("Gagal mengajukan KRS.");
    }
}

// ==========================================
// ADMIN ACTIONS (VALIDASI)
// ==========================================

// 6. Ambil Daftar Mahasiswa yang Mengajukan KRS (Status = SUBMITTED)
export async function getStudentsWithSubmittedKRS(academicYearId: string) {
  try {
    const { data: krsList, error } = await supabase
      .from("krs")
      .select(`
        student_id,
        students:students (
          id, nim, nama, 
          study_program:study_programs (nama, jenjang)
        )
      `)
      .eq("academic_year_id", academicYearId)
      .eq("status", "SUBMITTED");

    if (error) throw error;

    // Grouping by Student (Hilangkan duplikasi karena 1 mhs punya banyak baris KRS)
    const studentMap = new Map<string, any>();

    krsList.forEach((item: any) => {
      if (item.students && !studentMap.has(item.student_id)) {
        studentMap.set(item.student_id, item.students);
      }
    });

    return Array.from(studentMap.values());
  } catch (error) {
    console.error("Error fetching submitted students:", error);
    return [];
  }
}

// 7. Approve KRS (Setujui Semua DRAFT/SUBMITTED -> APPROVED)
export async function approveKRS(studentId: string, academicYearId: string) {
  try {
    const { error } = await supabase
      .from("krs")
      .update({ status: "APPROVED" })
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId)
      .in("status", ["SUBMITTED", "DRAFT"]); 

    if (error) throw error;
    revalidatePath("/validasi-krs"); 
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal menyetujui KRS.");
  }
}

// 8. Reject KRS (Kembalikan ke DRAFT atau set REJECTED)
export async function rejectKRS(studentId: string, academicYearId: string) {
  try {
    const { error } = await supabase
      .from("krs")
      .update({ status: "REJECTED" }) 
      .eq("student_id", studentId)
      .eq("academic_year_id", academicYearId)
      .eq("status", "SUBMITTED");

    if (error) throw error;
    revalidatePath("/validasi-krs");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal menolak KRS.");
  }
}