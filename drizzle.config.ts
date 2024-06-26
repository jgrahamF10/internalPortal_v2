import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DB_URL is not defined in the environment variables");
}

export default defineConfig({
  schema: "./db/schema/*",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});
