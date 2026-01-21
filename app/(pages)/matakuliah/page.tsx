import React from "react";
import { getCourses } from "@/app/actions/courses";
import { getStudyPrograms } from "@/app/actions/prodi";
import MataKuliahClient from "./MataKuliahClient";

export default async function MataKuliahPage() {
  const [courses, studyPrograms] = await Promise.all([
    getCourses(),
    getStudyPrograms()
  ]);

  return <MataKuliahClient initialData={courses} studyPrograms={studyPrograms} />;
}