'use server'

import db from "@/lib/db";
import { adminTable, userTable } from "@/lib/db/schema";
import { uniqueColumnsValidations } from "@/actions/index.actions";
import { TbaseSchema, THour, UserRoles } from "@/types/index.types";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { adminRole, doctorRole, receptionistRole } from "@/actions/roles.actions";
import { string } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { TAddSchema, TEditSchema, TPasswordSchema } from "@/types/operations.types";
import { book } from "@/actions/appointment.actions";
import { format } from "date-fns";

export async function add({
  data,
  role,
  selectedDays,
  selectedHours,
}: {
  data: TAddSchema;
  role: UserRoles;
  selectedDays?: string[];
  selectedHours?: THour[];
}) {
  const { username, firstname, lastname, phone, nationalId, dob, gender, password, email } = data;
  const result = await uniqueColumnsValidations(data)
  if (result?.error) return { error: result?.error };

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const dobString = format(dob, 'yyyy-MM-dd');

  const userId = generateIdFromEntropySize(10);

  const [user] = await db.insert(userTable).values({
    id: userId,
    firstname,
    lastname,
    username,
    email,
    phone,
    nationalId,
    dob: dobString,
    gender,
    password: passwordHash,
    role: role,
  }).returning();

  // doctor stuff
  let doctor;
  if (role == 'doctor' && selectedDays && selectedHours) {
    doctor = await doctorRole({ data, selectedDays, selectedHours, userId: user.id, operation: 'add' });
    if (doctor && doctor?.success) {
      return {
        success: true
      };
    }
  }

  // admin stuff
  let admin;
  if (role == 'admin') {
    admin = await adminRole({ data, userId, operation: 'add' });
    if (admin && admin?.success) {
      return {
        success: true
      };
    }
  }

  // receptionist stuff
  let receptionist;
  if (role == 'receptionist') {
    receptionist = await receptionistRole({ data, userId, operation: 'add' });
    if (receptionist && receptionist?.success) {
      return {
        success: true
      };
    }
  }

  revalidatePath('/dashboard');
  return {
    data: {
      user: user,
      doctor,
      admin,
      receptionist
    },
    success: true,
  }
}


export async function edit({
  data,
  role,
  userId,
  operation,
  selectedDays,
  selectedHours
}: {
  data: TEditSchema;
  role: UserRoles;
  userId: string;
  operation: "add" | "edit";
  selectedDays?: string[];
  selectedHours?: THour[];
}) {
  const { username, firstname, lastname, phone, nationalId, dob, gender, email } = data;

  const dataToUpdate: Partial<Omit<TEditSchema, 'dob'> & { dob: string }> = {}

  if (username) dataToUpdate.username = username
  if (firstname) dataToUpdate.firstname = firstname
  if (lastname) dataToUpdate.lastname = lastname
  if (phone) dataToUpdate.phone = phone
  if (nationalId) dataToUpdate.nationalId = nationalId
  if (dob) dataToUpdate.dob = format(dob, 'yyyy-MM-dd')
  if (gender) dataToUpdate.gender = gender
  if (email) dataToUpdate.email = email

  const result = await uniqueColumnsValidations(dataToUpdate);
  if (result?.error) return { error: result?.error };

  if (Object.keys(dataToUpdate).length > 0) await db.update(userTable).set(dataToUpdate).where(sql`${userTable.id} = ${userId}`).returning();

  // doctor
  if (role == 'doctor' && selectedDays && selectedHours) {
    const doctor = await doctorRole({ data, selectedDays, selectedHours, userId, operation });
    if (doctor?.success) {
      return {
        role: role,
        success: true
      };
    }
  }


  // admin
  const admin = await adminRole({ data, userId, operation });
  if (admin?.success) {
    return {
      role: role,
      success: true
    };
  }

  // receptionist stuff
  const receptionist = await receptionistRole({ data, userId, operation });
  if (receptionist && receptionist?.success) {
    return {
      role: role,
      success: true
    };
  }

  revalidatePath('/dashboard')
  return {
    role: role,
    success: true,
  }
}

export async function editPassword(data: TPasswordSchema, userId: string | number) {
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
      success: true
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