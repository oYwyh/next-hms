import { checkCredit } from "@/actions/auth/auth.action";
import { baseSchema } from "@/lib/types";
import { z } from "zod";

export const signUpSchema = baseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});;

export type TsignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  column: z.string(),
  credit: z.string(),
  password: z.string(),
});

export type TsignInSchema = z.infer<typeof signInSchema>;

export const checkSchema = z.object({
  column: z.string().optional(),
  credit: z.string(),
});

export type TcheckSchema = z.infer<typeof checkSchema>;
