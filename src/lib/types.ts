import { z } from "zod";
// auth

export const daysList = [
  { value: "sunday", label: "Sunday"},
  { value: "monday", label: "Monday"},
  { value: "tuesday", label: "Tuesday"},
  { value: "wednesday", label: "Wednesday"},
  { value: "thrusday", label: "Thrusday"},
  { value: "friday", label: "Friday"},
  { value: "saturday", label: "Saturday"},
];

export const hoursList: Array<{value: string; label: string}> = [];

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

