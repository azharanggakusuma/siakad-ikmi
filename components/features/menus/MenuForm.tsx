"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"; // <--- TAMBAHKAN INI
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
import { Search, X, Loader2, Filter } from "lucide-react";
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

// 1. Daftar Icon Bersih
const IGNORED_KEYS = ["createLucideIcon", "icons", "lucide-react", "default"];
const ICON_LIST = Object.keys(LucideIcons).filter(
  (key) => isNaN(Number(key)) && !IGNORED_KEYS.includes(key)
);

// 2. Kategori Resmi Lucide (Mapped by Keywords)
const LUCIDE_CATEGORIES = [
  { label: "Arrows", keywords: ["arrow", "chevron", "caret", "corner", "expand", "shrink", "move", "refresh", "rotate", "undo", "redo"] },
  { label: "Communication", keywords: ["mail", "message", "inbox", "send", "chat", "phone", "contact", "call", "signal", "wifi"] },
  { label: "Charts & Analytics", keywords: ["chart", "bar", "line", "pie", "activity", "graph", "trend", "analytics", "presentation"] },
  { label: "Devices", keywords: ["monitor", "laptop", "phone", "smartphone", "tablet", "watch", "tv", "camera", "printer", "battery", "cpu", "server", "hard-drive", "database", "keyboard", "mouse"] },
  { label: "Files & Folders", keywords: ["file", "folder", "document", "paper", "sheet", "page", "archive", "box", "clipboard", "copy", "save"] },
  { label: "Users & People", keywords: ["user", "person", "people", "group", "team", "account", "profile", "face", "smile"] },
  { label: "Money & Shopping", keywords: ["shopping", "cart", "bag", "store", "shop", "tag", "price", "credit-card", "wallet", "gift", "dollar", "euro", "bank", "coins"] },
  { label: "Media", keywords: ["play", "pause", "stop", "rewind", "forward", "skip", "volume", "music", "video", "film", "image", "mic", "headphones"] },
  { label: "Security", keywords: ["lock", "unlock", "key", "shield", "protect", "security", "user-check", "fingerprint"] },
  { label: "Design & Edit", keywords: ["pen", "pencil", "brush", "palette", "color", "crop", "layer", "layout", "grid", "ruler", "scissors", "edit", "trash"] },
  { label: "Time & Date", keywords: ["calendar", "date", "clock", "time", "watch", "schedule", "timer", "alarm"] },
  { label: "Weather & Nature", keywords: ["sun", "moon", "cloud", "rain", "snow", "wind", "storm", "thermometer", "umbrella", "leaf", "flower", "tree"] },
  { label: "Navigation & Maps", keywords: ["map", "pin", "location", "globe", "compass", "flag", "landmark", "navigation", "route"] },
  { label: "Brands", keywords: ["github", "facebook", "twitter", "instagram", "linkedin", "youtube", "twitch", "chrome", "slack", "dribbble", "codepen", "framer", "gitlab", "figma"] },
];

