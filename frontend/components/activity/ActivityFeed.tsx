"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ActivitySource } from "@/lib/mock-data";
import { GitBranch, MessageSquare, Calendar, ExternalLink, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const sourceConfig: Record<
  ActivitySource,
  { icon: React.ComponentType<{ className?: string }>; bg: string; label: string }
> = {
  github: { icon: GitBranch, bg: "#24292E", label: "GitHub" },
  slack: { icon: MessageSquare, bg: "#4A154B", label: "Slack" },
  jira: { icon: ExternalLink, bg: "#0052CC", label: "Jira" },
  calendar: { icon: Calendar, bg: "#1E293B", label: "Calendar" },
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const [logged, setLogged] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const config = sourceConfig[activity.source];
        const Icon = config.icon;
        const isLogged = logged.has(activity.id);

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="flex items-center gap-4 bg-[#111827] rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.bg }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F8FAFC] truncate">
                {activity.title}
              </p>
              <p className="text-xs text-[#94A3B8] mt-0.5 truncate">
                {activity.summary}
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">{activity.timeAgo}</p>
              {activity.draftTask && (
                <p className="text-xs font-bold text-emerald-400 mt-1 truncate">
                  ↳ {activity.draftTask}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setLogged((prev) => new Set([...prev, activity.id]))}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  isLogged
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-white/[0.04] border-white/[0.12] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20"
                )}
              >
                {isLogged ? "Logged ✓" : "Log this"}
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.12] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
