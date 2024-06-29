import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts", // where your schemas is
  out: "./src/lib/db/migrations", // where your migrations will be generated
  dialect: "postgresql", // the driver you are using
  dbCredentials: {
    url: process.env.DATABASE_URL as string, // your database url
  },
  verbose: true, // generating migrations will tell you what have changed
  strict: true, // when running the migrations if it needs to change something it will tell you
});
