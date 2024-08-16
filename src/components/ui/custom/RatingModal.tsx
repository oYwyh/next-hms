'use client'

import { Rating } from 'react-simple-star-rating'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { useEffect, useState } from "react"
import { TUser } from '@/types/index.types'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/Form'
import FormField from '@/components/ui/custom/FormField'
import { Button } from '@/components/ui/Button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { postReview } from '@/actions/index.actions'

export default function RatingModal({ user, appointmentId, doctorId }: { user: TUser, appointmentId: number, doctorId: number }) {
    if (!user) throw new Error('User not found');
    if (user.role != 'user') return;

    const [rating, setRating] = useState(0)
    const [open, setOpen] = useState<boolean | undefined>(undefined)

    const ratingSchema = z.object({
        rating: z.number().min(0.5).max(5),
        review: z.string().min(1),
    })

    const form = useForm<z.infer<typeof ratingSchema>>({
        resolver: zodResolver(ratingSchema),
    })

    const onSubmit = async (data: any) => {
        const result = await postReview(data, user.id, appointmentId, doctorId)
        setOpen(false)
    }

    return (
        <Dialog defaultOpen={true}>
            <DialogContent className="w-fit h-fit">
                <DialogHeader>
                    <DialogTitle>Review the appointment</DialogTitle>
                    <DialogDescription>
                        This review will be added to the doctor profile page
                        BE HONEST
                    </DialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-2 pt-3'>
                            <FormField form={form} name="rating" rating={true} />
                            <FormField form={form} name="review" isTextarea={true} />
                            <Button>Submit</Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}