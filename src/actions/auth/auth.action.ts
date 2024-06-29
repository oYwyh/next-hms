"use server";

import { lucia, validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { adminTable, doctorTable, userTable, workDaysTable, workHoursTable } from "@/lib/db/schema";
import { TcheckSchema, TsignInSchema, TsignUpSchema } from "@/app/auth/types";
import { columnsRegex } from "@/lib/types";
import { uniqueColumnsValidations } from "@/lib/funcs";
import { hash, verify } from "@node-rs/argon2";
import { error } from "console";
import { generateIdFromEntropySize } from "lucia";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TaddSchema } from "@/app/(dashboard)/types";

type InsertedCredit = {
  column: 'email' | 'phone' | 'nationalId' | 'username' | string;
  credit: string;
};

export async function signup(data: any, selectedDays?: string[], selectedHours?: string[], role: ("user" | "admin" | "doctor") = "user") {

  const { username, firstname, lastname, phone, nationalId, age, gender, password, email } = data;

  const result = await uniqueColumnsValidations(username, email, phone, nationalId)  

  if(result?.error) return { error: result?.error };

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

  const isDoctor = await db.query.userTable.findFirst({
    columns: { role: true },
    where: (userTable, funcs) => funcs.eq(userTable.id, userId),
  });

  if (isDoctor?.role === "doctor") {
    const doctor = await db.insert(doctorTable).values({
      user_id: userId,
      specialty: "something",
    }).returning({ id: doctorTable.id });
  
    if (selectedDays !== undefined && selectedDays.length > 0 && selectedHours !== undefined && selectedHours.length > 0) {
      for (const day of selectedDays) {
        const workDay = await db.insert(workDaysTable).values({
          doctorId: String(doctor[0].id),
          day: day
        }).returning({ id: workDaysTable.id });
  
        for (const timeRange of selectedHours) {
          const [startAt, endAt] = timeRange.split('-');
          console.log(`Start: ${startAt}, End: ${endAt}`);
          await db.insert(workHoursTable).values({
            workDayId: String(workDay[0].id),
            startAt: startAt,
            endAt: endAt
          });
        }
      }
    }
    revalidatePath('/admin/manage/doctors');
    return {
      done: true,
    };
  }
  

  

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      
  return redirect("/");
}



export async function signin(data: TsignInSchema) {

  const { column, credit, password } = data;

  const existingUser = await db.query.userTable.findFirst({
    where: (userTable: {[key: string]: any}, funcs) => funcs.eq(userTable[column], credit),
  });

  if(existingUser) {
    const validPassword = await verify(existingUser.password, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if(!validPassword) {
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
  }else {
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

// export async function registerDoctorZod(data) {
//   const { firstname, lastname, email, phone, nationalId, age, gender } = data;
// }