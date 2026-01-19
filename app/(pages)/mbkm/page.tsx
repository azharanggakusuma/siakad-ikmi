import React from "react";
import { getSession } from "@/app/actions/auth";
import { getMbkmByStudentId, getMbkmStudents } from "@/app/actions/mbkm";
import { getStudents } from "@/app/actions/students";
import { getAcademicYears } from "@/app/actions/academic-years";
import MbkmClient from "./MbkmClient";

export default async function MbkmPage() {
  const user = await getSession();

  let mbkmData: any[] = [];
  let students: any[] = [];
  let academicYears: any[] = [];

  if (user && user.role === 'mahasiswa' && user.student_id) {
    try {
        mbkmData = await getMbkmByStudentId(user.student_id);
    } catch (e) {
        console.error("Failed to fetch student MBKM data", e);
    }
  } else if (user) {
    // Admin / Dosen
    try {
       const [m, s, a] = await Promise.all([
         getMbkmStudents(),
         getStudents(),
         getAcademicYears()
       ]);
       mbkmData = m;
       students = s;
       academicYears = a;
    } catch (e) {
       console.error("Failed to fetch admin MBKM data", e);
    }
  }

  return (
    <MbkmClient 
      user={user}
      mbkmData={mbkmData}
      students={students}
      academicYears={academicYears}
    />
  );
}