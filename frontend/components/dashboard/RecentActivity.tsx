import { ApiRawEvent } from "@/lib/api/types";
import { GitBranch, MessageSquare, Calendar, ExternalLink } from "lucide-react";

const sourceConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; label: string }> = {
  github: { icon: GitBranch, bg: "#24292E", label: "GitHub" },
  slack: { icon: MessageSquare, bg: "#4A154B", label: "Slack" },
  jira: { icon: ExternalLink, bg: "#0052CC", label: "Jira" },
  calendar: { icon: Calendar, bg: "#1E293B", label: "Calendar" },
  vscode: { icon: ExternalLink, bg: "#23A1F1", label: "VS Code" },
  other: { icon: ExternalLink, bg: "#1E293B", label: "Other" },
};

function extractText(event: ApiRawEvent): string {
  const p = event.payload as Record<string, unknown>;
  const commits = p["commits"] as Array<{ message?: string }> | undefined;
  if (commits?.[0]?.message) return commits[0].message.split("\n")[0].slice(0, 80);
  const title = (p["pr_title"] ?? p["title"] ?? p["text"] ?? p["event_type"]) as string | undefined;
  if (title) return String(title).slice(0, 80);
  return `${event.source} activity`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentActivity({ activities }: { activities: ApiRawEvent[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06] flex flex-col">
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Activity</h3>
        <p className="text-xs text-[#94A3B8] flex-1 flex items-center justify-center py-6">
          No activity yet — connect GitHub, Slack, or Jira to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">Activity</h3>
        <span className="text-xs text-[#94A3B8] font-mono bg-white/[0.04] px-2 py-0.5 rounded">
          {activities.length} events
        </span>
      </div>
      <div className="space-y-3">
        {activities.map((item) => {
          const config = sourceConfig[item.source] ?? sourceConfig["other"];
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.bg }}
              >
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#F8FAFC] truncate font-medium">
                  {extractText(item)}
                </p>
                <p className="text-xs text-[#94A3B8]">{timeAgo(item.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
