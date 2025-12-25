"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { students as initialData, StudentData } from "@/lib/data";

export default function MahasiswaPage() {
  // --- STATE ---
  const [dataList, setDataList] = useState<StudentData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FILTER & SEARCH ---
  const filteredData = useMemo(() => {
    return dataList.filter((student) => {
      const query = searchQuery.toLowerCase();
      return (
        student.profile.nama.toLowerCase().includes(query) ||
        student.profile.nim.toLowerCase().includes(query) ||
        student.profile.prodi.toLowerCase().includes(query)
      );
    });
  }, [dataList, searchQuery]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const showingStart = filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const showingEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- ACTIONS (MOCK) ---
  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus data mahasiswa ${nama}?`)) {
      setDataList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAdd = () => {
    alert("Fitur Tambah Mahasiswa");
  };

  const handleEdit = (nama: string) => {
    alert(`Edit data ${nama}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <PageHeader 
          title="Data Mahasiswa" 
          breadcrumb={["SIAKAD", "Mahasiswa"]} 
        />
      </div>

      {/* CARD TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* TOOLBAR */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* SEARCH BAR (Identik dengan Navbar) */}
          <div className="relative group w-full sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Cari Nama atau NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-slate-100 py-2.5 pl-9 pr-4 text-xs text-slate-700 border border-transparent outline-none transition-all duration-200 hover:bg-slate-100/70 focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* TOMBOL TAMBAH DATA (Lebar Sedang/Proporsional) */}
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-[#1B3F95] text-white text-xs font-semibold rounded-full hover:bg-blue-800 transition shadow-md shadow-blue-900/10 active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4 min-w-[200px]">Nama Lengkap</th>
                <th className="px-6 py-4 w-32">NIM</th>
                <th className="px-6 py-4 min-w-[180px]">Program Studi</th>
                <th className="px-6 py-4 text-center w-24">Smt</th>
                <th className="px-6 py-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {currentData.length > 0 ? (
                currentData.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-center text-[11px] text-slate-400 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {student.profile.nama}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {student.profile.nim}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600">
                        {student.profile.prodi}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-50 text-[#1B3F95] text-[10px] font-bold">
                        {student.profile.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(student.profile.nama)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, student.profile.nama)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" 
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <p className="text-xs">Data tidak ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredData.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-white rounded-b-xl gap-4">
            <div className="text-[11px] text-slate-500 font-medium">
              Menampilkan <span className="text-slate-900 font-bold">{showingStart}</span> - <span className="text-slate-900 font-bold">{showingEnd}</span> dari <span className="text-slate-900 font-bold">{filteredData.length}</span> data
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition bg-white"
              >
                Prev
              </button>
              
              <div className="flex gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                     p = currentPage - 2 + i;
                  }
                  if (p > totalPages) return null;
                  
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 flex items-center justify-center text-[11px] rounded-lg font-bold transition-all ${
                        currentPage === p
                          ? "bg-[#1B3F95] text-white shadow-md shadow-blue-900/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ICONS ---
function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
}

function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}

function PencilIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
}

function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}