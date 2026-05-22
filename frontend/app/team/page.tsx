import { teamMembers } from "@/lib/mock-data";
import { Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Team Overview</h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {teamMembers.filter((m) => m.isActive).length} members active now ·{" "}
            {teamMembers.length} total
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#1E293B] text-[#94A3B8] text-sm font-medium border border-white/[0.08] hover:text-[#F8FAFC] transition-colors">
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${member.color}, ${member.color}99)`,
                  }}
                >
                  {member.initials}
                </div>
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#111827]",
                    member.isActive ? "bg-emerald-400" : "bg-[#475569]"
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">{member.name}</p>
                <p className="text-xs text-[#94A3B8]">{member.role}</p>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] mb-4 truncate">{member.recentActivity}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Weekly Hours</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span className="text-sm font-bold text-[#F8FAFC]">{member.weeklyHours}h</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Focus Score</p>
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span className="text-sm font-bold text-[#F8FAFC]">{member.focusScore}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#94A3B8]">Focus</span>
                <span className="text-xs font-medium" style={{ color: member.color }}>
                  {member.focusScore}%
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${member.focusScore}%`,
                    backgroundColor: member.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
