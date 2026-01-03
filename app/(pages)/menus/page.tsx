"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button"; 
import { ArrowUpDown } from "lucide-react";    
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import MenuTable from "@/components/features/menus/MenuTable";
import { MenuForm } from "@/components/features/menus/MenuForm";
import MenuReorderList from "@/components/features/menus/MenuReorderList"; 
import { Menu, MenuFormValues } from "@/lib/types";
import { getMenus, createMenu, updateMenu, deleteMenu } from "@/app/actions/menus";
// 1. Import Hook
import { useToastMessage } from "@/hooks/use-toast-message";

export default function MenusPage() {
  const [dataList, setDataList] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Gunakan Hook
  const { showLoading, showSuccess, successAction, errorAction, confirmDeleteMessage } = useToastMessage();

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
      errorAction("load", error);
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
    setIsFormOpen(false); 
    
    // Tampilkan Loading
    const toastId = showLoading("Menyimpan data menu...");

    try {
      if (isEditing && selectedMenu) {
        await updateMenu(selectedMenu.id, values);
        // Toast Sukses Update
        successAction("Menu", "update", toastId);
      } else {
        await createMenu(values);
        // Toast Sukses Create
        successAction("Menu", "create", toastId);
      }
      
      await fetchData();
    } catch (error: any) {
      setIsFormOpen(true); // Buka form lagi jika gagal
      // Toast Error Save
      errorAction("save", error, toastId);
    }
  };

  const handleDelete = async () => {
    if (selectedMenu) {
      setIsDeleteOpen(false);
      const toastId = showLoading("Menghapus data...");

      try {
        await deleteMenu(selectedMenu.id);
        // Toast Sukses Delete
        successAction("Menu", "delete", toastId);
        await fetchData();
      } catch (error: any) {
        // Toast Error Delete
        errorAction("delete", error, toastId);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
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
                  // Bisa pakai showSuccess manual jika pesannya spesifik
                  showSuccess("Urutan Diperbarui", "Susunan menu sidebar berhasil disimpan.");
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
        // 3. Gunakan Template Pesan Konfirmasi
        description={confirmDeleteMessage("Menu", selectedMenu?.label)} 
        confirmLabel="Ya, Hapus Menu"
        variant="destructive"
      />
    </div>
  );
}