import React from "react";
import { transcriptData } from "../lib/data";
import Header from "../components/Header";
import StudentInfo from "../components/StudentInfo";
import GradeTable from "../components/GradeTable";
import Footer from "../components/Footer";

export default function TranskripPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-black flex justify-center print:p-0 print:bg-white">
      {/* Container A4 Style */}
      <div className="w-[210mm] min-h-[297mm] bg-white p-8 shadow-lg relative print:shadow-none print:w-full print:m-0">
        
        <Header />
        
        <StudentInfo />
        
        <GradeTable data={transcriptData} />
        
        <Footer />

      </div>
    </div>
  );
}