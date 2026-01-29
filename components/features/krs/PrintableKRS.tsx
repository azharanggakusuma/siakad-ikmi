import React, { forwardRef } from "react";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import StudentInfo from "@/components/features/document/StudentInfo";
import DocumentFooter from "@/components/features/document/DocumentFooter";
import { Official } from "@/lib/types";
import { CourseOffering } from "@/app/actions/krs";
import { cn } from "@/lib/utils";

interface PrintableKRSProps {
  studentProfile: any;
  studentSemester: number;
  selectedAcademicYearName: string;
  takenCourses: CourseOffering[];
  totalSKS: number;
  official: Official | null;
  signatureType: "basah" | "digital" | "none";
  signatureBase64: string | null;
  className?: string;
}

const PrintableKRS = forwardRef<HTMLDivElement, PrintableKRSProps>(({
  studentProfile,
  studentSemester,
  selectedAcademicYearName,
  takenCourses,
  totalSKS,
  official,
  signatureType,
  signatureBase64,
  className,
}, ref) => {
  return (
    <div 
      id="print-area" 
      ref={ref}
      className={cn(
        "hidden print:block font-sans bg-white text-black p-8",
        className
      )}
    >
      <DocumentHeader title="KARTU RENCANA STUDI" />
      <div className="mt-1 mb-4 px-2">
        <StudentInfo
          profile={
            studentProfile || {
              nama: "-",
              nim: "-",
              semester: studentSemester,
              study_program: { nama: "-", jenjang: "-" },
            }
          }
          displaySemester={studentSemester}
          periode={selectedAcademicYearName}
        />
      </div>

      <div className="w-full mb-6 px-1">
        <table className="w-full text-[9px] font-caladea border-collapse border border-black mb-2">
          <thead>
            <tr className="bg-[#D9EAF7] text-center font-bold h-5 border-b border-black">
              <th className="border border-black w-6">No</th>
              <th className="border border-black w-24">Kode MK</th>
              <th className="border border-black text-left pl-2">Mata Kuliah</th>
              <th className="border border-black w-10">SKS</th>
              <th className="border border-black w-10">SMT</th>
            </tr>
          </thead>
          <tbody className="font-normal">
            {takenCourses.length > 0 ? (
              takenCourses.map((course, index) => (
                <tr key={course.id} className="text-center leading-none h-[13px]">
                  <td className="border border-black">{index + 1}</td>
                  <td className="border border-black">{course.kode}</td>
                  <td className="border border-black text-left pl-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                    {course.matkul}
                  </td>
                  <td className="border border-black">{course.sks}</td>
                  <td className="border border-black">{course.smt_default}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border border-black p-4 text-center italic">
                  Belum ada mata kuliah yang diambil.
                </td>
              </tr>
            )}
          </tbody>
          {takenCourses.length > 0 && (
            <tfoot>
              <tr className="font-bold bg-white h-4 border-t border-black text-[9px]">
                <td colSpan={3} className="border border-black px-2 text-left">
                  Jumlah SKS yang diambil
                </td>
                <td className="border border-black text-center">{totalSKS}</td>
                <td className="border border-black bg-gray-100"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="px-2">
        <DocumentFooter
          signatureType={signatureType}
          signatureBase64={signatureBase64}
          mode="krs"
          official={official}
        />
      </div>
    </div>
  );

});

PrintableKRS.displayName = "PrintableKRS";

export default PrintableKRS;
