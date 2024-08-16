import { z } from "zod"

export const createSchema = z.object({
    service: z.string(),
    amount: z.string(),
    userId: z.string(),
    doctorId: z.number(),
    appointmentId: z.number(),
    receptionistId: z.number(),
    date: z.string().min(1, "Date is required"),
    type: z.enum(["cash", "credit", 'electronic'])
})

export type TCreateSchema = z.infer<typeof createSchema>