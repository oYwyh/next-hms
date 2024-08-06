import { roles } from "@/constants";
import { z } from "zod";

export type AppointmentStatus = "pending" | "completed" | "canceled";
export type UniqueColumns = 'email' | 'phone' | 'nationalId' | 'username'
export type ReceptionistDepartments = "opd";
export type UserRoles = "admin" | "user" | "doctor" | 'receptionist';
export type Prescriptions = 'laboratory' | 'radiology' | 'medicine';
export type THour = { day: string; value: { from: string; to: string } };
export type TGenders = 'male' | 'female'
export type TTables = "admin" | "doctor" | "user" | "receptionist" | "appointment" | "prescription" | "review";
export type TIndex<T> = { [key: string]: T }

export type TUser = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  nationalId: string;
  dob: string;
  gender: TGenders;
  picture: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  doctor?: TDoctor;
  admin?: TAdmin;
  receptionist?: TReceptionist;
};

export type TDoctor = {
  id: number;
  specialty: string;
  userId: string;
};

export type TAdmin = {
  id: number;
  super: boolean;
  userId: string;
};

export type TReceptionist = {
  id: number;
  type: ReceptionistDepartments;
  userId: string;
};

export type TWorkDay = {
  id: number;
  doctorId: number;
  day: string;
};

export type TWorkHour = {
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

export const uniqueColumnsRegex: { [key: string]: RegExp } = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^01[0-2,5]{1}[0-9]{8}$/,
  nationalId: /^[2-3]{1}[0-9]{13}$/,
  username: /^[a-zA-Z0-9_-]{1,16}$/,
}


export const baseSchema = z.object({
  id: z.string().optional(),
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  username: z.string().min(1, "Username is required").refine(s => !s.includes(' '), 'No Spaces!'),
  email: z.string().email(),
  phone: z.string(),
  nationalId: z.string(),
  dob: z.date(),
  gender: z.enum(['male', 'female']),
  picture: z.string().optional(),
  role: z.enum(roles as [UserRoles]).optional(),
})

export type TbaseSchema = z.infer<typeof baseSchema>;

export const uniqueColumnsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone Number is required"),
  nationalId: z.string().min(1, "National Id is required"),
})

export type TUniqueColumnsSchema = Partial<z.infer<typeof uniqueColumnsSchema>>;