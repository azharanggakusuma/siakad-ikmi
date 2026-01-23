import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudents, getStudentByNim } from "@/app/actions/students"; // Need to ensure getStudentByNim exists or use query
import { getCourses } from "@/app/actions/courses";
import { createClient } from "@/lib/supabase/server";

import {
  calculateIPK,
  calculateTotalSKSLulus,
  calculateSemesterTrend,
} from "@/lib/grade-calculations";

import { 
  calculateGradeDistribution,
  calculateSemesterTrend as calculateAdminTrend 
} from "@/lib/dashboard-helper";

import DashboardClient from "./DashboardClient";
import { StudentData, StudentProfile, TranscriptItem } from "@/lib/types";

export default async function DashboardPage() {
  const user = await getSession();

  // Basic skeleton or redirect if no user, though middleware handles it
  if (!user) return null;

  let stats: any[] = [];
  let trendData: any[] = [];
  let gradeDistData = { counts: { A: 0, B: 0, C: 0, D: 0, E: 0 }, totalGrades: 0, totalAM: 0 };
  
  const isMahasiswa = user.role === "mahasiswa";
  const username = user.username; // Assuming username is NIM for students

  if (isMahasiswa) {
    // --- SERVER SIDE LOGIC FOR MAHASISWA ---
    // Fetch ONLY this student
    // Implement `getStudent(nim)` action or use Supabase directly here.
    
    // FETCH DATA VIA ACTION (Correct Way)
    const student = await getStudentByNim(username);

    if (student) {
        // Now student is fully populated with transcript, profile, semester etc.
        // No need to cast manually or construct object. 
        
        const myIPK = calculateIPK(student.transcript);
        const totalSKS = calculateTotalSKSLulus(student.transcript);
        
        const currentSmt = student.profile.semester; 
        trendData = calculateSemesterTrend(student.transcript, currentSmt); 
        const totalMK = student.transcript.length;
        
        const jenjang = student.profile.study_program?.jenjang || "S1";
        const targetSKS = jenjang.includes("D3") ? 108 : 144;
        const sisaSKS = targetSKS - totalSKS;

        let deskripsiSKS = sisaSKS > 0 ? `${sisaSKS} SKS lagi untuk Lulus.` : "Syarat SKS Terpenuhi";

        stats = [
          {
            label: "Total IPK",
            value: myIPK, 
            description: "Skala Indeks 4.00", 
            iconType: "award",
            themeColor: "chart-1",
          },
          {
            label: "Total SKS Lulus",
            value: totalSKS.toString(),
            description: deskripsiSKS,
            iconType: "activity", 
            themeColor: "chart-2",
          },
          {
            label: "Mata Kuliah",
            value: totalMK.toString(),
            description: "Akumulasi Mata Kuliah Diambil", 
            iconType: "library",
            themeColor: "chart-3",
          },
          {
            label: "Semester",
            value: `${currentSmt}`,
            description: "Periode Akademik Aktif", 
            iconType: "calendar",
            themeColor: "chart-4",
          },
        ];
        
        gradeDistData = calculateGradeDistribution([student]);
    } else {
        // Fallback
         stats = [{ label: "Data Tidak Ditemukan", value: "-", description: "-", iconType: "users", themeColor: "chart-1" }];
    }

  } else {
    // --- SERVER SIDE LOGIC FOR ADMIN/DOSEN ---
    const [students, courses] = await Promise.all([
        getStudents(),
        getCourses()
    ]);

    const currentStudentCount = students.length;
    let totalIPK = 0;
    students.forEach((s) => {
        totalIPK += parseFloat(calculateIPK(s.transcript));
    });
    
    const avgIPK = currentStudentCount > 0 ? (totalIPK / currentStudentCount).toFixed(2) : "0.00";
    
    gradeDistData = calculateGradeDistribution(students);
    trendData = calculateAdminTrend(students);
    
    const avgGradePoint = gradeDistData.totalGrades > 0 ? (gradeDistData.totalAM / gradeDistData.totalGrades).toFixed(2) : "0.00";
    
    stats = [
        {
          label: "Total Mahasiswa",
          value: currentStudentCount.toLocaleString(),
          description: "Mahasiswa Terdaftar",
          iconType: "users", 
          themeColor: "chart-1",
        },
        {
          label: "Total Mata Kuliah",
          value: courses.length.toString(),
          description: "MK Dalam Kurikulum",
          iconType: "library", 
          themeColor: "chart-2",
        },
        {
          label: "Rata-rata Nilai Mutu",
          value: avgGradePoint,
          description: "Standar Mutu Akademik",
          iconType: "award", 
          themeColor: "chart-3",
        },
        {
          label: "Rata-rata IPK",
          value: avgIPK,
          description: "Rata-rata Mahasiswa",
          iconType: "trending", 
          themeColor: "chart-4",
        },
      ];
  }

  return (
    <DashboardClient 
        stats={stats} 
        trendData={trendData} 
        gradeDistData={gradeDistData} 
        role={user.role} 
    />
  );
}