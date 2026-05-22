import { Router, Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const userRepo = new UserRepository();

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

// GET /api/users/me
router.get("/me", async (_req: Request, res: Response) => {
  const user = await userRepo.findById(DEFAULT_USER_ID);
  if (!user) throw new AppError(404, "User not found");
  res.json(user);
});

// PATCH /api/users/me
router.patch("/me", async (req: Request, res: Response) => {
  const { name } = z.object({ name: z.string().min(1).max(100).trim() }).parse(req.body);
  const user = await userRepo.updateName(DEFAULT_USER_ID, name);
  if (!user) throw new AppError(404, "User not found");
  res.json(user);
});

export default router;
