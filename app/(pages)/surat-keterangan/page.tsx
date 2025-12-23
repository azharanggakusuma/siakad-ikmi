"use client";

import React, { useState, useEffect } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header"; 
import Footer from "@/components/Footer"; 
import ControlPanel from "@/components/ControlPanel";
import { useSignature } from "@/hooks/useSignature";
import PageHeader from "@/components/PageHeader";
import { useLayout } from "@/app/context/LayoutContext";

export default function SuratKeteranganPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // --- STATE DATA ---
  // "nomorSurat" sekarang hanya menyimpan urutan (contoh: "125")
  const [nomorSurat, setNomorSurat] = useState(""); 
  const [tahunAkademik, setTahunAkademik] = useState("");
  
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  
  const [alamat, setAlamat] = useState("");
  
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [pekerjaanOrangTua, setPekerjaanOrangTua] = useState("");

  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();

  const currentStudent = students[selectedIndex];

  // --- HELPER OTOMATIS NOMOR SURAT ---
  const getRomanMonth = () => {
    const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return months[new Date().getMonth()];
  };

  const currentYear = new Date().getFullYear();
  const currentMonthRoman = getRomanMonth();
  
  // Format: [Urutan]/A/S.KET/STMIK-IKMI/[BulanRomawi]/[Tahun]
  // Jika nomorSurat kosong, tampilkan placeholder "..." di preview
  const fullNomorSurat = `${nomorSurat || "..."}/A/S.KET/STMIK-IKMI/${currentMonthRoman}/${currentYear}`;

  const handlePrint = () => {
    window.print();
  };

  const terbilangSemester = (num: number) => {
    const list = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas"];
    return list[num] || num.toString();
  };

  // --- STYLE UTAMA ---
  const labelStyle = { width: '150px', verticalAlign: 'top', padding: '1px 0' };
  const colonStyle = { width: '15px', verticalAlign: 'top', padding: '1px 0', textAlign: 'center' as const };
  const valueStyle = { verticalAlign: 'top', padding: '1px 20px 1px 4px' }; 

  const renderPaperContent = () => (
    <>
      {/* 1. KOP SURAT */}
      <Header title="" />

      {/* 2. JUDUL & NOMOR SURAT */}
      <div className="text-center mt-[-10px] mb-8 font-['Cambria'] text-black leading-snug">
        <h2 className="font-bold text-[14px] underline uppercase mb-0">SURAT KETERANGAN</h2>
        {/* Tampilkan Nomor Surat Otomatis */}
        <p className="text-[11px]">Nomor : {fullNomorSurat}</p>
      </div>

      {/* 3. ISI SURAT */}
      <div className="text-[11px] font-['Cambria'] text-black px-4 min-h-[450px]">
        
        {/* === PENANDATANGAN === */}
        <p className="mb-2">Yang bertanda tangan di bawah ini :</p>
        <div className="ml-4 mb-4">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td style={labelStyle}>Nama</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="font-bold break-words">Yudhistira Arie Wijaya, M.Kom</td>
              </tr>
              <tr>
                <td style={labelStyle}>NIDN</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="break-words">0401047103</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* === MAHASISWA === */}
        <p className="mb-2">Menerangkan bahwa :</p>
        <div className="ml-4 mb-4">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td style={labelStyle}>Nama</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="font-bold uppercase break-words">{currentStudent.profile.nama}</td>
              </tr>
              <tr>
                <td style={labelStyle}>NIM</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="break-words">{currentStudent.profile.nim}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Tempat, tanggal lahir</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="capitalize break-words">
                  {/* Fallback tampilan jika kosong */}
                  {tempatLahir || "..."}
                  , {tanggalLahir || "..."}
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Jurusan</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="break-words">{currentStudent.profile.prodi}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Semester</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="break-words">
                  {currentStudent.profile.semester} ({terbilangSemester(currentStudent.profile.semester)})
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Tahun Akademik</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="break-words">{tahunAkademik || "..."}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Alamat</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="break-words whitespace-pre-wrap text-justify">
                  {alamat || "..."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* === ORANG TUA === */}
        <p className="mb-2">Dan orang tua dari mahasiswa tersebut adalah :</p>
        <div className="ml-4 mb-4">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td style={labelStyle}>Nama Orang Tua</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="font-bold break-words">{namaOrangTua || "..."}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Pekerjaan</td>
                <td style={colonStyle}>:</td>
                <td style={valueStyle} className="capitalize break-words">{pekerjaanOrangTua || "..."}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* === PENUTUP === */}
        <p className="mb-3 text-justify leading-relaxed">
          Benar merupakan mahasiswa aktif STMIK IKMI Cirebon yang pada saat ini yang bersangkutan aktif kuliah di semester {currentStudent.profile.semester} ({terbilangSemester(currentStudent.profile.semester)}). Surat keterangan ini dibuat dan diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.
        </p>

        <p className="mb-8 text-justify leading-relaxed">
          Demikian surat keterangan ini kami berikan untuk dapat dipergunakan sebagaimana mestinya.
        </p>
      </div>

      {/* 4. TANDA TANGAN */}
      <Footer 
        signatureType={signatureType} 
        signatureBase64={secureImage} 
        mode="surat" 
      />
    </>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader 
          title="Surat Keterangan" 
          breadcrumb={["SIAKAD", "Surat Keterangan"]} 
        />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        
        {/* --- AREA KERTAS --- */}
        <div className={`
            hidden xl:flex print:flex print:w-full print:justify-center
            shrink-0 justify-start w-full 
            transition-all duration-300
            
            ${isCollapsed ? "xl:w-[210mm]" : "xl:w-[189mm]"}
        `}>
          <div 
             className={`
              bg-white p-6 shadow-2xl border border-gray-300 
              print:shadow-none print:border-none print:m-0 
              w-[210mm] min-h-[297mm] 
              
              origin-top-left 
              transform transition-transform duration-300

              ${isCollapsed ? "xl:scale-100" : "xl:scale-[0.9]"}
              print:scale-100
              
              flex flex-col justify-between
            `}
          >
            <div>
              {renderPaperContent()}
            </div>
          </div>
        </div>

        {/* --- CONTROL PANEL --- */}
        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          <ControlPanel
            students={students}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            signatureType={signatureType}
            onSignatureChange={setSignatureType}
            onPrint={handlePrint}
            
            // State (nomorSurat disini hanya urutan)
            nomorSurat={nomorSurat} setNomorSurat={setNomorSurat}
            tahunAkademik={tahunAkademik} setTahunAkademik={setTahunAkademik}
            tempatLahir={tempatLahir} setTempatLahir={setTempatLahir}
            tanggalLahir={tanggalLahir} setTanggalLahir={setTanggalLahir}
            alamat={alamat} setAlamat={setAlamat}
            namaOrangTua={namaOrangTua} setNamaOrangTua={setNamaOrangTua}
            pekerjaanOrangTua={pekerjaanOrangTua} setPekerjaanOrangTua={setPekerjaanOrangTua}
          />
        </div>
      </div>
    </div>
  );
}