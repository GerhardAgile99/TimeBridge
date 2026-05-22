export interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ApiDraft {
  id: string;
  user_id: string;
  project_id: string | null;
  raw_event_id: string | null;
  task: string;
  duration_minutes: number;
  notes: string | null;
  confidence_score: number;
  status: "pending" | "approved" | "rejected";
  sources: string[];
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ApiRawEvent {
  id: string;
  source: "slack" | "github" | "jira" | "calendar" | "vscode" | "other";
  user_id: string;
  payload: Record<string, unknown>;
  job_id: string | null;
  processed: boolean;
  created_at: string;
}

export interface ApiStats {
  hours_logged_this_week: number;
  pending_drafts: number;
  active_projects: number;
  today_detected_minutes: number;
  today_avg_confidence: number;
  events_today: number;
  project_breakdown: Array<{
    project_id: string;
    project_name: string;
    total_minutes: number;
  }>;
}

export interface ApiWeeklyData {
  data: Array<{ day: string; hours: number }>;
}

export interface ApiPaginated<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiDraftsResponse {
  data: ApiDraft[];
  pending_count: number;
  limit: number;
  offset: number;
}
