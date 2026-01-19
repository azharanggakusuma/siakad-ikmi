import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById, getOfficialForDocument, getStudents, getActiveAcademicYear } from "@/app/actions/students";
import SuratKeteranganClient from "./SuratKeteranganClient";

export default async function SuratKeteranganPage() {
  const user = await getSession();

  let studentData = null;
  let official = null;
  let allStudents: any[] = [];
  let academicYearName = "";

  const activeYear = await getActiveAcademicYear();
  if (activeYear) {
    academicYearName = activeYear.nama;
  }

  if (user && user.role === 'mahasiswa' && user.student_id) {
    try {
        studentData = await getStudentById(user.student_id);
        if (studentData?.profile?.study_program_id) {
            official = await getOfficialForDocument(studentData.profile.study_program_id);
        } else {
            official = await getOfficialForDocument();
        }
    } catch (e) {
        console.error("Failed to fetch student data for Surat Keterangan", e);
    }
  } else if (user) {
    // Admin / Dosen
    try {
       allStudents = await getStudents();
    } catch (e) {
       console.error("Failed to fetch admin data for Surat Keterangan", e);
    }
  }

  return (
    <SuratKeteranganClient 
      user={user}
      studentData={studentData}
      official={official}
      allStudents={allStudents}
      academicYearName={academicYearName}
    />
  );
}