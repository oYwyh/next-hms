import { logout } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ReceptionistPage() {
    const { user } = await validateRequest();

    if (!user) redirect('/auth')
    if (user.role != "receptionist") redirect("/")


    return (
        <>
            <div className="felx flex-col gap-5">
                <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
                <div className="flex flex-row gap-3">
                    <Link href="/dashboard/book">
                        <Button>
                            Book an appointment
                        </Button>
                    </Link>
                    <Link href="/dashboard/receipts">
                        <Button>
                            Receipts
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