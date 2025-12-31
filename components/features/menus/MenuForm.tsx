"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MenuFormValues } from "@/lib/types";
import { Search, X, ChevronDown } from "lucide-react";
// Import semua icon
import * as LucideIcons from "lucide-react";

interface MenuFormProps {
  initialData?: MenuFormValues;
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
};

const AVAILABLE_ROLES = [
  { id: "admin", label: "Admin" },
  { id: "dosen", label: "Dosen" },
  { id: "mahasiswa", label: "Mahasiswa" },
];

// 1. Ambil daftar icon murni (exclude internal helper Lucide)
const ICON_LIST = Object.keys(LucideIcons).filter(
  (key) => isNaN(Number(key)) && key !== "createLucideIcon" && key !== "icons" && key !== "lucide-react"
);

export function MenuForm({ initialData, isEditing, onSubmit, onCancel }: MenuFormProps) {
  const [formData, setFormData] = useState<MenuFormValues>(
    initialData ? { ...initialData } : { ...defaultValues }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof MenuFormValues, boolean>>>({});

  // --- STATE ICON PICKER ---
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [searchIcon, setSearchIcon] = useState("");
  const [visibleCount, setVisibleCount] = useState(100); // Mulai dengan 100 icon

  // Reset visible count saat search berubah atau modal dibuka
  useEffect(() => {
    if (isIconPickerOpen) setVisibleCount(100);
  }, [isIconPickerOpen, searchIcon]);

  // 2. Filter icon berdasarkan pencarian
  const allFilteredIcons = useMemo(() => {
    if (!searchIcon) return ICON_LIST;
    return ICON_LIST.filter((name) =>
      name.toLowerCase().includes(searchIcon.toLowerCase())
    );
  }, [searchIcon]);

  // 3. Potong list sesuai jumlah visibleCount agar ringan
  const visibleIcons = allFilteredIcons.slice(0, visibleCount);

  // Helper render icon dinamis
  const IconRender = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) return <X className={className} />;
    return <IconComponent className={className} />;
  };

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
      toast.error("Mohon lengkapi form yang ditandai merah.");
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
        
        {/* === ICON PICKER UPDATE === */}
        <div className="grid gap-2">
          <Label>Icon Menu</Label>
          <Dialog open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                role="combobox"
                className={`w-full justify-between font-normal ${!formData.icon && "text-muted-foreground"} ${errors.icon ? "border-red-500" : ""}`}
              >
                <span className="flex items-center gap-2">
                   {formData.icon ? (
                     <>
                       <IconRender name={formData.icon} className="h-4 w-4 text-slate-600" />
                       {formData.icon}
                     </>
                   ) : "Pilih Icon..."}
                </span>
                <Search className="h-4 w-4 opacity-50" />
              </Button>
            </DialogTrigger>
            
            {/* Lebarkan Modal agar muat lebih banyak */}
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Pilih Icon ({allFilteredIcons.length})</DialogTitle>
              </DialogHeader>
              
              <div className="py-2">
                <Input 
                  placeholder="Cari nama icon (inggris)..." 
                  value={searchIcon}
                  onChange={(e) => setSearchIcon(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-6 sm:grid-cols-8 gap-2 content-start">
                {visibleIcons.length === 0 ? (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-10">
                        Tidak ditemukan icon dengan nama "{searchIcon}".
                    </div>
                ) : (
                    <>
                      {visibleIcons.map((iconName) => (
                          <div
                              key={iconName}
                              className={`
                                  flex flex-col items-center justify-center gap-1 p-3 rounded-md cursor-pointer border transition-all hover:bg-slate-50
                                  ${formData.icon === iconName ? "bg-slate-100 border-primary ring-1 ring-primary" : "border-transparent hover:border-slate-200"}
                              `}
                              onClick={() => {
                                  handleInputChange("icon", iconName);
                                  setIsIconPickerOpen(false);
                                  setSearchIcon("");
                              }}
                              title={iconName}
                          >
                              <IconRender name={iconName} className="h-6 w-6 text-slate-700" />
                              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{iconName}</span>
                          </div>
                      ))}
                      
                      {/* Tombol Load More */}
                      {visibleCount < allFilteredIcons.length && (
                        <div className="col-span-full py-4 flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setVisibleCount((prev) => prev + 100)}
                            className="text-muted-foreground"
                          >
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Muat Lebih Banyak
                          </Button>
                        </div>
                      )}
                    </>
                )}
              </div>
              
              <div className="text-[10px] text-muted-foreground text-center border-t pt-2">
                Menampilkan {visibleIcons.length} dari {allFilteredIcons.length} icon
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
              <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
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