export function MenuForm({ initialData, isEditing, onSubmit, onCancel }: MenuFormProps) {
  const [formData, setFormData] = useState<MenuFormValues>(
    initialData ? { ...initialData } : { ...defaultValues }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof MenuFormValues, boolean>>>({});

  // --- STATE ICON PICKER ---
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [searchIcon, setSearchIcon] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(100);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll saat filter berubah
  useEffect(() => {
    if (isIconPickerOpen) {
      setVisibleCount(100);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [isIconPickerOpen, activeCategory, searchIcon]);

  // 3. Logic Filtering: Category + Search
  const filteredIcons = useMemo(() => {
    let result = ICON_LIST;

    // Filter Category
    if (activeCategory !== "All") {
      const category = LUCIDE_CATEGORIES.find(c => c.label === activeCategory);
      if (category) {
        result = result.filter(name => 
          category.keywords.some(k => name.toLowerCase().includes(k))
        );
      }
    }

    // Filter Search
    if (searchIcon) {
      const lowerSearch = searchIcon.toLowerCase();
      result = result.filter((name) => name.toLowerCase().includes(lowerSearch));
    }

    return result;
  }, [searchIcon, activeCategory]);

  // 4. Infinite Scroll Slice
  const visibleIcons = filteredIcons.slice(0, visibleCount);

  // 5. Handle Infinite Scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more jika scroll mendekati bawah (150px)
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (visibleCount < filteredIcons.length) {
        setVisibleCount((prev) => prev + 100);
      }
    }
  };

  const IconRender = ({ name, className }: { name: string; className?: string }) => {
    // @ts-ignore - Dynamic access
    const IconComponent = LucideIcons[name];
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
        
        {/* === ICON PICKER === */}
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
                       <div className="bg-slate-100 p-1 rounded-sm">
                         <IconRender name={formData.icon} className="h-4 w-4 text-slate-700" />
                       </div>
                       {formData.icon}
                     </>
                   ) : "Pilih Icon..."}
                </span>
                <Search className="h-4 w-4 opacity-50" />
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
              <DialogHeader className="px-6 py-4 border-b space-y-3">
                <DialogTitle>Pilih Icon</DialogTitle>
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                    placeholder="Cari icon (contoh: user, home, setting)..." 
                    value={searchIcon}
                    onChange={(e) => setSearchIcon(e.target.value)}
                    className="pl-9 h-10 bg-slate-50 border-slate-200"
                    autoFocus
                  />
                </div>
              </DialogHeader>

              {/* CATEGORY TABS (Scrollable Chips) */}
              <div className="border-b bg-slate-50/50">
                <div className="flex overflow-x-auto py-3 px-4 gap-2 no-scrollbar items-center">
                   <Button 
                      variant={activeCategory === "All" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setActiveCategory("All")}
                      className="h-8 rounded-full px-4 text-xs shadow-sm"
                   >
                     All Icons
                   </Button>
                   <div className="w-[1px] h-5 bg-slate-300 mx-1"></div>
                   {LUCIDE_CATEGORIES.map(cat => (
                     <Button 
                        key={cat.label}
                        variant={activeCategory === cat.label ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={() => setActiveCategory(cat.label)}
                        className={`h-8 rounded-full px-4 text-xs whitespace-nowrap border ${activeCategory === cat.label ? "bg-slate-200 border-slate-300 text-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                     >
                        {cat.label}
                     </Button>
                   ))}
                </div>
              </div>

              {/* ICON GRID (Infinite Scroll) */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 bg-slate-50/30"
                onScroll={handleScroll}
              >
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 content-start">
                  {visibleIcons.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-70">
                      <Filter className="h-12 w-12 mb-3 stroke-1 text-slate-300" />
                      <p className="font-medium">Tidak ditemukan icon</p>
                      <p className="text-xs">Coba kata kunci atau kategori lain.</p>
                    </div>
                  ) : (
                    visibleIcons.map((iconName) => (
                      <div
                        key={iconName}
                        className={`
                          group flex flex-col items-center justify-center gap-2 p-3 rounded-lg cursor-pointer border bg-white transition-all duration-200
                          ${formData.icon === iconName ? "border-primary ring-2 ring-primary ring-opacity-20 bg-primary/5 z-10" : "border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"}
                        `}
                        onClick={() => {
                          handleInputChange("icon", iconName);
                          setIsIconPickerOpen(false);
                        }}
                      >
                        <IconRender name={iconName} className={`h-6 w-6 transition-colors ${formData.icon === iconName ? "text-primary" : "text-slate-600 group-hover:text-slate-900"}`} />
                        <span className="text-[10px] text-slate-500 truncate w-full text-center group-hover:text-slate-800 font-medium">{iconName}</span>
                      </div>
                    ))
                  )}
                  
                  {/* Loader Infinite Scroll */}
                  {visibleCount < filteredIcons.length && (
                     <div className="col-span-full py-6 flex justify-center">
                        <Loader2 className="animate-spin h-6 w-6 text-primary/50" />
                     </div>
                  )}
                </div>
              </div>
              
              {/* Footer Stat */}
              <div className="border-t p-3 px-6 bg-white flex justify-between items-center text-xs text-muted-foreground shadow-sm z-10">
                  <div className="flex items-center gap-2">
                    <span>Terpilih: </span>
                    {/* Menggunakan Badge untuk tampilan label icon */}
                    <Badge variant="outline" className="font-mono bg-slate-50">{formData.icon}</Badge>
                  </div>
                  <span>{visibleIcons.length} dari {filteredIcons.length} icon</span>
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