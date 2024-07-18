import { ClientStuffProvider } from "@/app/ClientStuffProvider";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await validateRequest();

  if (!user || user.role != "doctor") {
    redirect("/");
  }

  return (
    <>
      {children}
    </>
  );
}