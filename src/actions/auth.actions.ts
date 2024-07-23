"use server";

import db from "@/lib/db";
import { lucia, validateRequest } from "@/lib/auth";
import { adminTable, appointmentTable, userTable } from "@/lib/db/schema";
import { columnsRegex, TcheckSchema, TloginSchema, TregisterSchema } from "@/types/auth.types";
import { TbaseSchema } from "@/types/index.types";
import { uniqueColumnsValidations } from "@/actions/index.actions";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";

export async function register(
  data: TregisterSchema,
) {
  const { username, firstname, lastname, phone, nationalId, age, gender, password, email } = data;

  const result = await uniqueColumnsValidations(data)

  if (result?.error) return { error: result?.error };

  if (password) {
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }

  const userId = generateIdFromEntropySize(10);

  const user = await db.insert(userTable).values({
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
    // role: 'admin'
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

export async function login(data: TloginSchema) {

  const { column, credit, password } = data;

  const existingUser = await db.query.userTable.findFirst({
    where: (userTable: { [key: string]: any }, funcs) => funcs.eq(userTable[column], credit),
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

export async function checkCredit(data: TcheckSchema) {

  const { credit } = data;

  const columns = ['email', 'phone', 'nationalId', 'username'] as const;

  const creditExist = await db.query.userTable.findFirst({
    columns: {
      username: true,
      email: true,
      phone: true,
      nationalId: true,
    },

    where: (userTable, { eq, or }) =>
      or(
        ...columns.map(column => eq(userTable[column], credit))
      ),
  });

  if (creditExist) {
    const matchedColumn = columns.find(column => creditExist[column] === credit);
    return {
      column: matchedColumn,
      exist: true,
    };
  } else if (!creditExist) {
    const isUsername = columnsRegex.username.test(credit);
    const isEmail = columnsRegex.email.test(credit);
    const isPhoneNumber = columnsRegex.phone.test(credit);
    const isNationalId = columnsRegex.nationalId.test(credit); // Egyptian national ID regex

    if (isEmail) {
      return {
        column: 'email',
        exist: false,
      };
    } else if (isPhoneNumber) {
      return {
        column: 'phone',
        exist: false,
      };
    } else if (isNationalId) {
      return {
        column: 'nationalId',
        exist: false,
      };
    } else if (isUsername) {
      return {
        column: 'username',
        exist: false,
      };
    } else {
      return {
        column: 'unknown',
        exist: false,
      };
    }
  }

}