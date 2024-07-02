'use server'

import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { uniqueColumnsValidations } from "@/lib/funcs";
import { TbaseSchema } from "@/lib/types";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { doctorRole } from "./roles.action";

export async function add(
  data: TbaseSchema,
  selectedDays: string[] = [],
  selectedHours: { day: string; value: string }[] = [],
  role: "user" | "admin" | "doctor" = "user",
) {
  const { username, firstname, lastname, phone, nationalId, age, gender, password, email } = data;
  const result = await uniqueColumnsValidations(username, email, phone, nationalId)
  if (result?.error) return { error: result?.error };
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const userId = generateIdFromEntropySize(10);

  await db.insert(userTable).values({
    id: userId,
    firstname,
    lastname,
    username,
    email,
    phone,
    nationalId,
    age,
    gender,
    password: passwordHash,
    role: role,
  });

  const getUserRole = await db.query.userTable.findFirst({
    columns: { role: true },
    where: (userTable, funcs) => funcs.eq(userTable.id, userId),
  });
  const userRole = getUserRole?.role || undefined;

  // doctor stuff
  const doctor = await doctorRole(data, userRole, selectedDays, selectedHours, userId);

  if (doctor?.done) {
    return {
      done: true
    };
  }
}

z