import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { TUser } from "@/types/index.types";
import { MoreHorizontal } from "lucide-react";
import { useState, useCallback, SetStateAction, Dispatch } from "react";

export default function Actions({ row, setSelectedUser }: { row: any, setSelectedUser: Dispatch<SetStateAction<TUser | null>> }) {
    const [open, setOpen] = useState<boolean>(false);

    const handleOpenChange = useCallback((open: boolean) => {
        setOpen(open);
    }, []);

    const handleUser = () => {
        setSelectedUser(row);
    }

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
                    <Button variant={'outline'} onClick={() => handleUser()}>Take Receipt</Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
