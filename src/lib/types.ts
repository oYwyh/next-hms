import { z } from "zod";
// auth

export type User = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  nationalId: string;
  age: string;
  gender: 'male' | 'female';
  role: "admin" | "user" | "doctor";
};

export type DoctorUser = User & {
  doctor: {
    id: number;
    specialty: string;
    user_id: string;
  };
};

export type AdminUser = User & {
  admin: {
    id: string;
    super: boolean;
    user_id: string;
  };
};

export const daysList = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thrusday", label: "Thrusday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export const baseSchema = z.object({
  id: z.string().optional(),
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
  role: z.enum(["admin", "user", "doctor"]).optional(),
  password: z.string().min(3, "Password must be at least 3 characters"),
  confirmPassword: z.string().min(3, "Password must be at least 3 characters"),
})

export type TbaseSchema = z.infer<typeof baseSchema>;