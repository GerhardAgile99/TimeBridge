import { BaseRepository } from "./BaseRepository";
import { User } from "../types";

export class UserRepository extends BaseRepository {
  async findById(id: string): Promise<User | null> {
    return this.queryOne<User>(
      "SELECT id, email, name, created_at FROM users WHERE id = $1",
      [id]
    );
  }

  async updateName(id: string, name: string): Promise<User | null> {
    return this.queryOne<User>(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name, created_at",
      [name, id]
    );
  }
}
