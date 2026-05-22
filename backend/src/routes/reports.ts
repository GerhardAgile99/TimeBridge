import { Router, Request, Response } from "express";
import { WorkLogRepository } from "../repositories/WorkLogRepository";
import { DraftRepository } from "../repositories/DraftRepository";

const router = Router();
const workLogRepo = new WorkLogRepository();
const draftRepo = new DraftRepository();

// GET /api/reports/stats — dashboard summary stats
router.get("/stats", async (req: Request, res: Response) => {
  const userId = (req.query["user_id"] as string) ?? "00000000-0000-0000-0000-000000000001";

  const [totalMinutes, pendingDrafts, projectStats] = await Promise.all([
    workLogRepo.totalMinutesThisWeek(userId),
    draftRepo.countPending(userId),
    workLogRepo.statsByProject(userId),
  ]);

  res.json({
    hours_logged_this_week: Math.round((totalMinutes / 60) * 10) / 10,
    pending_drafts: pendingDrafts,
    project_breakdown: projectStats,
  });
});

// GET /api/reports/weekly — breakdown by day for bar chart
router.get("/weekly", async (req: Request, res: Response) => {
  const userId = (req.query["user_id"] as string) ?? "00000000-0000-0000-0000-000000000001";

  const rows = await workLogRepo["query"]<{ day: string; total_minutes: string }>(
    `SELECT TO_CHAR(logged_date, 'Dy') as day,
            SUM(duration_minutes)::int as total_minutes
     FROM work_logs
     WHERE user_id=$1
       AND logged_date >= date_trunc('week', CURRENT_DATE)
     GROUP BY logged_date
     ORDER BY logged_date`,
    [userId]
  );

  res.json({
    data: rows.map((r) => ({
      day: r.day,
      hours: Math.round((parseInt(r.total_minutes, 10) / 60) * 10) / 10,
    })),
  });
});

export default router;
