import { Router } from "express";
import eventsRouter from "./events";
import draftsRouter from "./drafts";
import worklogsRouter from "./worklogs";
import projectsRouter from "./projects";
import reportsRouter from "./reports";
import githubWebhookRouter from "./webhooks/github";

const router = Router();

router.use("/events", eventsRouter);
router.use("/drafts", draftsRouter);
router.use("/worklogs", worklogsRouter);
router.use("/projects", projectsRouter);
router.use("/reports", reportsRouter);
router.use("/webhooks/github", githubWebhookRouter);

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
