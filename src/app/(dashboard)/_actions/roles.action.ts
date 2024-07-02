import db from "@/lib/db";
import { doctorTable, userTable, workDaysTable, workHoursTable } from "@/lib/db/schema";
import { TbaseSchema } from "@/lib/types";
import { hash } from "@node-rs/argon2";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function doctorRole(
  data: TbaseSchema,
  userRole: ("user" | "admin" | "doctor") = "user",
  selectedDays: string[],
  selectedHours: { day: string; value: string }[],
  userId: string,
  operation?: "add" | "edit",
) {
  if (userRole === "doctor") {
    const { username, firstname, lastname, phone, nationalId, age, gender, password, email } = data;

    if (!selectedDays || !selectedHours) {
      throw new Error("Please select days and hours");
    }

    const groupedHours = selectedHours.reduce((acc, hour) => {
      if (!acc[hour.day]) {
        acc[hour.day] = [];
      }
      acc[hour.day].push(hour.value);
      return acc;
    }, {} as Record<string, string[]>);

    if (operation == 'add' && userId) {
      const doctor = await db.insert(doctorTable).values({
        user_id: userId,
        specialty: "something",
      }).returning({ id: doctorTable.id });

      for (const day of selectedDays) {
        const workDay = await db.insert(workDaysTable).values({
          doctorId: Number(doctor[0].id),
          day: day
        }).returning({ id: workDaysTable.id, day: workDaysTable.day });

        if (groupedHours[day]) {
          for (const timeRange of groupedHours[day]) {
            const [startAt, endAt] = timeRange.split('-').map(time => time.trim());
            console.log(`Start: ${startAt}, End: ${endAt}`);
            await db.insert(workHoursTable).values({
              workDayId: Number(workDay[0].id),
              startAt: startAt,
              endAt: endAt
            });
          }
        }
      }
    } else if (operation == 'edit' && userId) {
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

      const doctor = await db.update(doctorTable).set({
        specialty: 'something2'
      }).where(sql`${doctorTable.user_id} = ${userId}`).returning();

      for (const day of selectedDays) {
        const workDay = await db.update(workDaysTable).set({
          doctorId: Number(doctor[0].id),
          day: day
        }).where(sql`${workDaysTable.doctorId} = ${doctor[0].id}`).returning({ id: workDaysTable.id, day: workDaysTable.day });

        if (groupedHours[day]) {
          for (const timeRange of groupedHours[day]) {
            const [startAt, endAt] = timeRange.split('-').map(time => time.trim());
            console.log(`Start: ${startAt}, End: ${endAt}`);
            await db.update(workHoursTable).set({
              workDayId: Number(workDay[0].id),
              startAt: startAt,
              endAt: endAt
            }).where(sql`${workHoursTable.workDayId} = ${workDay[0].id}`).returning();
          }
        }
      }
    }

    revalidatePath('/admin/manage/doctors');
    return {
      done: true,
    };
  }
  return;
}