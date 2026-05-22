import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DraftRepository } from "../repositories/DraftRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { RawEventRepository } from "../repositories/RawEventRepository";
import { UserRepository } from "../repositories/UserRepository";
import { Draft, DraftStatus } from "../types";

const USER_ID = "00000000-0000-0000-0000-000000000001";

const draftRepo = new DraftRepository();
const projectRepo = new ProjectRepository();
const eventRepo = new RawEventRepository();
const userRepo = new UserRepository();

const server = new McpServer({
  name: "flowtrack",
  version: "1.0.0",
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDraft(d: Draft): string {
  const mins = d.duration_minutes;
  const duration = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  return `[${d.id}] "${d.task}" — ${duration} (${Math.round(d.confidence)}% confidence, status: ${d.status})`;
}

function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ─── Tools ───────────────────────────────────────────────────────────────────

server.registerTool("list_drafts", {
  description: "List AI-generated timesheet drafts",
  inputSchema: {
    status: z.enum(["pending", "approved", "rejected"]).optional().describe("Filter by status (default: pending)"),
    limit: z.number().min(1).max(100).optional().describe("Max results (default: 20)"),
  },
}, async ({ status, limit }) => {
  const drafts = await draftRepo.findByUser(USER_ID, (status ?? "pending") as DraftStatus, limit ?? 20, 0);
  if (drafts.length === 0) return ok("No drafts found.");
  return ok(drafts.map(formatDraft).join("\n"));
});

server.registerTool("approve_draft", {
  description: "Approve an AI-generated draft and convert it to a work log",
  inputSchema: {
    id: z.string().uuid().describe("Draft ID to approve"),
  },
}, async ({ id }) => {
  const draft = await draftRepo.updateStatus(id, "approved");
  if (!draft) return ok(`Draft ${id} not found.`);
  return ok(`Approved: ${formatDraft(draft)}`);
});

server.registerTool("reject_draft", {
  description: "Reject an AI-generated draft",
  inputSchema: {
    id: z.string().uuid().describe("Draft ID to reject"),
  },
}, async ({ id }) => {
  const draft = await draftRepo.updateStatus(id, "rejected");
  if (!draft) return ok(`Draft ${id} not found.`);
  return ok(`Rejected: ${formatDraft(draft)}`);
});

server.registerTool("list_projects", {
  description: "List all FlowTrack projects",
}, async () => {
  const projects = await projectRepo.findAll();
  if (projects.length === 0) return ok("No projects yet. Create one with create_project.");
  return ok(projects.map(p => `[${p.id}] ${p.name}${p.description ? ` — ${p.description}` : ""}`).join("\n"));
});

server.registerTool("create_project", {
  description: "Create a new project in FlowTrack",
  inputSchema: {
    name: z.string().min(1).max(100).describe("Project name"),
    description: z.string().optional().describe("Optional description"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().describe("Hex color (e.g. #6366F1)"),
  },
}, async ({ name, description, color }) => {
  const project = await projectRepo.create({ name, description, color });
  return ok(`Created project: [${project.id}] ${project.name}`);
});

server.registerTool("list_events", {
  description: "List recent activity events detected by FlowTrack",
  inputSchema: {
    limit: z.number().min(1).max(100).optional().describe("Max results (default: 20)"),
  },
}, async ({ limit }) => {
  const events = await eventRepo.findByUser(USER_ID, limit ?? 20, 0);
  if (events.length === 0) return ok("No events yet. Connect an integration to start detecting work.");
  return ok(
    events.map(e => {
      const p = e.payload as Record<string, any>;
      const summary = p.commits?.[0]?.message ?? p.title ?? p.event_type ?? e.source;
      return `[${e.source}] ${summary} (${new Date(e.created_at).toLocaleString()})`;
    }).join("\n")
  );
});

server.registerTool("get_stats", {
  description: "Get work statistics for the current user",
}, async () => {
  const [pendingCount, projects, recentEvents] = await Promise.all([
    draftRepo.countPending(USER_ID),
    projectRepo.findAll(),
    eventRepo.findByUser(USER_ID, 5, 0),
  ]);

  const user = await userRepo.findById(USER_ID);
  const lines = [
    `User: ${user?.name ?? "Unknown"}`,
    `Pending drafts: ${pendingCount}`,
    `Projects: ${projects.length}`,
    `Recent events: ${recentEvents.length} (showing last 5)`,
    "",
    projects.length > 0 ? `Projects: ${projects.map(p => p.name).join(", ")}` : "No projects yet.",
  ];
  return ok(lines.join("\n"));
});

// ─── Resources ───────────────────────────────────────────────────────────────

server.registerResource("pending-drafts", "flowtrack://drafts/pending", {
  description: "All pending AI-generated timesheet drafts awaiting approval",
  mimeType: "application/json",
}, async () => {
  const drafts = await draftRepo.findByUser(USER_ID, "pending", 50, 0);
  return { contents: [{ uri: "flowtrack://drafts/pending", text: JSON.stringify(drafts, null, 2), mimeType: "application/json" }] };
});

server.registerResource("projects", "flowtrack://projects", {
  description: "All FlowTrack projects",
  mimeType: "application/json",
}, async () => {
  const projects = await projectRepo.findAll();
  return { contents: [{ uri: "flowtrack://projects", text: JSON.stringify(projects, null, 2), mimeType: "application/json" }] };
});

server.registerResource("recent-events", "flowtrack://events/recent", {
  description: "Recent work activity events detected from integrations",
  mimeType: "application/json",
}, async () => {
  const events = await eventRepo.findByUser(USER_ID, 50, 0);
  return { contents: [{ uri: "flowtrack://events/recent", text: JSON.stringify(events, null, 2), mimeType: "application/json" }] };
});

// ─── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // StdioServerTransport communicates over stdin/stdout — nothing to log to stdout
}

main().catch((err) => {
  process.stderr.write(`MCP server error: ${err}\n`);
  process.exit(1);
});
