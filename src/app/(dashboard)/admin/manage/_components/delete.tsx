'use client'

import { deleteUser } from "@/app/(dashboard)/_actions/operations.action";
import { Button } from "@/components/ui/Button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/AlertDialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Dispatch, SetStateAction, useState } from "react";
export default function Delete({ id, setPopOpen }: { id: string | number, setPopOpen: Dispatch<SetStateAction<boolean | undefined>>; }) {

    const [open, setOpen] = useState<boolean>()

    const onSubmit = async (id: string | number) => {
        const user = await deleteUser(id);
        setOpen(false)
        setPopOpen(false)
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogTrigger asChild><Button variant={'destructive'}>Delete</Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant='destructive' onClick={() => onSubmit(id)}>
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}