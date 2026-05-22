import { Router, Request, Response } from "express";
import crypto from "crypto";
import { RawEventRepository } from "../../repositories/RawEventRepository";
import { enqueueEvent } from "../../queues/eventQueue";
import { logger } from "../../config/logger";

const router = Router();
const eventRepo = new RawEventRepository();

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function normalizePayload(
  eventType: string,
  body: Record<string, unknown>
): Record<string, unknown> | null {
  switch (eventType) {
    case "push": {
      const commits = (body.commits as any[]) ?? [];
      const branch = String(body.ref ?? "").replace("refs/heads/", "");
      const headCommitPresent = !!(body as any).head_commit;
      logger.debug("normalizePayload push", { commitsLen: commits.length, branch, headCommitPresent, ref: body.ref });
      // Drop branch-delete pushes (no head_commit and no commits)
      if (commits.length === 0 && !headCommitPresent) return null;
      const headCommit = (body as any).head_commit;
      const allCommits = commits.length > 0 ? commits : (headCommit ? [headCommit] : []);
      logger.debug("normalizePayload push accepted", { allCommitsLen: allCommits.length });
      return {
        event_type: "push",
        repository: (body.repository as any)?.full_name,
        branch,
        pusher: (body.pusher as any)?.name,
        commits: allCommits.map((c: any) => ({
          id: c.id,
          message: c.message,
          author: c.author?.name,
          timestamp: c.timestamp,
          files_changed: [...(c.added ?? []), ...(c.modified ?? []), ...(c.removed ?? [])].length,
        })),
      };
    }

    case "pull_request": {
      const pr = body.pull_request as any;
      const action = body.action as string;
      if (!["opened", "closed", "ready_for_review", "review_requested"].includes(action)) {
        return null;
      }
      return {
        event_type: "pull_request",
        action,
        repository: (body.repository as any)?.full_name,
        title: pr?.title,
        body: pr?.body?.slice(0, 500),
        merged: pr?.merged ?? false,
        additions: pr?.additions,
        deletions: pr?.deletions,
        changed_files: pr?.changed_files,
        author: pr?.user?.login,
        branch: pr?.head?.ref,
      };
    }

    case "pull_request_review": {
      const review = body.review as any;
      // Skip empty "commented" reviews with no body
      if (review?.state === "commented" && !review?.body) return null;
      return {
        event_type: "pull_request_review",
        state: review?.state,
        repository: (body.repository as any)?.full_name,
        pr_title: (body.pull_request as any)?.title,
        reviewer: review?.user?.login,
        body: review?.body?.slice(0, 500),
      };
    }

    case "create": {
      if (body.ref_type !== "branch") return null;
      return {
        event_type: "branch_created",
        repository: (body.repository as any)?.full_name,
        branch: body.ref,
        creator: (body.sender as any)?.login,
      };
    }

    default:
      return null;
  }
}

// POST /api/webhooks/github
router.post("/", async (req: Request, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const eventType = req.headers["x-github-event"] as string | undefined;
  const secret = process.env["GITHUB_WEBHOOK_SECRET"];

  if (secret) {
    if (!signature) {
      res.status(401).json({ error: "Missing signature" });
      return;
    }
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody || !verifySignature(rawBody, signature, secret)) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }
  }

  if (!eventType) {
    res.status(400).json({ error: "Missing X-GitHub-Event header" });
    return;
  }

  // Ack immediately — GitHub expects a fast response
  res.status(202).json({ message: "Accepted" });

  const rawBody = req.body as Record<string, unknown>;
  logger.debug("GitHub event received", {
    eventType,
    action: (rawBody as any)?.action,
    ref: (rawBody as any)?.ref,
    commitsCount: Array.isArray((rawBody as any)?.commits) ? (rawBody as any).commits.length : "n/a",
    hasHeadCommit: !!(rawBody as any)?.head_commit,
  });

  const payload = normalizePayload(eventType, rawBody);
  if (!payload) {
    logger.debug("GitHub event skipped", { eventType, action: (rawBody as any)?.action });
    return;
  }

  try {
    const event = await eventRepo.create({
      source: "github",
      user_id: DEFAULT_USER_ID,
      payload,
    });

    const jobId = await enqueueEvent({
      eventId: event.id,
      source: "github",
      userId: DEFAULT_USER_ID,
      payload,
    });

    await eventRepo.updateJobId(event.id, jobId);
    logger.info("GitHub event enqueued", { eventType, eventId: event.id, jobId });
  } catch (err) {
    logger.error("Failed to process GitHub event", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
});

export default router;
