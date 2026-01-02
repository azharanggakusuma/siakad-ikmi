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
import { MenuFormValues, Menu } from "@/lib/types";
import { IconPicker } from "@/components/shared/IconPicker";

interface MenuFormProps {
  initialData?: MenuFormValues;
  availableMenus?: Menu[]; // Data untuk opsi Parent
  isEditing: boolean;
  onSubmit: (data: MenuFormValues) => void;
  onCancel: () => void;
}

const defaultValues: MenuFormValues = {
  label: "",
  href: "",
  icon: "Circle",
  section: "Menu Utama",
  allowed_roles: ["admin", "dosen", "mahasiswa"],
  sequence: 0,
  is_active: true,
  parent_id: null,
};

const AVAILABLE_ROLES = [
  { id: "admin", label: "Admin" },
  { id: "dosen", label: "Dosen" },
  { id: "mahasiswa", label: "Mahasiswa" },
];

export function MenuForm({
  initialData,
  availableMenus = [],
  isEditing,
  onSubmit,
  onCancel,
}: MenuFormProps) {
  const [formData, setFormData] = useState<MenuFormValues>(
    initialData ? { ...initialData } : { ...defaultValues }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof MenuFormValues, boolean>>>({});

  // Filter Parent yang valid: Hanya menu root (parent_id null) & bukan diri sendiri
  const validParents = availableMenus.filter(
    (m) => m.parent_id === null && m.id !== initialData?.id
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MenuFormValues, boolean>> = {};
    let isValid = true;
    if (!formData.label.trim()) newErrors.label = true;
    // Href wajib, tapi bisa '#' jika dropdown
    if (!formData.href.trim()) newErrors.href = true;
    if (!formData.icon.trim()) newErrors.icon = true;
    if (formData.allowed_roles.length === 0) newErrors.allowed_roles = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Mohon lengkapi data yang kurang.");
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
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Container Grid: Default 1 kolom, Layar medium ke atas 2 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* --- SECTION 1: INFORMASI UTAMA (Full Width) --- */}
        
        {/* Label Menu */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="label">Label Menu <span className="text-red-500">*</span></Label>
          <Input
            id="label"
            placeholder="Contoh: Dashboard"
            value={formData.label}
            onChange={(e) => handleInputChange("label", e.target.value)}
            className={errors.label ? "border-red-500" : ""}
          />
        </div>

        {/* Path / URL */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="href">Path / Link URL <span className="text-red-500">*</span></Label>
            <span className="text-[10px] text-muted-foreground">Gunakan <b>#</b> jika ini Parent Dropdown</span>
          </div>
          <Input
            id="href"
            placeholder={formData.parent_id ? "/master/data" : "# atau /path"}
            value={formData.href}
            onChange={(e) => handleInputChange("href", e.target.value)}
            className={errors.href ? "border-red-500" : ""}
          />
        </div>

        {/* --- SECTION 2: STRUKTUR & TAMPILAN (2 Kolom) --- */}

        {/* Parent ID */}
        <div className="space-y-2">
          <Label htmlFor="parent_id">Menu Induk (Opsional)</Label>
          <Select
            value={formData.parent_id?.toString() || "0"}
            onValueChange={(val) =>
              handleInputChange("parent_id", val === "0" ? null : Number(val))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Parent..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">-- Root (Menu Utama) --</SelectItem>
              {validParents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id.toString()}>
                  {parent.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section Group */}
        <div className="space-y-2">
          <Label htmlFor="section">Section Group</Label>
          <Input
            id="section"
            placeholder="Contoh: Menu Utama"
            value={formData.section}
            onChange={(e) => handleInputChange("section", e.target.value)}
          />
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label>Icon <span className="text-red-500">*</span></Label>
          <div className="w-full">
            <IconPicker
              value={formData.icon}
              onChange={(icon) => handleInputChange("icon", icon)}
              error={!!errors.icon}
            />
          </div>
        </div>

        {/* Urutan */}
        <div className="space-y-2">
          <Label htmlFor="sequence">Urutan</Label>
          <Input
            id="sequence"
            type="number"
            value={formData.sequence}
            onChange={(e) => handleInputChange("sequence", e.target.value)}
            placeholder="0"
          />
        </div>

        {/* --- SECTION 3: STATUS & PERMISSIONS (Full Width) --- */}

        {/* Status Aktif */}
        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="status">Status Aktif</Label>
            <Select
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(val) => handleInputChange("is_active", val === "active")}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Aktif (Tampil)</SelectItem>
                    <SelectItem value="inactive">Non-Aktif (Sembunyi)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* Hak Akses Role */}
        <div className="md:col-span-2 space-y-3 border rounded-md p-4 bg-slate-50/50">
          <Label className={errors.allowed_roles ? "text-red-500" : ""}>
            Hak Akses Role <span className="text-red-500">*</span>
          </Label>
          <div className="flex flex-wrap gap-6">
            {AVAILABLE_ROLES.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={formData.allowed_roles.includes(role.id)}
                  onCheckedChange={() => toggleRole(role.id)}
                />
                <Label
                  htmlFor={`role-${role.id}`}
                  className="text-sm font-normal cursor-pointer capitalize select-none"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          {isEditing ? "Simpan Perubahan" : "Buat Menu"}
        </Button>
      </div>
    </form>
  );
}