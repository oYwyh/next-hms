import { baseSchema } from "@/types/index.types";
import { z } from "zod";

export const diagnosisSchema = z.object({
    history: z.string().min(1, "History is required"),
    diagnosis: z.string().min(1, "Diagnosis is required"),
})

export type TdiagnosisSchema = z.infer<typeof diagnosisSchema>

export const updateProfileSchema = z.object({
    id: z.string().optional(),
    username: z.string().min(1, "Username is required").refine(s => !s.includes(' '), 'No Spaces!'),
    email: z.string().email("Invalid email"),
})

export type TupdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updatePersonalSchema = baseSchema.omit({ username: true, email: true, password: true, confirmPassword: true });

export type TupdatePersonalSchema = z.infer<typeof updatePersonalSchema>;

export const editSchema = baseSchema.omit({ password: true, confirmPassword: true }).extend({
    specialty: z.string().optional(),
    department: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'doctor' && !data.specialty) {
        ctx.addIssue({
            code: "custom",
            message: "Specialty is required",
            path: ["specialty"],
        });
    }
}).superRefine((data, ctx) => {
    if (data.role == 'receptionist') {
        if (!data.department) {
            ctx.addIssue({
                code: "custom",
                message: "Receptionist Department is required",
                path: ["department"],
            })
        }
    }
})


export type TeditSchema = { [key: string]: string } & z.infer<typeof editSchema>;

export const addSchema = baseSchema.extend({
    specialty: z.string().optional(),
    department: z.string().optional(),
}).refine((data: { password: string, confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).superRefine((data, ctx) => {
    if (data.role == 'doctor') {
        if (!data.specialty) {
            ctx.addIssue({
                code: "custom",
                message: "Specialty is required",
                path: ["specialty"],
            })
        }
    }
}).superRefine((data, ctx) => {
    if (data.role == 'receptionist') {
        if (!data.department) {
            ctx.addIssue({
                code: "custom",
                message: "Receptionist Department is required",
                path: ["department"],
            })
        }
    }
})

export type TaddSchema = { [key: string]: string } & z.infer<typeof addSchema>;

export const passwordSchema = z.object({
    id: z.string().optional(),
    password: z.string().min(3, "Password must be at least 3"),
    confirmPassword: z.string(),
}).refine((data: { password: string, confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export type TpasswordSchema = z.infer<typeof passwordSchema>;

export const uniqueColumnsSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone Number is required"),
    nationalId: z.string().min(1, "National Id is required"),
}).partial()

export type TuniqueColumnsSchema = z.infer<typeof uniqueColumnsSchema>;