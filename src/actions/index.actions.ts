'use server'

import db from "@/lib/db/index";
import { TUniqueColumnsSchema } from "@/types/index.types";
import { uniqueColumnsRegex } from "@/types/index.types";
import { adminTable, appointmentTable, doctorTable, prescriptionTable, receptionistTable, reviewTable, userTable } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { and, sql } from "drizzle-orm";
import { userMedicalFilesTable } from '@/lib/db/schema';

export const uniqueColumnsValidations = async (data: Partial<TUniqueColumnsSchema>) => {
    const columns = Object.keys(uniqueColumnsRegex)
        .filter(column => data[column as keyof TUniqueColumnsSchema]) // Ensure proper type assertion here
        .map(column => ({
            column,
            value: data[column as keyof TUniqueColumnsSchema] as string, // Cast value to string
            regex: uniqueColumnsRegex[column]
        }));

    const errors: Record<string, string> = {};

    for (const { column, value, regex } of columns) {
        const exist = await db.query.userTable.findFirst({
            columns: { [column]: true },
            where: (userTable: { [key: string]: any }, { eq }) => eq(userTable[column], value),
        });

        if (exist) {
            errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} already exists`;
        }
        if (!regex.test(value)) {
            errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} is invalid`;
        }
    }

    if (Object.keys(errors).length > 0) {
        return { error: errors };
    }

    return null; // If there are no errors
};



export async function postReview(
    data: any,
    userId: string,
    appointmentId: number,
    doctorId: number
) {
    const review = await db.insert(reviewTable).values({
        userId: userId,
        appointmentId: Number(appointmentId),
        doctorId: doctorId,
        rating: data.rating,
        review: data.review
    })

    revalidatePath('/appointments')

    return review
}

export async function revalidatePathAction(path: string) {
    if (!path) throw new Error('Invalid path')
    return revalidatePath(path)
}


export async function checkPdfOwner(name: string, userId: string) {
    const pdf = await db.query.userMedicalFilesTable.findFirst({
        where: (userMedicalFilesTable: { [key: string]: any }, { eq }) => and(
            eq(userMedicalFilesTable.name, name),
            eq(userMedicalFilesTable.userId, userId)
        ),
    });

    return pdf
}


export async function getUserId() {
    const user = await db.query.userTable.findFirst()
    return user?.id
}

const tablesMap = {
    user: userTable,
    admin: userTable,
    doctor: userTable,
    receptionist: userTable,
    appointment: appointmentTable,
    review: reviewTable,
    prescription: prescriptionTable,
};

export async function deleteAction(id: string | number, table: keyof typeof tablesMap) {
    const tableDefinition = tablesMap[table];

    if (!tableDefinition) {
        throw new Error("Invalid table name");
    }

    const user = await db.delete(tableDefinition).where(sql`${tableDefinition.id} = ${id}`);

    if (user) {
        revalidatePath('/dashboard')
    } else {
        throw new Error("Deletion failed");
    }
}