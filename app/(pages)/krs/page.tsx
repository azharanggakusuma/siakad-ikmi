import React from "react";
import { getSession } from "@/app/actions/auth";
import { getAcademicYears } from "@/app/actions/academic-years";
import { getOfficialForDocument } from "@/app/actions/students";
import { getStudentCourseOfferings, getStudentsWithSubmittedKRS } from "@/app/actions/krs";
import KRSClient from "./KRSClient";

export default async function KRSPage() {
  const user = await getSession();

  // Common Data
  const academicYears = await getAcademicYears();
  const activeYear = academicYears.find(y => y.is_active);
  const selectedYearId = activeYear ? activeYear.id : (academicYears.length > 0 ? academicYears[0].id : "");

  let initialDataStudent = null;
  let initialOfficial = null;
  let initialStudentsAdmin: any[] = [];
  
  if (user && user.role === 'mahasiswa' && user.student_id && selectedYearId) {
    try {
        // 1. Ambil Data KRS & Mahasiswa dulu untuk dapat ProdiID
        const krsData = await getStudentCourseOfferings(user.student_id, selectedYearId);
        initialDataStudent = krsData;

        // 2. Ambil Official sesuai Prodi Mahasiswa
        // Pastikan krsData.student_profile ada sebelum akses
        const prodiId = krsData.student_profile?.study_program_id;
        initialOfficial = await getOfficialForDocument(prodiId);
    } catch (e) {
        console.error("Failed to fetch student KRS data", e);
    }
  } else if (user && selectedYearId) {
    // Admin / Dosen
    try {
        initialStudentsAdmin = await getStudentsWithSubmittedKRS(selectedYearId);
    } catch (e) {
        console.error("Failed to fetch admin KRS data", e);
    }
  }

  return (
    <KRSClient 
      user={user}
      academicYears={academicYears}
      selectedYearId={selectedYearId}
      initialDataStudent={initialDataStudent}
      initialOfficial={initialOfficial}
      initialStudentsAdmin={initialStudentsAdmin}
    />
  );
}