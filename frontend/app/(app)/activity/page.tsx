import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { activities as mockActivities } from "@/lib/mock-data";
import { getEvents } from "@/lib/api/events";
import { timeAgo } from "@/lib/utils/time";
import type { Activity, ActivitySource } from "@/lib/mock-data";

const VALID_SOURCES: ActivitySource[] = ["slack", "github", "jira", "calendar"];

function extractText(source: string, payload: Record<string, unknown>): string {
  const p = payload as Record<string, any>;
  if (source === "github") {
    const commits = p.commits as any[] | undefined;
    if (commits?.length) return `Pushed "${commits[0].message}" to ${p.branch ?? "branch"}`;
    if (p.title) return `PR ${p.action ?? ""}: "${p.title}"`.trim();
    if (p.pr_title) return `Reviewed PR: "${p.pr_title}" (${p.state ?? ""})`.trim();
    if (p.event_type === "branch_created") return `Created branch: ${p.branch}`;
  }
  return String(p?.text ?? p?.title ?? p?.summary ?? p?.event_type ?? "Event detected");
}

async function loadActivities(): Promise<Activity[]> {
  try {
    const res = await getEvents(50);
    if (res.data.length === 0) return mockActivities;
    return res.data.map((e) => {
      const src = VALID_SOURCES.includes(e.source as ActivitySource)
        ? (e.source as ActivitySource)
        : ("slack" as ActivitySource);
      const text = extractText(e.source, e.payload ?? {});
      const label = src.charAt(0).toUpperCase() + src.slice(1);
      return {
        id: e.id,
        source: src,
        title: `${label} — ${text.slice(0, 80)}`,
        summary: text.slice(0, 120),
        timeAgo: timeAgo(e.created_at),
      };
    });
  } catch {
    return mockActivities;
  }
}

export default async function ActivityPage() {
  const activities = await loadActivities();

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Activity Feed</h1>
          <p className="text-[#94A3B8] text-sm mt-1">All detected work signals from your integrations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {["All Activities", "Today", "Past 7 days"].map((filter, i) => (
          <button
            key={filter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              i === 0
                ? "bg-[#1E293B] text-[#F8FAFC] border border-white/[0.1]"
                : "text-[#94A3B8] bg-white/[0.04] hover:bg-white/[0.08] hover:text-[#F8FAFC]"
            }`}
          >
            {filter}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ))}

        <div className="flex-1" />

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search activities"
            className="bg-[#1E293B] text-[#F8FAFC] placeholder:text-[#94A3B8] text-sm rounded-lg pl-9 pr-4 py-2 border border-white/[0.06] focus:outline-none focus:border-[#6366F1]/50 w-56 transition-colors"
          />
        </div>
      </div>

      <ActivityFeed activities={activities} />
    </div>
  );
}
