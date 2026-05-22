import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { RawEvent, WorkAnalysis, AgentContext } from "../types";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an AI timesheet assistant for a software engineering team.
Your job is to analyze work activity signals and determine if they represent meaningful billable work.

Rules:
- A commit, PR review, Jira ticket update, or Slack message about a bug IS work
- A casual greeting or status update is NOT work
- Estimate duration conservatively based on the complexity of the activity
- Always return valid JSON matching the schema exactly — no extra text, no markdown

Output JSON schema:
{
  "is_work": boolean,
  "project": string | null,
  "task": string | null,
  "duration_minutes": number,
  "category": "Engineering" | "Design" | "Communication" | "Meeting" | "Review" | "Research" | "Other",
  "summary": string,
  "confidence": number (0-100),
  "reasoning": string
}`;

export async function analyzeWork(
  event: RawEvent,
  context: AgentContext
): Promise<WorkAnalysis> {
  // If no API key is configured, return a plausible mock for dev
  if (!env.ANTHROPIC_API_KEY) {
    logger.warn("ANTHROPIC_API_KEY not set — returning mock analysis");
    return mockAnalysis(event);
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Activity event (source: ${event.source}):
${JSON.stringify(event.payload, null, 2)}

User context:
- Active projects: ${context.active_projects.join(", ") || "unknown"}
- Recent tasks: ${context.recent_tasks.slice(0, 3).join(", ") || "none"}
- Work hours: ${context.work_hours}

Analyze this and return JSON only.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "{}";

    const parsed = JSON.parse(text) as WorkAnalysis;
    logger.debug("WorkAnalyzer result", { is_work: parsed.is_work, confidence: parsed.confidence });
    return parsed;
  } catch (err) {
    logger.error("WorkAnalyzer Claude API error", { err });
    // Fall back to mock so the pipeline doesn't stall
    return mockAnalysis(event);
  }
}

function mockAnalysis(event: RawEvent): WorkAnalysis {
  const payload = event.payload as Record<string, unknown>;
  const isWork = event.source !== "other";
  const description =
    ((payload["commits"] as any[])?.[0]?.message ??
    String(payload["title"] ?? payload["text"] ?? "").slice(0, 80)) ||
    `${event.source} activity`;

  // Extract project name from source-specific payload fields
  let project: string | null = null;
  if (event.source === "github") {
    const repo = String(payload["repository"] ?? "");
    // Use the repo name part after the slash (e.g. "GerhardAgile99/TimeBridge" → "TimeBridge")
    project = repo.includes("/") ? repo.split("/").pop() ?? null : repo || null;
  }

  return {
    is_work: isWork,
    project,
    task: description,
    duration_minutes: 45,
    category: "Engineering",
    summary: `Detected ${event.source} activity`,
    confidence: 50,
    reasoning: "No ANTHROPIC_API_KEY — add one for real AI classification",
  };
}
