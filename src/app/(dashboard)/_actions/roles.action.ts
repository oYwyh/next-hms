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
  differentFields?: string[]
) {
  if (userRole === "doctor") {
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
            await db.insert(workHoursTable).values({
              workDayId: Number(workDay[0].id),
              startAt: startAt,
              endAt: endAt
            });
          }
        }
      }
    } else if (operation == 'edit' && userId) {
      const updates: Partial<TbaseSchema> = {};
      differentFields.forEach((field) => {
        if (field in data) {
          updates[field] = data[field];
        }
      });

      if (differentFields.includes('password')) {
        updates['password'] = await hash(data.password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });
      }

      await db.update(userTable).set(updates).where(sql`${userTable.id} = ${userId}`).returning();

      const doctorUpdates = {};
      if (differentFields.includes('specialty')) {
        doctorUpdates['specialty'] = 'something2';
      }
      
      if (Object.keys(doctorUpdates).length > 0) {
        await db.update(doctorTable).set(doctorUpdates).where(sql`${doctorTable.user_id} = ${userId}`).returning();
      }

      for (const day of selectedDays) {
        const workDay = await db.update(workDaysTable).set({
          doctorId: Number(doctor[0].id),
          day: day
        }).where(sql`${workDaysTable.doctorId} = ${doctor[0].id}`).returning({ id: workDaysTable.id, day: workDaysTable.day });

        if (groupedHours[day]) {
          for (const timeRange of groupedHours[day]) {
            const [startAt, endAt] = timeRange.split('-').map(time => time.trim());
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