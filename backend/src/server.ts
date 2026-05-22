import "dotenv/config";
import app from "./app";
import { connectDB } from "./db/client";
import { env } from "./config/env";
import { logger } from "./config/logger";

async function start(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`FlowTrack API running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Health: http://localhost:${env.PORT}/api/health`);
  });
}

start().catch((err) => {
  logger.error("Server startup failed", { err });
  process.exit(1);
});
