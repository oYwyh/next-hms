import { logout } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DoctorPage() {
  const { user } = await validateRequest();

  if (!user) redirect('/auth')
  if (user.role != "doctor") redirect("/")


  return (
    <>
      <div className="felx flex-col gap-5">
        <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
        <div className="flex flex-row gap-3">
          <Link href="/profile">
            <Button>
              Doctor Profile
            </Button>
          </Link>
          <Link href="/dashboard/appointments">
            <Button>
              Doctor Appointments
            </Button>
          </Link>
          <form action={logout}>
            <Button>Sign out</Button>
          </form>
        </div>
      </div>
    </>
  );
}
