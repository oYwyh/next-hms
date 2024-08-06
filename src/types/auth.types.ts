import { baseSchema, UniqueColumns } from "@/types/index.types";
import { z } from "zod";

export const registerSchema = baseSchema.extend({
  password: z.string().min(3, "Password must be at least 3 characters"),
  confirmPassword: z.string().min(3, "Password must be at least 3 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});;

export type TRegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  column: z.string(),
  credential: z.string(),
  password: z.string(),
});

export type TLoginSchema = z.infer<typeof loginSchema>;

export const checkSchema = z.object({
  credential: z.string(),
});

export type TCheckSchema = z.infer<typeof checkSchema>;


export type InsertedCredential = {
  column?: UniqueColumns;
  credential: string;
};