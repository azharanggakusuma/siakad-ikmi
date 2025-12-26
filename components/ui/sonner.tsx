"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans",
          
          description: 
            "group-[.toast]:text-muted-foreground",
          
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
            
          error: "group-[.toaster]:text-red-600",
          success: "group-[.toaster]:text-green-600",
          warning: "group-[.toaster]:text-yellow-600",
          info: "group-[.toaster]:text-blue-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }