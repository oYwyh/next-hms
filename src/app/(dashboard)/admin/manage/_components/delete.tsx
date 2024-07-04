'use client'

import { deleteUser } from "@/app/(dashboard)/_actions/operations.action";
import { Button } from "@/components/ui/button";

export default function Delete({ id }: { id: string | number }) {

    const onSubmit = async (id: string | number) => {
        const user = await deleteUser(id);
    }

    return (
        <Button variant='destructive' onClick={() => onSubmit(id)}>
            Delete
        </Button>
    )
}