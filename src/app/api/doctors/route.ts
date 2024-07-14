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
                .leftJoin(doctorTable, eq(doctorTable.user_id, userTable.id))
                .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
                .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
                .where(eq(userTable.role, 'doctor'));
        } else {
            doctorRecords = await db
                .select()
                .from(userTable)
                .leftJoin(doctorTable, eq(doctorTable.user_id, userTable.id))
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
            .leftJoin(doctorTable, eq(doctorTable.user_id, userTable.id))
            .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
            .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id))
            .where(and(
                eq(userTable.username, doctor),
                eq(userTable.role, 'doctor')
            ));
    }

    // Process the results to aggregate work_hours for each work_day
    const doctors = doctorRecords.reduce((acc, record) => {
        const userId = record.user.id;

        if (!acc[userId]) {
            acc[userId] = {
                user: record.user,
                doctor: record.doctor,
                work_days: []
            };
        }

        const workDayIndex = acc[userId].work_days.findIndex(day => day.id === record.work_days.id);
        if (workDayIndex === -1) {
            acc[userId].work_days.push({
                ...record.work_days,
                work_hours: [{ ...record.work_hours }]
            });
        } else {
            acc[userId].work_days[workDayIndex].work_hours.push({ ...record.work_hours });
        }

        return acc;
    }, {});

    // Convert the aggregated doctors object to an array
    const result = Object.values(doctors);

    console.log(result);


    return NextResponse.json(result);
}