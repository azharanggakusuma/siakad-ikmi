"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getStudents, getActiveAcademicYear, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type Official } from "@/lib/types";

import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";

import ControlPanel from "@/components/features/document/ControlPanel";
import PrintableSuratKeterangan from "@/components/features/surat-keterangan/PrintableSuratKeterangan";

export default function StudentSuratView() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // State Data Dinamis
  const [official, setOfficial] = useState<Official | null>(null);
  
  // State Form - Mahasiswa bisa isi data tambahan (opsional) atau read-only
  // Untuk fleksibilitas, kita biarkan bisa diedit agar bisa dicetak sesuai kebutuhan
  const [nomorSurat, setNomorSurat] = useState(""); 
  const [tahunAkademik, setTahunAkademik] = useState(""); 
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [pekerjaanOrangTua, setPekerjaanOrangTua] = useState("");

  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed, user } = useLayout();
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [students, activeYear, activeOfficial] = await Promise.all([
            getStudents(),
            getActiveAcademicYear(),
            getActiveOfficial()
        ]);

        setStudentsData(students);
        setOfficial(activeOfficial);

        if (activeYear) {
            setTahunAkademik(activeYear.nama);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-select mahasiswa login
  useEffect(() => {
    if (studentsData.length > 0 && user?.role === "mahasiswa" && user?.student_id) {
       const myIndex = studentsData.findIndex((s) => s.id === user.student_id);
       if (myIndex !== -1) setSelectedIndex(myIndex); 
    }
  }, [studentsData, user]);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // Update Alamat saat mahasiswa berganti
  useEffect(() => {
    if (currentStudent?.profile?.alamat) {
      setAlamat(currentStudent.profile.alamat);
    } else {
      setAlamat("");
    }
  }, [currentStudent]);

  return (
    <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        <PrintableSuratKeterangan
          loading={loading}
          currentStudent={currentStudent}
          official={official}
          nomorSurat={nomorSurat}
          tahunAkademik={tahunAkademik}
          tempatLahir={tempatLahir}
          tanggalLahir={tanggalLahir}
          alamat={alamat}
          namaOrangTua={namaOrangTua}
          pekerjaanOrangTua={pekerjaanOrangTua}
          signatureType={signatureType}
          signatureBase64={secureImage}
          isCollapsed={isCollapsed}
          setTotalPages={setTotalPages}
        />

        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-[240px] w-full rounded-xl" />
                <Skeleton className="h-[120px] w-full rounded-xl" />
             </div>
          ) : (
            <ControlPanel
              students={studentsData}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              signatureType={signatureType}
              onSignatureChange={setSignatureType}
              onPrint={() => window.print()}
              
              nomorSurat={nomorSurat} setNomorSurat={setNomorSurat}
              tahunAkademik={tahunAkademik} setTahunAkademik={setTahunAkademik}
              tempatLahir={tempatLahir} setTempatLahir={setTempatLahir}
              tanggalLahir={tanggalLahir} setTanggalLahir={setTanggalLahir}
              alamat={alamat} setAlamat={setAlamat}
              namaOrangTua={namaOrangTua} setNamaOrangTua={setNamaOrangTua}
              pekerjaanOrangTua={pekerjaanOrangTua} setPekerjaanOrangTua={setPekerjaanOrangTua}
              totalPages={totalPages}
              user={user} // Pass user agar ControlPanel bisa adaptasi jika diperlukan
            />
          )}
        </div>
    </div>
  );
}
