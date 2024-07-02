import { logout } from "@/actions/auth/auth.action";
import { Button } from "@/components/ui/button";
import { useGetUser } from "@/hooks/userHooks";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";

export default async function UserPage() {
  const user = await useGetUser();

  return (
    <>
      <div className="felx flex-col gap-5">
        <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
        <div className="flex flex-row gap-3">
          <Button>
            <Link href="/user/profile">User Profile</Link>
          </Button>
          <form action={logout}>
            <Button>Sign out</Button>
          </form>
        </div>
      </div>
    </>
  );
}
