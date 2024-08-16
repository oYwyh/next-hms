import { appointmentTable, doctorTable, prescriptionTable, receiptTable, receptionistTable, reviewTable, userMedicalFilesTable, userTable } from "@/lib/db/schema";
import { CalendarOff, CheckCheck, Loader } from "lucide-react";

export const roles: string[] = ['admin', 'doctor', 'user', 'receptionist']
export const genders: string[] = ['male', 'female'] as const
export const uniqueColumns = ["email", "phone", "nationalId", "username"] as const

export const tablesMap = {
    user: userTable,
    admin: doctorTable,
    doctor: doctorTable,
    receptionist: receptionistTable,
    appointment: appointmentTable,
    review: reviewTable,
    prescription: prescriptionTable,
    userFiles: userMedicalFilesTable,
    receipt: receiptTable
};


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

export const departments = [
    { label: "OPD", value: "opd" },
    { label: "IPD", value: "ipd" },
]

export const imageTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/webp']
export const fileTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
]
export const videoTypes = ['video/mp4', 'video/webm']

export const laboratoriesList = [
    { value: "laboratory1", label: "Laboratory 1" },
    { value: "laboratory2", label: "Laboratory 2" },
    { value: "laboratory3", label: "Laboratory 3" },
    { value: "laboratory4", label: "Laboratory 4" },
    { value: "laboratory5", label: "Laboratory 5" },
    { value: "laboratory6", label: "Laboratory 6" },
    { value: "laboratory7", label: "Laboratory 7" },
]

export const radiologiesList = [
    { value: "radiology1", label: "Radiology 1" },
    { value: "radiology2", label: "Radiology 2" },
    { value: "radiology3", label: "Radiology 3" },
    { value: "radiology4", label: "Radiology 4" },
    { value: "radiology5", label: "Radiology 5" },
    { value: "radiology6", label: "Radiology 6" },
    { value: "radiology7", label: "Radiology 7" },
]

export const medicinesList = [
    { value: "medicine1", label: "Medicine 1" },
    { value: "medicine2", label: "Medicine 2" },
    { value: "medicine3", label: "Medicine 3" },
    { value: "medicine4", label: "Medicine 4" },
    { value: "medicine5", label: "Medicine 5" },
    { value: "medicine6", label: "Medicine 6" },
    { value: "medicine7", label: "Medicine 7" },
]
export const prescriptions = ['laboratory', 'radiology', 'medicine']

export const receiptTypes = [
    { label: "Cash", value: "cash" },
    { label: "Credit", value: "credit" },
    { label: "Electronic", value: "electronic" },
]