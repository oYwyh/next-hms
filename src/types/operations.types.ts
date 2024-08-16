import { baseSchema } from "@/types/index.types";
import { z } from "zod";

export const editSchema = baseSchema.extend({
    specialty: z.string().optional(),
    fee: z.string().or(z.number()).optional(),
    days: z.array(z.string()).optional(),
    department: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role == 'doctor') {
        if (!data.specialty) {
            ctx.addIssue({
                code: "custom",
                message: "Specialty is required",
                path: ["specialty"],
            })
        }
        if (!data.fee) {
            ctx.addIssue({
                code: "custom",
                message: "Fee is required",
                path: ["fee"],
            })
        }
        if (isNaN(Number(data.fee))) {
            ctx.addIssue({
                code: "custom",
                message: "Fee must be a number",
                path: ["fee"],
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

export type TEditSchema = z.infer<typeof editSchema>;

export const addSchema = baseSchema.extend({
    fee: z.string().or(z.number()).optional(),
    specialty: z.string().optional(),
    days: z.array(z.string()).optional(),
    department: z.string().optional(),
    password: z.string().min(3, "Password must be at least 3"),
    confirmPassword: z.string().min(3, "Password must be at least 3"),
}).refine(data => data.password === data.confirmPassword, {
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
        if (!data.fee) {
            ctx.addIssue({
                code: "custom",
                message: "Fee is required",
                path: ["fee"],
            })
        }
        if (isNaN(Number(data.fee))) {
            ctx.addIssue({
                code: "custom",
                message: "Fee must be a number",
                path: ["fee"],
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

export type TAddSchema = z.infer<typeof addSchema>;

export const passwordSchema = z.object({
    password: z.string().min(3, "Password must be at least 3"),
    confirmPassword: z.string(),
}).refine((data: { password: string, confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export type TPasswordSchema = z.infer<typeof passwordSchema>;
