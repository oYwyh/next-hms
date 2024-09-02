import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './index';

async function main() {
    await migrate(db, {
        migrationsFolder: './src/lib/db/migrations' // migrations files path
    })

    await client.end()
}

main()