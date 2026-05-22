import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis";
import { logger } from "../../config/logger";
import { connectDB } from "../../db/client";
import { EventJobData } from "../eventQueue";
import { RawEventRepository } from "../../repositories/RawEventRepository";
import { DraftRepository } from "../../repositories/DraftRepository";
import { ProjectRepository } from "../../repositories/ProjectRepository";
import { AgentMemoryRepository } from "../../repositories/AgentMemoryRepository";
import { analyzeWork } from "../../agents/WorkAnalyzer";

const rawEventRepo = new RawEventRepository();
const draftRepo = new DraftRepository();
const projectRepo = new ProjectRepository();
const memoryRepo = new AgentMemoryRepository();

async function processEvent(job: Job<EventJobData>): Promise<void> {
  const { eventId, source, userId, payload } = job.data;
  logger.info(`Processing event ${eventId}`, { source, userId });

  // 1. Get agent context for this user
  const context = await memoryRepo.getContext(userId);

  // 2. Build a RawEvent object for the analyzer
  const rawEvent = {
    id: eventId,
    source,
    user_id: userId,
    payload,
    processed: false,
    job_id: job.id ?? null,
    created_at: new Date().toISOString(),
  };

  // 3. Analyze with Claude
  const analysis = await analyzeWork(rawEvent, context);

  if (!analysis.is_work) {
    logger.debug(`Event ${eventId} classified as non-work — skipping draft`);
    await rawEventRepo.markProcessed(eventId);
    return;
  }

  // 4. Resolve project (find or create by name)
  let projectId: string | undefined;
  if (analysis.project) {
    const project = await projectRepo.findOrCreate(analysis.project);
    projectId = project.id;

    // Update agent memory with the project name
    const currentProjects = context.active_projects;
    if (!currentProjects.includes(analysis.project)) {
      await memoryRepo.updateContext(userId, {
        active_projects: [...currentProjects.slice(-9), analysis.project],
      });
    }
  }

  // 5. Update recent tasks in memory
  if (analysis.task) {
    const recentTasks = context.recent_tasks;
    await memoryRepo.updateContext(userId, {
      recent_tasks: [...recentTasks.slice(-9), analysis.task],
    });
  }

  // 6. Create the draft
  const draft = await draftRepo.create({
    user_id: userId,
    project_id: projectId,
    task: analysis.task ?? "Work activity",
    duration_minutes: analysis.duration_minutes,
    confidence: analysis.confidence,
    notes: analysis.summary,
    sources: [source],
    raw_event_ids: [eventId],
    ai_reasoning: analysis.reasoning,
  });

  // 7. Mark event as processed
  await rawEventRepo.markProcessed(eventId);

  logger.info(`Draft created: ${draft.id}`, {
    task: draft.task,
    duration: draft.duration_minutes,
    confidence: draft.confidence,
  });
}

async function start(): Promise<void> {
  await connectDB();

  const worker = new Worker<EventJobData>("events", processEvent, {
    connection: redis,
    concurrency: 5,
  });

  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed`, { err });
  });

  logger.info("Event worker started — listening for jobs");
}

start().catch((err) => {
  logger.error("Worker startup failed", { err });
  process.exit(1);
});
