import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import Edit from "./Edit";
import Delete from "@/app/(dashboard)/_components/Delete";
import { useState } from "react";

export default function Actions({ row, rowData }: any) {
    const [open, setOpen] = useState<boolean>();

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
                <Edit
                    role={row.getValue('role')}
                    userId={row.getValue('id')}
                    userData={rowData}
                    workTime={row.getValue('workTime')}
                    setPopOpen={setOpen}
                />
                <Delete
                    id={row.getValue('id')}
                    setPopOpen={setOpen}
                />
            </DropdownMenuContent>
        </DropdownMenu >
    )
}