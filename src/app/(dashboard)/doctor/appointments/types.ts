import { z } from "zod";

export const diagnosisSchema = z.object({
    history: z.string().min(1, "History is required"),
    diagnosis: z.string().min(1, "Diagnosis is required"),
})

export type TdiagnosisSchema = z.infer<typeof diagnosisSchema>