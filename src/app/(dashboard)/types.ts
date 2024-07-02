import { baseSchema } from "@/lib/types";
import { z } from "zod";

export const updateProfileSchema = z.object({
    id: z.string().optional(),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email"),
})

export type TupdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updatePersonalSchema = z.object({
    id: z.string().optional(),
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
    phone: z.string().min(1, "Phone Number is required"),
    nationalId: z.string().min(1, "National Id is required"),
    age: z.string().refine((e) => {
        const age = parseInt(e);
        return age >= 18;
    }, {
        message: "Age must be greater than or equal to 18",
    }),
    gender: z.enum(["male", "female"]),
})

export type TupdatePersonalSchema = z.infer<typeof updatePersonalSchema>;

export const updatePasswordSchema = z.object({
    id: z.string().optional(),
    password: z.string().min(3, "Password must be at least 3"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type TupdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export const updateWorkSchema = z.object({
    id: z.string(),
    doctorId: z.number(),
    specialty: z.string(),
})

export type TupdateWorkSchema = z.infer<typeof updateWorkSchema>;



export const addSchema = baseSchema.refine((data: { password: string, confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export type TaddSchema = z.infer<typeof addSchema>;