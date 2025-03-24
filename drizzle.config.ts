import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:XVolzaSKCZPkizKDaoXIgSrtUcclpLSt@roundhouse.proxy.rlwy.net:38531/railway";
console.log("DB_URL", dbUrl);
if (!dbUrl) {
  throw new Error("DB_URL is not defined in the environment variables");
}

export default defineConfig({
  schema: ["./db/schema/*"],
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});
