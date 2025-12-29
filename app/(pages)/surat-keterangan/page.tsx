"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
// PERBAIKAN IMPORT
import { getStudents } from "@/app/actions/students";
import { type StudentData } from "@/lib/types";

import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";

import PageHeader from "@/components/layout/PageHeader";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import DocumentFooter from "@/components/features/document/DocumentFooter";
import ControlPanel from "@/components/features/document/ControlPanel";

export default function SuratKeteranganPage() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // State Form lainnya...
  const [nomorSurat, setNomorSurat] = useState(""); 
  const [tahunAkademik, setTahunAkademik] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [pekerjaanOrangTua, setPekerjaanOrangTua] = useState("");

  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();
  const paperRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudents();
        setStudentsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // Update Alamat saat mahasiswa berganti
  useEffect(() => {
    if (currentStudent?.profile?.alamat) {
      setAlamat(currentStudent.profile.alamat);
    } else {
      setAlamat("");
    }
  }, [currentStudent]);

  // Observer
  useEffect(() => {
    if (!paperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const pages = Math.ceil((entry.target.scrollHeight - 1) / 1122.5);
        setTotalPages(pages < 1 ? 1 : pages);
      }
    });
    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [currentStudent, alamat]);

  const getRomanMonth = () => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][new Date().getMonth()];
  const fullNomorSurat = `${nomorSurat || "..."}/A/S.KET/STMIK-IKMI/${getRomanMonth()}/${new Date().getFullYear()}`;
  const terbilangSemester = (num: number) => ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas"][num] || num.toString();

  const labelStyle = { width: '150px', verticalAlign: 'top', padding: '1px 0' };
  const colonStyle = { width: '15px', verticalAlign: 'top', padding: '1px 0', textAlign: 'center' as const };
  const valueStyle = { verticalAlign: 'top', padding: '1px 20px 1px 4px' }; 

  const renderPaperContent = () => {
      if (loading) {
          return (
            <div className="animate-pulse flex flex-col h-full">
               <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
                   <div className="flex items-center gap-3">
                       <Skeleton className="w-[80px] h-[80px]" /> 
                       <div className="flex flex-col gap-2">
                           <Skeleton className="h-3 w-48" />
                           <Skeleton className="h-8 w-32" />
                           <Skeleton className="h-4 w-24" />
                       </div>
                   </div>
                   <Skeleton className="w-[250px] h-[78px]" />
               </div>
               <div className="space-y-4 mt-8 px-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
               </div>
            </div>
          )
      }

      if (!currentStudent) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-slate-400">
            <p>Data Mahasiswa Kosong</p>
            </div>
        );
      }

      return (
        <>
            <DocumentHeader title="" />
            <div className="text-center mt-[-10px] mb-8 font-['Cambria'] text-black leading-snug">
            <h2 className="font-bold text-[14px] underline uppercase mb-0">SURAT KETERANGAN</h2>
            <p className="text-[11px]">Nomor : {fullNomorSurat}</p>
            </div>

            <div className="text-[11px] font-['Cambria'] text-black px-4 min-h-[450px]">
            <p className="mb-2">Yang bertanda tangan di bawah ini :</p>
            <div className="ml-4 mb-4">
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <tbody>
                    <tr><td style={labelStyle}>Nama</td><td style={colonStyle}>:</td><td style={valueStyle} className="font-bold break-words">YUDHISTIRA ARIE WIJAYA, M.Kom</td></tr>
                    <tr><td style={labelStyle}>NIDN</td><td style={colonStyle}>:</td><td style={valueStyle} className="break-words">0401047103</td></tr>
                </tbody>
                </table>
            </div>

            <p className="mb-2">Menerangkan bahwa :</p>
            <div className="ml-4 mb-4">
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <tbody>
                    <tr><td style={labelStyle}>Nama</td><td style={colonStyle}>:</td><td style={valueStyle} className="font-bold uppercase break-words">{currentStudent.profile.nama.toUpperCase()}</td></tr>
                    <tr><td style={labelStyle}>NIM</td><td style={colonStyle}>:</td><td style={valueStyle} className="break-words">{currentStudent.profile.nim}</td></tr>
                    <tr><td style={labelStyle}>Tempat, tanggal lahir</td><td style={colonStyle}>:</td><td style={valueStyle} className="capitalize break-words">{tempatLahir || "..."} , {tanggalLahir || "..."}</td></tr>
                    <tr>
                    <td style={labelStyle}>Jurusan</td>
                    <td style={colonStyle}>:</td>
                    <td style={valueStyle} className="break-words">
                        {currentStudent.profile.prodi} {currentStudent.profile.jenjang ? `(${currentStudent.profile.jenjang})` : ""}
                    </td>
                    </tr>
                    <tr><td style={labelStyle}>Semester</td><td style={colonStyle}>:</td><td style={valueStyle} className="break-words">{currentStudent.profile.semester} ({terbilangSemester(currentStudent.profile.semester)})</td></tr>
                    <tr><td style={labelStyle}>Tahun Akademik</td><td style={colonStyle}>:</td><td style={valueStyle} className="break-words">{tahunAkademik || "..."}</td></tr>
                    <tr><td style={labelStyle}>Alamat</td><td style={colonStyle}>:</td><td style={valueStyle} className="break-words whitespace-pre-wrap text-justify">{alamat || "..."}</td></tr>
                </tbody>
                </table>
            </div>

            <p className="mb-2">Dan orang tua dari mahasiswa tersebut adalah :</p>
            <div className="ml-4 mb-4">
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <tbody>
                    <tr><td style={labelStyle}>Nama Orang Tua</td><td style={colonStyle}>:</td><td style={valueStyle} className="font-bold break-words">{namaOrangTua || "..."}</td></tr>
                    <tr><td style={labelStyle}>Pekerjaan</td><td style={colonStyle}>:</td><td style={valueStyle} className="capitalize break-words">{pekerjaanOrangTua || "..."}</td></tr>
                </tbody>
                </table>
            </div>

            <p className="mb-3 text-justify leading-relaxed">
                Dengan ini menerangkan bahwa mahasiswa yang namanya tersebut di atas adalah benar-benar tercatat sebagai mahasiswa aktif di Sekolah Tinggi Manajemen Informatika dan Komputer (STMIK) IKMI Cirebon. Pada saat surat ini diterbitkan, yang bersangkutan sedang menempuh kegiatan perkuliahan secara aktif pada semester {currentStudent.profile.semester} ({terbilangSemester(currentStudent.profile.semester)}) Tahun Akademik {tahunAkademik || "..."}.
            </p>

            <p className="mb-8 text-justify leading-relaxed">
                Surat Keterangan ini dibuat dan diberikan kepada yang bersangkutan untuk dapat dipergunakan sebagai bukti keaktifan kuliah dan keperluan administrasi lainnya sebagaimana mestinya. Demikian surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan sesuai dengan ketentuan yang berlaku.
            </p>
            </div>

            <DocumentFooter signatureType={signatureType} signatureBase64={secureImage} mode="surat" />
        </>
      );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Surat Keterangan" breadcrumb={["SIAKAD", "Surat Keterangan"]} />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        <div className={`hidden xl:flex print:flex print:w-full print:justify-center shrink-0 justify-start w-full transition-all duration-300 ${isCollapsed ? "xl:w-[210mm]" : "xl:w-[189mm]"}`}>
          <div ref={paperRef} className={`bg-white p-8 shadow-2xl border border-gray-300 print:shadow-none print:border-none print:m-0 w-[210mm] min-h-[297mm] origin-top-left transform transition-transform duration-300 ${isCollapsed ? "xl:scale-100" : "xl:scale-[0.9]"} print:scale-100 flex flex-col justify-between`}>
            <div>{renderPaperContent()}</div>
          </div>
        </div>

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
            />
          )}
        </div>
      </div>
    </div>
  );
}