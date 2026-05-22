import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../config/logger";

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on("error", (err) => {
  logger.error("Unexpected DB pool error", { err });
});

export async function connectDB(): Promise<void> {
  const client = await db.connect();
  client.release();
  logger.info("Database connected");
}
