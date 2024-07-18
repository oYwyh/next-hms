import { z } from "zod";

export type AppointmentStatus = "pending" | "completed" | "canceled";
export type UserRoles = "admin" | "user" | "doctor";
export type Gender = "male" | "female";
export type Prescriptions = 'laboratory' | 'radiology' | 'medicine';

export type THours = { day: string; value: string }[];

export type TUser = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  nationalId: string;
  age: number;
  gender: string;
  picture: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TDoctor = TUser & {
  id: number;
  specialty: string;
  userId: string;
};

export type TAdmin = TUser & {
  id: number;
  super: boolean;
  userId: string;
};

export type TWorkDays = {
  id: number;
  doctorId: number;
  day: string;
};

export type TWorkHours = {
  id: number;
  workDayId: number;
  from: string;
  to: string;
};

export type TAppointment = {
  id: number;
  userId: string;
  doctorId: string;
  date: string;
  from: string;
  to: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type TReservation = {
  id: number;
  history: string;
  diagnosis: string;
  laboratory: string;
  radiology: string;
  medicine: string;
  appointmentId: number;
};

export type TPrescription = {
  id: number;
  laboratory: string;
  radiology: string;
  medicine: string;
  reservationId: number;
};

export type TReview = {
  id: number;
  appointmentId: number;
  doctorId: number;
  userId: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
};

export type TUserMedicalFolders = {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  files: TUserMedicalFiles[];
};

export type TUserMedicalFiles = {
  id: number;
  name: string;
  folderId: number;
  createdAt: string;
  updatedAt: string;
};

export type TSession = {
  id: string;
  userId: string;
  expiresAt: string;
};

export const baseSchema = z.object({
  id: z.string().optional(),
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  username: z.string().min(1, "Username is required").refine(s => !s.includes(' '), 'No Spaces!'),
  email: z.string().email(),
  phone: z.string(),
  nationalId: z.string(),
  age: z.string().refine((e) => {
    const age = parseInt(e);
    return age >= 18;
  }, 'Age must be greater than or equal to 18'),
  gender: z.enum(["male", "female"]),
  picture: z.string().optional(),
  role: z.enum(["admin", "user", "doctor"]).optional(),
  password: z.string().min(3, "Password must be at least 3 characters"),
  confirmPassword: z.string().min(3, "Password must be at least 3 characters"),
})

export type TbaseSchema = z.infer<typeof baseSchema>;