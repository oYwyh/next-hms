import { drizzle } from 'drizzle-orm/postgres-js' // the way we connect
import * as schema from './schema' // getting the schema
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres' // getting the database driver

import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";

const client = postgres(process.env.DATABASE_URL as string)
export const db: PostgresJsDatabase<typeof schema> = drizzle(client, {schema, logger: true /* to log all the sql query we make */ })

export default db;
