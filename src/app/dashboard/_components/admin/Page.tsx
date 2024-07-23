import { logout } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { user } = await validateRequest();

  return (
    <>
      <div className="felx flex-col gap-5">
        <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
        <div className="flex flex-row gap-3">
          <Button>
            <Link href="/profile">Admin Profile</Link>
          </Button>
          <Button>
            <Link href="/dashboard/admins">Manage Admins</Link>
          </Button>
          <Button>
            <Link href="/dashboard/doctors">Manage Doctors</Link>
          </Button>
          <Button>
            <Link href="/dashboard/users">Manage Users</Link>
          </Button>
          <Button>
            <Link href="/dashboard/receptionists">Manage Receptionists</Link>
          </Button>
          <Button>
            <Link href="/dashboard/appointments">Manage Appointments</Link>
          </Button>
          <form action={logout}>
            <Button>Sign out</Button>
          </form>
        </div>
      </div>
    </>
  );
}