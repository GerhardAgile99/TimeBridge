import { Activity } from "@/lib/mock-data";
import { GitBranch, MessageSquare, Calendar, ExternalLink } from "lucide-react";

const sourceConfig = {
  github: { icon: GitBranch, bg: "#24292E", label: "GitHub" },
  slack: { icon: MessageSquare, bg: "#4A154B", label: "Slack" },
  jira: { icon: ExternalLink, bg: "#0052CC", label: "Jira" },
  calendar: { icon: Calendar, bg: "#1E293B", label: "Calendar" },
};

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">Activity</h3>
        <span className="text-xs text-[#94A3B8] font-mono bg-white/[0.04] px-2 py-0.5 rounded">
          #0F11627
        </span>
      </div>
      <div className="space-y-3">
        {activities.map((item) => {
          const config = sourceConfig[item.source];
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
                  {item.title.split(" - ")[1] || item.title}
                </p>
                <p className="text-xs text-[#94A3B8]">{item.timeAgo}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
