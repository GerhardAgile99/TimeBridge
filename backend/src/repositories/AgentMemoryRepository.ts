import { BaseRepository } from "./BaseRepository";
import { AgentMemory, AgentContext } from "../types";

export class AgentMemoryRepository extends BaseRepository {
  async get(userId: string, key: string): Promise<Record<string, unknown> | null> {
    const row = await this.queryOne<AgentMemory>(
      "SELECT * FROM agent_memory WHERE user_id=$1 AND key=$2",
      [userId, key]
    );
    return row?.value ?? null;
  }

  async set(userId: string, key: string, value: Record<string, unknown>): Promise<void> {
    await this.execute(
      `INSERT INTO agent_memory (user_id, key, value)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, key) DO UPDATE SET value=$3, updated_at=NOW()`,
      [userId, key, JSON.stringify(value)]
    );
  }

  async getContext(userId: string): Promise<AgentContext> {
    const raw = await this.get(userId, "context");
    return (raw as unknown as AgentContext) ?? {
      active_projects: [],
      recent_tasks: [],
      work_hours: "09:00-18:00",
      timezone: "UTC",
    };
  }

  async updateContext(userId: string, patch: Partial<AgentContext>): Promise<void> {
    const current = await this.getContext(userId);
    await this.set(userId, "context", { ...current, ...patch });
  }
}
