import db from "@/lib/db/index";
import { TbaseSchema, columnsRegex } from "./types";
import { TaddSchema } from "@/app/(dashboard)/types";
import * as XLSX from 'xlsx'

export const uniqueColumnsValidations = async (data: TaddSchema) => {
  const columns = [
    data.username && { column: 'username', value: data?.username, regex: columnsRegex.username },
    data.email && { column: 'email', value: data?.email, regex: columnsRegex.email },
    data.phone && { column: 'phone', value: data?.phone, regex: columnsRegex.phone },
    data.nationalId && { column: 'nationalId', value: data?.nationalId, regex: columnsRegex.nationalId }
  ].filter(Boolean); // Filter out undefined values

  const errors: Record<string, string> = {};

  for (const { column, value, regex } of columns) {
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

  if (Object.keys(errors).length > 0) {
    return { error: errors };
  }
}

export const exportXLSX = async (data: {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  nationalId: string;
  age: string;
  gender: string;
  role: "admin" | "user" | "doctor" | null;
  id: string;
}[]) => {

}