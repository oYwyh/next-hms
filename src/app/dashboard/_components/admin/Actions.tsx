import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import Edit from "./Edit";
import { useState } from "react";
import Delete from "@/app/dashboard/_components/admin/Delete";
import { Row } from "@tanstack/react-table";
import Link from "next/link";

export default function Actions({ row, rowData }: { row: Row<any>, rowData: any }) {
    const [open, setOpen] = useState<boolean>(false);

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
                <div className="flex flex-col gap-2 w-full">
                    {row.getValue('role') == 'doctor' && (
                        <Link href={`/dr/${row.getValue('username')}`}>
                            <Button className="w-full" variant={'outline'}>
                                View Profile
                            </Button>
                        </Link>
                    )}
                    {row.getValue('role') == 'user' && (
                        <Link href={`/dashboard/users/${row.getValue('id')}/files`}>
                            <Button className="w-full" variant={'outline'}>
                                View Files
                            </Button>
                        </Link>
                    )}
                    <Edit
                        role={row.getValue('role')}
                        userId={row.getValue('id')}
                        userData={rowData}
                        workTime={row.getValue('workTime') ? row.getValue('workTime') : []}
                        setPopOpen={setOpen}
                    />
                    <Delete
                        id={row.getValue('id')}
                        table={
                            row.getValue('table') == 'doctor'
                                || row.getValue('table') == 'receptionist'
                                || row.getValue('table') == 'admin'
                                ? 'user' : row.getValue('table')
                        }
                        setPopOpen={setOpen}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}