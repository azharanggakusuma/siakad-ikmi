"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MenuFormValues } from "@/lib/types";

interface MenuFormProps {
  initialData?: MenuFormValues;
  isEditing: boolean;
  onSubmit: (data: MenuFormValues) => void;
  onCancel: () => void;
}

const defaultValues: MenuFormValues = {
  label: "",
  href: "",
  icon: "",
  section: "Menu Utama",
  allowed_roles: ["admin", "dosen", "mahasiswa"], // Default checked all
  sequence: 0,
  is_active: true,
};

const AVAILABLE_ROLES = [
  { id: "admin", label: "Admin" },
  { id: "dosen", label: "Dosen" },
  { id: "mahasiswa", label: "Mahasiswa" },
];

export function MenuForm({ initialData, isEditing, onSubmit, onCancel }: MenuFormProps) {
  const [formData, setFormData] = useState<MenuFormValues>(
    initialData
      ? { ...initialData }
      : { ...defaultValues }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof MenuFormValues, boolean>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MenuFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    if (!formData.label.trim()) {
      newErrors.label = true;
      errorMessages.push("Label menu wajib diisi.");
    }
    if (!formData.href.trim()) {
      newErrors.href = true;
      errorMessages.push("Href (URL) wajib diisi.");
    }
    if (!formData.icon.trim()) {
      newErrors.icon = true;
      errorMessages.push("Nama Icon wajib diisi.");
    }
    if (formData.allowed_roles.length === 0) {
      newErrors.allowed_roles = true;
      errorMessages.push("Minimal satu role harus dipilih.");
    }

    if (errorMessages.length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Validasi Gagal", {
        description: <ul className="list-disc pl-4">{errorMessages.map((m, i) => <li key={i}>{m}</li>)}</ul>
      });
    }
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleInputChange = (field: keyof MenuFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => {
      const roles = prev.allowed_roles.includes(role)
        ? prev.allowed_roles.filter((r) => r !== role)
        : [...prev.allowed_roles, role];
      return { ...prev, allowed_roles: roles };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      {/* Label & Sequence */}
      <div className="grid grid-cols-4 gap-4">
        <div className="grid gap-2 col-span-3">
          <Label htmlFor="label">Label Menu</Label>
          <Input
            id="label"
            placeholder="Contoh: Dashboard"
            value={formData.label}
            onChange={(e) => handleInputChange("label", e.target.value)}
            className={errors.label ? "border-red-500" : ""}
          />
        </div>
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="sequence">Urutan</Label>
          <Input
            id="sequence"
            type="number"
            value={formData.sequence}
            onChange={(e) => handleInputChange("sequence", e.target.value)}
          />
        </div>
      </div>

      {/* Href & Icon */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="href">Path / URL</Label>
          <Input
            id="href"
            placeholder="Contoh: /dashboard"
            value={formData.href}
            onChange={(e) => handleInputChange("href", e.target.value)}
            className={errors.href ? "border-red-500" : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="icon">Icon (Lucide Name)</Label>
          <Input
            id="icon"
            placeholder="Contoh: LayoutDashboard"
            value={formData.icon}
            onChange={(e) => handleInputChange("icon", e.target.value)}
            className={errors.icon ? "border-red-500" : ""}
          />
          <p className="text-[10px] text-muted-foreground">Gunakan nama icon dari Lucide React.</p>
        </div>
      </div>

      {/* Section & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
            <Label htmlFor="section">Section</Label>
            <Input
                id="section"
                placeholder="Contoh: Menu Utama"
                value={formData.section}
                onChange={(e) => handleInputChange("section", e.target.value)}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(val) => handleInputChange("is_active", val === "active")}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Non-Aktif</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Allowed Roles */}
      <div className="grid gap-3 border rounded-md p-3">
        <Label className={errors.allowed_roles ? "text-red-500" : ""}>Akses Role</Label>
        <div className="flex flex-wrap gap-4">
          {AVAILABLE_ROLES.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`role-${role.id}`} 
                checked={formData.allowed_roles.includes(role.id)}
                onCheckedChange={() => toggleRole(role.id)}
              />
              <Label 
                htmlFor={`role-${role.id}`} 
                className="text-sm font-normal cursor-pointer"
              >
                {role.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">{isEditing ? "Simpan Perubahan" : "Buat Menu"}</Button>
      </div>
    </form>
  );
}