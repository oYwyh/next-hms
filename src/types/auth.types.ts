import { baseSchema } from "@/types/index.types";
import { z } from "zod";

export const registerSchema = baseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});;

export type TregisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  column: z.string(),
  credit: z.string(),
  password: z.string(),
});

export type TloginSchema = z.infer<typeof loginSchema>;

export const checkSchema = z.object({
  column: z.string().optional(),
  credit: z.string(),
});

export type TcheckSchema = z.infer<typeof checkSchema>;

export const columnsRegex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^01[0-2,5]{1}[0-9]{8}$/,
  nationalId: /^[2-3]{1}[0-9]{13}$/,
  username: /^[a-zA-Z0-9_-]{1,16}$/,
}

export type InsertedCredit = {
  column?: 'email' | 'phone' | 'nationalId' | 'username' | string;
  credit: string;
};