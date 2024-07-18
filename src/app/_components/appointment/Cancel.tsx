'use client'

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

import { Dispatch, SetStateAction, useState } from "react";
import { cancel } from "@/app/(dashboard)/_actions/appointment.actions";

export default function Cancel(
    {
        appointmentId,
        setPopOpen
    }:
        {
            appointmentId: string | number,
            setPopOpen: Dispatch<SetStateAction<boolean | undefined>>;
        }
) {

    const [open, setOpen] = useState<boolean>()

    const onSubmit = async () => {
        const appointment = await cancel(appointmentId);
        if (!appointment?.canceled) throw new Error('Failed to cancel appointment');
        setOpen(false)
        setPopOpen(false)
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogTrigger asChild><Button variant={'destructive'}>Cancel</Button></AlertDialogTrigger>
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
                    <Button variant='destructive' onClick={() => onSubmit()}>
                        Continue
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}