'use server'

import db from "@/lib/db/index";
import { TuniqueColumnsSchema } from "@/app/(dashboard)/types";
import { columnsRegex } from "@/app/auth/types";
import { reviewTable } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export const uniqueColumnsValidations = async (data: TuniqueColumnsSchema) => {
    console.log(`data`)
    console.log(data)
    const columns = [
        data.username && { column: 'username', value: data?.username, regex: columnsRegex.username },
        data.email && { column: 'email', value: data?.email, regex: columnsRegex.email },
        data.phone && { column: 'phone', value: data?.phone, regex: columnsRegex.phone },
        data.nationalId && { column: 'nationalId', value: data?.nationalId, regex: columnsRegex.nationalId }
    ].filter(Boolean) as { column: string; value: string; regex: RegExp; }[];

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
}

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