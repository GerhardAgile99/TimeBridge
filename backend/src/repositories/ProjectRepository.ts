import { BaseRepository } from "./BaseRepository";
import { Project } from "../types";

export class ProjectRepository extends BaseRepository {
  async findAll(): Promise<Project[]> {
    return this.query<Project>("SELECT * FROM projects ORDER BY name");
  }

  async findById(id: string): Promise<Project | null> {
    return this.queryOne<Project>("SELECT * FROM projects WHERE id=$1", [id]);
  }

  async findByName(name: string): Promise<Project | null> {
    return this.queryOne<Project>("SELECT * FROM projects WHERE LOWER(name)=LOWER($1)", [name]);
  }

  async create(data: { name: string; description?: string; color?: string }): Promise<Project> {
    const row = await this.queryOne<Project>(
      "INSERT INTO projects (name, description, color) VALUES ($1,$2,$3) RETURNING *",
      [data.name, data.description ?? null, data.color ?? "#6366F1"]
    );
    return row!;
  }

  async findOrCreate(name: string): Promise<Project> {
    const existing = await this.findByName(name);
    if (existing) return existing;
    return this.create({ name });
  }
}
