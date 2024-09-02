import { z } from "zod"

export const createSchema = z.object({
    service: z.string().min(1, "Service is required"),
    amount: z.string(),
    userId: z.string().optional(),
    doctorId: z.number().optional(),
    appointmentId: z.number().optional(),
    receptionistId: z.number().optional(),
    type: z.enum(["cash", "credit", 'electronic'])
})

export type TCreateSchema = z.infer<typeof createSchema>