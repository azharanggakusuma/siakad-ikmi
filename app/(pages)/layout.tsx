import React from "react";
import { redirect } from "next/navigation"; // <--- 1. Import redirect
import ClientLayout from "./ClientLayout"; 
import { getSession } from "@/app/actions/auth";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Ambil session
  const user = await getSession();

  // 3. CEK DAN LEMPAR JIKA BELUM LOGIN
  if (!user) {
    redirect("/login");
  }

  // Jika lolos (user ada), render halaman
  return (
    <ClientLayout user={user}>
      {children}
    </ClientLayout>
  );
}