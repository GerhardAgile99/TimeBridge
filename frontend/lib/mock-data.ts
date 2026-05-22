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

export const activities: Activity[] = [
  {
    id: "1",
    source: "github",
    title: 'GitHub - Pushed commit "feat: add rate limiting" to main',
    summary: "Pushed commit: Update login summary.",
    timeAgo: "3m ago",
  },
  {
    id: "2",
    source: "slack",
    title: "Slack - Message in #engineering: Updated Q3 goals",
    summary: "Message in #engineering: Updated Q3 goals.",
    timeAgo: "47m ago",
  },
  {
    id: "3",
    source: "jira",
    title: "Jira - Resolved ticket PROJ-1842",
    summary: "Resolved ticket PROJ-1842 with patch.",
    timeAgo: "1h ago",
  },
  {
    id: "4",
    source: "calendar",
    title: "Calendar - Finished 1:1 with Design Lead",
    summary: "Finished design integration activities.",
    timeAgo: "2h ago",
  },
  {
    id: "5",
    source: "github",
    title: 'GitHub - Opened PR #412 "fix: memory leak in worker"',
    summary: "PR opened against main branch for review.",
    timeAgo: "2h ago",
  },
  {
    id: "6",
    source: "slack",
    title: "Slack - Message in #frontend: Deployed v2.1.0 to staging",
    summary: "Deployment notification posted to channel.",
    timeAgo: "3h ago",
  },
  {
    id: "7",
    source: "jira",
    title: "Jira - Moved PROJ-1838 to In Review",
    summary: "Status updated from In Progress to In Review.",
    timeAgo: "4h ago",
  },
  {
    id: "8",
    source: "calendar",
    title: "Calendar - Sprint Planning (1h 30m)",
    summary: "Sprint 23 planning session with engineering team.",
    timeAgo: "5h ago",
  },
];

export const drafts: Draft[] = [
  {
    id: "1",
    project: "Mobile App Redesign",
    task: "Implemented auth flow improvements",
    duration: "2h 15m",
    confidence: 94,
    sources: ["github", "jira"],
    status: "pending",
  },
  {
    id: "2",
    project: "Mobile App Redesign",
    task: "Code review and merge for rate limiting PR",
    duration: "45m",
    confidence: 91,
    sources: ["github"],
    status: "pending",
  },
  {
    id: "3",
    project: "Customer Onboarding",
    task: "Fixed authentication bug in session flow",
    duration: "1h 30m",
    confidence: 88,
    sources: ["slack", "github"],
    status: "pending",
  },
  {
    id: "4",
    project: "Internal AI Tooling",
    task: "Reviewed and merged context memory PR",
    duration: "1h 10m",
    confidence: 96,
    sources: ["github", "jira"],
    status: "pending",
  },
  {
    id: "5",
    project: "Sprint Planning",
    task: "Q3 engineering goals alignment session",
    duration: "1h 30m",
    confidence: 97,
    sources: ["calendar", "slack"],
    status: "pending",
  },
  {
    id: "6",
    project: "API Gateway v2",
    task: "Added rate limiting middleware with Redis",
    duration: "2h 45m",
    confidence: 89,
    sources: ["github", "jira"],
    status: "pending",
  },
  {
    id: "7",
    project: "Mobile App Redesign",
    task: "Design review meeting with product team",
    duration: "55m",
    confidence: 93,
    sources: ["calendar", "slack"],
    status: "pending",
  },
];

export const chartData = [
  { month: "Sep", value: 3200 },
  { month: "Oct", value: 4800 },
  { month: "Nov", value: 2900 },
  { month: "Dec", value: 5500 },
  { month: "Jan", value: 4200 },
  { month: "Feb", value: 6100 },
  { month: "Mar", value: 5800 },
  { month: "Apr", value: 7200 },
  { month: "May", value: 6400 },
  { month: "Jun", value: 8900 },
  { month: "Jul", value: 7600 },
  { month: "Aug", value: 9400 },
  { month: "Vep", value: 10200 },
];

