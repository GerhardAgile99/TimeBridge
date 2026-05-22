import { BaseRepository } from "./BaseRepository";
import { WorkLog } from "../types";

export class WorkLogRepository extends BaseRepository {
  async create(data: {
    user_id: string;
    project_id?: string;
    draft_id?: string;
    task: string;
    duration_minutes: number;
    notes?: string;
    logged_date?: string;
  }): Promise<WorkLog> {
    const row = await this.queryOne<WorkLog>(
      `INSERT INTO work_logs (user_id, project_id, draft_id, task, duration_minutes, notes, logged_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        data.user_id,
        data.project_id ?? null,
        data.draft_id ?? null,
        data.task,
        data.duration_minutes,
        data.notes ?? null,
        data.logged_date ?? new Date().toISOString().split("T")[0],
      ]
    );
    return row!;
  }

  async findByUser(userId: string, limit = 100, offset = 0): Promise<WorkLog[]> {
    return this.query<WorkLog>(
      `SELECT wl.*, p.name as project_name FROM work_logs wl
       LEFT JOIN projects p ON p.id = wl.project_id
       WHERE wl.user_id=$1 ORDER BY wl.logged_date DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
  }

  async totalMinutesThisWeek(userId: string): Promise<number> {
    const rows = await this.query<{ total: string }>(
      `SELECT COALESCE(SUM(duration_minutes),0) as total FROM work_logs
       WHERE user_id=$1 AND logged_date >= date_trunc('week', CURRENT_DATE)`,
      [userId]
    );
    return parseInt(rows[0]?.total ?? "0", 10);
  }

  async statsByProject(userId: string): Promise<{ project_id: string; project_name: string; total_minutes: number }[]> {
    return this.query(
      `SELECT wl.project_id, p.name as project_name, SUM(wl.duration_minutes)::int as total_minutes
       FROM work_logs wl LEFT JOIN projects p ON p.id=wl.project_id
       WHERE wl.user_id=$1 GROUP BY wl.project_id, p.name ORDER BY total_minutes DESC`,
      [userId]
    );
  }
}
