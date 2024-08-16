'use server'

import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { appointmentTable, doctorTable, prescriptionTable, receiptTable, receptionistTable, reservationTable, userTable } from "@/lib/db/schema";
import { TdiagnosisSchema } from "@/types/dashboard.types";
import { TDepartments, TReceiptTypes, UserRoles } from "@/types/index.types";

export async function getReservationDetails(
    appointmentId: string | number | undefined,
    receiptExists: boolean = false
) {
    const appointment = await db.query.appointmentTable.findFirst({
        where: sql`${appointmentTable.id} = ${appointmentId}`
    })

    const user = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${appointment?.userId}`
    })

    const [doctorJoinedData] = await db.select().from(doctorTable)
        .where(sql`${doctorTable.id} = ${appointment?.doctorId}`)
        .leftJoin(userTable, sql`${doctorTable.userId} = ${userTable.id}`);

    if (!doctorJoinedData.user) throw new Error('Failed to get doctor details');

    const doctor = {
        id: doctorJoinedData.user.id as string,
        doctorId: doctorJoinedData.doctor.id as number,
        firstname: doctorJoinedData.user.firstname,
        lastname: doctorJoinedData.user.lastname,
        username: doctorJoinedData.user.username,
        email: doctorJoinedData.user.email,
        phone: doctorJoinedData.user.phone,
        nationalId: doctorJoinedData.user.nationalId,
        dob: doctorJoinedData.user.dob,
        gender: doctorJoinedData.user.gender,
        picture: doctorJoinedData.user.picture,
        role: doctorJoinedData.user.role as UserRoles,
        createdAt: doctorJoinedData.user.createdAt || new Date(),
        updatedAt: doctorJoinedData.user.updatedAt || new Date(),
        specialty: doctorJoinedData.doctor.specialty,
        fee: doctorJoinedData.doctor.fee
    }

    let receipt;
    let receptionist;
    if (receiptExists) {
        const [receiptJoinedData] = await db.select().from(receiptTable)
            .where(sql`${receiptTable.appointmentId} = ${appointmentId}`)
            .leftJoin(receptionistTable, sql`${receiptTable.receptionistId} = ${receptionistTable.id}`)
            .leftJoin(userTable, sql`${receptionistTable.userId} = ${userTable.id}`);

        if (!receiptJoinedData.user || !receiptJoinedData.receipt || !receiptJoinedData.receptionist) throw new Error('Failed to get receipt details');

        receipt = {
            id: receiptJoinedData.receipt.id as number,
            service: receiptJoinedData.receipt.service,
            amount: receiptJoinedData.receipt.amount,
            date: receiptJoinedData.receipt.date,
            type: receiptJoinedData.receipt.type as TReceiptTypes,
            userId: receiptJoinedData.receipt.userId,
            doctorId: receiptJoinedData.receipt.doctorId,
            appointmentId: receiptJoinedData.receipt.appointmentId,
            receptionistId: receiptJoinedData.receipt.receptionistId,
            createdAt: receiptJoinedData.receipt.createdAt || new Date(),
            updatedAt: receiptJoinedData.receipt.updatedAt || new Date()
        }

        receptionist = {
            id: receiptJoinedData.user.id as string,
            receptionistId: receiptJoinedData.receptionist.id as number,
            firstname: receiptJoinedData.user.firstname,
            lastname: receiptJoinedData.user.lastname,
            username: receiptJoinedData.user.username,
            email: receiptJoinedData.user.email,
            phone: receiptJoinedData.user.phone,
            nationalId: receiptJoinedData.user.nationalId,
            dob: receiptJoinedData.user.dob,
            gender: receiptJoinedData.user.gender,
            picture: receiptJoinedData.user.picture,
            role: receiptJoinedData.user.role as UserRoles,
            createdAt: receiptJoinedData.user.createdAt || new Date(),
            updatedAt: receiptJoinedData.user.updatedAt || new Date(),
            department: receiptJoinedData.receptionist.department as TDepartments
        }
    }


    if (!doctor || !user || !appointment) throw new Error('Failed to get appointment details');

    return {
        appointment,
        user,
        doctor,
        receipt,
        receptionist
    }
}