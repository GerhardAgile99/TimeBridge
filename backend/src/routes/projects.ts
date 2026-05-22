import { Router, Request, Response } from "express";
import { z } from "zod";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const projectRepo = new ProjectRepository();

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

router.get("/", async (_req: Request, res: Response) => {
  const projects = await projectRepo.findAll();
  res.json({ data: projects });
});

router.get("/:id", async (req: Request, res: Response) => {
  const project = await projectRepo.findById(String(req.params["id"]));
  if (!project) throw new AppError(404, "Project not found");
  res.json(project);
});

router.post("/", async (req: Request, res: Response) => {
  const body = CreateSchema.parse(req.body);
  const project = await projectRepo.create(body);
  res.status(201).json(project);
});

export default router;
