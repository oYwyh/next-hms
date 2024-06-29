import db from "@/lib/db/index";
import { columnsRegex } from "./types";

export const uniqueColumnsValidations = async (username: string, email: string, phone: string, nationalId: string) => {
  const columns = [
    { column: 'username', value: username, regex: columnsRegex.username },
    { column: 'email', value: email, regex: columnsRegex.email },
    { column: 'phone', value: phone, regex: columnsRegex.phone },
    { column: 'nationalId', value: nationalId, regex: columnsRegex.nationalId }
  ];

  const errors: Record<string, string> = {};

  for (const { column, value, regex } of columns) {
      const exist = await db.query.userTable.findFirst({
        columns: { [column]: true },
        where: (userTable: {[key: string]: any}, { eq }) => eq(userTable[column], value),
      });

      if (exist ) {
        errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} already exists`;
      }
      if(!regex.test(value)) {
        errors[column] = `${column.charAt(0).toUpperCase() + column.slice(1)} Is invalid`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return { error: errors };
    }
}