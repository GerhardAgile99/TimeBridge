import { Queue } from "bullmq";
import { redis } from "../config/redis";
import { logger } from "../config/logger";
import { EventSource } from "../types";

export interface EventJobData {
  eventId: string;
  source: EventSource;
  userId: string;
  payload: Record<string, unknown>;
}

export const eventQueue = new Queue<EventJobData>("events", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 100 },
  },
});

export async function enqueueEvent(data: EventJobData): Promise<string> {
  const job = await eventQueue.add("process-event", data, {
    jobId: `event-${data.eventId}`,
  });
  logger.debug("Event enqueued", { jobId: job.id, source: data.source });
  return job.id ?? "";
}
