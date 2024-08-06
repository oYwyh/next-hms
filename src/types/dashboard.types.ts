import { baseSchema } from "@/types/index.types";
import { z } from "zod";

export const diagnosisSchema = z.object({
    history: z.string().min(1, "History is required"),
    diagnosis: z.string().min(1, "Diagnosis is required"),
})

export type TdiagnosisSchema = z.infer<typeof diagnosisSchema>

export const passwordSchema = z.object({
    password: z.string().min(3, "Password must be at least 3"),
    confirmPassword: z.string(),
}).refine((data: { password: string, confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export type TpasswordSchema = z.infer<typeof passwordSchema>;
