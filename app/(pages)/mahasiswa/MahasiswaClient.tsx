"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message"; 
import Image from "next/image"; 
import { Pencil, Trash2, CheckCircle2, XCircle, User, Printer } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { StudentForm } from "@/components/features/mahasiswa/StudentForm";
import PrintableBiodata from "@/components/features/mahasiswa/PrintableBiodata";
import { type StudentData, type StudentFormValues, type StudyProgram } from "@/lib/types";
import { createStudent, updateStudent, deleteStudent } from "@/app/actions/students";

interface MahasiswaClientProps {
  initialStudents: StudentData[];
  initialPrograms: StudyProgram[];
}

export default function MahasiswaClient({ initialStudents, initialPrograms }: MahasiswaClientProps) {
  const { successAction, confirmDeleteMessage, showError, showLoading } = useToastMessage();
  const router = useRouter();

  const [dataList, setDataList] = useState<StudentData[]>(initialStudents);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>(initialPrograms); 
  const [isLoading, setIsLoading] = useState(false); 
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [prodiFilter, setProdiFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>(""); 
  const [formData, setFormData] = useState<StudentFormValues | undefined>(undefined);
  const [printingStudent, setPrintingStudent] = useState<StudentData | null>(null);

  // Sync props if needed (optional)
  React.useEffect(() => {
    setDataList(initialStudents);
    setStudyPrograms(initialPrograms);
  }, [initialStudents, initialPrograms]);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return dataList.filter((student) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        student.profile.nama.toLowerCase().includes(query) ||
        student.profile.nim.toLowerCase().includes(query);
      
      const matchProdi = prodiFilter === "ALL" || student.profile.study_program?.nama === prodiFilter;
      const matchSemester = semesterFilter === "ALL" || String(student.profile.semester) === semesterFilter;
      
      return matchSearch && matchProdi && matchSemester;
    });
  }, [dataList, searchQuery, prodiFilter, semesterFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(undefined);
    setSelectedId(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: StudentData) => {
    setSelectedId(student.id); 
    setFormData({
      nim: student.profile.nim,
      nama: student.profile.nama,
      study_program_id: student.profile.study_program_id ? String(student.profile.study_program_id) : "",
      angkatan: student.profile.angkatan, 
      alamat: student.profile.alamat,
      is_active: student.profile.is_active,
      avatar_url: student.profile.avatar_url,
      jenis_kelamin: student.profile.jenis_kelamin || "",
      tempat_lahir: student.profile.tempat_lahir || "",
      tanggal_lahir: student.profile.tanggal_lahir || "",
      agama: student.profile.agama || "",
      nik: student.profile.nik || "",
      status: student.profile.status || "",
      no_hp: student.profile.no_hp || "",
      email: student.profile.email || ""
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: StudentFormValues) => {
    const toastId = showLoading("Sedang menyimpan data...");
    
    try {
      if (isEditing && selectedId) {
        await updateStudent(selectedId, values);
        successAction("Mahasiswa", "update", toastId);
      } else {
        await createStudent(values);
        successAction("Mahasiswa", "create", toastId);
      }
      
      router.refresh();
      setIsFormOpen(false);
    } catch (error: any) {
      showError("Gagal Menyimpan", error.message, toastId);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      const toastId = showLoading("Sedang menghapus data...");
      try {
        await deleteStudent(selectedId);
        successAction("Mahasiswa", "delete", toastId);
        
        // Optimistic UI update
        setDataList(prev => prev.filter(p => p.id !== selectedId));

        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        }
      } catch (error: any) {
        showError("Gagal Menghapus", error.message, toastId);
      }
    }
    setIsDeleteOpen(false);
  };

  const handlePrint = (student: StudentData) => {
    setPrintingStudent(student);
    const originalTitle = document.title;
    
    // Give time for state update and DOM render
    setTimeout(() => {
        document.title = `Biodata - ${student.profile.nama}`;
        window.print();
        
        // Restore title after print dialog closes (approximate)
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    }, 500);
  };

  // --- COLUMNS ---
  const columns: Column<StudentData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    {
      header: "Mahasiswa",
      render: (row) => (
        <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                {row.profile.avatar_url ? (
                    <Image 
                        src={row.profile.avatar_url} 
                        alt={row.profile.nama} 
                        fill 
                        className="object-cover"
                    />
                ) : (
                    <User className="h-5 w-5 text-slate-400" />
                )}
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-sm">{row.profile.nama}</span>
                <span className="text-xs text-muted-foreground font-mono">{row.profile.nim}</span>
            </div>
        </div>
      ),
    },
    {
      header: "NIK",
      className: "w-[130px]",
      render: (row) => <span className="text-xs text-gray-600">{row.profile.nik || "-"}</span>
    },
    {
      header: "L/P",
      className: "w-[50px] text-center",
      render: (row) => <span className="text-gray-600">{row.profile.jenis_kelamin === 'Laki-laki' ? 'L' : (row.profile.jenis_kelamin === 'Perempuan' ? 'P' : '-')}</span>
    },
    {
      header: "TTL",
      className: "w-[150px]",
      render: (row) => (
        <div className="flex flex-col text-xs text-gray-600">
           <span>{row.profile.tempat_lahir || "-"}</span>
           <span className="text-muted-foreground">{row.profile.tanggal_lahir || "-"}</span>
        </div>
      )
    },
    {
      header: "Agama",
      className: "w-[100px]",
      render: (row) => <span className="text-sm text-gray-600">{row.profile.agama || "-"}</span>
    },
    {
      header: "Sts. Nikah",
      className: "w-[100px]",
      render: (row) => <span className="text-xs text-gray-600">{row.profile.status || "-"}</span>
    },
    {
      header: "Alamat",
      className: "w-[200px]",
      render: (row) => <span className="text-xs text-gray-600 line-clamp-2" title={row.profile.alamat}>{row.profile.alamat || "-"}</span>
    },
    {
      header: "Kontak",
      className: "w-[180px]",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-700">{row.profile.no_hp || "-"}</span>
            <span className="text-xs text-muted-foreground">{row.profile.email || "-"}</span>
        </div>
      )
    },
    { 
      header: "Program Studi", 
      className: "w-[200px]",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
            {row.profile.study_program ? `${row.profile.study_program.nama} (${row.profile.study_program.jenjang})` : "-"}
        </span>
      )
    },
    {
      header: "Angkatan",
      className: "text-center w-[80px]",
      render: (row) => (
        <span className="text-gray-700 font-medium">
          {row.profile.angkatan}
        </span>
      )
    },
    { 
      header: "Semester", 
      className: "text-center w-[80px]", 
      render: (row) => row.profile.semester 
    },
    {
        header: "Status",
        className: "text-center w-[120px]",
        render: (row) => (
          <Badge 
            variant={row.profile.is_active ? "default" : "destructive"} 
            className={`font-normal ${row.profile.is_active ? "bg-green-600" : ""}`}
          >
            {row.profile.is_active ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {row.profile.is_active ? "Aktif" : "Non-Aktif"}
          </Badge>
        )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="icon" className="text-yellow-600 hover:bg-yellow-50 h-8 w-8" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-600 hover:bg-red-50 h-8 w-8" 
            onClick={() => { 
                setSelectedId(row.id); 
                setDeleteName(row.profile.nama); 
                setIsDeleteOpen(true); 
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-blue-600 hover:bg-blue-50 h-8 w-8" 
            onClick={() => handlePrint(row)}
            title="Print Biodata"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const filterContent = (
    <>
      <DropdownMenuLabel>Program Studi</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={prodiFilter} onValueChange={(v) => { setProdiFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {studyPrograms.map(p => (
           <DropdownMenuRadioItem key={p.id} value={p.nama}>{p.nama}</DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Semester</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={semesterFilter} onValueChange={(v) => { setSemesterFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <DropdownMenuRadioItem key={i} value={i.toString()}>Semester {i}</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup>
    </>
  );

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background-color: white; z-index: 9999;
          }
        }
      `}</style>
      
      {/* PRINT COMPONENT */}
      <PrintableBiodata student={printingStudent} />

      <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500 print:hidden">
      <PageHeader title="Data Mahasiswa" breadcrumb={["Beranda", "Mahasiswa"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Nama atau NIM..."
            onAdd={handleOpenAdd}
            addLabel="Tambah Data"
            filterContent={filterContent}
            isFilterActive={prodiFilter !== "ALL" || semesterFilter !== "ALL"}
            onResetFilter={() => { setProdiFilter("ALL"); setSemesterFilter("ALL"); setSearchQuery(""); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex} 
            totalItems={filteredData.length}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title={isEditing ? "Edit Data Mahasiswa" : "Tambah Data Mahasiswa"}
        description={isEditing ? `Perbarui data mahasiswa atas nama ${formData?.nama}.` : "Lengkapi form di bawah untuk menambah data mahasiswa."}
        maxWidth="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <StudentForm 
            key={isEditing && selectedId ? `edit-${selectedId}` : "add-new"}
            initialData={formData}
            studyPrograms={studyPrograms} 
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Data Mahasiswa?"
        description={confirmDeleteMessage("Mahasiswa", deleteName)}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
    </>
  );
}
