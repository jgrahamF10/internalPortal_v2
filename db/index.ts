
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema1 from "./schema/auth_db";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const combinedSchema = { ...schema1,  };
export const db = drizzle(pool, { schema: combinedSchema });
