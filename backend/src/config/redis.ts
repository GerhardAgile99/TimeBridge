import { Redis } from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  });
  client.on("connect", () => logger.info("Redis connected"));
  client.on("error", (err) => logger.error("Redis error", { err }));
  return client;
}

export const redis = createRedisClient();