export const projectChartData = [
  { name: "Mobile App", value: 35, color: "#6366F1" },
  { name: "Onboarding", value: 25, color: "#8B5CF6" },
  { name: "AI Tooling", value: 18, color: "#EC4899" },
  { name: "API Gateway", value: 12, color: "#F59E0B" },
  { name: "Other", value: 10, color: "#10B981" },
];

export const weeklyBarData = [
  { day: "Mon", hours: 6.5 },
  { day: "Tue", hours: 8.2 },
  { day: "Wed", hours: 7.1 },
  { day: "Thu", hours: 5.8 },
  { day: "Fri", hours: 9.4 },
  { day: "Sat", hours: 2.1 },
  { day: "Sun", hours: 0.5 },
];

export const projects: Project[] = [
  {
    id: "1",
    name: "Mobile App Redesign",
    totalHours: 124.5,
    contributors: 5,
    aiActivityLevel: "high",
    recentWork: "Auth flow implementation",
    color: "#6366F1",
  },
  {
    id: "2",
    name: "Customer Onboarding",
    totalHours: 87.2,
    contributors: 3,
    aiActivityLevel: "high",
    recentWork: "Session bug fix",
    color: "#8B5CF6",
  },
  {
    id: "3",
    name: "Internal AI Tooling",
    totalHours: 63.0,
    contributors: 2,
    aiActivityLevel: "medium",
    recentWork: "Context memory PR",
    color: "#EC4899",
  },
  {
    id: "4",
    name: "API Gateway v2",
    totalHours: 41.8,
    contributors: 4,
    aiActivityLevel: "medium",
    recentWork: "Rate limiting feature",
    color: "#F59E0B",
  },
  {
    id: "5",
    name: "Data Pipeline",
    totalHours: 28.5,
    contributors: 2,
    aiActivityLevel: "low",
    recentWork: "Schema migration",
    color: "#10B981",
  },
  {
    id: "6",
    name: "DevOps Automation",
    totalHours: 19.0,
    contributors: 1,
    aiActivityLevel: "low",
    recentWork: "Docker compose setup",
    color: "#06B6D4",
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Jordan Davis",
    initials: "JD",
    role: "Senior Engineer",
    isActive: true,
    focusScore: 87,
    recentActivity: "Pushed commit to mobile-redesign",
    weeklyHours: 28.4,
    color: "#6366F1",
  },
  {
    id: "2",
    name: "Sarah Chen",
    initials: "SC",
    role: "Frontend Engineer",
    isActive: true,
    focusScore: 92,
    recentActivity: "Reviewed PR #412",
    weeklyHours: 31.2,
    color: "#8B5CF6",
  },
  {
    id: "3",
    name: "Marcus Lee",
    initials: "ML",
    role: "Backend Engineer",
    isActive: false,
    focusScore: 74,
    recentActivity: "Updated Jira PROJ-1842",
    weeklyHours: 22.5,
    color: "#EC4899",
  },
  {
    id: "4",
    name: "Aisha Patel",
    initials: "AP",
    role: "Product Manager",
    isActive: true,
    focusScore: 81,
    recentActivity: "Sprint planning meeting",
    weeklyHours: 18.0,
    color: "#F59E0B",
  },
  {
    id: "5",
    name: "Tom Wright",
    initials: "TW",
    role: "DevOps Engineer",
    isActive: false,
    focusScore: 68,
    recentActivity: "Updated CI pipeline",
    weeklyHours: 15.5,
    color: "#10B981",
  },
  {
    id: "6",
    name: "Priya Kumar",
    initials: "PK",
    role: "Data Engineer",
    isActive: false,
    focusScore: 79,
    recentActivity: "Schema migration deployed",
    weeklyHours: 20.8,
    color: "#06B6D4",
  },
];
