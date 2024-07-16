import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Row } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import Cancel from "./Cancel";
import Link from "next/link";
import { appointmentTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { validateRequest } from "@/lib/auth";

export default function Actions({ row }: { row: Row<any> }) {
    const appointmentId: string | number = row.getValue("id");
    const status: string = row.getValue("status");
    const doctorId: string | number = row.getValue("doctorId");
    const [open, setOpen] = useState<boolean>();

    const { data } = useQuery({
        queryKey: ['id'],
        queryFn: async () => {
            const response = await fetch('/api/global/user');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        }
    })

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel >Actions</DropdownMenuLabel>
                <div className="flex flex-col gap-2">
                    {data && data.role == 'admin' ? (
                        <Link href={`/admin/manage/appointments/reservation/${appointmentId}/view`}>
                            <Button className="w-[100%]">
                                View
                            </Button>
                        </Link>
                    ) : (
                        <>
                            {data && doctorId == data.id && status == 'completed' && (
                                <Link href={`/doctor/appointments/reservation/${appointmentId}/view`}>
                                    <Button className="w-[100%]">
                                        View
                                    </Button>
                                </Link>
                            )}
                            {data && doctorId != data.id && status == 'completed' && (
                                <Link href={`/user/appointments/reservation/${appointmentId}/view`}>
                                    <Button className="w-[100%]">
                                        View
                                    </Button>
                                </Link>
                            )}
                            {data && doctorId == data.id && status != 'completed' && (
                                <Link href={`/doctor/appointments/reservation/${appointmentId}`}>
                                    <Button className="w-[100%]">
                                        Start
                                    </Button>
                                </Link>
                            )}
                            {status != 'completed' && (
                                <Cancel
                                    appointmentId={appointmentId}
                                    setPopOpen={setOpen}
                                />
                            )}
                        </>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}