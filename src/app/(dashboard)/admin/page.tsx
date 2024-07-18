import { logout } from "@/actions/auth/auth.actions";
import { Button } from "@/components/ui/Button";
import { useGetUser } from "@/hooks/useGetUser";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";

export default async function AdminPage() {
  const user = await useGetUser();

  return (
    <>
      <div className="felx flex-col gap-5">
        <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
        <div className="flex flex-row gap-3">
          <Button>
            <Link href="/profile">Admin Profile</Link>
          </Button>
          <Button>
            <Link href="/admin/manage/admins">Manage Admins</Link>
          </Button>
          <Button>
            <Link href="/admin/manage/doctors">Manage Doctors</Link>
          </Button>
          <Button>
            <Link href="/admin/manage/users">Manage Users</Link>
          </Button>
          <Button>
            <Link href="/admin/manage/appointments">Manage Appointments</Link>
          </Button>
          <form action={logout}>
            <Button>Sign out</Button>
          </form>
        </div>
      </div>
    </>
  );
}