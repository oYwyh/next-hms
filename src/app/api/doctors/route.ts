import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { doctorTable, userTable, workDaysTable, workHoursTable } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

async function fetchDoctorRecords(doctor: string, specialty: string) {
    if (doctor === 'all') {
        return specialty === 'all'
            ? db.select()
                .from(userTable)
                .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))
                .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
                .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
                .where(eq(userTable.role, 'doctor'))
            : db.select()
                .from(userTable)
                .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))
                .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
                .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
                .where(and(eq(userTable.role, 'doctor'), eq(doctorTable.specialty, specialty)));
    } else {
        return db.select()
            .from(userTable)
            .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))
            .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
            .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
            .where(and(eq(userTable.username, doctor), eq(userTable.role, 'doctor')));
    }
}

async function processDoctorRecords(doctorRecords: any[]) {
    return doctorRecords.reduce((acc: any, record: any) => {
        const userId = record.user.id;
        if (!acc[userId]) {
            acc[userId] = {
                user: record.user,
                doctor: record.doctor,
                workDays: []
            };
        }
        const workDayIndex = acc[userId].workDays.findIndex((day: any) => day.id === record.workDays.id);
        if (workDayIndex === -1) {
            acc[userId].workDays.push({
                ...record.workDays,
                workHours: [{ ...record.workHours }]
            });
        } else {
            acc[userId].workDays[workDayIndex].workHours.push({ ...record.workHours });
        }
        return acc;
    }, {});
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const doctor = searchParams.get('doctor') || 'all';
        const specialty = searchParams.get('specialty') || 'all';

        const doctorRecords = await fetchDoctorRecords(doctor, specialty);
        const doctors = await processDoctorRecords(doctorRecords);

        return NextResponse.json(Object.values(doctors));
    } catch (error) {
        return NextResponse.error();
    }
}