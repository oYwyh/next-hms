import { logout } from "@/actions/auth/auth.actions";
import { Button } from "@/components/ui/Button";
import { useGetUser } from "@/hooks/useGetUser";
import Link from "next/link";

export default async function DoctorPage() {
  const user = await useGetUser();

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
          <Link href="/doctor/appointments">
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
