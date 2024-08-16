import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import { useState, useCallback } from "react";
import { Row } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import Cancel from "./Cancel";
import Link from "next/link";
import Delete from "@/app/dashboard/_components/admin/Delete";

interface ActionsProps {
    row: Row<any>;
}

export default function Actions({ row }: ActionsProps) {
    const appointmentId = row.getValue<string | number>("id");
    const status = row.getValue<string>("status");
    const doctorId = row.getValue<string | number>("doctorId");
    const doctorUserId = row.getValue<string | number>("doctorUserId");
    const [open, setOpen] = useState<boolean>(false);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user/info');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
    });

    const handleOpenChange = useCallback((open: boolean) => {
        setOpen(open);
    }, []);

    const renderButton = (href: string, label: string) => (
        <Link href={href}>
            <Button className="w-full">
                {label}
            </Button>
        </Link>
    );

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <div className="flex flex-col gap-2">
                    {user && (
                        <>
                            {(user.role === 'admin' && status === 'completed') ||
                                (doctorUserId === user.id && status === 'completed')
                                ? renderButton(`/dashboard/appointments/reservation/${appointmentId}/view`, 'View')
                                : doctorUserId !== user.id && status === 'completed'
                                    ? renderButton(`/appointments/reservation/${appointmentId}/view`, 'View')
                                    : doctorUserId === user.id && status !== 'completed'
                                        ? renderButton(`/dashboard/appointments/reservation/${appointmentId}`, 'Start')
                                        : null
                            }
                            {status !== 'completed' && (
                                <Delete id={appointmentId} table="appointment" setPopOpen={setOpen} />
                            )}
                        </>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
