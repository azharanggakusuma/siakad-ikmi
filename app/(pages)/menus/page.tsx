"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import MenuTable from "@/components/features/menus/MenuTable";
import { MenuForm } from "@/components/features/menus/MenuForm";
import { Menu, MenuFormValues } from "@/lib/types";
import { getMenus, createMenu, updateMenu, deleteMenu } from "@/app/actions/menus";

export default function MenusPage() {
  const [dataList, setDataList] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const menus = await getMenus();
      setDataList(menus);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data menu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === HANDLERS ===
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
    try {
      if (isEditing && selectedMenu) {
        await updateMenu(selectedMenu.id, values);
        toast.success("Berhasil Update", { description: `Menu ${values.label} diperbarui.` });
      } else {
        await createMenu(values);
        toast.success("Berhasil", { description: `Menu ${values.label} ditambahkan.` });
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error("Gagal Menyimpan", { description: error.message || "Terjadi kesalahan sistem." });
    }
  };

  const handleDelete = async () => {
    if (selectedMenu) {
      try {
        await deleteMenu(selectedMenu.id);
        toast.success("Dihapus", { description: "Menu berhasil dihapus." });
        await fetchData();
      } catch (error: any) {
        toast.error("Gagal Hapus", { description: error.message || "Gagal menghapus data." });
      }
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Manajemen Menu" breadcrumb={["SIAKAD", "Pengaturan", "Menu"]} />

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
        description={isEditing ? "Ubah konfigurasi menu navigasi." : "Tambahkan menu baru ke sidebar."}
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
                }
              : undefined
          }
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* MODAL DELETE */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Menu?"
        description={`Yakin ingin menghapus menu "${selectedMenu?.label}"? Menu ini akan hilang dari sidebar semua user.`}
        confirmLabel="Hapus Menu"
        variant="destructive"
      />
    </div>
  );
}