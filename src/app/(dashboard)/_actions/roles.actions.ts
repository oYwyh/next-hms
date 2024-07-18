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
        userId: userId,
        specialty: specialty,
      }).returning({ id: doctorTable.id });

      for (const day of selectedDays) {
        const workDay = await db.insert(workDaysTable).values({
          doctorId: Number(doctor[0].id),
          day: day
        }).returning({ id: workDaysTable.id, day: workDaysTable.day });

        if (groupedHours[day]) {
          for (const timeRange of groupedHours[day]) {
            const [from, to] = timeRange.split('-').map(time => time.trim());
            console.log(`Start: ${from}, End: ${to}`);
            await db.insert(workHoursTable).values({
              workDayId: Number(workDay[0].id),
              from: from,
              to: to
            });
          }
        }
      }
    } else if (operation == 'edit' && userId) {
      const doctor = await db.select({ id: doctorTable.id }).from(doctorTable).where(sql`${doctorTable.userId} = ${userId}`);

      if (specialty) {
        await db.update(doctorTable).set({
          specialty: specialty,
        }).where(sql`${doctorTable.userId} = ${userId}`).returning();
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
            const [from, to] = timeRange.split('-').map(time => time.trim());
            console.log(`Start: ${from}, End: ${to}`);
            await db.insert(workHoursTable).values({
              workDayId: Number(workDay[0].id),
              from: from,
              to: to
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
        userId: userId,
      })
    }

    revalidatePath('/admin/manage/admins');
    return {
      done: true,
    };
  }
  return;
}