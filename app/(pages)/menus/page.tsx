"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; 
import { ArrowUpDown } from "lucide-react";    
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import MenuTable from "@/components/features/menus/MenuTable";
import { MenuForm } from "@/components/features/menus/MenuForm";
import MenuReorderList from "@/components/features/menus/MenuReorderList"; 
import { Menu, MenuFormValues } from "@/lib/types";
import { getMenus, createMenu, updateMenu, deleteMenu } from "@/app/actions/menus";

export default function MenusPage() {
  const [dataList, setDataList] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const menus = await getMenus();
      setDataList(menus);
    } catch (error) {
      console.error(error);
      toast.error("Gagal Memuat Data", { 
        description: "Terjadi kesalahan saat mengambil data menu. Silakan muat ulang halaman." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedMenu(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (values: MenuFormValues) => {
    // Tutup modal dulu biar UX terasa cepat
    setIsFormOpen(false); 
    
    // Tampilkan loading toast
    const toastId = toast.loading("Sedang memproses data...");

    try {
      if (isEditing && selectedMenu) {
        await updateMenu(selectedMenu.id, values);
        toast.success("Perubahan Disimpan", { 
          description: `Data menu "${values.label}" berhasil diperbarui.`,
          id: toastId // Replace loading toast
        });
      } else {
        await createMenu(values);
        toast.success("Menu Ditambahkan", { 
          description: `Menu baru "${values.label}" telah berhasil dibuat.`,
          id: toastId 
        });
      }
      
      await fetchData();
    } catch (error: any) {
      console.error("Submit Error:", error); // Log error asli di console untuk developer
      toast.error("Gagal Menyimpan", { 
        description: "Terjadi kendala saat menyimpan data. Silakan coba lagi beberapa saat lagi.",
        id: toastId
      });
      // Buka modal lagi jika gagal, agar user tidak perlu ketik ulang (opsional)
      setIsFormOpen(true); 
    }
  };

  const handleDelete = async () => {
    if (selectedMenu) {
      setIsDeleteOpen(false);
      const toastId = toast.loading("Menghapus data...");

      try {
        await deleteMenu(selectedMenu.id);
        toast.success("Berhasil Dihapus", { 
            description: "Data menu telah dihapus dari sistem.",
            id: toastId
        });
        await fetchData();
      } catch (error: any) {
        console.error("Delete Error:", error);
        toast.error("Gagal Menghapus", { 
            description: "Data tidak dapat dihapus. Pastikan menu ini tidak memiliki sub-menu aktif.",
            id: toastId
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      
      {/* HEADER DENGAN TOMBOL REORDER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader title="Manajemen Menu" breadcrumb={["Beranda", "Menus"]} />
          
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setIsReorderOpen(true)}>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Atur Urutan
             </Button>
          </div>
      </div>

      <MenuTable 
        data={dataList}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* MODAL ADD/EDIT */}
      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title={isEditing ? "Edit Menu" : "Tambah Menu Baru"}
        description={isEditing ? "Ubah detail menu navigasi aplikasi." : "Tambahkan menu baru ke dalam navigasi sidebar."}
        maxWidth="sm:max-w-[600px]"
      >
        <MenuForm
          key={isEditing && selectedMenu ? `edit-${selectedMenu.id}` : "add-new"}
          initialData={
            isEditing && selectedMenu
              ? {
                  id: selectedMenu.id,
                  label: selectedMenu.label,
                  href: selectedMenu.href,
                  icon: selectedMenu.icon,
                  section: selectedMenu.section,
                  allowed_roles: selectedMenu.allowed_roles,
                  sequence: selectedMenu.sequence,
                  is_active: selectedMenu.is_active,
                  parent_id: selectedMenu.parent_id,
                }
              : undefined
          }
          availableMenus={dataList}
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* MODAL REORDER */}
      <FormModal
        isOpen={isReorderOpen}
        onClose={setIsReorderOpen}
        title="Atur Urutan Menu"
        description="Geser item (drag & drop) untuk mengatur posisi menu di sidebar."
        maxWidth="sm:max-w-[500px]"
      >
        {isReorderOpen && (
           <MenuReorderList 
              initialItems={dataList} 
              onClose={() => setIsReorderOpen(false)}
              onSuccess={() => {
                  fetchData();
                  toast.success("Urutan Diperbarui", { description: "Susunan menu sidebar berhasil disimpan." });
              }} 
           />
        )}
      </FormModal>

      {/* MODAL DELETE */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Menu?"
        description={`Apakah Anda yakin ingin menghapus menu "${selectedMenu?.label}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Menu"
        variant="destructive"
      />
    </div>
  );
}