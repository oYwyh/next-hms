'use server'

import db from "@/lib/db";
import { TupdatePasswordSchema, TupdatePersonalSchema, TupdateProfileSchema, TupdateWorkSchema } from "../types"
import { doctorTable, userTable, workDaysTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { columnsRegex } from "@/lib/types";
import { error } from "console";

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
    const { id, firstname, lastname, phone, nationalId, age, gender  } = data;

    if (!id) {
        throw new Error("User ID is required");
    }

    // Check if the email exists and belongs to a different user
    const phoneExist = await db.query.userTable.findFirst({
        columns: { phone: true },
        where: (userTable, { eq, and, not }) => and(
            eq(userTable.phone, phone),
            not(eq(userTable.id, id))
        ),
    })

    if (phoneExist) {
        return {
            error: 'Phone Exists',
        };
    }

    if(columnsRegex.phone.test(phone) === false) {
        return {
            error: 'Invalid Phone'
        }
    }

    const nationalIdExist = await db.query.userTable.findFirst({
        columns: { nationalId: true },
        where: (userTable, { eq, and, not }) => and(
            eq(userTable.nationalId, nationalId),
            not(eq(userTable.id, id))
        ),
    })

    
    if (nationalIdExist) {
        return {
            error: 'National Id Exists',
        };
    }

    if(columnsRegex.nationalId.test(nationalId) === false) {
        return {
            error: 'Invalid National Id'
        }
    }

    // Update the user with the new username and email
    const user = await db.update(userTable).set({
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        nationalId: nationalId,
        age: age,
        gender: gender,
    })
    .where(eq(userTable.id, id));

    return {
        user: user,
    };
};


export const updatePassword = async (data: TupdatePasswordSchema) => {
    const { id, password } = data;

    const passwordHash = await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });

    if (!id) {
        throw new Error("User ID is required");
    }

    const user = await db.update(userTable).set({
        password: passwordHash
    })
    .where(eq(userTable.id, id))
}

export const updateWork = async (data: TupdateWorkSchema, selectedDays: string[]) => {
    const { id, doctorId } = data;

    if (!id || !doctorId) {
        throw new Error("User ID is required");
    }


    selectedDays.forEach(async (day) => {
        const dayTest = await db.insert(workDaysTable).values({
            doctorId: String(doctorId),
            day: day
        })

        console.log(dayTest)
    })

    // const result = await db.update(doctorTable).set({
    //     specialty: specialty
    // })
    // .where(eq(doctorTable.id, doctor?.id))

    // return {
    //     result,
    // }
}

