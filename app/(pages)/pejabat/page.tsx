"use client";

import React, { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message"; 
import { Pencil, Trash2, CheckCircle2, XCircle, FileSignature, ShieldCheck, Check, X } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import OfficialForm from "@/components/features/pejabat/OfficialForm";
import { type Official, type OfficialFormValues } from "@/lib/types";
import { getOfficials, createOfficial, updateOfficial, deleteOfficial } from "@/app/actions/officials";

export default function OfficialsPage() {
  const { successAction, confirmDeleteMessage, showError, showLoading } = useToastMessage();

  const [dataList, setDataList] = useState<Official[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>(""); 
  const [formData, setFormData] = useState<OfficialFormValues | undefined>(undefined);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getOfficials();
      setDataList(data);
    } catch (error) {
      console.error("Load Error:", error);
      showError(
        "Gagal Memuat Data",
        "Mohon maaf, sistem gagal memuat data pejabat."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        item.lecturer?.nama?.toLowerCase().includes(query) ||
        (item.lecturer?.nidn && item.lecturer.nidn.toLowerCase().includes(query)) ||
        item.jabatan.toLowerCase().includes(query);
      
      return matchSearch;
    });
  }, [dataList, searchQuery]);

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

  const handleOpenEdit = (item: Official) => {
    setSelectedId(item.id); 
    setFormData({
      lecturer_id: item.lecturer_id,
      study_program_id: item.study_program_id,
      jabatan: item.jabatan,
      is_active: item.is_active,
      ttd_basah_url: item.ttd_basah_url,
      ttd_digital_url: item.ttd_digital_url,
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: OfficialFormValues, formDataPayload: FormData) => {
    const toastId = showLoading("Sedang menyimpan data...");
    
    try {
      if (isEditing && selectedId) {
        await updateOfficial(selectedId, formDataPayload);
        successAction("Pejabat", "update", toastId);
      } else {
        await createOfficial(formDataPayload);
        successAction("Pejabat", "create", toastId);
      }
      await fetchData(); 
      setIsFormOpen(false);
    } catch (error: any) {
      showError("Gagal Menyimpan", error.message, toastId);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      const toastId = showLoading("Sedang menghapus data...");
      try {
        await deleteOfficial(selectedId);
        successAction("Pejabat", "delete", toastId);
        
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        }
        await fetchData();
      } catch (error: any) {
        showError("Gagal Menghapus", error.message, toastId);
      }
    }
    setIsDeleteOpen(false);
  };

  // --- COLUMNS ---
  const columns: Column<Official>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    {
      header: "Nama Pejabat",
      render: (row) => (
        <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm">{row.lecturer?.nama}</span>
            <span className="text-xs text-muted-foreground">NIDN: {row.lecturer?.nidn || "-"}</span>
        </div>
      ),
    },
    {
      header: "Jabatan",
      className: "w-[200px]",
      render: (row) => <span className="text-gray-700 font-medium">{row.jabatan}</span>
    },
    {
        header: "Dokumen Tanda Tangan",
        className: "w-[250px]",
        render: (row) => (
            <div className="flex items-center gap-2">
                 {/* Basah */}
                 <Badge 
                    variant="outline" 
                    className={
                        row.ttd_basah_url 
                        ? "border-green-200 text-green-700 bg-green-50" 
                        : "border-red-200 text-red-700 bg-red-50"
                    }
                 >
                    {row.ttd_basah_url ? (
                        <CheckCircle2 className="w-3 h-3 mr-1.5" />
                    ) : (
                        <XCircle className="w-3 h-3 mr-1.5" />
                    )}
                    Basah
                 </Badge>
                 
                 {/* Digital */}
                 <Badge 
                    variant="outline" 
                    className={
                        row.ttd_digital_url 
                        ? "border-green-200 text-green-700 bg-green-50" 
                        : "border-red-200 text-red-700 bg-red-50"
                    }
                 >
                    {row.ttd_digital_url ? (
                         <CheckCircle2 className="w-3 h-3 mr-1.5" />
                    ) : (
                         <XCircle className="w-3 h-3 mr-1.5" />
                    )}
                    Digital
                 </Badge>
            </div>
        )
    },
    {
        header: "Status",
        className: "text-center w-[120px]",
        render: (row) => (
          <Badge 
            variant={row.is_active ? "default" : "secondary"} 
            className={`font-normal ${row.is_active ? "bg-green-600" : ""}`}
          >
            {row.is_active ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {row.is_active ? "Aktif" : "Non-Aktif"}
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
                setDeleteName(row.lecturer?.nama); 
                setIsDeleteOpen(true); 
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <PageHeader title="Data Pejabat" breadcrumb={["Beranda", "Data Pejabat"]} />
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Nama / NIDN / Jabatan..."
            onAdd={handleOpenAdd}
            addLabel="Tambah Pejabat"
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
        title={isEditing ? "Edit Pejabat" : "Tambah Pejabat"}
        description={isEditing ? `Perbarui data pejabat.` : "Lengkapi form di bawah untuk menambah pejabat."}
        maxWidth="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <OfficialForm 
            key={selectedId || "new-official"}
            isEditing={isEditing}
            initialData={formData}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Pejabat?"
        description={confirmDeleteMessage("Pejabat", deleteName)}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}
