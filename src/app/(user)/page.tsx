import { logout } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";

export default async function UserPage() {
  const user = await validateRequest();

  return (
    <>
      <div className="felx flex-col gap-5">
        <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
        <div className="flex flex-row gap-3">
          <Button>
            <Link href="/profile">User Profile</Link>
          </Button>
          <Button>
            <Link href="/appointments">User Appointments</Link>
          </Button>
          <Button>
            <Link href="/files">User Medical Files</Link>
          </Button>
          <Button>
            <Link href={{
              pathname: "/book",
            }}
            >
              Booking
            </Link>
          </Button>
          <form action={logout}>
            <Button>Sign out</Button>
          </form>
        </div>
      </div>
    </>
  );
}
