
import { CalendarOff, CheckCheck, Loader } from "lucide-react";

export const roles: string[] = ['admin', 'doctor', 'user', 'receptionist']
export const genders: string[] = ['male', 'female'] as const
export const uniqueColumns = ["email", "phone", "nationalId", "username"] as const

export const statuses = [
    {
        value: "pending",
        label: "Pending",
        icon: Loader,
    },
    {
        value: "completed",
        label: "Completed",
        icon: CheckCheck,
    },
    {
        value: "canceled",
        label: "Canceled",
        icon: CalendarOff,
    },
]

export const daysList = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thrusday", label: "Thrusday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
];



export const statusOpt = [
    { label: "pending", color: "gold" },
    { label: "completed", color: "lightgreen" },
    { label: "cancelled", color: "red" },
]

export const specialties = [
    { label: "General Surgery", value: "general_surgery" },
    { label: "Podo", value: "podo" },
    { label: "Orthopedics", value: "orthopedics" },
]

export const receptionistDepartments = [
    { label: "OPD", value: "opd" },
]