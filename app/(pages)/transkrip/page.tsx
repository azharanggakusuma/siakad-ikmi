import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById, getOfficialForDocument, getStudents, getStudyPrograms } from "@/app/actions/students";
import TranskripClient from "./TranskripClient";

export default async function TranskripPage() {
  const user = await getSession();

  let studentData = null;
  let official = null;
  let allStudents: any[] = [];
  let studyPrograms: any[] = [];

  if (user && user.role === 'mahasiswa' && user.student_id) {
    try {
        studentData = await getStudentById(user.student_id);
        if (studentData?.profile?.study_program_id) {
            official = await getOfficialForDocument(studentData.profile.study_program_id);
        } else {
            official = await getOfficialForDocument();
        }
    } catch (e) {
        console.error("Failed to fetch student data for Transkrip", e);
    }
  } else if (user) {
    // Admin / Dosen
    try {
       const [s, p] = await Promise.all([
         getStudents(),
         getStudyPrograms()
       ]);
       allStudents = s;
       studyPrograms = p;
    } catch (e) {
       console.error("Failed to fetch admin data for Transkrip", e);
    }
  }

  return (
    <TranskripClient 
      user={user}
      studentData={studentData}
      official={official}
      allStudents={allStudents}
      studyPrograms={studyPrograms}
    />
  );
}