"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { CheckCircle2, Circle } from "lucide-react"; 
import { cn } from "@/lib/utils"; 

interface MenuFormProps {
  initialData?: MenuFormValues;
  availableMenus?: Menu[]; 
  isEditing: boolean;
  onSubmit: (data: MenuFormValues) => void;
  onCancel: () => void;
}

const defaultValues: MenuFormValues = {
  label: "",
  href: "",
  icon: "Circle",
  section: "Menu Utama",
  allowed_roles: ["admin", "mahasiswa"],
  sequence: 0,
  is_active: true,
  parent_id: null,
};

const ROLE_OPTIONS = [
  { id: "admin", label: "Administrator" },
  { id: "mahasiswa", label: "Mahasiswa" },
   { id: "dosen", label: "Dosen" },
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

  const validParents = availableMenus.filter(
    (m) => m.parent_id === null && m.id !== initialData?.id
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MenuFormValues, boolean>> = {};
    let isValid = true;
    if (!formData.label.trim()) newErrors.label = true;
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
      
      if (roles.length > 0 && errors.allowed_roles) {
          setErrors((prevErr) => ({ ...prevErr, allowed_roles: undefined }));
      }
      return { ...prev, allowed_roles: roles };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* === BARIS 1 === */}
        <div className="space-y-2">
          <Label htmlFor="section">Section Group</Label>
          <Input
            id="section"
            placeholder="Contoh: Menu Utama"
            value={formData.section}
            onChange={(e) => handleInputChange("section", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label Menu <span className="text-red-500">*</span></Label>
          <Input
            id="label"
            placeholder="Contoh: Dashboard"
            value={formData.label}
            onChange={(e) => handleInputChange("label", e.target.value)}
            className={errors.label ? "border-red-500" : ""}
          />
        </div>

        {/* === BARIS 2 === */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="href">Path / Link URL <span className="text-red-500">*</span></Label>
          </div>
          <Input
            id="href"
            placeholder={formData.parent_id ? "/master/data" : "# atau /path"}
            value={formData.href}
            onChange={(e) => handleInputChange("href", e.target.value)}
            className={errors.href ? "border-red-500" : ""}
          />
          <p className="text-[10px] text-muted-foreground">Gunakan <b>#</b> jika ini Parent Dropdown</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_id">Menu Induk</Label>
          <Select
            // [UBAH] parent_id string, gunakan "0" untuk root
            value={formData.parent_id?.toString() || "0"}
            onValueChange={(val) =>
              // [UBAH] Jangan di Number(), biarkan string atau null
              handleInputChange("parent_id", val === "0" ? null : val)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Parent..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">-- Root (Menu Utama) --</SelectItem>
              {validParents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* === BARIS 3 === */}
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

        <div className="space-y-2">
            <Label htmlFor="status">Status Menu</Label>
            <Select
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(val) => handleInputChange("is_active", val === "active")}
            >
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Non-Aktif</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="hidden">
          <Input
            id="sequence"
            type="hidden"
            value={formData.sequence}
            onChange={(e) => handleInputChange("sequence", e.target.value)}
          />
        </div>

        {/* === BARIS 4: HAK AKSES ROLE === */}
        <div className="md:col-span-2 space-y-3 mt-2">
          <div className="space-y-1">
            <Label className={errors.allowed_roles ? "text-red-500" : ""}>
              Hak Akses Role <span className="text-red-500">*</span>
            </Label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLE_OPTIONS.map((role) => {
               const isSelected = formData.allowed_roles.includes(role.id);

               return (
                 <div
                   key={role.id}
                   onClick={() => toggleRole(role.id)}
                   className={cn(
                     "flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-all select-none gap-3",
                     "hover:bg-slate-50",
                     isSelected 
                        ? "border-[#1B3F95] bg-blue-50/50 text-[#1B3F95]" 
                        : "border-slate-200 text-slate-600"
                   )}
                 >
                   {isSelected ? (
                     <CheckCircle2 
                        size={20} 
                        strokeWidth={1} 
                        className="text-[#1B3F95] fill-blue-100 shrink-0" 
                     />
                   ) : (
                     <Circle 
                        size={20} 
                        strokeWidth={1} 
                        className="text-slate-300 shrink-0" 
                     />
                   )}
                   
                   <span className={cn(
                       "text-sm font-medium",
                       isSelected ? "text-[#1B3F95]" : "text-slate-600"
                   )}>
                       {role.label}
                   </span>
                 </div>
               );
            })}
          </div>
          {errors.allowed_roles && (
            <p className="text-xs text-red-500 font-medium">
              * Wajib memilih minimal satu hak akses.
            </p>
          )}
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="bg-[#1B3F95] hover:bg-[#153275]">
          {isEditing ? "Simpan Perubahan" : "Buat Menu Baru"}
        </Button>
      </div>
    </form>
  );
}