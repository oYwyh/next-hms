import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { doctorTable, userTable, workDaysTable, workHoursTable } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const doctor = searchParams.get('doctor') || 'all';
    const specialty = searchParams.get('specialty') || 'all';

    let doctorRecords;
    if (doctor === 'all') {
        if (specialty === 'all') {
            doctorRecords = await db
                .select()
                .from(userTable)
                .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))
                .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
                .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
                .where(eq(userTable.role, 'doctor'));
        } else {
            doctorRecords = await db
                .select()
                .from(userTable)
                .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))
                .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
                .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
                .where(and(
                    eq(userTable.role, 'doctor'),
                    eq(doctorTable.specialty, specialty)
                ));
        }
    } else {
        doctorRecords = await db
            .select()
            .from(userTable)
            .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))
            .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
            .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
            .where(and(
                eq(userTable.username, doctor),
                eq(userTable.role, 'doctor')
            ));
    }

    // Process the results to aggregate workHours for each work_day
    const doctors = doctorRecords.reduce((acc: any, record: any) => {
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

    // Convert the aggregated doctors object to an array
    const result = Object.values(doctors);

    console.log(result);

    return NextResponse.json(result);
}