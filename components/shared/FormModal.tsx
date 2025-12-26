"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "sm:max-w-[425px]",
}: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={maxWidth}
        // 👇 INI PERBAIKANNYA: Mencegah auto-focus ke input pertama
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        {/* Render konten form (CourseForm) di sini */}
        {children}
      </DialogContent>
    </Dialog>
  );
}