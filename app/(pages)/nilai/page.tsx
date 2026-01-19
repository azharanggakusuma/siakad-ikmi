import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudents, getStudyPrograms } from "@/app/actions/students";
import { getStudentGradeSummary } from "@/app/actions/grades";
import NilaiClient from "./NilaiClient";

export default async function NilaiPage() {
  const user = await getSession();

  let initialStudents: any[] = [];
  let initialPrograms: any[] = [];
  let initialGrades: any[] = [];
  let initialSummary = { totalSKS: 0, totalNM: 0, ipk: "0.00" };

  if (user && user.role === 'mahasiswa' && user.student_id) {
    try {
        const res = await getStudentGradeSummary(user.student_id);
        initialGrades = res.grades;
        initialSummary = res.summary;
    } catch (e) {
        console.error("Failed to fetch student grades", e);
    }
  } else if (user) {
    // Admin / Dosen
    try {
        const [students, programs] = await Promise.all([
            getStudents(),
            getStudyPrograms()
        ]);
        initialStudents = students;
        initialPrograms = programs;
    } catch (e) {
        console.error("Failed to fetch admin data", e);
    }
  }

  return (
    <NilaiClient 
      user={user}
      initialStudents={initialStudents}
      initialPrograms={initialPrograms}
      initialGrades={initialGrades}
      initialSummary={initialSummary}
    />
  );
}