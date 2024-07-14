'use server'

import db from "@/lib/db";
import { adminTable, userTable } from "@/lib/db/schema";
import { uniqueColumnsValidations } from "@/lib/funcs";
import { TbaseSchema } from "@/lib/types";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { adminRole, doctorRole } from "./roles.action";
import { string } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { TeditSchema, TpasswordSchema } from "../types";

export async function add(
  data: TbaseSchema,
  role: "user" | "admin" | "doctor" = "user",
  selectedDays?: string[],
  selectedHours?: { day: string; value: string }[],
) {
  const { username, firstname, lastname, phone, nationalId, age, gender, password, email } = data;
  const result = await uniqueColumnsValidations(data)
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

  // doctor stuff
  const doctor = await doctorRole(data, role, selectedDays, selectedHours, userId, 'add');
  if (doctor && doctor?.done) {
    return {
      role: 'doctor',
      done: true
    };
  }

  // admin stuff
  const admin = await adminRole(data, role, userId, 'add');
  if (admin && admin?.done) {
    return {
      role: 'admin',
      done: true
    };
  }

  revalidatePath('/admin/manage/users');
  return {
    role: 'user',
    done: true,
  }
}


export async function edit(
  data: TeditSchema,
  role: "user" | "admin" | "doctor" = "user",
  userId: string,
  operation: "add" | "edit",
  selectedDays?: string[],
  selectedHours?: { day: string; value: string }[],
) {
  const result = await uniqueColumnsValidations(data);
  if (result?.error) return { error: result?.error };

  const { username, firstname, lastname, phone, nationalId, age, gender, email } = data;

  if (username || firstname || lastname || phone || nationalId || age || gender || email) {
    await db.update(userTable).set({
      firstname: firstname,
      lastname: lastname,
      username: username,
      email: email,
      phone: phone,
      nationalId: nationalId,
      age: age,
      gender: gender,
    }).where(sql`${userTable.id} = ${userId}`).returning();
  }

  // doctor
  const doctor = await doctorRole(data, role, selectedDays, selectedHours, userId, operation);
  if (doctor?.done) {
    return {
      role: role,
      done: true
    };
  }

  // admin
  const admin = await adminRole(data, role, userId, operation);
  if (admin?.done) {
    return {
      role: role,
      done: true
    };
  }

  revalidatePath('/admin/manage/users')
  return {
    role: role,
    done: true,
  }
}

export async function deleteUser(id: string | number) {

  const user = await db.delete(userTable).where(sql`${userTable.id} = ${id}`);

  if (user) {
    revalidatePath('/admin/manage/doctors');
    return {
      done: true
    }
  }
}

export async function editPassword(data: TpasswordSchema, userId: string | number) {
  const { password } = data;
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const result = await db.update(userTable).set({ password: passwordHash }).where(sql`${userTable.id} = ${userId}`).returning();

  if (result) {
    return {
      done: true
    }
  } else {
    throw new Error('Failed to update password');
  }
}

export async function toggleSuper(
  id: string | number,
  superValue: boolean
) {
  const result = await db.update(adminTable).set({ super: superValue }).where(sql`user_id = ${id}`).returning();

  revalidatePath('/admin/manage/admins')
  return result;
}