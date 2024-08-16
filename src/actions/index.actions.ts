'use server'

import db from "@/lib/db/index";
import { InsertedCredential, TIndex, TUniqueColumnsSchema, TUser } from "@/types/index.types";
import { uniqueColumnsRegex } from "@/types/index.types";
import { adminTable, appointmentTable, doctorTable, prescriptionTable, receptionistTable, reviewTable, userTable } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq, or, sql } from "drizzle-orm";
import { userMedicalFilesTable } from '@/lib/db/schema';
import { tablesMap, uniqueColumns } from "@/constants";
import { TCheckSchema } from "@/types/index.types";

export async function checkCredit(data: TCheckSchema) {
    const { credential } = data;

    const columns = uniqueColumns

    // Define the type for columnsObject
    type ColumnsObject = {
        [key in typeof columns[number]]: true;
    };

    // Dynamically create the columns object
    const columnsObject = columns.reduce((acc, column) => {
        acc[column] = true;
        return acc;
    }, {} as ColumnsObject);


    const creditExists = await db.query.userTable.findFirst({
        columns: columnsObject,

        where: (userTable, { eq, or }) =>
            or(
                ...columns.map(column => eq(userTable[column], credential))
            ),
    });

    if (creditExists) {
        const matchedColumn = columns.find(column => creditExists[column] === credential);
        return {
            column: matchedColumn,
            exists: true,
        };
    } else if (!creditExists) {
        // Dynamically check the credit against each regex
        for (const column in uniqueColumnsRegex) {
            if (uniqueColumnsRegex[column].test(credential)) {
                return {
                    column,
                    exists: false,
                };
            }
        }

        return {
            column: 'unknown',
            exists: false,
        };
    }
}

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

import { AnyPgTable } from 'drizzle-orm/pg-core'; // Import the base type for your tables

// Function to get an object by a specified field with another field for comparison, with multiple joins capability
export const getByField = async ({
    value,
    tableName,
    fieldToMatch = 'id',
}: {
    value: string | number,
    tableName: keyof typeof tablesMap,
    fieldToMatch: string, // Field to match with the provided value
}) => {
    // Get the main table from the tablesMap
    const table = tablesMap[tableName];

    if (!table) {
        throw new Error(`Table ${tableName} does not exist in tablesMap.`);
    }

    // Get the columns to match the value against
    const fieldToMatchColumn = (table as { [key: string]: any })[fieldToMatch];

    if (!fieldToMatchColumn) {
        throw new Error(`Field ${fieldToMatch} does not exist in table ${tableName}.`);
    }

    // Start building the query
    let result = db
        .select()
        .from(table)
        .where(eq(fieldToMatchColumn, value))

    // Return the first result, or null if not found
    return result || null;
};



/*

// Function to get an object by a specified field with another field for comparison, with multiple joins capability
export const getByField = async ({
    value,
    tableName,
    fieldToMatch = 'id',
    joins = [],
}: {
    value: string | number,
    tableName: keyof typeof tablesMap,
    fieldToMatch: string, // Field to match with the provided value
    joins?: Array<{
        joinTableName: keyof typeof tablesMap; // Table to join with
        joinCondition: (mainTable: any, joinTable: any) => any; // Join condition as a function
    }> // Optional: Array of join details
}) => {
    // Get the main table from the tablesMap
    const table = tablesMap[tableName];

    if (!table) {
        throw new Error(`Table does not exist in tablesMap.`);
    }

    // Get the columns to match the value against
    const fieldToMatchColumn = (table as { [key: string]: any })[fieldToMatch];

    if (!fieldToMatchColumn) {
        throw new Error(`Field ${fieldToMatch} does not exist in table ${tableName}.`);
    }

    // Start building the query
    let query = db
        .select()
        .from(table)
        .where(eq(fieldToMatchColumn, value))

    // If joins are provided, apply each join
    if (joins && joins.length > 0) {
        joins.forEach(join => {
            const joinTable = tablesMap[join.joinTableName];
            if (!joinTable) {
                throw new Error(`Join table ${join.joinTableName} does not exist in tablesMap.`);
            }
            query = query.innerJoin(joinTable, join.joinCondition(table, joinTable));
        });
    }

    // Execute the query
    const [result] = await query.execute();

    // Return the first result, or null if not found
    return result || null;
};
*/