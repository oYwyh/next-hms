import { baseSchema } from "@/types/index.types";
import { z } from "zod";

export const updateProfileSchema = z.object({
    id: z.string().optional(),
    username: z.string().min(1, "Username is required").refine(s => !s.includes(' '), 'No Spaces!'),
    email: z.string().email("Invalid email"),
})

export type TupdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updatePersonalSchema = baseSchema.omit({ id: true, username: true, email: true, password: true, confirmPassword: true });

export type TupdatePersonalSchema = z.infer<typeof updatePersonalSchema>;