import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { doctorTable, userTable } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: Request, { params: { specialty } }: { params: { specialty: string } }) {

    const whereCondition = specialty === 'all'
        ? sql`${userTable.role} = 'doctor'`
        : sql`${userTable.role} = 'doctor' AND ${doctorTable.specialty} = ${specialty}`;

    const doctorsList = await db.select()
        .from(userTable)
        .leftJoin(doctorTable, eq(doctorTable.user_id, userTable.id))
        .where(whereCondition);

    const fullNames = doctorsList.map(doctor => ({
        label: `${doctor.user.firstname} ${doctor.user.lastname}`,
        value: `${doctor.user.username}`
    }));

    fullNames.unshift({ label: 'All specialty', value: 'all' });

    return NextResponse.json(fullNames);
}