'use server'

import db from "@/lib/db";
import { adminTable, userTable } from "@/lib/db/schema";
import { uniqueColumnsValidations } from "@/lib/funcs";
import { TbaseSchema, TdoctorSchema } from "@/lib/types";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { adminRole, doctorRole } from "./roles.action";
import { string } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { TeditSchema } from "../types";

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

  const { username, firstname, lastname, phone, nationalId, age, gender, password, email } = data;

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  await db.update(userTable).set({
    firstname: firstname,
    lastname: lastname,
    username: username,
    email: email,
    phone: phone,
    nationalId: nationalId,
    age: age,
    gender: gender,
    password: passwordHash
  }).where(sql`${userTable.id} = ${userId}`).returning();

  // doctor
  const doctor = await doctorRole(data, role, selectedDays, selectedHours, userId, operation);
  if (doctor?.done) {
    return {
      role: 'doctor',
      done: true
    };
  }

  // admin
  const admin = await adminRole(data, role, userId, operation);
  if (admin?.done) {
    return {
      role: 'admin',
      done: true
    };
  }

  revalidatePath('/admin/manage/users')
  return {
    role: 'user',
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

export async function toggleSuper(
  id: string | number,
  superValue: boolean
) {
  const result = await db.update(adminTable).set({ super: superValue }).where(sql`user_id = ${id}`).returning();

  revalidatePath('/admin/manage/admins')
  return result;
}



/*
  'use server'

import db from "@/lib/db";
import { adminTable, userTable } from "@/lib/db/schema";
import { uniqueColumnsValidations } from "@/lib/funcs";
import { TbaseSchema, TdoctorSchema } from "@/lib/types";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { adminRole, doctorRole } from "./roles.action";
import { string } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { TeditSchema } from "../types";

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
  fieldsToCompare?: string[]
) {
//   // Filter data to include only fields in fieldsToCompare that are defined
//   const filteredData = fieldsToCompare.reduce((obj, key) => {
//     if (data[key] !== undefined) {
//       obj[key] = data[key];
//     }
//     return obj;
// }, {});

  // // Check if filteredData is empty
  // if (Object.keys(filteredData).length === 0) {
  //   return { error: "No values to update" };
  // }

  // Perform validation
  const result = await uniqueColumnsValidations(filteredData);
  if (result?.error) return { error: result?.error };

  // Hash the password if it's included in the filtered data
    const passwordHash = await hash(filteredData.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    filteredData.password = passwordHash;
  }

  // Update the user data
  await db.update(userTable).set(filteredData).where(sql`${userTable.id} = ${userId}`).returning();

  // Handle role-specific updates
  if (role === 'doctor') {
    const doctor = await doctorRole(data, role, selectedDays, selectedHours, userId, operation);
    if (doctor?.done) {
      return {
        role: 'doctor',
        done: true
      };
    }
  }

  if (role === 'admin') {
    const admin = await adminRole(data, role, userId, operation);
    if (admin?.done) {
      return {
        role: 'admin',
        done: true
      };
    }
  }

  revalidatePath('/admin/manage/users');
  return {
    role: 'user',
    done: true,
  };
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

export async function toggleSuper(
  id: string | number,
  superValue: boolean
) {
  const result = await db.update(adminTable).set({ super: superValue }).where(sql`user_id = ${id}`).returning();

  revalidatePath('/admin/manage/admins')
  return result;
}
*/