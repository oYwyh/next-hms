'use server'

import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";

export const useGetUser = async () => {
  const { user } = await validateRequest();

  if (user?.role === "admin") {
    const admin = await db.query.userTable.findFirst({
      columns: {
        password: false,
      },
      where: (userTable, { eq }) => eq(userTable.id, user.id),
      with: {
        admin: true
      },
    });
    return admin;
  } else if (user?.role === "doctor") {
    const doctor = await db.query.userTable.findFirst({
      columns: {
        password: false,
      },
      where: (userTable, { eq }) => eq(userTable.id, user.id),
      with: {
        doctor: {
          with: {
            workDays: {
              with: {
                workHours: true
              }
            }
          },
        }
      },
    });
    return doctor;
  }

  return user;
};