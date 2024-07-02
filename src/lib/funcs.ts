import db from "@/lib/db/index";
import { TbaseSchema, columnsRegex } from "./types";

export const uniqueColumnsValidations = async (
  data: TbaseSchema,
  differentFields?: string[]
) => {
  const columns = [
    { column: 'username', value: data?.username, regex: columnsRegex.username },
    { column: 'email', value: data?.email, regex: columnsRegex.email },
    { column: 'phone', value: data?.phone, regex: columnsRegex.phone },
    { column: 'nationalId', value: data?.nationalId, regex: columnsRegex.nationalId }
  ];
  const errors: Record<string, string> = {};
  if (differentFields) {
    for (const { column, value, regex } of columns) {
      if (differentFields.includes(column)) {
        const exist = await db.query.userTable.findFirst({
          columns: { [column]: true },
          where: (userTable: { [key: string]: any }, { eq }) => eq(userTable[column], value),
        });

        if (exist) {
          errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} already exists`;
        }
        if (!regex.test(value)) {
          errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} is invalid`;
        }
      }
    }
  } else {
    for (const { column, value, regex } of columns) {
      const exist = await db.query.userTable.findFirst({
        columns: { [column]: true },
        where: (userTable: { [key: string]: any }, { eq }) => eq(userTable[column], value),
      });

      if (exist) {
        errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} already exists`;
      }
      if (!regex.test(value)) {
        errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} Is invalid`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return { error: errors };
    }
  }
}
