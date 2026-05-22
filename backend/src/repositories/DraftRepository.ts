import { BaseRepository } from "./BaseRepository";
import { Draft, DraftStatus } from "../types";

export class DraftRepository extends BaseRepository {
  async create(data: {
    user_id: string;
    project_id?: string;
    task: string;
    duration_minutes: number;
    confidence: number;
    notes?: string;
    sources?: string[];
    raw_event_ids?: string[];
    ai_reasoning?: string;
  }): Promise<Draft> {
    const row = await this.queryOne<Draft>(
      `INSERT INTO drafts
         (user_id, project_id, task, duration_minutes, confidence, notes, sources, raw_event_ids, ai_reasoning)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.user_id,
        data.project_id ?? null,
        data.task,
        data.duration_minutes,
        data.confidence,
        data.notes ?? null,
        JSON.stringify(data.sources ?? []),
        JSON.stringify(data.raw_event_ids ?? []),
        data.ai_reasoning ?? null,
      ]
    );
    return row!;
  }

  async findById(id: string): Promise<Draft | null> {
    return this.queryOne<Draft>("SELECT * FROM drafts WHERE id = $1", [id]);
  }

  async findByUser(
    userId: string,
    status?: DraftStatus,
    limit = 50,
    offset = 0
  ): Promise<Draft[]> {
    if (status) {
      return this.query<Draft>(
        "SELECT * FROM drafts WHERE user_id=$1 AND status=$2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        [userId, status, limit, offset]
      );
    }
    return this.query<Draft>(
      "SELECT * FROM drafts WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset]
    );
  }

  async updateStatus(id: string, status: DraftStatus): Promise<Draft | null> {
    return this.queryOne<Draft>(
      "UPDATE drafts SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
  }

  async update(
    id: string,
    data: Partial<Pick<Draft, "task" | "duration_minutes" | "notes" | "project_id">>
  ): Promise<Draft | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.task !== undefined) { sets.push(`task=$${i++}`); values.push(data.task); }
    if (data.duration_minutes !== undefined) { sets.push(`duration_minutes=$${i++}`); values.push(data.duration_minutes); }
    if (data.notes !== undefined) { sets.push(`notes=$${i++}`); values.push(data.notes); }
    if (data.project_id !== undefined) { sets.push(`project_id=$${i++}`); values.push(data.project_id); }
    if (sets.length === 0) return this.findById(id);
    values.push(id);
    return this.queryOne<Draft>(
      `UPDATE drafts SET ${sets.join(", ")}, updated_at=NOW() WHERE id=$${i} RETURNING *`,
      values
    );
  }

  async countPending(userId: string): Promise<number> {
    const rows = await this.query<{ count: string }>(
      "SELECT COUNT(*) FROM drafts WHERE user_id=$1 AND status='pending'",
      [userId]
    );
    return parseInt(rows[0]?.count ?? "0", 10);
  }
}
