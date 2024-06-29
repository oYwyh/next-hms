import { checkCredit } from "@/actions/auth/auth.action";
import { z } from "zod";

export const baseSchema = z.object({
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email(),
  phone: z.string(),
  nationalId: z.string(),
  age: z.string().refine((e) => {
    const age = parseInt(e);
    return age >= 18;
  }, 'Age must be greater than or equal to 18'),
  gender: z.enum(["male", "female"]),
  password: z.string().min(3, "Password must be at least 3 characters"),
  confirmPassword: z.string().min(3, "Password must be at least 3 characters"),
})

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
