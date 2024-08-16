'user server'

import { book } from "@/actions/appointment.actions";
import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { generatePassword } from "@/lib/funcs";
import { TAddUserSchema } from "@/types/receptionist.types";
import { hash } from "@node-rs/argon2";
import { format } from "date-fns";
import { generateIdFromEntropySize } from "lucia";

export async function addUser(data: TAddUserSchema) {
    const userId = generateIdFromEntropySize(10);

    const password = generatePassword();
    const passwordHash = await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    })

    const dobString = format(data.dob, 'yyyy-MM-dd');

    const user = db.insert(userTable).values({
        id: userId,
        firstname: data.firstname,
        lastname: data.lastname,
        username: data.username,
        email: data.email,
        phone: data.phone,
        nationalId: data.nationalId,
        dob: dobString,
        gender: data.gender,
        password: passwordHash,
        role: 'user',
    }).returning();
}