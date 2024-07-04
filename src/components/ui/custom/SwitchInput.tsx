import { useForm } from "react-hook-form"
import FormField from "./FormField"
import { Button } from "../button"
import { Form } from "../form"
import db from "@/lib/db"
import { adminTable } from "@/lib/db/schema"
import { sql } from "drizzle-orm"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toggleSuper } from "@/app/(dashboard)/_actions/operations.action"
import { useState } from "react"

export default function SwitchInput({ id, value }: { id: string | number | any, value: string | boolean }) {
    const form = useForm({
        defaultValues: {
            super: value
        }
    })

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onSubmit = async (data: any) => {
        if (data.super == undefined) {
            data.super = false
        }
        const superValue = data.super;
        const result = await toggleSuper(id, superValue)
        setIsDialogOpen(false)

        console.log(result)
    }

    const handleSwitchChange = (checked: boolean) => {
        form.setValue("super", checked);
        setIsDialogOpen(true);
    };

    return (
        <Form {...form}>
            <form >
                <FormField
                    form={form}
                    name="super"
                    switch="super"
                    onSwitchChange={handleSwitchChange}
                />
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button type="submit" onClick={form.handleSubmit(onSubmit)}
                                >Continue</Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </form>
        </Form>
    )
}