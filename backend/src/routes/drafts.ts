import { Router, Request, Response } from "express";
import { z } from "zod";
import { DraftRepository } from "../repositories/DraftRepository";
import { WorkLogRepository } from "../repositories/WorkLogRepository";
import { AppError } from "../middleware/errorHandler";
import { DraftStatus } from "../types";

const router = Router();
const draftRepo = new DraftRepository();
const workLogRepo = new WorkLogRepository();

const p = (v: string | string[] | undefined): string => String(v ?? "");

const EditSchema = z.object({
  task: z.string().min(1).optional(),
  duration_minutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
  project_id: z.string().uuid().optional(),
});

// POST /api/drafts/approve-all — must be before /:id routes
router.post("/approve-all", async (req: Request, res: Response) => {
  const userId = String(req.body["user_id"] ?? "00000000-0000-0000-0000-000000000001");
  const pending = await draftRepo.findByUser(userId, "pending", 200);

  const results = await Promise.all(
    pending.map(async (draft) => {
      const [updatedDraft, workLog] = await Promise.all([
        draftRepo.updateStatus(draft.id, "approved"),
        workLogRepo.create({
          user_id: draft.user_id,
          project_id: draft.project_id ?? undefined,
          draft_id: draft.id,
          task: draft.task,
          duration_minutes: draft.duration_minutes,
          notes: draft.notes ?? undefined,
        }),
      ]);
      return { draft: updatedDraft, work_log: workLog };
    })
  );

  res.json({ approved: results.length, results });
});

// GET /api/drafts
router.get("/", async (req: Request, res: Response) => {
  const userId = String(req.query["user_id"] ?? "00000000-0000-0000-0000-000000000001");
  const statusParam = req.query["status"];
  const status = (typeof statusParam === "string" ? statusParam : undefined) as DraftStatus | undefined;
  const limit = Math.min(parseInt(String(req.query["limit"] ?? "50"), 10), 200);
  const offset = parseInt(String(req.query["offset"] ?? "0"), 10);

  const [drafts, pending] = await Promise.all([
    draftRepo.findByUser(userId, status, limit, offset),
    draftRepo.countPending(userId),
  ]);

  res.json({ data: drafts, pending_count: pending, limit, offset });
});

// GET /api/drafts/:id
router.get("/:id", async (req: Request, res: Response) => {
  const draft = await draftRepo.findById(p(req.params["id"]));
  if (!draft) throw new AppError(404, "Draft not found");
  res.json(draft);
});

// PATCH /api/drafts/:id
router.patch("/:id", async (req: Request, res: Response) => {
  const id = p(req.params["id"]);
  const draft = await draftRepo.findById(id);
  if (!draft) throw new AppError(404, "Draft not found");
  if (draft.status !== "pending") throw new AppError(400, "Only pending drafts can be edited");
  const body = EditSchema.parse(req.body);
  const updated = await draftRepo.update(id, body);
  res.json(updated);
});

// POST /api/drafts/:id/approve
router.post("/:id/approve", async (req: Request, res: Response) => {
  const id = p(req.params["id"]);
  const draft = await draftRepo.findById(id);
  if (!draft) throw new AppError(404, "Draft not found");
  if (draft.status !== "pending") throw new AppError(400, "Draft is already processed");

  const [updatedDraft, workLog] = await Promise.all([
    draftRepo.updateStatus(draft.id, "approved"),
    workLogRepo.create({
      user_id: draft.user_id,
      project_id: draft.project_id ?? undefined,
      draft_id: draft.id,
      task: draft.task,
      duration_minutes: draft.duration_minutes,
      notes: draft.notes ?? undefined,
    }),
  ]);

  res.json({ draft: updatedDraft, work_log: workLog });
});

// POST /api/drafts/:id/reject
router.post("/:id/reject", async (req: Request, res: Response) => {
  const id = p(req.params["id"]);
  const draft = await draftRepo.findById(id);
  if (!draft) throw new AppError(404, "Draft not found");
  if (draft.status !== "pending") throw new AppError(400, "Draft is already processed");
  const updated = await draftRepo.updateStatus(draft.id, "rejected");
  res.json(updated);
});

export default router;
