
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./schema/auth_db";
import * as memberSchema from "./schema/member_management";
import * as trackerSchema from "./schema/tracker_db";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const combinedSchema = { ...authSchema, ...memberSchema, ...trackerSchema };
export const db = drizzle(pool, { schema: combinedSchema });
