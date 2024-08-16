import db from "@/lib/db";
import { adminTable, doctorTable, receptionistTable, userTable, workDaysTable, workHoursTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TAddSchema, TEditSchema } from "@/types/operations.types";
import { TDepartments, THour, UserRoles } from "@/types/index.types";


export async function doctorRole({
  data,
  selectedDays,
  selectedHours,
  userId,
  operation,
}: {
  data: TEditSchema | TAddSchema,
  selectedDays: string[],
  selectedHours: THour[],
  userId: string,
  operation: "add" | "edit"
}) {
  const { specialty, fee } = data;

  const groupedHours = selectedHours.reduce((acc, { day: selectedDay, value }) => {
    if (!acc[selectedDay]) {
      acc[selectedDay] = [];
    }
    acc[selectedDay].push(value);
    return acc;
  }, {} as Record<string, THour["value"][]>);

  /*
    console.log(selectedHours)
    console.log(groupedHours)
    [
      { day: 'wednesday', value: { from: '03:00', to: '05:00' } },
      { day: 'wednesday', value: { from: '02:00', to: '03:00' } }
    ]
    {
      wednesday: [ { from: '03:00', to: '05:00' }, { from: '02:00', to: '03:00' } ]
    }
  */

  if (operation == 'add' && userId) {
    const doctor = await db.insert(doctorTable).values({
      userId: userId,
      specialty: specialty,
      fee: String(fee),
    }).returning({ id: doctorTable.id });

    for (const day of selectedDays) {
      const workDay = await db.insert(workDaysTable).values({
        doctorId: Number(doctor[0].id),
        day: day
      }).returning({ id: workDaysTable.id, day: workDaysTable.day });

      if (groupedHours[day]) {
        for (const timeRange of groupedHours[day]) {
          console.log(timeRange)
          await db.insert(workHoursTable).values({
            workDayId: Number(workDay[0].id),
            from: timeRange.from,
            to: timeRange.to
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
    if (fee) {
      await db.update(doctorTable).set({
        fee: String(fee),
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
          await db.insert(workHoursTable).values({
            workDayId: Number(workDay[0].id),
            from: timeRange.from,
            to: timeRange.to
          });
        }
      }
    }
  }

  revalidatePath('/dashboard/doctors');
  return {
    success: true,
  };
}

export const adminRole = async ({
  data,
  userId,
  operation
}: {
  data: TEditSchema | TAddSchema;
  userId: string;
  operation?: "add" | "edit";
}) => {
  if (operation == 'add') {
    await db.insert(adminTable).values({
      userId: userId,
    })
  }

  revalidatePath('/dashboard/admins');
  return {
    success: true,
  };
}

export const receptionistRole = async ({
  data,
  userId,
  operation
}: {
  data: TEditSchema | TAddSchema;
  userId: string;
  operation?: "add" | "edit";
}) => {
  if (operation == 'add') {
    await db.insert(receptionistTable).values({
      department: data.department as TDepartments,
      userId: userId,
    })
  } else if (operation == 'edit') {
    if (data.department) {
      await db.update(receptionistTable).set({
        department: data.department as TDepartments,
      }).where(sql`${receptionistTable.userId} = ${userId}`).returning();
    }
  }

  revalidatePath('/dashboard/receptionists');
  return {
    success: true,
  };
}