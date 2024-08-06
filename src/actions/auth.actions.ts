"use server";

import db from "@/lib/db";
import { lucia, validateRequest } from "@/lib/auth";
import { adminTable, appointmentTable, userTable } from "@/lib/db/schema";
import { TIndex, uniqueColumnsRegex } from "@/types/index.types";
import { TCheckSchema, TLoginSchema, TRegisterSchema } from "@/types/auth.types";
import { TbaseSchema } from "@/types/index.types";
import { uniqueColumnsValidations } from "@/actions/index.actions";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { uniqueColumns } from "@/constants";
import { format } from "date-fns";

export async function register(
  data: TRegisterSchema,
) {
  const { username, firstname, lastname, phone, nationalId, dob, gender, password, email } = data;

  const result = await uniqueColumnsValidations(data)

  if (result?.error) return { error: result?.error };

  // Convert dob to string format 'YYYY-MM-DD'
  const dobString = format(dob, 'yyyy-MM-dd');

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const userId = generateIdFromEntropySize(10);

  const user = await db.insert(userTable).values({
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
    role: 'user'
  }).returning();

  if (user[0]?.role == 'admin') {
    await db.insert(adminTable).values({
      userId: userId,
      super: true,
    })
  }

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect("/");
}

export async function login(data: TLoginSchema) {

  const { column, credential, password } = data;

  const existingUser = await db.query.userTable.findFirst({
    where: (userTable: { [key: string]: any }, funcs) => funcs.eq(userTable[column], credential),
  });

  if (existingUser) {
    const validPassword = await verify(existingUser.password, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return {
        error: 'Invalid Password'
      }
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/");
  } else {
    throw new Error('Invalid email or password');
  }
}

export async function logout() {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}

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