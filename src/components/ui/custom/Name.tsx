import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChangeEvent, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "../form"
import FormField from "./FormField"

type TName = {
    handleClick: (data: TnameSchema) => void
    title: string
    name: string
}

const nameSchema = z.object({
    name: z.string().min(3, "Name must be at least 3").max(20, "Name must be at most 20"),
})

export type TnameSchema = z.infer<typeof nameSchema>

export default function Name({ handleClick, title, name }: TName) {
    const [open, setOpen] = useState<boolean>();

    const form = useForm<TnameSchema>({
        resolver: zodResolver(nameSchema),
    });

    const onSubmit = (data: TnameSchema) => {
        setOpen(false)
        handleClick(data)
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="capitalize">{title}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="capitalize">{name} Name</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-[100%]">
                        <FormField form={form} name="name" />
                        <DialogFooter className="pt-2">
                            <Button type="submit">Continue</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}