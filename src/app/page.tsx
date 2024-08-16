import { logout } from "@/actions/auth.actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useGetUser } from "@/hooks/useGetUser";
import Link from "next/link";

export default async function Home() {
  const user = await useGetUser();


  return (
    <>
      {!user ? (
        <Link href="/auth">
          <Button>auth</Button>
        </Link>
      ) : (
        <>
          <div className="felx flex-col gap-5">
            <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
            <div className="flex flex-row gap-3">
              {user?.role != 'user' &&
                <Link href="/dashboard">
                  <Button className="capitalize">
                    {user?.role} dashbaord
                  </Button>
                </Link>
              }
              {user?.role == 'user' &&
                <div className="flex flex-row gap-3">
                  <Link href="/book">
                    <Button>
                      Book an appointment
                    </Button>
                  </Link>
                  <Link href="/appointments">
                    <Button>
                      User Appointments
                    </Button>
                  </Link>
                  <Link href="/files">
                    <Button>
                      User Medical Files
                    </Button>
                  </Link>
                </div>
              }
              <form action={logout}>
                <Button>Sign out</Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
