export type EventSource = "slack" | "github" | "jira" | "calendar" | "vscode" | "other";
export type DraftStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface RawEvent {
  id: string;
  source: EventSource;
  user_id: string | null;
  payload: Record<string, unknown>;
  processed: boolean;
  job_id: string | null;
  created_at: string;
}

export interface Draft {
  id: string;
  user_id: string;
  project_id: string | null;
  task: string;
  duration_minutes: number;
  confidence: number;
  notes: string | null;
  sources: EventSource[];
  raw_event_ids: string[];
  ai_reasoning: string | null;
  status: DraftStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkLog {
  id: string;
  user_id: string;
  project_id: string | null;
  draft_id: string | null;
  task: string;
  duration_minutes: number;
  notes: string | null;
  logged_date: string;
  created_at: string;
}

export interface AgentMemory {
  id: string;
  user_id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

// The shape the AI WorkAnalyzer returns
export interface WorkAnalysis {
  is_work: boolean;
  project: string | null;
  task: string | null;
  duration_minutes: number;
  category: string;
  summary: string;
  confidence: number;
  reasoning: string;
}

// Agent context injected into every AI call
export interface AgentContext {
  active_projects: string[];
  recent_tasks: string[];
  work_hours: string;
  timezone: string;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
