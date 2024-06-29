import "dotenv/config"

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// for migrations
const migrationClient = postgres(process.env.DATABASE_URL as string, { max: 1 });

async function main() {
    await migrate(drizzle(migrationClient), {
        migrationsFolder: './src/db/migrations' // migrations files path
    })

    await migrationClient.end()
}

main()