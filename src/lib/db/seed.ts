'use server'

import db from "@/lib/db"
import { adminTable, appointmentTable, doctorTable, receptionistTable, userTable, workDaysTable, workHoursTable } from "@/lib/db/schema";
import { AppointmentStatus, TDepartments } from "@/types/index.types";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";

function hashPwd(password: string) {
    return hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });
}

export async function seed() {
    const adminId = generateIdFromEntropySize(10)
    const userId = generateIdFromEntropySize(10)
    const doctorId = generateIdFromEntropySize(10)
    const receptionistId = generateIdFromEntropySize(10)

    const users = [
        {
            id: adminId,
            firstname: "admin",
            lastname: "admin",
            username: "admin",
            email: "admin@gmail.com",
            phone: '01024824716',
            nationalId: "3080120110011",
            dob: '2008-08-07',
            gender: 'male',
            password: await hashPwd("admin"),
            role: "admin",
        },
        {
            id: userId,
            firstname: "user",
            lastname: "user",
            username: "user",
            email: "user@gmail.com",
            phone: '01024824717',
            nationalId: "3080120110012",
            password: await hashPwd("user"),
            dob: '2008-08-07',
            gender: 'male',
            role: "user",
        },
        {
            id: doctorId,
            firstname: "doctor",
            lastname: "doctor",
            username: "doctor",
            email: "doctor@gmail.com",
            phone: '01024824718',
            nationalId: "3080120110013",
            password: await hashPwd("doctor"),
            dob: '2008-08-07',
            gender: 'male',
            role: "doctor",
        },
        {
            id: receptionistId,
            firstname: "receptionist",
            lastname: "receptionist",
            username: "receptionist",
            email: "receptionist@gmail.com",
            phone: '01024824719',
            nationalId: "3080120110014",
            password: await hashPwd("receptionist"),
            dob: '2008-08-07',
            gender: 'male',
            role: "receptionist",
        },
    ]

    const admins = [
        {
            id: 1,
            super: true,
            userId: adminId
        }
    ]

    const doctors = [
        {
            id: 1,
            specialty: "general_surgery",
            fee: '500',
            userId: doctorId
        }
    ]

    const receptionists = [
        {
            id: 1,
            department: "opd" as TDepartments,
            userId: receptionistId
        }
    ]

    const appointments = [
        {
            date: "2025-01-01",
            from: "10:00",
            to: "11:00",
            status: "pending" as AppointmentStatus,
            doctorId: 1,
            userId: userId
        },
        {
            date: "2025-01-02",
            from: "02:00",
            to: "06:00",
            status: "pending" as AppointmentStatus,
            doctorId: 1,
            userId: userId
        }
    ]

    const workDays = [
        {
            id: 1,
            day: 'monday',
            doctorId: 1
        },
        {
            id: 2,
            day: 'tuesday',
            doctorId: 1
        }
    ]

    const workHours = [
        {
            from: '10:00',
            to: '11:00',
            workDayId: 1
        },
        {
            from: '02:00',
            to: '06:00',
            workDayId: 2
        }
    ]

    for (const user of users) {
        await db.insert(userTable).values(user)
    }

    for (const admin of admins) {
        await db.insert(adminTable).values(admin)
    }

    for (const doctor of doctors) {
        await db.insert(doctorTable).values(doctor)
    }

    for (const receptionist of receptionists) {
        await db.insert(receptionistTable).values(receptionist)
    }

    for (const appointment of appointments) {
        await db.insert(appointmentTable).values(appointment)
    }

    for (const workDay of workDays) {
        await db.insert(workDaysTable).values(workDay)
    }

    for (const workHour of workHours) {
        await db.insert(workHoursTable).values(workHour)
    }

}

export async function destroyDb() {
    await db.delete(userTable).execute();
    await db.delete(adminTable).execute();
    await db.delete(doctorTable).execute();
    await db.delete(receptionistTable).execute();
    await db.delete(appointmentTable).execute();
    await db.delete(workDaysTable).execute();
    await db.delete(workHoursTable).execute();
}