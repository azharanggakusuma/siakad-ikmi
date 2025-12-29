"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { UserForm, type UserFormValues } from "@/components/features/users/UserForm";
import UserTable from "@/components/features/users/UserTable";
import { ResetPasswordModal } from "@/components/features/users/ResetPasswordModal"; 
import { getUsers, createUser, updateUser, deleteUser, type UserData } from "@/app/actions/users";

export default function UsersPage() {
  const [dataList, setDataList] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const users = await getUsers();
      setDataList(users);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === HANDLERS ===
  const handleOpenAdd = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleOpenReset = (user: UserData) => {
    setSelectedUser(user);
    setIsResetOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing && selectedUser) {
        await updateUser(selectedUser.id, values);
        toast.success("Berhasil Update", { description: `User ${values.name} diperbarui.` });
      } else {
        await createUser(values);
        toast.success("Berhasil", { description: `User ${values.name} ditambahkan.` });
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error("Gagal Menyimpan", { description: error.message || "Terjadi kesalahan sistem." });
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        toast.success("Dihapus", { description: "User berhasil dihapus." });
        await fetchData();
      } catch (error: any) {
        toast.error("Gagal Hapus", { description: error.message || "Gagal menghapus data." });
      }
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Data Pengguna" breadcrumb={["SIAKAD", "Users"]} />

      <UserTable 
        data={dataList}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onResetPassword={handleOpenReset}
      />

      {/* MODAL ADD/EDIT */}
      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title={isEditing ? "Edit User" : "Tambah User Baru"}
        description={isEditing ? "Update informasi login pengguna." : "Buat akun baru untuk akses sistem."}
        maxWidth="sm:max-w-[500px]"
      >
        <UserForm
          key={isEditing && selectedUser ? `edit-${selectedUser.id}` : "add-new"}
          initialData={
            isEditing && selectedUser
              ? {
                  id: selectedUser.id,
                  name: selectedUser.name,
                  username: selectedUser.username,
                  role: selectedUser.role,
                  student_id: selectedUser.student_id,
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
        title="Hapus User?"
        description={`Yakin ingin menghapus user "${selectedUser?.name}"? Akses login akan hilang permanen.`}
        confirmLabel="Hapus User"
        variant="destructive"
      />

      {/* MODAL RESET PASSWORD */}
      <ResetPasswordModal 
        isOpen={isResetOpen}
        onClose={setIsResetOpen}
        user={selectedUser}
      />
    </div>
  );
}