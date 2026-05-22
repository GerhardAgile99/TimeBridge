import { ApiDraft } from "@/lib/api/types";
import { GitBranch, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";

const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GitBranch,
  jira: ExternalLink,
  slack: MessageSquare,
  calendar: ExternalLink,
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function RecentDrafts({ drafts }: { drafts: ApiDraft[] }) {
  if (drafts.length === 0) {
    return (
      <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06] flex flex-col">
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">AI Draft Approval</h3>
        <p className="text-xs text-[#94A3B8] flex-1 flex items-center justify-center py-6">
          No pending drafts — connect an integration to detect work automatically.
        </p>
        <Link
          href="/drafts"
          className="block mt-4 text-center text-xs text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium"
        >
          View all drafts →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">AI Draft Approval</h3>
        <span className="text-xs text-[#94A3B8] font-mono bg-white/[0.04] px-2 py-0.5 rounded">
          {drafts.length} pending
        </span>
      </div>
      <div className="space-y-3">
        {drafts.map((draft) => (
          <div key={draft.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
            <div className="w-7 h-7 bg-[#24292E] rounded-lg flex items-center justify-center shrink-0">
              <GitBranch className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#F8FAFC] truncate">{draft.task}</p>
              <p className="text-xs text-[#94A3B8]">{formatMinutes(draft.duration_minutes)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {draft.sources.slice(0, 2).map((src) => {
                const Icon = sourceIcons[src] ?? ExternalLink;
                return (
                  <div key={src} className="w-4 h-4 text-[#6366F1]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}
              <span className="text-xs font-bold text-emerald-400">{draft.confidence_score}%</span>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/drafts"
        className="block mt-4 text-center text-xs text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium"
      >
        View all drafts →
      </Link>
    </div>
  );
}
