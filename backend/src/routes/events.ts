import { Router, Request, Response } from "express";
import { z } from "zod";
import { RawEventRepository } from "../repositories/RawEventRepository";
import { enqueueEvent } from "../queues/eventQueue";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const eventRepo = new RawEventRepository();

const SourceLiteral = z.union([
  z.literal("slack"), z.literal("github"), z.literal("jira"),
  z.literal("calendar"), z.literal("vscode"), z.literal("other"),
]);

const IngestSchema = z.object({
  source: SourceLiteral,
  user_id: z.string().uuid().optional(),
  payload: z.record(z.string(), z.unknown()),
});

// POST /api/events
router.post("/", async (req: Request, res: Response) => {
  const body = IngestSchema.parse(req.body);
  const userId = body.user_id ?? "00000000-0000-0000-0000-000000000001";

  const event = await eventRepo.create({
    source: body.source,
    user_id: userId,
    payload: body.payload,
  });

  const jobId = await enqueueEvent({
    eventId: event.id,
    source: event.source,
    userId,
    payload: body.payload,
  });

  await eventRepo.updateJobId(event.id, jobId);

  res.status(202).json({
    message: "Event accepted",
    id: event.id,
    job_id: jobId,
  });
});

// GET /api/events
router.get("/", async (req: Request, res: Response) => {
  const userId = String(req.query["user_id"] ?? "00000000-0000-0000-0000-000000000001");
  const limit = Math.min(parseInt(String(req.query["limit"] ?? "50"), 10), 200);
  const offset = parseInt(String(req.query["offset"] ?? "0"), 10);

  const [events, total] = await Promise.all([
    eventRepo.findByUser(userId, limit, offset),
    eventRepo.count(userId),
  ]);

  res.json({ data: events, total, limit, offset });
});

// GET /api/events/:id
router.get("/:id", async (req: Request, res: Response) => {
  const event = await eventRepo.findById(String(req.params["id"]));
  if (!event) throw new AppError(404, "Event not found");
  res.json(event);
});

export default router;
