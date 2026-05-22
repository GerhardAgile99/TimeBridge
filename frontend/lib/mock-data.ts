export type ActivitySource = "slack" | "github" | "jira" | "calendar";

export interface Activity {
  id: string;
  source: ActivitySource;
  title: string;
  summary: string;
  timeAgo: string;
}

export interface Draft {
  id: string;
  project: string;
  task: string;
  duration: string;
  confidence: number;
  sources: ActivitySource[];
  status: "pending" | "approved" | "rejected";
}

export interface Project {
  id: string;
  name: string;
  totalHours: number;
  contributors: number;
  aiActivityLevel: "high" | "medium" | "low";
  recentWork: string;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  isActive: boolean;
  focusScore: number;
  recentActivity: string;
  weeklyHours: number;
  color: string;
}

export const activities: Activity[] = [];
export const drafts: Draft[] = [];
export const chartData: { month: string; value: number }[] = [];
export const projectChartData: { name: string; value: number; color: string }[] = [];
export const weeklyBarData: { day: string; hours: number }[] = [];
export const projects: Project[] = [];
export const teamMembers: TeamMember[] = [];
