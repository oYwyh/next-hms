import db from "@/lib/db";
import { adminTable, doctorTable, userTable, workDaysTable, workHoursTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TaddSchema, TeditSchema } from "../types";


export async function doctorRole(
  data: TeditSchema | TaddSchema,
  userRole: ("user" | "admin" | "doctor") = "doctor",
  selectedDays: string[] | undefined,
  selectedHours: { day: string; value: string }[] | undefined,
  userId: string,
  operation?: "add" | "edit",
) {
  if (userRole === "doctor") {
    const { specialty } = data;


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
        specialty: specialty,
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
      const doctor = await db.select({ id: doctorTable.id }).from(doctorTable).where(sql`${doctorTable.user_id} = ${userId}`);

      if (specialty) {
        await db.update(doctorTable).set({
          specialty: specialty,
        }).where(sql`${doctorTable.user_id} = ${userId}`).returning();
      }

      const workDay = await db.delete(workDaysTable).where(sql`${workDaysTable.doctorId} = ${doctor[0].id}`).returning();
      await db.delete(workHoursTable).where(sql`${workHoursTable.workDayId} = ${workDay[0].id}`);

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
    }

    revalidatePath('/admin/manage/doctors');
    return {
      done: true,
    };
  }
  return;
}

export const adminRole = async (
  data: TeditSchema | TaddSchema,
  userRole: ("user" | "admin" | "doctor") = "admin",
  userId: string,
  operation?: "add" | "edit",
) => {
  if (userRole == 'admin') {
    if (operation == 'add') {
      await db.insert(adminTable).values({
        user_id: userId,
      })
    }

    revalidatePath('/admin/manage/admins');
    return {
      done: true,
    };
  }
  return;
}