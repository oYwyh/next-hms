import { logout } from "@/actions/auth/auth.action";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useGetUser } from "@/hooks/userHooks";
import Link from "next/link";

export default async function Home() {
  const user = await useGetUser();

  return (
    <>
      {!user ? (
        <Link href="/auth">
          <Badge>auth</Badge>
        </Link>
      ) : (
        <>
          <div className="felx flex-col gap-5">
            <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
            <div className="flex flex-row gap-3">
              {user?.role == 'admin' &&
                <Link href="/admin">
                  <Button>
                    admin dashbaord
                  </Button>
                </Link>
              }
              {user?.role == 'doctor' &&
                <Link href="/doctor">
                  <Button>
                    Doctor dashbaord
                  </Button>
                </Link>
              }
              {user?.role == 'user' &&
                <Link href="/user">
                  <Button>
                    User dashbaord
                  </Button>
                </Link>
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
