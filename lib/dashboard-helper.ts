import { StudentData, TranscriptItem } from "@/lib/types";

export function calculateIPK(transcript: TranscriptItem[]) {
  const totalSKS = transcript.reduce((acc, curr) => acc + curr.sks, 0);
  const totalNM = transcript.reduce((acc, curr) => acc + curr.nm, 0);
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

export function calculateStudentIPS(transcript: TranscriptItem[], semester: number) {
  const semesterItems = transcript.filter((t) => t.smt === semester);
  if (semesterItems.length === 0) return null;

  const totalSKS = semesterItems.reduce((acc, curr) => acc + curr.sks, 0);
  const totalNM = semesterItems.reduce((acc, curr) => acc + curr.nm, 0);
  
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

export function calculateSemesterTrend(allStudents: StudentData[]) {
  let maxSmt = 0;
  allStudents.forEach(s => {
    s.transcript.forEach(t => {
      if (t.smt > maxSmt) maxSmt = t.smt;
    });
  });

  const trendData = [];

  for (let smt = 1; smt <= maxSmt; smt++) {
    let totalIPS = 0;
    let countStudent = 0;

    allStudents.forEach((student) => {
      const ips = calculateStudentIPS(student.transcript, smt);
      if (ips !== null) {
        totalIPS += ips;
        countStudent++;
      }
    });

    const avgIPS = countStudent > 0 ? totalIPS / countStudent : 0;
    const heightPercentage = Math.min((avgIPS / 4) * 100, 100);

    trendData.push({
      label: `Smt ${smt}`,
      val: Number(avgIPS.toFixed(2)),
      height: `${heightPercentage}%`,
    });
  }

  return trendData;
}

export function calculateGradeDistribution(allStudents: StudentData[]) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let totalGrades = 0;
  let totalAM = 0;

  allStudents.forEach((student) => {
    student.transcript.forEach((item) => {
      // Pastikan casting key aman
      const grade = item.hm as keyof typeof counts;
      if (counts[grade] !== undefined) {
        counts[grade]++;
        totalGrades++;
        totalAM += item.am;
      }
    });
  });

  return { counts, totalGrades, totalAM };
}