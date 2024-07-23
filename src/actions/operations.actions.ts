'use server'

import db from "@/lib/db";
import { adminTable, userTable } from "@/lib/db/schema";
import { uniqueColumnsValidations } from "@/actions/index.actions";
import { TbaseSchema, THours, UserRoles } from "@/types/index.types";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { adminRole, doctorRole, receptionistRole } from "@/actions/roles.actions";
import { string } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { TeditSchema, TpasswordSchema } from "@/types/dashboard.types";
import { generateRandomPassword } from "@/lib/funcs";
import { book } from "@/actions/appointment.actions";

export async function add(
  data: TbaseSchema,
  role: UserRoles = "user",
  withAppointment?: { doctorId: number, date: string, from: string, to: string },
  selectedDays?: string[],
  selectedHours?: THours,
) {
  const { username, firstname, lastname, phone, nationalId, age, gender, password, email } = data;
  const result = await uniqueColumnsValidations(data)
  if (result?.error) return { error: result?.error };

  let passwordHash;
  if (!withAppointment && password) {
    passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }

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
    password: passwordHash ? passwordHash : generateRandomPassword(),
    role: role,
  });

  if (withAppointment) {
    await book(userId, withAppointment.doctorId, withAppointment.date, withAppointment.from, withAppointment.to);
    revalidatePath('/dashboard/appointments');
    return {
      done: true
    };
  }

  // doctor stuff
  const doctor = await doctorRole(data, role, selectedDays, selectedHours, userId, 'add');
  if (doctor && doctor?.done) {
    revalidatePath('/dashboard/doctors');
    return {
      done: true
    };
  }

  // admin stuff
  const admin = await adminRole(data, role, userId, 'add');
  if (admin && admin?.done) {
    revalidatePath('/dashboard/admins');
    return {
      done: true
    };
  }

  // receptionist stuff
  const receptionist = await receptionistRole(data, role, userId, 'add');
  if (receptionist && receptionist?.done) {
    revalidatePath('/dashboard/receptionists');
    return {
      done: true
    };
  }

  revalidatePath('/dashboard/users');
  return {
    done: true,
  }
}


export async function edit(
  data: TeditSchema,
  role: UserRoles = "user",
  userId: string,
  operation: "add" | "edit",
  selectedDays?: string[],
  selectedHours?: THours,
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
  revalidatePath('/dashboard/doctors')
  if (doctor?.done) {
    return {
      role: role,
      done: true
    };
  }

  // admin
  const admin = await adminRole(data, role, userId, operation);
  revalidatePath('/dashboard/admins')
  if (admin?.done) {
    return {
      role: role,
      done: true
    };
  }

  // receptionist stuff
  const receptionist = await receptionistRole(data, role, userId, operation);
  if (receptionist && receptionist?.done) {
    revalidatePath('/dashboard/receptionists');
    return {
      done: true
    };
  }

  revalidatePath('/dashboard/users')
  return {
    role: role,
    done: true,
  }
}

export async function deleteUser(id: string | number) {

  const user = await db.delete(userTable).where(sql`${userTable.id} = ${id}`);

  if (user) {
    revalidatePath('/dashboard/doctors');
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
  const result = await db.update(adminTable).set({ super: superValue }).where(sql`${adminTable.userId} = ${id}`).returning();

  revalidatePath('/dashboard/admins')
  return result;
}