"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Search, Check, Loader2 } from "lucide-react";
import { getStudentsForSelection, type StudentOption } from "@/app/actions/users";

export interface UserFormValues {
  id?: string;
  name: string;
  username: string;
  password?: string;
  role: string;
  student_id?: number | null;
}

interface UserFormProps {
  initialData?: UserFormValues;
  isEditing: boolean;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
}

// Default role dikosongkan agar placeholder muncul saat tambah user
const defaultValues: UserFormValues = {
  name: "",
  username: "",
  password: "",
  role: "", 
  student_id: null,
};

export function UserForm({ initialData, isEditing, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormValues>(() => {
    if (initialData) {
      return {
        id: initialData.id,
        name: initialData.name || "",
        username: initialData.username || "",
        password: "",
        role: initialData.role || "", // Pastikan role terisi saat edit
        student_id: initialData.student_id || null,
      };
    }
    return defaultValues;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, boolean>>>({});

  // --- STATE UNTUK SEARCHABLE SELECT ---
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // FETCH DATA MAHASISWA SAAT ROLE = MAHASISWA
  useEffect(() => {
    if (formData.role === "mahasiswa") {
      setIsLoadingStudents(true);
      getStudentsForSelection(isEditing ? formData.id : undefined)
        .then((data) => {
          setStudentOptions(data);
        })
        .finally(() => setIsLoadingStudents(false));
    }
  }, [formData.role, isEditing, formData.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = studentOptions.filter((s) =>
    s.nim.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.nama.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const selectedStudentObj = studentOptions.find(s => s.id === formData.student_id);

  // --- VALIDASI ---
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormValues, boolean>> = {};
    let isValid = true;
    const errorMessages: string[] = [];

    // Validasi Role Wajib Dipilih
    if (!formData.role) {
      newErrors.role = true;
      isValid = false;
      errorMessages.push("Role wajib dipilih.");
    }

    if (!formData.name.trim()) {
      newErrors.name = true;
      isValid = false;
      errorMessages.push("Nama wajib diisi.");
    }
    if (!formData.username.trim()) {
      newErrors.username = true;
      isValid = false;
      errorMessages.push("Username wajib diisi.");
    }
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      newErrors.password = true;
      isValid = false;
      errorMessages.push("Password minimal 6 karakter.");
    }
    if (formData.role === "mahasiswa" && !formData.student_id) {
      isValid = false;
      errorMessages.push("Harap pilih data mahasiswa untuk ditautkan.");
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error("Validasi Gagal", {
        description: (
          <ul className="list-disc pl-4 space-y-1 text-sm">
            {errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        )
      });
    }
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof UserFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSelectStudent = (student: StudentOption) => {
    if (student.is_taken) return;
    setFormData(prev => ({
      ...prev,
      student_id: student.id,
      name: student.nama,
      username: student.nim
    }));
    setIsDropdownOpen(false);
    setSearchStudent("");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      
      {/* Role Selection */}
      <div className="grid gap-2">
        <Label htmlFor="role">Role / Peran</Label>
        <Select
          value={formData.role}
          onValueChange={(val) => {
            handleInputChange("role", val);
            if (val !== 'mahasiswa') {
              setFormData(prev => ({ ...prev, student_id: null }));
            }
          }}
        >
          {/* Tambahkan validasi error style pada SelectTrigger */}
          <SelectTrigger className={`w-full ${errors.role ? "border-red-500 focus:ring-0 focus:border-red-500" : ""}`}>
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            {/* Hanya menampilkan Admin dan Mahasiswa */}
            <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- FITUR DROPDOWN MAHASISWA --- */}
      {formData.role === "mahasiswa" && (
        <div className="grid gap-2 relative" ref={dropdownRef}>
          <Label className="flex justify-between">
            Tautkan Data Mahasiswa
            {isLoadingStudents && <Loader2 className="animate-spin h-3 w-3 text-muted-foreground" />}
          </Label>
          
          <div 
            className={`flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-slate-50 
              ${!formData.student_id ? 'text-muted-foreground' : 'text-foreground font-medium'} 
              ${errors.student_id ? "border-red-500" : "border-input"}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedStudentObj 
              ? `${selectedStudentObj.nim} - ${selectedStudentObj.nama}` 
              : "Pilih / Cari Mahasiswa..."}
            <Search size={14} className="opacity-50" />
          </div>

          {/* Isi Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white">
              <div className="p-2 border-b sticky top-0 bg-white z-10">
                <Input 
                  placeholder="Cari NIM atau Nama..." 
                  className="h-8 text-xs"
                  autoFocus
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto p-1">
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-center p-2 text-muted-foreground">Data tidak ditemukan.</p>
                ) : (
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className={`
                        flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer
                        ${s.id === formData.student_id ? "bg-slate-100 font-medium" : "hover:bg-slate-50"}
                        ${s.is_taken ? "opacity-50 cursor-not-allowed bg-slate-50/50" : ""}
                      `}
                    >
                      <div className="flex flex-col">
                        <span>{s.nim} - {s.nama}</span>
                        {s.is_taken && <span className="text-[10px] text-red-500 font-semibold">(Sudah punya akun)</span>}
                      </div>
                      {s.id === formData.student_id && <Check size={14} className="text-green-600" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
           <p className="text-[10px] text-muted-foreground">
             *Memilih mahasiswa akan otomatis mengisi Nama & Username.
           </p>
        </div>
      )}

      {/* Nama & Username */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nama User"
            className={errors.name ? "border-red-500" : ""}
            readOnly={formData.role === 'mahasiswa' && !!formData.student_id} 
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder="Username login"
            className={errors.username ? "border-red-500" : ""}
          />
        </div>
      </div>

      {/* Password */}
      <div className="grid gap-2 relative">
        <Label htmlFor="password">
          {isEditing ? "Password Baru (Opsional)" : "Password"}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder={isEditing ? "Kosongkan jika tidak ingin mengubah" : "******"}
            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {isEditing && (
          <p className="text-[10px] text-muted-foreground">
            *Biarkan kosong jika tetap menggunakan password lama.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          {isEditing ? "Simpan Perubahan" : "Buat User"}
        </Button>
      </div>
    </form>
  );
}