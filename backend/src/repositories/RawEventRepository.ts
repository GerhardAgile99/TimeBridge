import { BaseRepository } from "./BaseRepository";
import { RawEvent, EventSource } from "../types";

export class RawEventRepository extends BaseRepository {
  async create(data: {
    source: EventSource;
    user_id?: string;
    payload: Record<string, unknown>;
    job_id?: string;
  }): Promise<RawEvent> {
    const row = await this.queryOne<RawEvent>(
      `INSERT INTO raw_events (source, user_id, payload, job_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.source, data.user_id ?? null, JSON.stringify(data.payload), data.job_id ?? null]
    );
    return row!;
  }

  async findById(id: string): Promise<RawEvent | null> {
    return this.queryOne<RawEvent>("SELECT * FROM raw_events WHERE id = $1", [id]);
  }

  async findUnprocessed(limit = 50): Promise<RawEvent[]> {
    return this.query<RawEvent>(
      "SELECT * FROM raw_events WHERE processed = FALSE ORDER BY created_at ASC LIMIT $1",
      [limit]
    );
  }

  async findByUser(userId: string, limit = 50, offset = 0): Promise<RawEvent[]> {
    return this.query<RawEvent>(
      "SELECT * FROM raw_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset]
    );
  }

  async markProcessed(id: string): Promise<void> {
    await this.execute("UPDATE raw_events SET processed = TRUE WHERE id = $1", [id]);
  }

  async updateJobId(id: string, jobId: string): Promise<void> {
    await this.execute("UPDATE raw_events SET job_id = $1 WHERE id = $2", [jobId, id]);
  }

  async count(userId?: string): Promise<number> {
    const sql = userId
      ? "SELECT COUNT(*) FROM raw_events WHERE user_id = $1"
      : "SELECT COUNT(*) FROM raw_events";
    const rows = await this.query<{ count: string }>(sql, userId ? [userId] : []);
    return parseInt(rows[0]?.count ?? "0", 10);
  }
}
