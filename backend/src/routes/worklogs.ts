import { Router, Request, Response } from "express";
import { WorkLogRepository } from "../repositories/WorkLogRepository";

const router = Router();
const workLogRepo = new WorkLogRepository();

// GET /api/worklogs
router.get("/", async (req: Request, res: Response) => {
  const userId = (req.query["user_id"] as string) ?? "00000000-0000-0000-0000-000000000001";
  const limit = Math.min(parseInt((req.query["limit"] as string) ?? "100", 10), 500);
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);

  const logs = await workLogRepo.findByUser(userId, limit, offset);
  res.json({ data: logs, limit, offset });
});

export default router;
