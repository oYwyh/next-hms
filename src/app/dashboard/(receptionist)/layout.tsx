import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReceptionistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await validateRequest();

  if (!user) redirect('/auth')
  if (user.role != "receptionist") redirect("/")

  return (
    <>
      {children}
    </>
  );
}