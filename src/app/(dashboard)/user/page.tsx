import { logout } from "@/actions/auth/auth.action";
import { Button } from "@/components/ui/Button";
import { useGetUser } from "@/hooks/userHooks";
import { validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function UserPage() {
  const user = await validateRequest();

  return (
    <>
      <div className="felx flex-col gap-5">
        <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
        <div className="flex flex-row gap-3">
          <Button>
            <Link href="/user/profile">User Profile</Link>
          </Button>
          <Button>
            <Link href="/user/appointments">User Appointments</Link>
          </Button>
          <Button>
            <Link href="/user/files">User Medical Files</Link>
          </Button>
          <Button>
            <Link href={{
              pathname: '/user/booking',
            }}
            >
              Booking
            </Link>
          </Button>
          {/* <Button>
            <Link href="/user/appointments">
              Appointments
            </Link>
          </Button> */}
          <form action={logout}>
            <Button>Sign out</Button>
          </form>
        </div>
      </div>
    </>
  );
}
