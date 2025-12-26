"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FormModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string; // misal: "sm:max-w-[600px]"
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "sm:max-w-[500px]",
}: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        {/* HAPUS form wrapper & footer bawaan. 
            Biarkan children (StudentForm/CourseForm) yang render form & buttonnya sendiri. */}
        {children}

      </DialogContent>
    </Dialog>
  );
}