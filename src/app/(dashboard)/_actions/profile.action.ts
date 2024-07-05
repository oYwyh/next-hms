'use server'

import db from "@/lib/db";
import { TpasswordSchema, TupdatePasswordSchema, TupdatePersonalSchema, TupdateProfileSchema } from "../types"
import { doctorTable, userTable, workDaysTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { error } from "console";
import { columnsRegex } from "@/app/auth/types";
import { uniqueColumnsValidations } from "@/lib/funcs";

export const updateProfile = async (data: TupdateProfileSchema) => {
    const { username, email, id } = data;

    if (!id) {
        throw new Error("User ID is required");
    }

    // Check if the email exists and belongs to a different user
    const emailExists = await db.query.userTable.findFirst({
        columns: {
            email: true,
        },
        where: (userTable, { eq, and, not }) => and(
            eq(userTable.email, email),
            not(eq(userTable.id, id))
        ),
    });

    if (emailExists) {
        return {
            exists: 'Email Exists',
        };
    }

    // Update the user with the new username and email
    const user = await db.update(userTable).set({
        username: username,
        email: email,
    })
        .where(eq(userTable.id, id));

    return {
        user: user,
    };
};

export const updatePersonal = async (data: TupdatePersonalSchema) => {
    const { id, firstname, lastname, phone, nationalId, age, gender } = data;

    // Check if the email exists and belongs to a different user
    const result = await uniqueColumnsValidations(data);
    if (result?.error) return { error: result?.error };

    // Update the user with the new username and email
    const user = await db.update(userTable).set({
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        nationalId: nationalId,
        age: age,
        gender: gender,
    }).where(sql`${userTable.id} = ${id}`);

    return {
        user: user,
    };
};


export const updatePassword = async (data: TpasswordSchema) => {
    const { id, password } = data;
    const passwordHash = await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });
    const result = await db.update(userTable).set({ password: passwordHash }).where(sql`${userTable.id} = ${id}`).returning();

    if (result) {
        return {
            done: true
        }
    } else {
        throw new Error('Failed to update password');
    }
}