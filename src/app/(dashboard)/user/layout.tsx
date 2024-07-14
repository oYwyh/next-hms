import { ClientStuffProvider } from "@/app/ClientStuffProvider";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppointmentContext } from "./context";
import { useState } from "react";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await validateRequest();

  if (!user || user.role != "user") {
    redirect("/");
  }


  return (
    <ClientStuffProvider>
      {children}
    </ClientStuffProvider>
  );
}
