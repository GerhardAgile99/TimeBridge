import { Pool } from "pg";
import { db } from "../db/client";

export abstract class BaseRepository {
  protected db: Pool = db;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.db.query<any>(sql, params as unknown[]);
    return result.rows as T[];
  }

  protected async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  protected async execute(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.db.query(sql, params as unknown[]);
    return result.rowCount ?? 0;
  }

  async rawExecute(sql: string, params?: unknown[]): Promise<number> {
    return this.execute(sql, params);
  }
}
